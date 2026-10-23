/**
 * OCR layer — two paths, one interface.
 *
 *  PRIMARY (server): Gemini vision API (free tier via Google AI Studio).
 *  FALLBACK (browser): Tesseract.js, 100% free + offline — see ocr-client.ts.
 *
 * The API route tries Gemini first; if no key is configured it tells the
 * client to run on-device OCR instead. Either way the SAME ExtractedLabel
 * shape flows into the verdict engine.
 */
import type { ExtractedLabel } from "./verdict";
import { LOCAL_DRUGS } from "./drugs";

// gemini-2.0-flash was shut down by Google on 2026-06-01 (API returns 404).
// gemini-3.8-flash is Google's named successor and is on the API free tier.
// Override the primary any time with the GEMINI_MODEL env var.
//
// The free tier is shared and bursty: one model can be overloaded or out of
// quota while another answers instantly. So the vision call walks a short
// chain of free models and uses the first one that responds — the label
// JSON is identical whichever model reads it.
//
// Diagnosis from the live Vercel logs on 2026-10-23: every fallback attempt
// on the v1beta endpoint answered 404 (model not found on that API
// version), while the primary v1beta model works but is sometimes very
// slow on larger photos (one success took ~80s). So: the primary stays on
// v1beta with a long window, and the fallbacks are tried on the v1
// endpoint, where the GA models live.
const GEMINI_CHAIN: { model: string; version: string; timeoutMs: number }[] = [
  {
    model: process.env.GEMINI_MODEL || "gemini-3.8-flash",
    version: "v1beta",
    timeoutMs: 50000,
  },
  { model: "gemini-2.5-flash", version: "v1", timeoutMs: 30000 },
  { model: "gemini-2.5-flash-lite", version: "v1", timeoutMs: 30000 },
];

const PROMPT = `You are reading a medicine label in a photo. The item may be a
medicine box OR a blister strip (patta) — the foil strip that holds tablets.
Return ONLY valid JSON (no markdown fences) with these keys:
{
  "drugName": string | null,        // brand name, e.g. "Panadol"
  "manufacturer": string | null,    // e.g. "GSK"
  "batchNumber": string | null,     // e.g. "B12345"
  "expiryDate": string | null,      // exactly as printed, e.g. "08/27"
  "ocrConfidence": number           // 0..1, your confidence in the reading
}
If a field is unreadable or absent, use null.

Rules for blister strips (foil):
- The medicine name is usually printed MANY times across the foil. That
  repeated text is ONE drug — report the name once.
- Batch number and expiry, when present, are crimped or embossed along one
  edge of the strip and may be faint or low-contrast — check the edges.
- Many strips carry no batch/expiry at all (those live on the outer box).
  If a batch or expiry is not clearly visible, return null for it.
- NEVER invent or guess a batch number or expiry date that is not visible.`;

function cleanJson(raw: string): string {
  return raw.replace(/```json|```/g, "").trim();
}

/** One vision attempt against one model. Null = this model did not answer. */
async function tryGeminiModel(
  model: string,
  version: string,
  timeoutMs: number,
  key: string,
  imageBase64: string,
  mimeType: string
): Promise<ExtractedLabel | null> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/${version}/models/${model}:generateContent?key=${key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: ctrl.signal,
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: PROMPT },
                { inline_data: { mime_type: mimeType, data: imageBase64 } },
              ],
            },
          ],
          // Keep this minimal on purpose: extra generation fields
          // (temperature / maxOutputTokens / thinkingConfig) coincided with
          // the live vision call failing on 2026-10-23 — the model chain
          // below is what fixed reliability, not generation tuning.
          generationConfig: {
            responseMimeType: "application/json",
          },
        }),
      }
    );
    if (!res.ok) {
      // Visible in the Vercel function logs if diagnosis is ever needed.
      console.error(`Gemini ${model} responded ${res.status}`);
      return null;
    }
    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return null;
    const j = JSON.parse(cleanJson(text));
    return {
      drugName: j.drugName ?? null,
      manufacturer: j.manufacturer ?? null,
      batchNumber: j.batchNumber ?? null,
      expiryDate: j.expiryDate ?? null,
      ocrConfidence:
        typeof j.ocrConfidence === "number" ? j.ocrConfidence : 0.7,
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/** Server-side: extract label fields with Gemini vision. Null = unavailable. */
export async function extractWithGemini(
  imageBase64: string,
  mimeType = "image/jpeg"
): Promise<ExtractedLabel | null> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  for (const step of GEMINI_CHAIN) {
    const label = await tryGeminiModel(
      step.model,
      step.version,
      step.timeoutMs,
      key,
      imageBase64,
      mimeType
    );
    if (label) return label;
  }
  return null;
}

const KNOWN_MAKERS = [
  "GSK", "Abbott", "Sanofi", "Getz", "CCL", "Sami", "Reckitt", "Pfizer",
  "Novartis", "Himont", "Pharmevo", "Martin Dow",
];

/**
 * Heuristic extraction from raw OCR text (used with the Tesseract fallback).
 * Finds known drug names / makers with regexes; everything else is best-effort.
 */
export function extractFromText(
  text: string,
  ocrConfidence = 0.55
): ExtractedLabel {
  const upper = text.toUpperCase();
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

  // Blister strips print the same word over and over ("PANADOL PANADOL
  // PANADOL GSK"). Collapse those runs so the name reads as one drug.
  const dedupeWords = (s: string) => s.replace(/\b(\S+)(\s+\1\b)+/gi, "$1");

  // Drug name: first known drug mentioned in the text…
  let drugName: string | null = null;
  for (const d of LOCAL_DRUGS) {
    if (upper.includes(norm(d.name).toUpperCase()) || upper.includes(d.name.toUpperCase())) {
      drugName = d.name;
      break;
    }
  }
  // …otherwise the first non-empty line as an uncertain candidate.
  if (!drugName) {
    const line = text
      .split("\n")
      .map((l) => dedupeWords(l.trim()))
      .find((l) => l.length > 2);
    drugName = line ? line.slice(0, 40) : null;
  }

  let manufacturer: string | null = null;
  for (const m of KNOWN_MAKERS) {
    if (upper.includes(m.toUpperCase())) {
      manufacturer = m;
      break;
    }
  }

  // Handles: "Batch B123", "Batch: B123", "Batch No. B123", "B.No. X99", "Lot 42A"
  const batch =
    text.match(
      /(?:batch(?:\s*no\.?)?|b\.?\s*no\.?|lot(?:\s*no\.?)?)[\s:.]*([A-Z0-9][A-Z0-9\-]{2,})/i
    )?.[1] ?? null;

  const expiry =
    text.match(
      /(?:exp(?:iry|iry)?\.?[\s:]*)((?:0?[1-9]|1[0-2])[\/\-.]\d{2,4}|\d{4}[\/\-.](?:0?[1-9]|1[0-2])|(?:JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)[A-Z]*\s*\d{2,4})/i
    )?.[1] ?? null;

  return { drugName, manufacturer, batchNumber: batch, expiryDate: expiry, ocrConfidence };
}
