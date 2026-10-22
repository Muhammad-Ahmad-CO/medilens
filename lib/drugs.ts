/**
 * Drug data layer.
 *
 * Two sources, in priority order:
 *  1. LOCAL_DRUGS — a curated, offline-first list of common medicines sold in
 *     Pakistan. This is the DEMO-SAFE source: it always works, even with no
 *     internet, which is exactly what you want on demo day.
 *  2. openFDA — the US FDA's free public drug API, used as a secondary source
 *     when the local DB has no match.
 */

export interface LocalDrug {
  name: string;
  manufacturer: string;
  packSizes: string[];
  notes?: string;
}

/** Curated demo database — extend this list any time (it is just data). */
export const LOCAL_DRUGS: LocalDrug[] = [
  { name: "Panadol", manufacturer: "GSK", packSizes: ["100 tablets", "200 tablets"], notes: "Paracetamol 500mg" },
  { name: "Panadol Extra", manufacturer: "GSK", packSizes: ["48 tablets", "100 tablets"], notes: "Paracetamol + caffeine" },
  { name: "Augmentin", manufacturer: "GSK", packSizes: ["30 tablets"], notes: "Co-amoxiclav 625mg" },
  { name: "Disprin", manufacturer: "Reckitt Benckiser", packSizes: ["100 tablets"], notes: "Aspirin 300mg dispersible" },
  { name: "Brufen", manufacturer: "Abbott", packSizes: ["100 tablets", "200ml syrup"], notes: "Ibuprofen 400mg" },
  { name: "Arinac", manufacturer: "Abbott", packSizes: ["100 tablets"], notes: "Ibuprofen + pseudoephedrine" },
  { name: "Septran", manufacturer: "GSK", packSizes: ["100 tablets"], notes: "Co-trimoxazole" },
  { name: "Flagyl", manufacturer: "Sanofi", packSizes: ["100 tablets", "200 tablets"], notes: "Metronidazole 400mg" },
  { name: "Risek", manufacturer: "Getz Pharma", packSizes: ["28 capsules"], notes: "Omeprazole 20mg" },
  { name: "Getryl", manufacturer: "Getz Pharma", packSizes: ["30 tablets"], notes: "Glimepiride" },
  { name: "Xavor", manufacturer: "CCL", packSizes: ["30 tablets"], notes: "Losartan potassium" },
  { name: "Nezeril", manufacturer: "Sami Pharmaceuticals", packSizes: ["15ml drops"], notes: "Oxymetazoline nasal" },
];

function norm(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/** Fuzzy match against the local DB (handles minor OCR misreads). */
export function findLocalDrug(query: string): LocalDrug | null {
  const q = norm(query);
  if (!q) return null;
  // Exact-ish match first…
  for (const d of LOCAL_DRUGS) {
    const n = norm(d.name);
    if (n === q || q.includes(n) || n.includes(q)) return d;
  }
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
