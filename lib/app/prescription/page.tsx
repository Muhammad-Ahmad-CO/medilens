"use client";
/**
 * Prescription reader page: photo of a doctor's handwritten prescription →
 * Gemini vision → a clear, plain-language list of the medicines, how many,
 * when to take them and how. Lines the AI cannot read safely are shown as
 * "not read clearly" — a medicine name is never guessed.
 */
import { useEffect, useState } from "react";
import CameraCapture from "@/components/CameraCapture";
import { downscaleImage } from "@/lib/ocr-client";
import {
  CircleAlert,
  RotateCcw,
  StopSquare,
  TriangleAlert,
  Volume,
} from "@/components/icons";

interface RxMedicine {
  name: string | null;
  form: string | null;
  strength: string | null;
  quantity: string | null;
  timing: string | null;
  instructions: string | null;
  unclear: boolean;
  matchedName: string | null;
  uses: string | null;
}

interface RxResult {
  medicines: RxMedicine[];
  notes: string | null;
}

type Phase = "idle" | "reading" | "done" | "error";

const blobToBase64 = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).split(",")[1]);
    r.onerror = reject;
    r.readAsDataURL(blob);
  });

export default function PrescriptionPage() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [status, setStatus] = useState("");
  const [result, setResult] = useState<RxResult | null>(null);
  const [speaking, setSpeaking] = useState(false);

  const canSpeak =
    typeof window !== "undefined" && "speechSynthesis" in window;
  useEffect(
    () => () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    },
    []
  );

  const handleCapture = async (blob: Blob) => {
    setPhase("reading");
    setStatus("Reading the prescription… handwriting takes a few seconds.");
    try {
      const image = await downscaleImage(blob);
      const base64 = await blobToBase64(image);
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 60_000);
      let res: Response;
      try {
        res = await fetch("/api/prescription", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: base64 }),
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timer);
      }
      if (!res.ok) throw new Error("read failed");
      const data = (await res.json()) as RxResult;
      setResult(data);
      setPhase("done");
    } catch {
      setPhase("error");
      setStatus(
        "The prescription could not be read. Please retake the photo in good light, holding the paper flat — or try again in a moment."
      );
    }
  };

  const toggleSpeak = () => {
    if (!canSpeak || !result) return;
    const synth = window.speechSynthesis;
    if (speaking) {
      synth.cancel();
      setSpeaking(false);
      return;
    }
    const read = result.medicines.filter((m) => !m.unclear && m.name);
    const unclearCount = result.medicines.length - read.length;
    let text = `Your prescription has ${result.medicines.length} medicine lines. `;
    read.forEach((m, i) => {
      text += `${i + 1}. ${m.name}${m.strength ? `, ${m.strength}` : ""}. `;
      if (m.timing) text += `${m.timing}. `;
      if (m.instructions) text += `${m.instructions}. `;
    });
    if (unclearCount > 0) {
      text += `${unclearCount} line${unclearCount === 1 ? " was" : "s were"} not read clearly. Please confirm ${unclearCount === 1 ? "it" : "them"} with your pharmacist. `;
    }
    text += "Always confirm with your pharmacist before taking any medicine.";
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 0.98;
    utter.onend = () => setSpeaking(false);
    utter.onerror = () => setSpeaking(false);
    synth.cancel();
    synth.speak(utter);
    setSpeaking(true);
  };

  return (
    <div className="scan-wrap">
      <div className="scan-card" style={{ maxWidth: 640 }}>
        <span className="eyebrow">Prescription reader</span>
        <h2>Read a prescription</h2>
        <p className="muted" style={{ marginTop: 4 }}>
          Doctor ki likhai samajh nahi ati? Take a photo of the prescription —
          MediLens will list the medicines, how many, when to take them and how.
        </p>

        <aside className="disclaimer" style={{ marginTop: 12 }}>
          <TriangleAlert size={19} />
          <p>
            AI can misread handwriting. This list is a reading aid, not medical
            advice — <b>always confirm every medicine with your pharmacist
            before taking it.</b>
          </p>
        </aside>

        {phase === "idle" && (
          <div style={{ marginTop: 16 }}>
            <CameraCapture onCapture={handleCapture} />
          </div>
        )}

        {phase === "reading" && (
          <div style={{ marginTop: 16 }}>
            <p style={{ fontWeight: 600, margin: "0.4rem 0 0" }}>{status}</p>
            <div className="progress">
              <div style={{ width: "70%" }} />
            </div>
          </div>
        )}

        {phase === "error" && (
          <div className="scan-state" style={{ marginTop: 16 }}>
            <div className="ss-ico">
              <CircleAlert size={26} />
            </div>
            <p style={{ fontWeight: 600, margin: "0 0 1rem" }}>{status}</p>
            <button className="btn" onClick={() => setPhase("idle")}>
              Try again
            </button>
          </div>
        )}

        {phase === "done" && result && (
          <div style={{ marginTop: 16 }}>
            <p style={{ fontWeight: 700, margin: "0 0 4px" }}>
              {result.medicines.length} medicine line
              {result.medicines.length === 1 ? "" : "s"} read
            </p>
            <div className="rx-list">
              {result.medicines.map((m, i) =>
                m.unclear || !m.name ? (
                  <article key={i} className="rx-card unclear">
                    <div className="rx-card-head">
                      <TriangleAlert size={18} />
                      <h3>Not read clearly</h3>
                    </div>
                    <p>
                      This line could not be read safely, so no medicine name
                      was guessed. <b>Confirm this line with your pharmacist.</b>
                    </p>
                    {(m.timing || m.instructions) && (
                      <p className="muted small">
                        {[m.timing, m.instructions].filter(Boolean).join(" · ")}
                      </p>
                    )}
                  </article>
                ) : (
                  <article key={i} className="rx-card">
                    <div className="rx-card-head">
                      <h3>
                        {m.name}
                        {m.strength ? ` ${m.strength}` : ""}
                      </h3>
                      {m.form && <span className="rx-chip">{m.form}</span>}
                    </div>
                    {m.uses && (
                      <p className="rx-uses">{m.uses}</p>
                    )}
                    <dl className="rx-rows">
                      {m.quantity && (
                        <div>
                          <dt>How many</dt>
                          <dd>{m.quantity}</dd>
                        </div>
                      )}
                      {m.timing && (
                        <div>
                          <dt>When</dt>
                          <dd>{m.timing}</dd>
                        </div>
                      )}
                      {m.instructions && (
                        <div>
                          <dt>How</dt>
                          <dd>{m.instructions}</dd>
                        </div>
                      )}
                    </dl>
                  </article>
                )
              )}
            </div>
            {result.notes && (
              <p className="muted small" style={{ marginTop: 10 }}>
                Also on the prescription: {result.notes}
              </p>
            )}
            <div className="verdict-actions" style={{ marginTop: 16 }}>
              {canSpeak && (
                <button
                  className={speaking ? "btn" : "btn btn-secondary"}
                  onClick={toggleSpeak}
                  aria-pressed={speaking}
                >
                  {speaking ? <StopSquare size={17} /> : <Volume size={17} />}
                  {speaking ? "Stop" : "Listen to list"}
                </button>
              )}
              <button
                className="btn"
                onClick={() => {
                  setResult(null);
                  setPhase("idle");
                }}
              >
                <RotateCcw size={17} /> Read another
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
