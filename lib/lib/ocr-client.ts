"use client";
/**
 * On-device OCR fallback (runs entirely in the browser — free forever,
 * works offline). Used only when the server has no Gemini key configured.
 */
import { createWorker } from "tesseract.js";

/**
 * Shrink a photo before it is sent anywhere. A phone camera photo can be
 * 4000px wide and several MB; the label text is still perfectly readable
 * at 1280px, and the smaller file uploads much faster and is quicker for
 * the AI to read. Both scan paths (camera capture and file upload) pass
 * through here. If anything goes wrong, the original photo is used.
 */
export async function downscaleImage(
  blob: Blob,
  maxSide = 1280
): Promise<Blob> {
  try {
    const bmp = await createImageBitmap(blob);
    const longest = Math.max(bmp.width, bmp.height);
    const scale = Math.min(1, maxSide / longest);
    if (scale >= 1 && blob.type === "image/jpeg") return blob;
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bmp.width * scale));
    canvas.height = Math.max(1, Math.round(bmp.height * scale));
    canvas.getContext("2d")?.drawImage(bmp, 0, 0, canvas.width, canvas.height);
    bmp.close();
    const out = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.8)
    );
    return out ?? blob;
  } catch {
    return blob;
  }
}

export async function extractTextOnDevice(
  image: Blob,
  onProgress?: (p: number) => void
): Promise<{ text: string; confidence: number }> {
  const worker = await createWorker("eng");
  try {
    const {
      data: { text, confidence },
    } = await worker.recognize(image, {}, {
      // @ts-expect-error tesseract.js logger typing
      logger: (m: { status: string; progress: number }) => {
        if (m.status === "recognizing text" && onProgress) onProgress(m.progress);
      },
    });
    return { text, confidence: (confidence ?? 50) / 100 };
  } finally {
    await worker.terminate();
  }
}
