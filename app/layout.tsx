import type { Metadata, Viewport } from "next";
import { Manrope, Inter, IBM_Plex_Mono } from "next/font/google";
import { DISCLAIMER } from "@/lib/verdict";
import { LogoMark, ScanLine } from "@/components/icons";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-manrope",
  display: "swap",
});
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["500"],
  variable: "--font-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MediLens — Medicine Authenticity Checker",
  description:
    "Scan any medicine pack and get an AI-powered verdict: genuine, needs attention, or high risk. Spot counterfeit medicines before they reach your family.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#FFFFFF",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${inter.variable} ${plexMono.variable}`}
    >
      <body>
        <div className="grain" aria-hidden />
        <header className="topbar">
          <div className="topbar-in">
            <a href="/" className="brand">
              <LogoMark />
              Medi<em>Lens</em>
            </a>
            <nav>
              <a href="/scan">Scan</a>
              <a href="/map">Hotspot map</a>
              <a href="/history">History</a>
              <a href="/scan" className="nav-cta">
                <ScanLine size={16} /> Scan a pack
              </a>
            </nav>
          </div>
        </header>
        <main>{children}</main>
        <footer className="footer">
          <div className="footer-in">
            <div className="footer-top">
              <a href="/" className="brand">
                <LogoMark />
                Medi<em>Lens</em>
              </a>
              <nav>
                <a href="/scan">Scan a medicine</a>
                <a href="/map">Hotspot map</a>
                <a href="/history">Scan history</a>
              </nav>
            </div>
            <p className="fineprint">
              <b>Safety note:</b> {DISCLAIMER}
            </p>
            <p className="fineprint">
              MediLens is a student-built awareness tool. Always buy medicines
              from licensed pharmacies and consult a pharmacist or doctor with
              any concern.
            </p>
          </div>
        </footer>
        <script
          dangerouslySetInnerHTML={{
            __html: `if ('serviceWorker' in navigator) { window.addEventListener('load', () => { navigator.serviceWorker.register('/sw.js').catch(()=>{}); }); }`,
          }}
        />
      </body>
    </html>
  );
}
