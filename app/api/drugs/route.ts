import { NextRequest, NextResponse } from "next/server";
import { findLocalDrug, lookupOpenFDA } from "@/lib/drugs";

/** GET /api/drugs?q=panadol — quick drug lookup (powers demos & tests). */
export async function GET(req: NextRequest) {
  const q = new URL(req.url).searchParams.get("q")?.trim();
  if (!q) {
    return NextResponse.json({ error: "Add ?q=<drug name>." }, { status: 400 });
  }
  const local = findLocalDrug(q);
  if (local) {
    return NextResponse.json({
      found: true,
      source: "local",
      name: local.name,
      manufacturer: local.manufacturer,
      packSizes: local.packSizes,
    });
  }
  const fda = await lookupOpenFDA(q);
  if (fda.found) {
    return NextResponse.json({
      found: true,
      source: "openfda",
      name: fda.brandName,
      manufacturer: fda.manufacturer,
    });
  }
  return NextResponse.json({ found: false, query: q });
}
