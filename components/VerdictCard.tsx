"use client";
/**
 * Verdict result screen: animated verdict hero + explained reasons +
 * label reading + actions (PDF export, hotspot reporting, scan again).
 */
import type { VerdictResult, VerdictLevel } from "@/lib/verdict";
import { VERDICT_COPY } from "@/lib/verdict";
import { downloadPdfReport } from "@/lib/pdf";
import { useEffect, useRef, useState } from "react";
import {
  Check,
  FileDown,
  MapPin,
  RotateCcw,
  StopSquare,
  TriangleAlert,
  Volume,
  XIcon,
} from "@/components/icons";
import type { DrugInfo } from "@/lib/drugs";

export interface ScanResult {
  label: {
    drugName: string | null;
    manufacturer: string | null;
    batchNumber: string | null;
    expiryDate: string | null;
    ocrConfidence: number;
  };
  drug: {
    name: string;
    manufacturer: string;
    source: string;
    info?: DrugInfo | null;
  } | null;
  verdict: VerdictResult;
  /** Multi-photo scans only: how many photos were combined. */
  photosUsed?: number;
}

/* ---------- Animated verdict badge (SVG stroke-draw) ---------- */
function VerdictBadge({ level }: { level: VerdictLevel }) {
  const icon =
    level === "green" ? (
      <path className="vbadge-draw" d="M38 52 L48 62 L64 40" pathLength={1} />
    ) : level === "amber" ? (
      <g>
        <path className="vbadge-draw" d="M51 38 L51 58" pathLength={1} />
        <circle className="vbadge-dot" cx="51" cy="68" r="3.2" />
      </g>
    ) : (
      <g>
        <path className="vbadge-draw" d="M41 41 L61 61" pathLength={1} />
        <path className="vbadge-draw vbadge-delay" d="M61 41 L41 61" pathLength={1} />
      </g>
    );
  return (
    <svg className={`vbadge ${level}`} viewBox="20 8 62 84" width="84" height="84" aria-hidden>
      <circle className="vbadge-ring" cx="51" cy="51" r="30" pathLength={1} />
      {icon}
    </svg>
  );
}

