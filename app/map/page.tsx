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
    <div className="container" style={{ paddingBottom: "2rem" }}>
      <div className="page-head">
        <span className="eyebrow">Community watch</span>
        <h2>Counterfeit hotspot map</h2>
        <p>
          Anonymised community scan reports. Red clusters suggest areas where
          suspicious packs are being found.
        </p>
      </div>
      <div className="map-frame">
        <div className="map-legend-row" style={{ marginTop: 0 }}>
          <span>
            <i style={{ background: "#B3261E" }} />
            High risk
          </span>
          <span>
            <i style={{ background: "#B45309" }} />
            Needs attention
          </span>
          <span>
            <i style={{ background: "#177245" }} />
            Likely genuine
          </span>
        </div>
        <HotspotMap />
      </div>
    </div>
  );
}
