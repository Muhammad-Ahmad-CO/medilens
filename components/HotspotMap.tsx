"use client";
/**
 * Crowdsourced counterfeit hotspot map (Leaflet + OpenStreetMap — free, no key).
 * Circle markers keep it simple: no marker-icon asset headaches.
 *
 * Also finds real pharmacies near the user (OpenStreetMap Overpass API —
 * free, no key) and pins them on the same map with distances + directions.
 */
import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin } from "@/components/icons";

interface Report {
  drug_name: string | null;
  verdict: string;
  lat: number;
  lng: number;
  city: string | null;
}

interface Pharmacy {
  name: string;
  lat: number;
  lng: number;
  distM: number;
}

const COLORS: Record<string, string> = {
  red: "#B3261E",
  amber: "#B45309",
  green: "#177245",
};

const PHARMACY_COLOR = "#1D4ED8";

function haversineM(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function formatDist(m: number): string {
  return m < 1000 ? `${m} m` : `${(m / 1000).toFixed(1)} km`;
}

type PharmState = "idle" | "locating" | "loading" | "done" | "empty" | "denied" | "failed";

export default function HotspotMap() {
  const divRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const pharmLayerRef = useRef<L.LayerGroup | null>(null);
  const [count, setCount] = useState<number | null>(null);
  const [pharmState, setPharmState] = useState<PharmState>("idle");
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);

  useEffect(() => {
    if (!divRef.current) return;
    const map = L.map(divRef.current).setView([30.3753, 69.3451], 5); // Pakistan
    mapRef.current = map;
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
      mapRef.current = null;
    };
  }, []);

  const findPharmacies = () => {
    if (pharmState === "locating" || pharmState === "loading") return;
    if (!("geolocation" in navigator)) {
      setPharmState("failed");
      return;
    }
    setPharmState("locating");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setPharmState("loading");
        try {
          const query =
            `[out:json][timeout:25];` +
            `(node["amenity"="pharmacy"](around:3000,${lat},${lng});` +
            `way["amenity"="pharmacy"](around:3000,${lat},${lng}););` +
            `out center 60;`;
          // The free Overpass servers sometimes answer "at capacity" —
          // try the main server, then one mirror, before giving up.
          const body = `data=${encodeURIComponent(query)}`;
          let data: { elements?: unknown[] } | null = null;
          for (const endpoint of [
            "https://overpass-api.de/api/interpreter",
            "https://overpass.kumi.systems/api/interpreter",
          ]) {
            try {
              const ctrl = new AbortController();
              const timer = setTimeout(() => ctrl.abort(), 25000);
              const res = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body,
                signal: ctrl.signal,
              });
              clearTimeout(timer);
              if (!res.ok) continue;
              data = await res.json();
              break;
            } catch {
              /* try the next endpoint */
            }
          }
          if (!data) throw new Error("overpass");
          const elements = (data.elements ?? []) as {
            lat?: number;
            lon?: number;
            center?: { lat: number; lon: number };
            tags?: { name?: string };
          }[];
          const found: Pharmacy[] = elements
            .map((el) => {
              const pLat = el.lat ?? el.center?.lat;
              const pLng = el.lon ?? el.center?.lon;
              if (pLat == null || pLng == null) return null;
              return {
                name: el.tags?.name ?? "Pharmacy",
                lat: pLat,
                lng: pLng,
                distM: haversineM(lat, lng, pLat, pLng),
              } as Pharmacy;
            })
            .filter((p: Pharmacy | null): p is Pharmacy => p !== null)
            .sort((a: Pharmacy, b: Pharmacy) => a.distM - b.distM)
            .slice(0, 15);
          setPharmacies(found);
          setPharmState(found.length ? "done" : "empty");

          const map = mapRef.current;
          if (map) {
            if (pharmLayerRef.current) {
              pharmLayerRef.current.remove();
            }
            const layer = L.layerGroup().addTo(map);
            pharmLayerRef.current = layer;
            L.circleMarker([lat, lng], {
              radius: 8,
              color: "#111827",
              fillColor: "#ffffff",
              fillOpacity: 1,
              weight: 3,
            })
              .addTo(layer)
              .bindPopup("<b>You are here</b>");
            for (const p of found) {
              L.circleMarker([p.lat, p.lng], {
                radius: 8,
                color: PHARMACY_COLOR,
                fillColor: PHARMACY_COLOR,
                fillOpacity: 0.75,
                weight: 2,
              })
                .addTo(layer)
                .bindPopup(
                  `<b>${p.name}</b><br/>${formatDist(p.distM)} away<br/>` +
                    `<a href="https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}" target="_blank" rel="noopener">Get directions</a>`
                );
            }
            if (found.length) {
              const bounds = L.latLngBounds([
                [lat, lng],
                ...found.map((p) => [p.lat, p.lng] as [number, number]),
              ]);
              map.fitBounds(bounds.pad(0.15));
            } else {
              map.setView([lat, lng], 14);
            }
          }
        } catch {
          setPharmState("failed");
        }
      },
      () => setPharmState("denied"),
      { timeout: 10000 }
    );
  };

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

      {/* ===== Pharmacies near you ===== */}
      <div style={{ marginTop: "1.25rem" }}>
        <button
          className="btn"
          onClick={findPharmacies}
          disabled={pharmState === "locating" || pharmState === "loading"}
        >
          {pharmState === "locating" || pharmState === "loading" ? (
            <span className="spin" aria-hidden />
          ) : (
            <MapPin size={17} />
          )}
          {pharmState === "locating"
            ? "Locating…"
            : pharmState === "loading"
              ? "Searching pharmacies…"
              : "Find pharmacies near me"}
        </button>
        {pharmState === "denied" && (
          <p className="report-note warn">
            Location permission denied — pharmacies near you need your location.
          </p>
        )}
        {pharmState === "failed" && (
          <p className="report-note warn">
            Couldn&apos;t load pharmacies. Check your connection and try again.
          </p>
        )}
        {pharmState === "empty" && (
          <p className="report-note warn">
            No pharmacy found within 3 km of your location on the map data.
          </p>
        )}
        {pharmState === "done" && (
          <ul className="pharm-list">
            {pharmacies.map((p, i) => (
              <li key={i} className="pharm-row">
                <span className="pharm-dot" style={{ background: PHARMACY_COLOR }} aria-hidden />
                <span className="pharm-name">{p.name}</span>
                <span className="muted small">{formatDist(p.distM)}</span>
                <a
                  className="pharm-dir"
                  href={`https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}`}
                  target="_blank"
                  rel="noopener"
                >
                  Directions
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
