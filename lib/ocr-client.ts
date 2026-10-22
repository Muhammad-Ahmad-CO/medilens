"use client";
/**
 * On-device OCR fallback (runs entirely in the browser — free forever,
 * works offline). Used only when the server has no Gemini key configured.
 */
import { createWorker } from "tesseract.js";

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
