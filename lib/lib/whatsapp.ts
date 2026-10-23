/**
 * WhatsApp Cloud API helpers (Meta) — free test number is enough for demo.
 *
 * Flow: user sends a medicine photo to the MediLens WhatsApp number →
 * Meta calls our webhook → we download the photo with the access token →
 * the SAME Gemini pipeline as the website reads it → we reply in the chat.
 *
 * Env vars (set in Vercel, never in code):
 *   WHATSAPP_TOKEN            — Meta access token (temporary test token OK)
 *   WHATSAPP_PHONE_ID         — the test/business phone number ID
 *   WHATSAPP_VERIFY_TOKEN     — any word the user invents; typed into Meta too
 */

const GRAPH = "https://graph.facebook.com/v21.0";

function token(): string | null {
  return process.env.WHATSAPP_TOKEN ?? null;
}

export function whatsappConfigured(): boolean {
  return Boolean(process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_ID);
}

/** Send a plain text reply in the WhatsApp chat. */
export async function sendWhatsAppText(to: string, body: string): Promise<void> {
  const t = token();
  const phoneId = process.env.WHATSAPP_PHONE_ID;
  if (!t || !phoneId) return;
  try {
    await fetch(`${GRAPH}/${phoneId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${t}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body },
      }),
    });
  } catch {
    /* best effort — Meta retries webhooks, a lost reply is not fatal */
  }
}

/** Download a photo the user sent, as base64 (+ its mime type). */
export async function downloadWhatsAppMedia(
  mediaId: string
): Promise<{ base64: string; mimeType: string } | null> {
  const t = token();
  if (!t) return null;
  try {
    const metaRes = await fetch(`${GRAPH}/${mediaId}`, {
      headers: { Authorization: `Bearer ${t}` },
    });
    if (!metaRes.ok) return null;
    const meta = await metaRes.json();
    const url: string | undefined = meta?.url;
    const mimeType: string = meta?.mime_type ?? "image/jpeg";
    if (!url) return null;
    const fileRes = await fetch(url, {
      headers: { Authorization: `Bearer ${t}` },
    });
    if (!fileRes.ok) return null;
    const buf = Buffer.from(await fileRes.arrayBuffer());
    return { base64: buf.toString("base64"), mimeType };
  } catch {
    return null;
  }
}
