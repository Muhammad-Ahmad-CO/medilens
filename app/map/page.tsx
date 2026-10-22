"use client";
/**
 * /map page — Leaflet must not render on the server, so the map component
 * is dynamically imported with ssr: false.
 */
import dynamic from "next/dynamic";

const HotspotMap = dynamic(() => import("@/components/HotspotMap"), {
  ssr: false,
  loading: () => <p className="muted">Loading map…</p>,
});

export default function MapPage() {
  return (
    <div className="card">
      <h2 style={{ margin: "0 0 0.4rem", letterSpacing: "-0.02em" }}>Counterfeit hotspot map</h2>
      <p className="muted small" style={{ marginTop: 0 }}>
        Anonymised community scan reports. Red clusters suggest areas where
        suspicious packs are being found.
      </p>
      <div
        style={{
          display: "flex",
          gap: "1.1rem",
          flexWrap: "wrap",
          margin: "0.9rem 0",
          fontSize: "0.85rem",
          color: "var(--muted)",
        }}
      >
        <span><i style={{ display: "inline-block", width: 10, height: 10, borderRadius: "50%", background: "#f87171", marginRight: 6 }} />High risk</span>
        <span><i style={{ display: "inline-block", width: 10, height: 10, borderRadius: "50%", background: "#fbbf24", marginRight: 6 }} />Needs attention</span>
        <span><i style={{ display: "inline-block", width: 10, height: 10, borderRadius: "50%", background: "#34d399", marginRight: 6 }} />Likely genuine</span>
      </div>
      <HotspotMap />
    </div>
  );
}
