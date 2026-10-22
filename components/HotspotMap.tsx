"use client";
/**
 * Crowdsourced counterfeit hotspot map (Leaflet + OpenStreetMap — free, no key).
 * Circle markers keep it simple: no marker-icon asset headaches.
 */
import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface Report {
  drug_name: string | null;
  verdict: string;
  lat: number;
  lng: number;
  city: string | null;
}

const COLORS: Record<string, string> = {
  red: "#B3261E",
  amber: "#B45309",
  green: "#177245",
};

export default function HotspotMap() {
  const divRef = useRef<HTMLDivElement>(null);
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    if (!divRef.current) return;
    const map = L.map(divRef.current).setView([30.3753, 69.3451], 5); // Pakistan
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    fetch("/api/reports")
      .then((r) => r.json())
      .then((d) => {
        const reports: Report[] = d.reports ?? [];
        setCount(reports.length);
        for (const rpt of reports) {
          const color = COLORS[rpt.verdict] ?? COLORS.amber;
          L.circleMarker([rpt.lat, rpt.lng], {
            radius: 9,
            color,
            fillColor: color,
            fillOpacity: 0.55,
            weight: 2,
          })
            .addTo(map)
            .bindPopup(
              `<b>${rpt.drug_name ?? "Unknown drug"}</b><br/>Verdict: ${rpt.verdict}${rpt.city ? `<br/>${rpt.city}` : ""}`
            );
        }
      })
      .catch(() => setCount(0));

    return () => {
      map.remove();
    };
  }, []);

  return (
    <div>
      <p className="muted small">
        {count === null
          ? "Loading reports…"
          : `${count} anonymised report${count === 1 ? "" : "s"} (locations rounded to ~1 km for privacy).`}
      </p>
      <div
        ref={divRef}
        className="leaflet-wrap"
        style={{ height: "60vh", zIndex: 0 }}
      />
    </div>
  );
}
