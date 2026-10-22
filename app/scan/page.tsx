"use client";
/**
 * Scan page: camera → /api/scan → Gemini OCR, with automatic fallback to
 * on-device Tesseract OCR when the server has no AI key configured.
 */
import { useState } from "react";
import CameraCapture from "@/components/CameraCapture";
import VerdictCard, { type ScanResult } from "@/components/VerdictCard";
import { extractTextOnDevice } from "@/lib/ocr-client";

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
      // Attempt 1: server-side Gemini vision OCR
      const base64 = await blobToBase64(blob);
      let res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64 }),
      });

      // Attempt 2 (fallback): on-device Tesseract OCR
      if (res.status === 503) {
        setStatus("AI unavailable — reading on-device instead…");
        const { text, confidence } = await extractTextOnDevice(blob, (p) =>
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

  if (phase === "done" && result) {
    return (
      <VerdictCard
        result={result}
        onReset={() => {
          setResult(null);
          setPhase("idle");
        }}
      />
    );
  }

  return (
    <div className="scan-wrap">
      <div className="card" style={{ padding: "1.6rem" }}>
        <span className="eyebrow">Step 1 of 1</span>
        <h2 style={{ margin: "0.5rem 0 1.2rem", letterSpacing: "-0.02em" }}>
          Scan medicine pack
        </h2>
      {phase === "idle" && (
        <>
          <CameraCapture onCapture={handleCapture} />
          <div
            style={{
              marginTop: "1.4rem",
              paddingTop: "1.2rem",
              borderTop: "1px solid var(--card-border)",
              textAlign: "center",
            }}
          >
            <p className="muted small" style={{ margin: "0 0 0.7rem" }}>
              No camera handy? Run the real pipeline on a sample pack:
            </p>
            <div style={{ display: "flex", gap: "0.6rem", justifyContent: "center", flexWrap: "wrap" }}>
              <button
                className="btn btn-secondary"
                onClick={() => handleDemoScan("genuine")}
              >
                ✨ Demo: genuine pack
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => handleDemoScan("expired")}
              >
                ⚠️ Demo: expired pack
              </button>
            </div>
          </div>
        </>
      )}
      {phase === "reading" && (
        <div>
          <p style={{ fontWeight: 600 }}>{status}</p>
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
        <div style={{ textAlign: "center", padding: "1rem 0" }}>
          <div style={{ fontSize: "2.4rem", marginBottom: "0.6rem" }} aria-hidden>😕</div>
          <p style={{ fontWeight: 600, margin: "0 0 1rem" }}>{status}</p>
          <button className="btn" onClick={() => setPhase("idle")}>
            <span aria-hidden>↻</span> Try again
          </button>
        </div>
      )}
      </div>
    </div>
  );
}
