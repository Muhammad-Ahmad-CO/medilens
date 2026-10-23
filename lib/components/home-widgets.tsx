"use client";
/**
 * Interactive pieces of the home page:
 * - HeroScene: pinned hero, scroll progress drives --p (card rise, lens drift)
 * - CountUp: numbers count when they enter the viewport
 * - PenaltyBars: signal-strength bars animate when visible
 * - VerdictShowcase: three-verdict tab switcher
 */
import { useEffect, useRef, useState } from "react";
import { VERDICT_COPY, type VerdictLevel } from "@/lib/verdict";
import {
  ArrowDown,
  BadgeCheck,
  Check,
  CircleCheck,
  OctagonX,
  TriangleAlert,
  XIcon,
} from "@/components/icons";

/* ---------------- CountUp ---------------- */
export function CountUp({
  to,
  decimals = 0,
  prefix = "",
  suffix = "",
}: {
  to: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [val, setVal] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const dur = 1400;
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / dur);
          const eased = 1 - Math.pow(1 - t, 3);
          setVal(to * eased);
          if (t < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [to]);
  return (
    <span ref={ref}>
      {prefix}
      {val.toFixed(decimals)}
      {suffix}
    </span>
  );
}

/* ---------------- Hero ---------------- */
export function HeroScene() {
  const pinRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const pin = pinRef.current;
    if (!pin) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const rect = pin.getBoundingClientRect();
      const total = pin.offsetHeight - window.innerHeight;
      const p = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 1;
      pin.style.setProperty("--p", p.toFixed(3));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section className="hero-pin" ref={pinRef}>
      <div className="hero-sticky">
        <div className="wrap hero-grid">
          <div className="hero-copy">
            <span className="pill">
              <span className="dot" /> AI medicine verification — free, no sign-up
            </span>
            <h1>
              Know your medicine is <span className="u">real</span> before you
              take it.
            </h1>
            <p className="hero-lead">
              Point your phone at any medicine pack. MediLens reads the label,
              checks it against trusted drug databases and gives you a clear
              verdict in seconds — genuine, needs attention, or high risk.
            </p>
            <div className="hero-ctas">
              <a className="btn" href="/scan">
                <BadgeCheck size={19} /> Scan a medicine pack
              </a>
              <a className="btn btn-secondary" href="#how">
                See how it works
              </a>
            </div>
            <div className="hero-meta">
              <div className="m">
                <b>
                  <CountUp to={2} /> databases
                </b>
                <span>cross-checked per scan</span>
              </div>
              <div className="m">
                <b>
                  &lt;<CountUp to={10} /> sec
                </b>
                <span>from photo to verdict</span>
              </div>
              <div className="m">
                <b>
                  <CountUp to={100} />% free
                </b>
                <span>no account needed</span>
              </div>
            </div>
          </div>

          <div className="hero-panel">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="main"
              src="/img/hero-pharmacy.jpg"
              alt="A pharmacist reviewing medicine packs on pharmacy shelves"
            />
            <span className="hero-chip">
              <span className="dot" /> Live verification
            </span>
            <span className="hero-chip mono" style={{ left: "auto", right: 16, top: 16 }}>
              OCR · 98.2%
            </span>
            <div className="hero-lens" aria-hidden>
              <svg viewBox="0 0 120 120" fill="none">
                <circle cx="52" cy="52" r="40" stroke="#0E7A5F" strokeWidth="7" fill="rgba(255,255,255,0.25)" />
                <path d="M84 84 L110 110" stroke="#0B1F19" strokeWidth="11" strokeLinecap="round" />
                <path d="M38 52 h28 M52 38 v28" stroke="#0E7A5F" strokeWidth="7" strokeLinecap="round" />
              </svg>
            </div>
            <div className="hero-vcard">
              <div className="row1">
                <span className="badge-ico green">
                  <CircleCheck size={22} />
                </span>
                <div>
                  <div className="vt">Likely genuine</div>
                  <div className="vs">All checks passed</div>
                </div>
                <div className="conf">
                  <b>96%</b>
                  <span>Confidence</span>
                </div>
              </div>
              <dl className="meta">
                <div>
                  <dt>Medicine</dt>
                  <dd>Panadol 500mg</dd>
                </div>
                <div>
                  <dt>Maker</dt>
                  <dd>GSK</dd>
                </div>
                <div>
                  <dt>Batch</dt>
                  <dd className="mono">B2417</dd>
                </div>
                <div>
                  <dt>Expiry</dt>
                  <dd className="mono">08 / 2027</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
        <div className="scroll-hint" aria-hidden>
          Scroll
          <ArrowDown size={15} />
        </div>
      </div>
    </section>
  );
}

/* ---------------- Penalty bars ---------------- */
const BARS: { label: string; pct: number; display: string; cls: string }[] = [
  { label: "Genuine pack — all signals pass", pct: 96, display: "96 / 100", cls: "green" },
  { label: "Unclear photo or worn label", pct: 58, display: "58 / 100", cls: "amber" },
  { label: "Expired pack", pct: 22, display: "22 / 100", cls: "red" },
  { label: "Unknown medicine, no database match", pct: 8, display: "8 / 100", cls: "red" },
];

