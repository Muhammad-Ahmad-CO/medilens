"use client";
/**
 * Scan page: camera -> /api/scan -> Gemini OCR, with automatic fallback to
 * on-device Tesseract OCR when the server has no AI key configured.
 */
import { useState } from "react";
import CameraCapture from "@/components/CameraCapture";
import VerdictCard, { type ScanResult } from "@/components/VerdictCard";
import { extractTextOnDevice, downscaleImage } from "@/lib/ocr-client";
import { CircleAlert, CircleCheck, TriangleAlert } from "@/components/icons";

type Phase = "idle" | "reading" | "done" | "error";

const blobToBase64 = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).split(",")[1]);
    r.onerror = reject;
    r.readAsDataURL(blob);
  });

export default function ScanPage() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [result, setResult] = useState<ScanResult | null>(null);
  // Multi-photo scan: up to 3 photos of ONE pack (the name is on one
  // face, the batch/expiry on another). Collected here, sent as a
  // single request. The single-photo flow below is untouched.
  const [multi, setMulti] = useState(false);
  const [photos, setPhotos] = useState<Blob[]>([]);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);

  const DEMOS = {
    genuine: {
      label: "Demo: genuine pack",
      text: "PANADOL\nGSK Consumer Healthcare\nBatch No. B12345\nEXP 08/28",
      confidence: 0.88,
    },
    expired: {
      label: "Demo: expired pack",
      text: "BRUFEN\nAbbott Laboratories\nBatch No. X99\nEXP 01/20",
      confidence: 0.88,
    },
  } as const;

  const handleDemoScan = async (kind: keyof typeof DEMOS) => {
    const demo = DEMOS[kind];
    setPhase("reading");
    setProgress(0.08);
    setStatus("Running demo scan…");
    const stageRunner = runStages(" (demo)");
    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: demo.text,
          ocrConfidence: demo.confidence,
        }),
      });
      if (!res.ok) throw new Error("Demo failed");
      const data = await res.json();
      await stageRunner;
      // Animate the progress bar for drama.
      setProgress(1);
      await new Promise((r) => setTimeout(r, 350));
      setResult(data);
      setPhase("done");
    } catch {
      setPhase("error");
      setStatus("Demo failed — please try again.");
    }
  };

  const runStages = async (label: string) => {
    // Staged status messages — turns a 2-second wait into a story.
    const stages = [
      [400, `Reading label${label}…`],
      [900, "Matching against drug databases…"],
      [1400, "Evaluating safety verdict…"],
    ] as const;
    for (const [at, msg] of stages) {
      await new Promise((r) => setTimeout(r, at));
      setStatus(msg);
      setProgress((p) => Math.min(0.92, p + 0.22));
    }
  };

  const handleCapture = async (blob: Blob) => {
    setPhase("reading");
    setProgress(0.05);
    setStatus("Reading label…");
    const stageRunner = runStages("");
    try {
      // Shrink the photo first: a full-size phone photo is several MB,
      // which makes the upload (and the AI read) slow for no benefit.
      const image = await downscaleImage(blob);

      // Attempt 1: server-side Gemini vision OCR. Give it up to ~45s —
      // if it has not answered by then, fall back to on-device OCR
      // instead of leaving the user staring at a spinner.
      const base64 = await blobToBase64(image);
      let res: Response | null = null;
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 45_000);
      try {
        res = await fetch("/api/scan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: base64 }),
          signal: controller.signal,
        });
      } catch {
        res = null; // timed out or network error → use the fallback below
      } finally {
        clearTimeout(timer);
      }

      // Attempt 2 (fallback): on-device Tesseract OCR
      if (!res || res.status === 503) {
        setStatus("AI unavailable — reading on-device instead…");
        const { text, confidence } = await extractTextOnDevice(image, (p) =>
          setProgress(0.1 + p * 0.7)
        );
        res = await fetch("/api/scan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, ocrConfidence: confidence }),
        });
      }

      if (!res.ok) throw new Error("Scan failed");
      const data = await res.json();
      await stageRunner;
      setProgress(1);
      await new Promise((r) => setTimeout(r, 350)); // let 100% land visually
      setResult(data);
      setPhase("done");
    } catch {
      setPhase("error");
      setStatus("Something went wrong. Please try again with a clearer photo.");
    }
  };

  /* ---------- multi-photo collection (up to 3 photos, one pack) ---------- */
  const photoHint =
    photos.length === 0
      ? "Photo 1: dawai ka naam wali side lo."
      : photos.length === 1
        ? "Photo 2: batch number / expiry wali side lo."
        : "Photo 3 (optional): koi aur side, ya Check dabao.";

  const handleCollectPhoto = async (blob: Blob) => {
    if (photos.length >= 3) return;
    const small = await downscaleImage(blob);
    setPhotos((p) => [...p, small]);
    setPhotoUrls((u) => [...u, URL.createObjectURL(small)]);
  };

  const removePhoto = (i: number) => {
    URL.revokeObjectURL(photoUrls[i]);
    setPhotos((p) => p.filter((_, j) => j !== i));
    setPhotoUrls((u) => u.filter((_, j) => j !== i));
  };

  const clearPhotos = () => {
    photoUrls.forEach((u) => URL.revokeObjectURL(u));
    setPhotos([]);
    setPhotoUrls([]);
  };

  const handleMultiScan = async () => {
    if (photos.length === 0) return;
    setPhase("reading");
    setProgress(0.05);
    setStatus("Reading labels…");
    const stageRunner = runStages(` (${photos.length} photos)`);
    try {
      const images: string[] = [];
      for (const p of photos) images.push(await blobToBase64(p));
      let res: Response | null = null;
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 45_000);
      try {
        res = await fetch("/api/scan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ images }),
          signal: controller.signal,
        });
      } catch {
        res = null; // timed out or network error → fallback below
      } finally {
        clearTimeout(timer);
      }
      // Fallback: read each photo on-device and join the texts — the
      // server's text path then takes the first name/batch/expiry
      // found. No conflict guard in this path, so it is a fallback
      // only, not the main flow.
      if (!res || res.status === 503) {
        setStatus("AI unavailable — reading on-device instead…");
        const parts: string[] = [];
        for (const p of photos) {
          const { text } = await extractTextOnDevice(p, (pr) =>
            setProgress(0.1 + pr * 0.7)
          );
          parts.push(text);
        }
        res = await fetch("/api/scan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: parts.join("\n"), ocrConfidence: 0.55 }),
        });
      }
      if (!res.ok) throw new Error("Scan failed");
      const data = await res.json();
      await stageRunner;
      setProgress(1);
      await new Promise((r) => setTimeout(r, 350));
      setResult(data);
      setPhase("done");
    } catch {
      setPhase("error");
      setStatus(
        "Something went wrong. Your photos are still saved — try again."
      );
    }
  };

  if (phase === "done" && result) {
    return (
      <VerdictCard
        result={result}
        onReset={() => {
          setResult(null);
          clearPhotos();
          setMulti(false);
          setPhase("idle");
        }}
      />
    );
  }

  return (
    <div className="scan-wrap">
      <div className="scan-card">
        <span className="eyebrow">Step 1 of 1</span>
        <h2>Scan medicine pack</h2>
        {phase === "idle" && (
          <>
            <div className="dz-btns" style={{ marginBottom: "0.8rem" }}>
              <button
                className={`btn ${!multi ? "" : "btn-secondary"}`}
                onClick={() => {
                  clearPhotos();
                  setMulti(false);
                }}
              >
                1 photo
              </button>
              <button
                className={`btn ${multi ? "" : "btn-secondary"}`}
                onClick={() => setMulti(true)}
              >
                2–3 photos
              </button>
            </div>
            {multi ? (
              <>
                <p className="muted small" style={{ marginTop: 0 }}>
                  {photoHint}
                </p>
                <CameraCapture onCapture={handleCollectPhoto} />
                {photoUrls.length > 0 && (
                  <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                    {photoUrls.map((u, i) => (
                      <div key={u} style={{ position: "relative" }}>
                        <img
                          src={u}
                          alt={`Photo ${i + 1}`}
                          style={{
                            width: 72,
                            height: 72,
                            objectFit: "cover",
                            borderRadius: 8,
                          }}
                        />
                        <button
                          onClick={() => removePhoto(i)}
                          aria-label={`Remove photo ${i + 1}`}
                          style={{
                            position: "absolute",
                            top: -8,
                            right: -8,
                            width: 22,
                            height: 22,
                            borderRadius: "50%",
                            border: "none",
                            background: "#111",
                            color: "#fff",
                            cursor: "pointer",
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <button
                  className="btn"
                  style={{ marginTop: 12 }}
                  disabled={photoUrls.length === 0}
                  onClick={handleMultiScan}
                >
                  Check karo ({photoUrls.length} photo
                  {photoUrls.length === 1 ? "" : "s"})
                </button>
                <p className="muted small">
                  Pehli photo naam wali side ki, doosri batch/expiry wali
                  side ki lo. Ek hi pack ki photos honi chahiye.
                </p>
              </>
            ) : (
              <>
                <CameraCapture onCapture={handleCapture} />
                <div className="demo-zone">
              <p className="muted small" style={{ margin: 0 }}>
                No camera handy? Run the real pipeline on a sample pack:
              </p>
              <div className="dz-btns">
                <button
                  className="btn btn-secondary"
                  onClick={() => handleDemoScan("genuine")}
                >
                  <CircleCheck size={17} /> Demo: genuine pack
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => handleDemoScan("expired")}
                >
                  <TriangleAlert size={17} /> Demo: expired pack
                </button>
              </div>
            </div>
          </>
        )}
          </>
        )}
        {phase === "reading" && (
          <div>
            <p style={{ fontWeight: 600, margin: "0.4rem 0 0" }}>{status}</p>
            <div className="progress">
              <div style={{ width: `${Math.round(progress * 100)}%` }} />
            </div>
            <div className="scan-steps" aria-hidden>
              {["Reading label", "Matching database", "Safety verdict"].map((label, i) => {
                const thresholds = [0.3, 0.62, 1.0];
                const state =
                  progress >= thresholds[i] ? "done"
                  : i === 0 || progress >= thresholds[i - 1] ? "active"
                  : "";
                return (
                  <div key={label} className={`scan-step ${state}`}>
                    {label}
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {phase === "error" && (
          <div className="scan-state">
            <div className="ss-ico">
              <CircleAlert size={26} />
            </div>
            <p style={{ fontWeight: 600, margin: "0 0 1rem" }}>{status}</p>
            <button className="btn" onClick={() => setPhase("idle")}>
              Try again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