/* ---------- Animated confidence count-up ---------- */
function useCountUp(target: number, duration = 900) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(target * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

type ReportState = "idle" | "locating" | "done" | "denied" | "failed";

export default function VerdictCard({
  result,
  onReset,
}: {
  result: ScanResult;
  onReset: () => void;
}) {
  const { verdict } = result;
  const copy = VERDICT_COPY[verdict.level];
  const confidence = Math.round(verdict.confidence * 100);
  const shownConfidence = useCountUp(confidence);
  const [reportState, setReportState] = useState<ReportState>("idle");
  const [pdfBusy, setPdfBusy] = useState(false);
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  /* ---- Listen button: speaks ONLY when tapped (never autoplay) ---- */
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
  const toggleSpeak = () => {
    if (!canSpeak) return;
    const synth = window.speechSynthesis;
    if (speaking) {
      synth.cancel();
      setSpeaking(false);
      return;
    }
    const drugName = result.drug?.name ?? result.label.drugName ?? "This medicine";
    const text = `${drugName}. ${copy.title}. ${copy.advice}`;
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 0.98;
    utter.onend = () => setSpeaking(false);
    utter.onerror = () => setSpeaking(false);
    synth.cancel();
    synth.speak(utter);
    setSpeaking(true);
  };

  const reportToMap = () => {
    if (reportState === "locating") return;
    setReportState("locating");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          await fetch("/api/reports", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              drug_name: result.label.drugName,
              verdict: verdict.level,
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
            }),
          });
          setReportState("done");
        } catch {
          setReportState("failed");
        }
      },
      () => setReportState("denied"),
      { timeout: 8000 }
    );
  };

  const handlePdf = async () => {
    setPdfBusy(true);
    try {
      await downloadPdfReport(result);
    } finally {
      timers.current.push(window.setTimeout(() => setPdfBusy(false), 600));
    }
  };

  const ReasonIcon = () =>
    verdict.level === "green" ? (
      <Check size={13} />
    ) : verdict.level === "amber" ? (
      <TriangleAlert size={13} />
    ) : (
      <XIcon size={13} />
    );

  return (
    <div className="verdict-screen">
      {/* ===== Hero ===== */}
      <section className={`verdict-hero ${verdict.level}`}>
        <div className="fade-up" style={{ "--d": "0ms" } as React.CSSProperties}>
          <VerdictBadge level={verdict.level} />
        </div>
        <p className="eyebrow fade-up" style={{ "--d": "120ms" } as React.CSSProperties}>
          Scan complete
        </p>
        <h2 className="fade-up" style={{ "--d": "200ms" } as React.CSSProperties}>
          {copy.title}
        </h2>
        <p className="verdict-advice fade-up" style={{ "--d": "280ms" } as React.CSSProperties}>
          {copy.advice}
        </p>
        <div className="conf-meter fade-up" style={{ "--d": "360ms" } as React.CSSProperties}>
          <div className="conf-top">
            <span>Confidence</span>
            <span className="conf-num">{shownConfidence}%</span>
          </div>
          <div className="conf-track">
            <div
              className={`conf-fill ${verdict.level}`}
              style={{ width: `${shownConfidence}%` }}
            />
          </div>
          {result.drug && (
            <p className="conf-src">
              Matched via {result.drug.source === "local" ? "local database" : "openFDA"}
            </p>
          )}
          {result.photosUsed && result.photosUsed > 1 && (
            <p className="conf-src">
              Combined from {result.photosUsed} photos
            </p>
          )}
        </div>
        <dl
          className="label-grid fade-up"
          style={{ "--d": "420ms" } as React.CSSProperties}
        >
          <div><dt>Drug</dt><dd>{result.label.drugName ?? "—"}</dd></div>
          <div><dt>Manufacturer</dt><dd>{result.label.manufacturer ?? "—"}</dd></div>
          <div><dt>Batch</dt><dd className="mono">{result.label.batchNumber ?? "—"}</dd></div>
          <div><dt>Expiry</dt><dd className="mono">{result.label.expiryDate ?? "—"}</dd></div>
        </dl>
      </section>

      {/* ===== Why this verdict ===== */}
      <section className="card">
        <h3>Why this verdict</h3>
        <ul className="reason-list" style={{ borderTop: "none", paddingTop: 0, marginTop: 4 }}>
          {verdict.reasons.map((r, i) => (
            <li
              key={i}
              className={`reason-row ${verdict.level} fade-up`}
              style={{ "--d": `${460 + i * 110}ms` } as React.CSSProperties}
            >
              <span className="reason-ico" aria-hidden>
                <ReasonIcon />
              </span>
              <span>{r}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* ===== Honest-limit notes (adversarial review, Oct 2026) ===== */}
      {verdict.level === "green" && result.drug && (
        <section className="card fade-up">
          <p
            className="drug-info-note"
            style={{ marginTop: 0, borderTop: "none", paddingTop: 0 }}
          >
            This check verified the data printed on the pack (name, maker,
            batch, expiry). It cannot verify the physical pack itself — also
            check the hologram, seal and print quality, and buy from a
            trusted pharmacy.
          </p>
        </section>
      )}
      {verdict.level === "red" && !result.drug && (
        <section className="card fade-up">
          <p
            className="drug-info-note"
            style={{ marginTop: 0, borderTop: "none", paddingTop: 0 }}
          >
            This medicine was not found in our lists. That does not prove it
            is fake — it may be new, imported, or misspelled. Please confirm
            with your pharmacist before deciding.
          </p>
        </section>
      )}
      {(result.label.ocrConfidence ?? 1) < 0.6 && (
        <section className="card fade-up">
          <p
            className="drug-info-note"
            style={{ marginTop: 0, borderTop: "none", paddingTop: 0 }}
          >
            The photo was hard to read. Retake it in good light, hold the
            phone steady, and make sure the name, batch and expiry are
            clearly visible.
          </p>
        </section>
      )}

      {/* ===== About this medicine (local DB details) ===== */}
      {result.drug?.info && (
        <section className="card fade-up" style={{ "--d": "520ms" } as React.CSSProperties}>
          <h3>About this medicine</h3>
          <dl className="drug-info">
            <div>
              <dt>Used for</dt>
              <dd>{result.drug.info.uses}</dd>
            </div>
            <div>
              <dt>Usual dose</dt>
              <dd>{result.drug.info.dosage}</dd>
            </div>
            <div>
              <dt>Side effects</dt>
              <dd>{result.drug.info.sideEffects}</dd>
            </div>
            <div>
              <dt>Be careful</dt>
              <dd>{result.drug.info.caution}</dd>
            </div>
          </dl>
          <p className="drug-info-note">
            General information only — always confirm your dose with your doctor
            or pharmacist.
          </p>
        </section>
      )}

      {/* ===== Actions ===== */}
      <div className="verdict-actions fade-up" style={{ "--d": "540ms" } as React.CSSProperties}>
        {canSpeak && (
          <button
            className={speaking ? "btn" : "btn btn-secondary"}
            onClick={toggleSpeak}
            aria-pressed={speaking}
          >
            {speaking ? <StopSquare size={17} /> : <Volume size={17} />}
            {speaking ? "Stop" : "Listen to result"}
          </button>
        )}
        <button className="btn" onClick={onReset}>
          <RotateCcw size={17} /> Scan another
        </button>
        <button className="btn btn-secondary" onClick={handlePdf} disabled={pdfBusy}>
          {pdfBusy ? <span className="spin" aria-hidden /> : <FileDown size={17} />}
          {pdfBusy ? "Preparing…" : "PDF report"}
        </button>
        <button
          className="btn btn-secondary"
          onClick={reportToMap}
          disabled={reportState === "locating" || reportState === "done"}
        >
          {reportState === "locating" ? (
            <span className="spin" aria-hidden />
          ) : reportState === "done" ? (
            <Check size={17} />
          ) : (
            <MapPin size={17} />
          )}
          {reportState === "locating"
            ? "Locating…"
            : reportState === "done"
              ? "Reported"
              : "Report to map"}
        </button>
      </div>
      {reportState === "done" && (
        <p className="report-note ok fade-up">
          <Check size={15} /> Reported anonymously — thank you!
        </p>
      )}
      {reportState === "denied" && (
        <p className="report-note warn fade-up">
          Location permission denied — the report needs your location to place the hotspot.
        </p>
      )}
      {reportState === "failed" && (
        <p className="report-note warn fade-up">
          Couldn&apos;t send the report. Check your connection and try again.
        </p>
      )}

      {/* ===== Safety disclaimer ===== */}
      <aside className="disclaimer fade-up" style={{ "--d": "600ms" } as React.CSSProperties}>
        <TriangleAlert size={19} />
        <p>{verdict.disclaimer}</p>
      </aside>
    </div>
  );
}
