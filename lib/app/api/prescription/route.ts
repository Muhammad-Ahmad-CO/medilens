import { NextRequest, NextResponse } from "next/server";
import { readPrescriptionWithGemini } from "@/lib/ocr";
import { findLocalDrug } from "@/lib/drugs";
import {
  clientIp,
  rateLimit,
  rateLimitedResponse,
} from "@/lib/rate-limit";

// Same protections as /api/scan: per-IP rate limit + upload size cap.
const RX_LIMIT = 10;
const RX_WINDOW_MS = 60_000;
const MAX_IMAGE_BASE64_BYTES = 6 * 1024 * 1024;

/**
 * POST /api/prescription
 * Body: { image: base64 }
 * Reads a doctor's handwritten prescription with Gemini vision and returns
 * a plain-language medicine list. Lines the AI cannot read safely come back
 * with name=null and unclear=true — never a guessed medicine name.
 */
export async function POST(req: NextRequest) {
  const rl = rateLimit(`rx:${clientIp(req)}`, RX_LIMIT, RX_WINDOW_MS);
  if (!rl.ok) return rateLimitedResponse(rl.retryAfter);

  let body: { image?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const image = body.image;
  if (!image || typeof image !== "string") {
    return NextResponse.json(
      { error: "An image is required." },
      { status: 400 }
    );
  }
  if (image.length > MAX_IMAGE_BASE64_BYTES) {
    return NextResponse.json(
      { error: "That photo is too large. Please retake it a little closer." },
      { status: 413 }
    );
  }

  const result = await readPrescriptionWithGemini(image);
  if (!result) {
    return NextResponse.json(
      {
        error: "PRESCRIPTION_UNAVAILABLE",
        message:
          "The reading service is busy right now. Please try again in a moment.",
      },
      { status: 503 }
    );
  }

  // Attach "what is it for" from the local DB when a name matches a known drug.
  const medicines = result.medicines.map((m) => {
    const local = m.name ? findLocalDrug(m.name) : null;
    return {
      ...m,
      matchedName: local?.name ?? null,
      uses: local?.info?.uses ?? null,
    };
  });

  return NextResponse.json({ medicines, notes: result.notes });
}
