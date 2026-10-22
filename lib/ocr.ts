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
// Override any time with the GEMINI_MODEL env var.
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.8-flash";

const PROMPT = `You are reading a medicine pack label in a photo.
Return ONLY valid JSON (no markdown fences) with these keys:
{
  "drugName": string | null,        // brand name, e.g. "Panadol"
  "manufacturer": string | null,    // e.g. "GSK"
  "batchNumber": string | null,     // e.g. "B12345"
  "expiryDate": string | null,      // exactly as printed, e.g. "08/27"
  "ocrConfidence": number           // 0..1, your confidence in the reading
}
If a field is unreadable or absent, use null.`;

function cleanJson(raw: string): string {
  return raw.replace(/```json|```/g, "").trim();
}

/** Server-side: extract label fields with Gemini vision. Null = unavailable. */
export async function extractWithGemini(
  imageBase64: string,
  mimeType = "image/jpeg"
): Promise<ExtractedLabel | null> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: PROMPT },
                { inline_data: { mime_type: mimeType, data: imageBase64 } },
              ],
            },
          ],
          generationConfig: { responseMimeType: "application/json" },
        }),
      }
    );
    if (!res.ok) return null;
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
  }
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
    const line = text.split("\n").map((l) => l.trim()).find((l) => l.length > 2);
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