export function PenaltyBars() {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setOn(true);
          io.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div className="penalty" ref={ref}>
      <div className="p-head">
        <span>How the verdict engine scores a pack</span>
        <b>signal strength</b>
      </div>
      {BARS.map((b) => (
        <div className="pbar" key={b.label}>
          <div className="t">
            <span>{b.label}</span>
            <b>{b.display}</b>
          </div>
          <div className="track">
            <div
              className={`fill ${b.cls}`}
              style={{ width: on ? `${b.pct}%` : 0 }}
            />
          </div>
        </div>
      ))}
      <p className="note">
        Every failed check lowers the score. One hard failure — an expired date
        or no database match — is enough for a high-risk verdict.
      </p>
    </div>
  );
}

/* ---------------- Verdict showcase ---------------- */
const SHOW: Record<
  VerdictLevel,
  {
    icon: React.ReactNode;
    conf: number;
    reasons: string[];
    label: { drug: string; maker: string; batch: string; expiry: string };
  }
> = {
  green: {
    icon: <CircleCheck size={26} />,
    conf: 96,
    reasons: [
      "Medicine found in a trusted drug database",
      "Manufacturer on the pack matches the record (GSK)",
      "Expiry date 08/2027 is in the future",
    ],
    label: { drug: "Panadol", maker: "GSK", batch: "B2417", expiry: "08/2027" },
  },
  amber: {
    icon: <TriangleAlert size={26} />,
    conf: 58,
    reasons: [
      "Label text was hard to read — photo may be blurry",
      "Batch number could not be fully confirmed",
      "Safer to verify with the pharmacist before use",
    ],
    label: { drug: "Disprin", maker: "Reckitt", batch: "Partially read", expiry: "Not read" },
  },
  red: {
    icon: <OctagonX size={26} />,
    conf: 91,
    reasons: [
      "This pack expired in 01/2020 — do not use it",
      "Expired medicines can lose strength or become unsafe",
      "Return it to a pharmacy for safe disposal",
    ],
    label: { drug: "Brufen", maker: "Abbott", batch: "X99", expiry: "01/2020" },
  },
};

const TABS: { level: VerdictLevel; blurb: string }[] = [
  { level: "green", blurb: "Name, maker and dates all match the official record." },
  { level: "amber", blurb: "Something could not be confirmed. Check before you take it." },
  { level: "red", blurb: "Expired, unknown or mismatched. Do not take this medicine." },
];

export function VerdictShowcase() {
  const [active, setActive] = useState<VerdictLevel>("green");
  const copy = VERDICT_COPY[active];
  const show = SHOW[active];
  return (
    <div className="show-layout">
      <div className="show-copy">
        <span className="eyebrow">The verdict</span>
        <h2>
          Three answers. <span className="u">No confusion.</span>
        </h2>
        <p>
          Every scan ends in one of three plain-language verdicts, each with
          the reasons spelled out — so a worried parent at midnight gets a
          clear answer, not a technical report.
        </p>
        <div className="vtabs">
          {TABS.map((t) => (
            <button
              key={t.level}
              className={`vtab ${t.level} ${active === t.level ? "active" : ""}`}
              onClick={() => setActive(t.level)}
              aria-pressed={active === t.level}
            >
              <span className={`badge-ico ${t.level}`}>
                {t.level === "green" ? (
                  <CircleCheck size={20} />
                ) : t.level === "amber" ? (
                  <TriangleAlert size={20} />
                ) : (
                  <OctagonX size={20} />
                )}
              </span>
              <span>
                <b>{VERDICT_COPY[t.level].title}</b>
                <span>{t.blurb}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
      <div className="show-card" aria-live="polite">
        <div className="fade-in" key={active}>
          <div className="sc-head">
            <span className={`badge-ico ${active}`}>{show.icon}</span>
            <div>
              <h3>{copy.title}</h3>
              <div className="sc-sub">Scan result — example</div>
            </div>
          </div>
          <p className="sc-advice">{copy.advice}</p>
          <div className="conf">
            <div className="conf-top">
              <span>Confidence</span>
              <span className="conf-num">{show.conf}%</span>
            </div>
            <div className="conf-track">
              <div className={`conf-fill ${active}`} style={{ width: `${show.conf}%` }} />
            </div>
            <p className="conf-src">Matched via local database + openFDA</p>
          </div>
          <ul className="reason-list">
            {show.reasons.map((r) => (
              <li key={r} className={`reason-row ${active}`}>
                <span className="reason-ico" aria-hidden>
                  {active === "green" ? (
                    <Check size={13} />
                  ) : active === "amber" ? (
                    <TriangleAlert size={13} />
                  ) : (
                    <XIcon size={13} />
                  )}
                </span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
          <dl className="label-grid">
            <div>
              <dt>Drug</dt>
              <dd>{show.label.drug}</dd>
            </div>
            <div>
              <dt>Manufacturer</dt>
              <dd>{show.label.maker}</dd>
            </div>
            <div>
              <dt>Batch</dt>
              <dd className="mono">{show.label.batch}</dd>
            </div>
            <div>
              <dt>Expiry</dt>
              <dd className="mono">{show.label.expiry}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
