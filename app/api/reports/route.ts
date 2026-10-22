import { NextRequest, NextResponse } from "next/server";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import {
  clientIp,
  rateLimit,
  rateLimitedResponse,
} from "@/lib/rate-limit";

// Security: stop bots from flooding the crowdsourced map with fake
// reports (20 reports/minute per IP is plenty for a real user).
const REPORT_LIMIT = 20;
const REPORT_WINDOW_MS = 60_000;

/**
 * Crowdsourced hotspot reports (powers the /map page).
 * Coordinates are rounded to ~1.1 km BEFORE storage — no exact user
 * location is ever saved. Privacy by design (see documentation).
 */
const round1km = (n: number) => Math.round(n * 100) / 100;

export async function GET() {
  if (!isSupabaseConfigured()) return NextResponse.json({ reports: [] });
  try {
    const { data } = await getSupabase()
      .from("hotspot_reports")
      .select("drug_name,verdict,lat,lng,city,created_at")
      .order("created_at", { ascending: false })
      .limit(300);
    return NextResponse.json({ reports: data ?? [] });
  } catch {
    return NextResponse.json({ reports: [] });
  }
}

export async function POST(req: NextRequest) {
  // Security: per-IP rate limit (prevents fake-report spam on the map).
  const rl = rateLimit(
    `reports:${clientIp(req)}`,
    REPORT_LIMIT,
    REPORT_WINDOW_MS
  );
  if (!rl.ok) return rateLimitedResponse(rl.retryAfter);

  const body = await req.json().catch(() => null);
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ saved: false, reason: "supabase_not_configured" });
  }
  if (!body || typeof body.lat !== "number" || typeof body.lng !== "number") {
    return NextResponse.json({ error: "Provide { lat, lng }." }, { status: 400 });
  }
  try {
    await getSupabase().from("hotspot_reports").insert({
      drug_name: body.drug_name ?? null,
      verdict: body.verdict ?? "amber",
      lat: round1km(body.lat),
      lng: round1km(body.lng),
      city: body.city ?? null,
    });
    return NextResponse.json({ saved: true });
  } catch {
    return NextResponse.json({ saved: false }, { status: 500 });
  }
}
