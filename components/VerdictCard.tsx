"use client";
/**
 * Verdict result screen: animated verdict hero + explained reasons +
 * label reading + actions (PDF export, hotspot reporting, scan again).
 */
import type { VerdictResult, VerdictLevel } from "@/lib/verdict";
import { VERDICT_COPY } from "@/lib/verdict";
import { downloadPdfReport } from "@/lib/pdf";
import { useEffect, useRef, useState } from "react";

export interface ScanResult {
  label: {
    drugName: string | null;
    manufacturer: string | null;
    batchNumber: string | null;
    expiryDate: string | null;
    ocrConfidence: number;
  };
  drug: { name: string; manufacturer: string; source: string } | null;
  verdict: VerdictResult;
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
    <svg className={`vbadge ${level}`} viewBox="20 8 62 84" width="96" height="96" aria-hidden>
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

  const reasonIcon = (i: number) =>
    verdict.level === "green" ? "✓" : verdict.level === "amber" ? "!" : "✕";

  return (
    <div className="verdict-screen">
      {/* ===== Hero ===== */}
      <section className={`verdict-hero ${verdict.level}`}>
        <div className="verdict-hero-glow" aria-hidden />
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
            <div className="conf-fill" style={{ width: `${shownConfidence}%` }} />
          </div>
          {result.drug && (
            <p className="conf-src">
              Matched via {result.drug.source === "local" ? "local database" : "openFDA"}
            </p>
          )}
        </div>
      </section>

      {/* ===== Why this verdict ===== */}
      <section className="card">
        <h3 style={{ marginTop: 0 }}>Why this verdict</h3>
        <ul className="reason-list">
          {verdict.reasons.map((r, i) => (
            <li
              key={i}
              className={`reason-row ${verdict.level} fade-up`}
              style={{ "--d": `${420 + i * 110}ms` } as React.CSSProperties}
            >
              <span className="reason-ico" aria-hidden>{reasonIcon(i)}</span>
              <span>{r}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* ===== Label reading ===== */}
      <section className="card">
        <h3 style={{ marginTop: 0 }}>Label reading</h3>
        <dl className="label-grid">
          <div><dt>Drug</dt><dd>{result.label.drugName ?? "—"}</dd></div>
          <div><dt>Manufacturer</dt><dd>{result.label.manufacturer ?? "—"}</dd></div>
          <div><dt>Batch</dt><dd className="mono">{result.label.batchNumber ?? "—"}</dd></div>
          <div><dt>Expiry</dt><dd className="mono">{result.label.expiryDate ?? "—"}</dd></div>
        </dl>
      </section>

      {/* ===== Actions ===== */}
      <div className="verdict-actions fade-up" style={{ "--d": "500ms" } as React.CSSProperties}>
        <button className="btn" onClick={onReset}>
          <span aria-hidden>↻</span> Scan another
        </button>
        <button className="btn btn-secondary" onClick={handlePdf} disabled={pdfBusy}>
          {pdfBusy ? <span className="spin" aria-hidden /> : <span aria-hidden>⬇</span>}
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
            <span aria-hidden>✓</span>
          ) : (
            <span aria-hidden>📍</span>
          )}
          {reportState === "locating"
            ? "Locating…"
            : reportState === "done"
              ? "Reported"
              : "Report to map"}
        </button>
      </div>
      {reportState === "done" && (
        <p className="report-note ok fade-up">✓ Reported anonymously — thank you!</p>
      )}
      {reportState === "denied" && (
        <p className="report-note warn fade-up">
          Location permission denied — the report needs your location to place the hotspot.
        </p>
      )}
      {reportState === "failed" && (
        <p className="report-note warn fade-up">
          Couldn't send the report. Check your connection and try again.
        </p>
      )}

      {/* ===== Safety disclaimer ===== */}
      <aside className="disclaimer fade-up" style={{ "--d": "560ms" } as React.CSSProperties}>
        <span aria-hidden>⚠️</span>
        <p>{verdict.disclaimer}</p>
      </aside>
    </div>
  );
}
