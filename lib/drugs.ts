/**
 * Drug data layer.
 *
 * Two sources, in priority order:
 *  1. LOCAL_DRUGS — the curated, offline-first index in ./drugs-data-a.ts
 *     and ./drugs-data-b.ts (common medicines found in Pakistani
 *     pharmacies, 200+ entries). This is the DEMO-SAFE source: it always
 *     works, even with no internet. The index is split in two files only
 *     so each one stays small enough to paste into the GitHub web editor.
 *  2. openFDA — the US FDA's free public drug API, used as a secondary
 *     source when the local index has no match.
 *
 * The types and the merged array are re-exported here so existing imports
 * (routes, ocr.ts, tests) keep working unchanged.
 */
import { LOCAL_DRUGS_A } from "./drugs-data-a";
import { LOCAL_DRUGS_B } from "./drugs-data-b";
export const LOCAL_DRUGS: LocalDrug[] = [...LOCAL_DRUGS_A, ...LOCAL_DRUGS_B];
export type { LocalDrug, DrugInfo } from "./drugs-data-a";
import type { LocalDrug } from "./drugs-data-a";

function norm(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/** Fuzzy match against the local index (handles minor OCR misreads). */
export function findLocalDrug(query: string): LocalDrug | null {
  const q = norm(query);
  if (!q) return null;
  // Tier 1: exact match always wins ("Panadol" is Panadol, not a variant).
  for (const d of LOCAL_DRUGS) {
    if (norm(d.name) === q) return d;
  }
  // Tier 2: the query CONTAINS a full drug name (pack text like "Panadol
  // Extra 500mg") — the longest name wins, so a specific variant beats its
  // base drug. (Returning the first list hit here showed plain Panadol's
  // details for Panadol Extra packs — caught by a unit test.)
  let best: LocalDrug | null = null;
  for (const d of LOCAL_DRUGS) {
    const n = norm(d.name);
    if (q.includes(n) && (!best || n.length > norm(best.name).length)) best = d;
  }
  if (best) return best;
  // Tier 3: the query is a PARTIAL name (OCR cut it short) — the shortest
  // containing name is the closest completion.
  for (const d of LOCAL_DRUGS) {
    const n = norm(d.name);
    if (n.includes(q) && (!best || n.length < norm(best.name).length)) best = d;
  }
  if (best) return best;
  // …then a tolerant prefix match (covers 1–2 character OCR errors).
  for (const d of LOCAL_DRUGS) {
    const n = norm(d.name);
    if (n.length >= 4 && q.length >= 4 && (n.startsWith(q.slice(0, 4)) || q.startsWith(n.slice(0, 4)))) {
      return d;
    }
  }
  return null;
}

export interface OpenFDAResult {
  found: boolean;
  brandName?: string;
  manufacturer?: string;
}

/** Free secondary lookup. No API key needed for low volume. */
export async function lookupOpenFDA(query: string): Promise<OpenFDAResult> {
  try {
    const url =
      "https://api.fda.gov/drug/label.json?search=" +
      encodeURIComponent(`openfda.brand_name:"${query}"`) +
      "&limit=1";
    const res = await fetch(url, { next: { revalidate: 86400 } });
    if (!res.ok) return { found: false };
    const data = await res.json();
    const first = data?.results?.[0];
    if (!first) return { found: false };
    return {
      found: true,
      brandName: first?.openfda?.brand_name?.[0] ?? query,
      manufacturer: first?.openfda?.manufacturer_name?.[0],
    };
  } catch {
    return { found: false }; // offline or API down → treat as "no match"
  }
}
