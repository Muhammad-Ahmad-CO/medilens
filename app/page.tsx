import Reveal from "@/components/Reveal";
import { LOCAL_DRUGS } from "@/lib/drugs";
import {
  CountUp,
  HeroScene,
  PenaltyBars,
  VerdictShowcase,
} from "@/components/home-widgets";
import {
  ArrowRight,
  Camera,
  Database,
  FileText,
  Layers,
  MapPin,
  ScanLine,
  ShieldCheck,
  WifiOff,
} from "@/components/icons";

/**
 * MediLens home — clinical v3 design (approved mock):
 * pinned photo hero, photo strip, deep-green crisis band, sample scan
 * feed, verdict showcase, how-it-works, medicine index, hotspot panel,
 * features, closing.
 */

const FEED: { level: "green" | "amber" | "red"; drug: string; place: string; time: string }[] = [
  { level: "green", drug: "Panadol 500mg", place: "Karachi", time: "2 min ago" },
  { level: "red", drug: "Brufen 400mg — expired", place: "Lahore", time: "9 min ago" },
  { level: "green", drug: "Augmentin 625mg", place: "Islamabad", time: "14 min ago" },
  { level: "amber", drug: "Disprin — label unclear", place: "Hyderabad", time: "21 min ago" },
  { level: "green", drug: "Flagyl 400mg", place: "Faisalabad", time: "26 min ago" },
  { level: "red", drug: "Unknown pack — no match", place: "Multan", time: "33 min ago" },
  { level: "green", drug: "Risek 20mg", place: "Rawalpindi", time: "41 min ago" },
  { level: "amber", drug: "Arinac — batch unconfirmed", place: "Peshawar", time: "48 min ago" },
];

const FEATURES = [
  {
    icon: <Camera size={22} />,
    title: "Camera-first scanning",
    text: "No typing, no barcodes to hunt for. Photograph the front of the pack and MediLens reads the printed label — name, maker, batch and expiry.",
  },
  {
    icon: <Database size={22} />,
    title: "Checked against real records",
    text: "Every reading is cross-checked against a local formulary of common Pakistani medicines and the openFDA database used by regulators.",
  },
  {
    icon: <Layers size={22} />,
    title: "Layered safety checks",
    text: "Database match, manufacturer match and expiry logic combine into one confidence score. Hard failures — like an expired date — cannot be outvoted.",
  },
  {
    icon: <FileText size={22} />,
    title: "Explained verdicts + PDF",
    text: "You see exactly why a pack passed or failed, in plain words, and can download a PDF report to show a pharmacist or keep for your records.",
  },
  {
    icon: <MapPin size={22} />,
    title: "Community hotspot map",
    text: "Anonymous reports build a live map of where suspicious packs are being found, so neighbourhoods can be warned early.",
  },
  {
    icon: <WifiOff size={22} />,
    title: "Works when AI is offline",
    text: "If the cloud vision service is unavailable, on-device text reading takes over automatically. A weak connection never blocks a safety check.",
  },
];

const STEPS = [
  {
    num: "01",
    icon: <Camera size={20} />,
    title: "Photograph the pack",
    text: "Open the scanner and photograph the front label of any medicine pack — strip, bottle or box. Good light and a straight angle give the clearest reading, and there is an upload option if the camera is unavailable.",
  },
  {
    num: "02",
    icon: <ScanLine size={20} />,
    title: "AI reads the label",
    text: "Vision AI extracts the medicine name, manufacturer, batch number and expiry date from the photo. If the cloud service is unreachable, the same reading happens on your device instead — automatically.",
  },
  {
    num: "03",
    icon: <Database size={20} />,
    title: "Cross-checked against databases",
    text: "The reading is matched against a local formulary of common medicines and the openFDA database. The maker on the pack must agree with the official record, and the expiry date must be valid and in the future.",
  },
  {
    num: "04",
    icon: <ShieldCheck size={20} />,
    title: "A verdict you can act on",
    text: "The checks combine into green, amber or red — each with its reasons listed in plain language. Save the PDF report, and if a pack looks wrong, report it anonymously to the community hotspot map.",
  },
];

