import { NextRequest, NextResponse } from "next/server";
import { extractWithGemini } from "@/lib/ocr";
import { findLocalDrug, lookupOpenFDA } from "@/lib/drugs";
import { evaluateVerdict, type DrugRecord } from "@/lib/verdict";
import {
  downloadWhatsAppMedia,
  sendWhatsAppText,
  whatsappConfigured,
} from "@/lib/whatsapp";

/**
 * WhatsApp webhook for MediLens.
 *
 * GET  — Meta's one-time verification handshake (hub.challenge).
 * POST — message events. A photo runs through the same pipeline as the
 *        website scan; the verdict is replied inside the WhatsApp chat.
 *
 * Duplicate protection: Meta retries webhooks when the reply is slow
 * (our AI read can take a while), so processed message ids are remembered
 * for the life of the function instance and repeats are ignored.
 */
const seen = new Set<string>();

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const mode = params.get("hub.mode");
  const token = params.get("hub.verify_token");
  const challenge = params.get("hub.challenge");
  if (
    mode === "subscribe" &&
    token &&
    token === process.env.WHATSAPP_VERIFY_TOKEN &&
    challenge
  ) {
    return new NextResponse(challenge, { status: 200 });
  }
  return new NextResponse("Forbidden", { status: 403 });
}

const HELP_TEXT =
  "Assalam-o-Alaikum! Ye MediLens hai. 💊\n\n" +
  "Kisi bhi dawa ke dabbe ya patte (strip) ki saaf photo bhejen — me check karke bata dunga ke dawa asal lagti hai ya mashkook.\n\n" +
  "Photo bhejte waqt khayal rakhen: roshni achi ho, aur dawa ka naam + batch number saaf dikhe.";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: true });
  }

  const msg = (body as any)?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
  if (!msg?.id || !msg?.from) return NextResponse.json({ ok: true });
  if (seen.has(msg.id)) return NextResponse.json({ ok: true });
  seen.add(msg.id);

  if (!whatsappConfigured()) return NextResponse.json({ ok: true });

  try {
    if (msg.type === "text") {
      await sendWhatsAppText(msg.from, HELP_TEXT);
      return NextResponse.json({ ok: true });
    }
    if (msg.type !== "image") {
      await sendWhatsAppText(
        msg.from,
        "Me sirf photo parh sakta hun — dawa ke dabbe ya patte ki photo bhejen. 📷"
      );
      return NextResponse.json({ ok: true });
    }

    await sendWhatsAppText(msg.from, "Photo mil gayi — dawa check kar raha hun, ek lamha… 🔍");

    const media = await downloadWhatsAppMedia(msg.image.id);
    if (!media) {
      await sendWhatsAppText(
        msg.from,
        "Photo download nahi ho saki. Barah-e-karam dobara bhejen."
      );
      return NextResponse.json({ ok: true });
    }

    const label = await extractWithGemini(media.base64, media.mimeType);
    if (!label) {
      await sendWhatsAppText(
        msg.from,
        "AI is waqt masroof hai — ek minute baad photo dobara bhejen."
      );
      return NextResponse.json({ ok: true });
    }
    if (!label.drugName) {
      await sendWhatsAppText(
        msg.from,
        "Is photo me dawa ka naam saaf nahi parha gaya. Roshni me, qareeb se dobara photo bhejen."
      );
      return NextResponse.json({ ok: true });
    }

    // Same matching + verdict as the website scan.
    let record: DrugRecord | null = null;
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
    const verdict = evaluateVerdict(label, record);

    const icon =
      verdict.level === "green" ? "🟢" : verdict.level === "amber" ? "🟡" : "🔴";
    const title =
      verdict.level === "green"
        ? "ASAL lagti hai"
        : verdict.level === "amber"
          ? "MASHKOOK hai — ehtiyat karen"
          : "KHATARNAK — ye dawa mat len";
    const lines = [
      `${icon} ${title}`,
      "",
      `Dawa: ${record?.name ?? label.drugName}`,
      label.manufacturer ? `Company: ${label.manufacturer}` : null,
      label.batchNumber ? `Batch: ${label.batchNumber}` : "Batch: nahi mila",
      label.expiryDate ? `Expiry: ${label.expiryDate}` : "Expiry: nahi mili",
      `Yakeen (confidence): ${Math.round(verdict.confidence * 100)}%`,
      "",
      ...verdict.reasons.slice(0, 3).map((r) => `• ${r}`),
      record?.info?.uses ? `\nYe dawa: ${record.info.uses}` : null,
      "",
      "Note: Ye ek screening hai, medical mashwara nahi. Shak ho to pharmacist se lazmi confirm karen.",
    ].filter(Boolean);
    await sendWhatsAppText(msg.from, lines.join("\n"));
  } catch {
    /* never fail the webhook itself — Meta would disable it after retries */
  }
  return NextResponse.json({ ok: true });
}
