import { NextRequest, NextResponse } from "next/server";
import {
  extractWithGemini,
  extractFromText,
  mergeLabels,
  type ExtractedLabel,
} from "@/lib/ocr";
import { findLocalDrug, lookupOpenFDA } from "@/lib/drugs";
import { evaluateVerdict, type DrugRecord } from "@/lib/verdict";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import {
  clientIp,
  rateLimit,
  rateLimitedResponse,
} from "@/lib/rate-limit";

// Security: generous limits that stop quota-burning bots but never
// block a real person using the app (10 scans/minute per IP).
const SCAN_LIMIT = 10;
const SCAN_WINDOW_MS = 60_000;
// Security: reject absurdly large uploads before any AI work (6 MB).
const MAX_IMAGE_BASE64_BYTES = 6 * 1024 * 1024;

/**
 * POST /api/scan
 * Body: { image: base64 }  → server-side Gemini OCR (one photo)
 *    or { images: base64[] } (1–3 photos of ONE pack) → each photo is
 *       read separately, then merged field-by-field (name from one
 *       photo, batch/expiry from another) into a single verdict.
 *    or { text: string, ocrConfidence?: number } → client-side Tesseract text
 *
 * Pipeline: OCR → drug match (local DB → openFDA) → rule-based verdict
 *           → save scan (best effort) → JSON result.
 */
export async function POST(req: NextRequest) {
  // Security: per-IP rate limit (protects the Gemini free-tier quota).
  // One request counts once, however many photos it carries.
  const rl = rateLimit(`scan:${clientIp(req)}`, SCAN_LIMIT, SCAN_WINDOW_MS);
  if (!rl.ok) return rateLimitedResponse(rl.retryAfter);

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  // --- 1. Label extraction -------------------------------------------------
  let label: ExtractedLabel;
  let photosUsed = 0;
  let conflict = false;
  if (Array.isArray(body.images)) {
    // Multi-photo scan: up to 3 photos of the same pack.
    if (body.images.length < 1 || body.images.length > 3) {
      return NextResponse.json(
        { error: "Send 1 to 3 photos." },
        { status: 400 }
      );
    }
    for (const img of body.images) {
      if (String(img).length > MAX_IMAGE_BASE64_BYTES) {
        return NextResponse.json(
          { error: "Image too large. Use a photo under ~4 MB." },
          { status: 413 }
        );
      }
    }
    const cleaned = body.images.map((img: unknown) =>
      String(img).replace(/^data:image\/\w+;base64,/, "")
    );
    // Read the photos in parallel (wall time ≈ the slowest single read).
    // A photo the AI fails to read simply contributes nothing — the
    // merged label is built from the photos that DID read.
    const reads = await Promise.all(
      cleaned.map((b: string) => extractWithGemini(b))
    );
    const ok = reads.filter((r): r is ExtractedLabel => r !== null);
    if (ok.length === 0) {
      return NextResponse.json(
        {
          error: "AI_OCR_UNAVAILABLE",
          message:
            "Server-side vision AI is not configured. The app will fall back to on-device OCR.",
        },
        { status: 503 }
      );
    }
    const merged = mergeLabels(ok);
    label = merged.label;
    conflict = merged.conflict;
    photosUsed = body.images.length;
  } else if (body.image) {
    // Security: reject oversized uploads before spending any AI quota.
    if (String(body.image).length > MAX_IMAGE_BASE64_BYTES) {
      return NextResponse.json(
        { error: "Image too large. Use a photo under ~4 MB." },
        { status: 413 }
      );
    }
    const fromAI = await extractWithGemini(String(body.image).replace(/^data:image\/\w+;base64,/, ""));
    if (!fromAI) {
      // No Gemini key / API failure → client should use on-device OCR.
      return NextResponse.json(
        {
          error: "AI_OCR_UNAVAILABLE",
          message:
            "Server-side vision AI is not configured. The app will fall back to on-device OCR.",
        },
        { status: 503 }
      );
    }
    label = fromAI;
  } else if (body.text) {
    label = extractFromText(String(body.text), body.ocrConfidence ?? 0.55);
  } else {
    return NextResponse.json(
      { error: "Provide { image } (base64) or { text }." },
      { status: 400 }
    );
  }

  // --- 2. Drug matching: local DB first, openFDA second --------------------
  let record: DrugRecord | null = null;
  if (label.drugName) {
    const local = findLocalDrug(label.drugName);
    if (local) {
      record = {
        name: local.name,
        manufacturer: local.manufacturer,
        source: "local",
        info: local.info ?? null,
      };
    } else {
      const fda = await lookupOpenFDA(label.drugName);
      if (fda.found) {
        record = {
          name: fda.brandName ?? label.drugName,
          manufacturer: fda.manufacturer ?? "Unknown",
          source: "openfda",
        };
      }
    }
  }

  // --- 3. Verdict (rule-based, explainable) ---------------------------------
  let verdict = evaluateVerdict(label, record);
  if (conflict && verdict.level === "green") {
    // Two photos named two different known drugs: the photos may be of
    // two different packs, so a GREEN would be a lie. Downgrade to AMBER
    // and say so plainly instead of silently picking one name.
    verdict = {
      ...verdict,
      level: "amber",
      confidence: Math.min(verdict.confidence, 0.7),
      reasons: [
        ...verdict.reasons,
        "Photos show different medicine names — make sure all photos are of the same pack.",
      ],
    };
  }

  // --- 4. Persist scan (best effort — never fail the scan over storage) -----
  if (isSupabaseConfigured()) {
    try {
      await getSupabase().from("scans").insert({
        drug_name: label.drugName,
        manufacturer: label.manufacturer,
        batch_number: label.batchNumber,
        expiry_date: label.expiryDate,
        verdict: verdict.level,
        reasons: verdict.reasons,
        confidence: verdict.confidence,
        ocr_confidence: label.ocrConfidence,
      });
    } catch {
      /* storage is optional for the demo */
    }
  }

  return NextResponse.json({
    label,
    drug: record,
    verdict,
    ...(photosUsed > 0 ? { photosUsed } : {}),
  });
}