export default function Home() {
  return (
    <>
      <HeroScene />

      {/* ---------- photo strip ---------- */}
      <section className="section" style={{ paddingTop: 84 }}>
        <div className="wrap">
          <Reveal>
            <div className="strip">
              <figure>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/img/hero-pharmacy.jpg" alt="Pharmacy shelves stocked with medicine packs" loading="lazy" />
                <figcaption>Real packs, real shelves — the label is the evidence</figcaption>
              </figure>
              <figure className="tall">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/img/researcher.jpg" alt="A researcher examining samples in a laboratory" loading="lazy" />
                <figcaption>Verified against trusted records</figcaption>
              </figure>
              <figure className="tall">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/img/lab.jpg" alt="Laboratory testing of medicine samples" loading="lazy" />
                <figcaption>Built for families, not labs</figcaption>
              </figure>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------- crisis band ---------- */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <Reveal>
            <div className="crisis">
              <div className="inner">
                <div>
                  <span className="eyebrow">Why this matters</span>
                  <h2>
                    Fake medicine is not a small problem. It is a global one.
                  </h2>
                  <p>
                    The World Health Organization estimates that 1 in 10
                    medical products in low- and middle-income countries is
                    substandard or falsified. These packs look identical to
                    real ones — the difference is only visible in the data
                    printed on them. That is exactly what MediLens checks.
                  </p>
                  <div className="big-stat">
                    <div>
                      <b>
                        1 in <CountUp to={10} />
                      </b>
                      <span>medical products may be fake or substandard (WHO)</span>
                    </div>
                    <div>
                      <b>
                        <CountUp to={10.5} decimals={1} prefix="$" suffix="B" />
                      </b>
                      <span>spent yearly on falsified medicines worldwide</span>
                    </div>
                  </div>
                </div>
                <PenaltyBars />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------- sample scan feed ---------- */}
      <section className="feed-sec" aria-label="Sample recent scans">
        <div className="wrap">
          <div className="feed-head">
            <span className="dot" /> Recent community scans — sample activity
          </div>
        </div>
        <div className="feed-viewport">
          <div className="feed-track">
            {[...FEED, ...FEED].map((f, i) => (
              <div className="feed-item" key={i} aria-hidden={i >= FEED.length}>
                <span className={`fdot ${f.level}`} />
                <div>
                  <b>{f.drug}</b>
                  <span>
                    {f.place} · {f.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- verdict showcase ---------- */}
      <section className="section">
        <div className="wrap">
          <Reveal>
            <VerdictShowcase />
          </Reveal>
        </div>
      </section>

      {/* ---------- how it works ---------- */}
      <section className="section alt" id="how">
        <div className="wrap">
          <Reveal>
            <div className="sec-head">
              <span className="eyebrow">How it works</span>
              <h2>
                From photo to verdict in <span className="u">four steps</span>
              </h2>
              <p>
                No sign-up, no app install, nothing to learn. If you can take
                a photo, you can verify a medicine.
              </p>
            </div>
          </Reveal>
          <div className="steps">
            {STEPS.map((s, i) => (
              <Reveal key={s.num} delay={i === 1 ? "reveal-d1" : i === 2 ? "reveal-d2" : ""}>
                <div className="step">
                  <span className="num">{s.num}</span>
                  <h3>
                    {s.icon} {s.title}
                  </h3>
                  <p>{s.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- medicine index ---------- */}
      <section className="section">
        <div className="wrap">
          <Reveal>
            <div className="sec-head">
              <span className="eyebrow">Medicine index</span>
              <h2>
                The local formulary, <span className="u">in the open</span>
              </h2>
              <p>
                These common medicines are verified instantly against
                MediLens&apos;s built-in records — and every scan is also
                checked against openFDA, so the index keeps growing beyond
                this list.
              </p>
            </div>
          </Reveal>
          <Reveal delay="reveal-d1">
            <div className="med-index" style={{ marginTop: 40 }}>
              <div className="med-head">
                <span>Medicine</span>
                <span>Manufacturer</span>
                <span className="h-form">Details</span>
                <span className="h-src">Source</span>
              </div>
              {LOCAL_DRUGS.map((d) => (
                <div className="med-row" key={d.name}>
                  <span className="name">{d.name}</span>
                  <span className="mfr">{d.manufacturer}</span>
                  <span className="form">{d.notes ?? "—"}</span>
                  <span className="src">LOCAL DB</span>
                </div>
              ))}
              <div className="med-foot">
                <span>
                  {LOCAL_DRUGS.length} medicines in the local index · plus live
                  openFDA lookups on every scan
                </span>
                <a href="/scan" style={{ color: "var(--accent-strong)", fontWeight: 600, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 5 }}>
                  Scan one now <ArrowRight size={14} />
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------- hotspot panel ---------- */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <Reveal>
            <div className="map-panel">
              <div className="map-copy">
                <span className="eyebrow">Community watch</span>
                <h3>See where suspicious packs are being found</h3>
                <p>
                  Every scan can be reported anonymously. Grouped together,
                  those reports form a hotspot map that warns whole
                  neighbourhoods — and helps authorities spot patterns early.
                </p>
                <div className="map-legend">
                  <span>
                    <i style={{ background: "#B3261E" }} /> High risk
                  </span>
                  <span>
                    <i style={{ background: "#B45309" }} /> Needs attention
                  </span>
                  <span>
                    <i style={{ background: "#177245" }} /> Likely genuine
                  </span>
                </div>
                <div>
                  <a className="btn btn-secondary" href="/map">
                    <MapPin size={18} /> Open the hotspot map
                  </a>
                </div>
              </div>
              <div className="map-visual" aria-hidden>
                <svg viewBox="0 0 600 380" preserveAspectRatio="none">
                  <g stroke="#C9D6D0" strokeWidth="1">
                    <path d="M0 70 H600 M0 150 H600 M0 230 H600 M0 310 H600" />
                    <path d="M90 0 V380 M210 0 V380 M330 0 V380 M450 0 V380" />
                  </g>
                  <path d="M-10 300 C140 250, 240 330, 380 260 S560 190, 620 210" stroke="#0E7A5F" strokeWidth="7" fill="none" strokeLinecap="round" opacity="0.5" />
                  <path d="M60 -10 C110 110, 60 240, 130 390" stroke="#C9D6D0" strokeWidth="10" fill="none" opacity="0.7" />
                  <path d="M330 -10 C300 120, 420 220, 400 390" stroke="#C9D6D0" strokeWidth="8" fill="none" opacity="0.6" />
                </svg>
                <span className="pin-dot" style={{ left: "22%", top: "30%", background: "#B3261E", color: "#B3261E" }} />
                <span className="pin-dot" style={{ left: "55%", top: "52%", background: "#B45309", color: "#B45309", animationDelay: "0.6s" }} />
                <span className="pin-dot" style={{ left: "74%", top: "24%", background: "#177245", color: "#177245", animationDelay: "1.1s" }} />
                <span className="pin-dot" style={{ left: "40%", top: "72%", background: "#177245", color: "#177245", animationDelay: "1.6s" }} />
                <span className="pin-dot" style={{ left: "84%", top: "64%", background: "#B3261E", color: "#B3261E", animationDelay: "0.3s" }} />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------- features ---------- */}
      <section className="section alt">
        <div className="wrap">
          <Reveal>
            <div className="sec-head center">
              <span className="eyebrow center">Why MediLens</span>
              <h2>
                Built like a medical product, <span className="u">not a demo</span>
              </h2>
            </div>
          </Reveal>
          <div className="feat-grid">
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={i % 3 === 1 ? "reveal-d1" : i % 3 === 2 ? "reveal-d2" : ""}>
                <div className="feat">
                  <span className="f-ico">{f.icon}</span>
                  <h3>{f.title}</h3>
                  <p>{f.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- closing ---------- */}
      <section className="section">
        <div className="wrap">
          <Reveal>
            <div className="closing">
              <div className="inner">
                <h2>Ten seconds of checking can prevent a lifetime of harm.</h2>
                <p>
                  The next pack you buy for your family deserves those ten
                  seconds. Scan it — and know.
                </p>
                <a className="btn btn-light" href="/scan">
                  Scan a medicine pack <ArrowRight size={18} />
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
