import Reveal from "@/components/Reveal";

/**
 * MediLens landing page — international-competition grade first impression:
 * cinematic hero, live phone mockup, crisis stats, how-it-works, verdict
 * showcase, tech marquee and a closing CTA.
 */
export default function Home() {
  return (
    <>
      {/* ================= HERO ================= */}
      <section className="hero">
        <div className="hero-bg">
          <div className="orb orb-1" />
          <div className="orb orb-2" />
          <div className="orb orb-3" />
          <div className="grid-overlay" />
        </div>
        <div className="hero-inner container">
          <span className="pill">
            <span className="dot" /> AI-powered medicine verification
          </span>
          <h1>
            Is this medicine <span className="grad-text">genuine?</span>
          </h1>
          <p className="lead">
            Point your phone camera at any medicine pack. MediLens reads the
            label, checks it against drug databases, and gives you an explained
            red&nbsp;/&nbsp;amber&nbsp;/&nbsp;green safety verdict — in seconds.
          </p>
          <div className="cta-row">
            <a className="btn" href="/scan">
              📷 Scan a medicine
            </a>
            <a className="btn btn-ghost" href="#how">
              See how it works
            </a>
          </div>
          <div className="stats">
            <div className="stat">
              <b>1 in 10</b>
              <span>medicines falsified in LMICs (WHO)</span>
            </div>
            <div className="stat">
              <b>~5 sec</b>
              <span>from photo to verdict</span>
            </div>
            <div className="stat">
              <b>Rs 0</b>
              <span>free forever, no hardware</span>
            </div>
          </div>

          {/* Phone mockup — the "wow" visual */}
          <div className="hero-visual">
            <div className="phone">
              <div className="phone-screen">
                <div className="phone-notch">
                  <i />
                </div>
                <div className="mock-scan">
                  <div className="mock-view">
                    <div className="mock-laser" />
                    <div className="mock-pack">
                      PANADOL
                      <small>GSK · Batch B12345</small>
                    </div>
                  </div>
                  <div className="mock-verdict">
                    <span className="tick">✓</span>
                    <div>
                      <b>Likely genuine</b>
                      <span>GSK record · expiry valid</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= TECH MARQUEE ================= */}
      <div className="marquee" aria-hidden>
        <div className="marquee-track">
          {[
            "NEXT.JS 14", "GEMINI VISION AI", "OPENFDA DATA", "SUPABASE",
            "TESSERACT OCR", "LEAFLET MAPS", "PWA OFFLINE-FIRST", "JSPDF REPORTS",
            "NEXT.JS 14", "GEMINI VISION AI", "OPENFDA DATA", "SUPABASE",
            "TESSERACT OCR", "LEAFLET MAPS", "PWA OFFLINE-FIRST", "JSPDF REPORTS",
          ].map((t, i) => (
            <span key={i}>{t} ✦</span>
          ))}
        </div>
      </div>

      {/* ================= PROBLEM ================= */}
      <section className="section">
        <div className="container">
          <Reveal>
            <div className="center">
              <span className="eyebrow">The crisis</span>
              <h2>
                Counterfeit medicine is a <span className="grad-text">silent epidemic</span>
              </h2>
              <p className="sub">
                Fake and substandard drugs don&apos;t just waste money — they
                fail to cure, breed resistance, and kill. The technology to
                fight back fits in your pocket.
              </p>
            </div>
          </Reveal>
          <div className="grid3">
            <Reveal>
              <div className="card stat-card">
                <b className="red">1 in 10</b>
                <h3>Falsified medicines</h3>
                <p>
                  WHO estimate for low- and middle-income countries — the very
                  places with the weakest verification infrastructure.
                </p>
              </div>
            </Reveal>
            <Reveal delay="reveal-d1">
              <div className="card stat-card">
                <b className="amber">$0</b>
                <h3>Cost of checking today</h3>
                <p>
                  There is no consumer tool for this. Patients either trust the
                  pack blindly or pay for lab tests they can&apos;t afford.
                </p>
              </div>
            </Reveal>
            <Reveal delay="reveal-d2">
              <div className="card stat-card">
                <b className="cyan">5 sec</b>
                <h3>MediLens verdict time</h3>
                <p>
                  One photo → AI label reading → database match → explained
                  verdict. No lab, no hardware, no cost.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section className="section" id="how">
        <div className="container">
          <Reveal>
            <div className="center">
              <span className="eyebrow">How it works</span>
              <h2>
                Photo in. <span className="grad-text">Verdict out.</span>
              </h2>
              <p className="sub">
                A four-stage pipeline engineered for speed, accuracy and — most
                importantly — explainability. Every verdict tells you exactly
                why.
              </p>
            </div>
          </Reveal>
          <div className="grid3">
            <Reveal>
              <div className="card">
                <div className="step-num">01</div>
                <h3>Capture</h3>
                <p>
                  The PWA opens your camera with a guided viewfinder. Snap the
                  pack&apos;s front label — or upload a photo.
                </p>
              </div>
            </Reveal>
            <Reveal delay="reveal-d1">
              <div className="card">
                <div className="step-num">02</div>
                <h3>Read &amp; match</h3>
                <p>
                  Gemini vision extracts drug name, manufacturer, batch and
                  expiry — then matches against a curated drug database and the
                  openFDA registry.
                </p>
              </div>
            </Reveal>
            <Reveal delay="reveal-d2">
              <div className="card">
                <div className="step-num">03</div>
                <h3>Verdict</h3>
                <p>
                  A transparent rule engine scores the pack red, amber or
                  green — with every reason listed, plus a PDF report for your
                  pharmacist.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ================= VERDICT SHOWCASE ================= */}
      <section className="section">
        <div className="container">
          <Reveal>
            <div className="center">
              <span className="eyebrow">Explainable by design</span>
              <h2>
                Not a black box. <span className="grad-text">A reasoning.</span>
              </h2>
              <p className="sub">
                Unlike pure-AI guesswork, MediLens applies auditable rules — so
                a pharmacist can trust, verify and act on every result.
              </p>
            </div>
          </Reveal>
          <div className="grid3">
            <Reveal>
              <div className="verdict-mini green">
                <span className="tag">🟢 Likely genuine</span>
                <p>
                  “Matched Panadol in the local database. Manufacturer matches
                  GSK. Expiry valid. All critical checks passed.”
                </p>
              </div>
            </Reveal>
            <Reveal delay="reveal-d1">
              <div className="verdict-mini amber">
                <span className="tag">🟡 Needs attention</span>
                <p>
                  “Manufacturer on pack does not match the registered maker.
                  Check carefully or ask your pharmacist before use.”
                </p>
              </div>
            </Reveal>
            <Reveal delay="reveal-d2">
              <div className="verdict-mini red">
                <span className="tag">🔴 High risk</span>
                <p>
                  “This medicine is EXPIRED. Do not use it. Take it to a
                  pharmacist.”
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section className="section">
        <div className="container">
          <Reveal>
            <div className="center">
              <span className="eyebrow">Full system</span>
              <h2>
                More than a <span className="grad-text">scanner</span>
              </h2>
            </div>
          </Reveal>
          <div className="grid3">
            {[
              ["🗺️", "Hotspot map", "Anonymised community reports reveal where suspicious packs cluster — an early-warning system for regulators."],
              ["📄", "Pharmacist reports", "One-tap PDF reports with the full reasoning chain, ready to hand to a professional."],
              ["📶", "Offline-first PWA", "Installs like a native app. The curated drug database and on-device OCR keep working with no internet."],
              ["🔒", "Privacy by design", "Hotspot coordinates are rounded to ~1 km before storage. No exact location ever leaves your phone."],
              ["🌐", "openFDA backed", "Falls back to the US FDA's public drug registry when the local database has no match."],
              ["⚡", "Dual OCR engine", "Gemini vision when online, Tesseract.js on-device when not. The scan never dead-ends."],
            ].map(([icon, title, text], i) => (
              <Reveal key={title} delay={i % 3 === 1 ? "reveal-d1" : i % 3 === 2 ? "reveal-d2" : ""}>
                <div className="card">
                  <div className="icon">{icon}</div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="section">
        <div className="container">
          <Reveal>
            <div className="cta-band">
              <h2>Check your medicine. Right now.</h2>
              <p>
                Free forever. No account needed. No hardware. Just your phone
                camera and five seconds.
              </p>
              <a className="btn btn-light" href="/scan">
                📷 Start scanning
              </a>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
