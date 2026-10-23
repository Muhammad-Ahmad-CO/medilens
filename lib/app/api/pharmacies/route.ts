import { NextRequest, NextResponse } from "next/server";
import { clientIp, rateLimit, rateLimitedResponse } from "@/lib/rate-limit";

/**
 * GET /api/pharmacies?lat=..&lng=..
 *
 * Nearby pharmacies from OpenStreetMap (Overpass API — free, no key),
 * queried SERVER-side on purpose: the public Overpass servers often answer
 * "at capacity" to direct browser calls (that is exactly what broke the
 * first version of this feature on a real phone). From the server we can
 * send a proper User-Agent, try several mirrors in turn, and log failures.
 */
const ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass.nhrt.dev/api/interpreter",
];

const RADIUS_M = 3000;
const LIMIT_PER_MIN = 20;

// The free map servers can be slow; give the mirrors time to answer
// (Vercel kills a function at 10s unless told otherwise).
export const maxDuration = 60;

interface PharmacyOut {
  name: string;
  lat: number;
  lng: number;
  distM: number;
}

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

export async function GET(req: NextRequest) {
  const rl = rateLimit(`pharm:${clientIp(req)}`, LIMIT_PER_MIN, 60_000);
  if (!rl.ok) return rateLimitedResponse(rl.retryAfter);

  const lat = Number(req.nextUrl.searchParams.get("lat"));
  const lng = Number(req.nextUrl.searchParams.get("lng"));
  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lng) ||
    lat < -90 ||
    lat > 90 ||
    lng < -180 ||
    lng > 180
  ) {
    return NextResponse.json(
      { error: "Valid lat and lng are required." },
      { status: 400 }
    );
  }

  const query =
    `[out:json][timeout:20];` +
    `(node["amenity"="pharmacy"](around:${RADIUS_M},${lat},${lng});` +
    `way["amenity"="pharmacy"](around:${RADIUS_M},${lat},${lng}););` +
    `out center 60;`;

  for (const endpoint of ENDPOINTS) {
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 18000);
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
          "User-Agent": "MediLens/1.0 (student project; contact via GitHub Muhammad-Ahmad-CO)",
        },
        body: `data=${encodeURIComponent(query)}`,
        signal: ctrl.signal,
      });
      clearTimeout(timer);
      if (!res.ok) {
        console.error(`Pharmacies: ${endpoint} responded ${res.status}`);
        continue;
      }
      const data = await res.json();
      const elements = (data?.elements ?? []) as {
        lat?: number;
        lon?: number;
        center?: { lat: number; lon: number };
        tags?: { name?: string };
      }[];
      const pharmacies: PharmacyOut[] = elements
        .map((el) => {
          const pLat = el.lat ?? el.center?.lat;
          const pLng = el.lon ?? el.center?.lon;
          if (pLat == null || pLng == null) return null;
          return {
            name: el.tags?.name ?? "Pharmacy",
            lat: pLat,
            lng: pLng,
            distM: haversineM(lat, lng, pLat, pLng),
          } as PharmacyOut;
        })
        .filter((p): p is PharmacyOut => p !== null)
        .sort((a, b) => a.distM - b.distM)
        .slice(0, 15);
      return NextResponse.json({ pharmacies });
    } catch (err) {
      console.error(`Pharmacies: ${endpoint} failed`, err);
      /* try the next mirror */
    }
  }

  return NextResponse.json(
    { error: "PHARMACY_LOOKUP_FAILED" },
    { status: 502 }
  );
}
