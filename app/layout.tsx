import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MediLens — Medicine Authenticity Checker",
  description:
    "Point your camera at a medicine pack. MediLens verifies it against drug databases and flags likely counterfeits.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#0e7490",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <header className="topbar">
          <a href="/" className="brand">
            <span className="brand-mark">◉</span> MediLens
          </a>
          <nav>
            <a href="/scan">Scan</a>
            <a href="/history">History</a>
            <a href="/map">Map</a>
          </nav>
        </header>
        <main className="container">{children}</main>
        <footer className="footer">
          MediLens is a screening assistant, not a medical device. Always
          consult a pharmacist or doctor.
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
