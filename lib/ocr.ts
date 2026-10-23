import type { ExtractedLabel } from "./verdict";
import { LOCAL_DRUGS } from "./drugs";

const PRIMARY_MODEL = process.env.GEMINI_MODEL || "gemini-3.6-flash";
const GEMINI_CHAIN: { model: string; version: string; timeoutMs: number }[] = [
  { model: PRIMARY_MODEL, version: "v1beta", timeoutMs: 15000 },
  { model: PRIMARY_MODEL, version: "v1beta", timeoutMs: 15000 },
  { model: "gemini-3.5-flash", version: "v1beta", timeoutMs: 15000 },
  { model: "gemini-3.8-flash", version: "v1beta", timeoutMs: 20000 },
  { model: "gemini-3.5-flash-lite", version: "v1beta", timeoutMs: 12000 },
];
const GEMINI_BUDGET_MS = 42000;

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

async function callGeminiOnce(
  model: string,
  version: string,
  timeoutMs: number,
  key: string,
  prompt: string,
  imageBase64: string,
  mimeType: string
): Promise<string | null> {
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
                { text: prompt },
                { inline_data: { mime_type: mimeType, data: imageBase64 } },
              ],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
          },
        }),
      }
    );
    if (!res.ok) {
      console.error(`Gemini ${model} responded ${res.status}`);
      return null;
    }
    const data = await res.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function callGeminiChain(
  prompt: string,
  imageBase64: string,
  mimeType: string
): Promise<string | null> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  const deadline = Date.now() + GEMINI_BUDGET_MS;
  for (const step of GEMINI_CHAIN) {
    const remaining = deadline - Date.now();
    if (remaining <= 0) break;
    const text = await callGeminiOnce(
      step.model,
      step.version,
      Math.min(step.timeoutMs, remaining),
      key,
      prompt,
      imageBase64,
      mimeType
    );
    if (text) return text;
  }
  return null;
}

export async function extractWithGemini(
  imageBase64: string,
  mimeType = "image/jpeg"
): Promise<ExtractedLabel | null> {
  const text = await callGeminiChain(PROMPT, imageBase64, mimeType);
  if (!text) return null;
  try {
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

export interface PrescriptionMedicine {
  name: string | null;
  form: string | null;
  strength: string | null;
  quantity: string | null;
  timing: string | null;
  instructions: string | null;
  unclear: boolean;
}

export interface PrescriptionResult {
  medicines: PrescriptionMedicine[];
  notes: string | null;
}

const PRESCRIPTION_PROMPT = `You are reading a doctor's handwritten prescription in a photo. Doctors' handwriting is famously hard to read — be careful and honest.

Return ONLY valid JSON (no markdown fences) in exactly this shape:
{
  "medicines": [
    {
      "name": string | null,        // medicine name as written, e.g. "Panadol"
      "form": string | null,         // "Tablet" | "Capsule" | "Syrup" | "Drops" | "Cream" | "Injection" | null
      "strength": string | null,     // e.g. "500mg", "120mg/5ml"
      "quantity": string | null,     // how much was prescribed, e.g. "10 tablets", "1 bottle"
      "timing": string | null,       // plain words, e.g. "1 tablet in the morning and 1 at night"
      "instructions": string | null, // e.g. "After food", "Before breakfast", "With water"
      "unclear": boolean             // true if you cannot read this line confidently
    }
  ],
  "notes": string | null             // anything else important written on the prescription
}

Rules:
- Expand abbreviations into plain words: BD = twice a day, TDS = three times a day, OD = once a day, HS = at bedtime, SOS = only when needed. Notation like "1+0+1" means 1 in the morning, 0 at midday, 1 at night — say it in plain words in "timing".
- "Tab." means tablet, "Cap." capsule, "Syp." syrup.
- NEVER guess a medicine name. A wrong medicine name can kill. If a word could be two different medicines, or you cannot read it confidently, set "name" to null and "unclear" to true for that line. Still fill the other fields you CAN read on that line.
- If a detail (strength, quantity, timing) is not written or not readable, use null — do not invent it.
- Skip lines that are clearly not medicines (doctor's name, patient name, dates, signatures, advice like "rest").`;

export async function readPrescriptionWithGemini(
  imageBase64: string,
  mimeType = "image/jpeg"
): Promise<PrescriptionResult | null> {
  const text = await callGeminiChain(PRESCRIPTION_PROMPT, imageBase64, mimeType);
  if (!text) return null;
  try {
    const j = JSON.parse(cleanJson(text));
    const meds = Array.isArray(j.medicines) ? j.medicines : [];
    return {
      medicines: meds.map((m: Record<string, unknown>) => ({
        name: (m.name as string) ?? null,
        form: (m.form as string) ?? null,
        strength: (m.strength as string) ?? null,
        quantity: (m.quantity as string) ?? null,
        timing: (m.timing as string) ?? null,
        instructions: (m.instructions as string) ?? null,
        unclear: m.unclear === true || !m.name,
      })),
      notes: (j.notes as string) ?? null,
    };
  } catch {
    return null;
  }
}

const KNOWN_MAKERS = [
  "GSK", "Abbott", "Sanofi", "Getz", "CCL", "Sami", "Reckitt", "Pfizer",
  "Novartis", "Himont", "Pharmevo", "Martin Dow",
];

export function extractFromText(
  text: string,
  ocrConfidence = 0.55
): ExtractedLabel {
  const upper = text.toUpperCase();
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

  const dedupeWords = (s: string) => s.replace(/\b(\S+)(\s+\1\b)+/gi, "$1");

  let drugName: string | null = null;
  let bestLen = -1;
  for (const d of LOCAL_DRUGS) {
    if (upper.includes(norm(d.name).toUpperCase()) || upper.includes(d.name.toUpperCase())) {
      if (d.name.length > bestLen) {
        drugName = d.name;
        bestLen = d.name.length;
      }
    }
  }
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
