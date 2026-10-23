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

/** Plain-language details shown on the result screen ("About this medicine"). */
export interface DrugInfo {
  uses: string;
  dosage: string;
  sideEffects: string;
  caution: string;
}

export interface LocalDrug {
  name: string;
  manufacturer: string;
  packSizes: string[];
  notes?: string;
  info?: DrugInfo;
}

/** Curated demo database — extend this list any time (it is just data). */
export const LOCAL_DRUGS: LocalDrug[] = [
  {
    name: "Panadol", manufacturer: "GSK", packSizes: ["100 tablets", "200 tablets"], notes: "Paracetamol 500mg",
    info: {
      uses: "For fever, headache and body pain.",
      dosage: "Adults: 1–2 tablets (500mg) every 4–6 hours when needed. Maximum 8 tablets in 24 hours.",
      sideEffects: "Usually very safe. Rarely: skin rash or allergy.",
      caution: "Do not take with other medicines that contain paracetamol — too much harms the liver.",
    },
  },
  {
    name: "Panadol Extra", manufacturer: "GSK", packSizes: ["48 tablets", "100 tablets"], notes: "Paracetamol + caffeine",
    info: {
      uses: "For strong headache, migraine and body pain.",
      dosage: "Adults: 1–2 tablets every 4–6 hours when needed. Maximum 8 tablets in 24 hours.",
      sideEffects: "The caffeine can cause restlessness or trouble sleeping in some people.",
      caution: "Do not combine with other paracetamol products, and avoid extra tea or coffee.",
    },
  },
  {
    name: "Augmentin", manufacturer: "GSK", packSizes: ["30 tablets"], notes: "Co-amoxiclav 625mg",
    info: {
      uses: "Antibiotic for bacterial infections — throat, chest, ear, teeth and skin.",
      dosage: "Usually 1 tablet two or three times a day, exactly as the doctor prescribed. Finish the full course.",
      sideEffects: "Loose stools, nausea, stomach upset.",
      caution: "Prescription medicine. Never start or stop an antibiotic on your own.",
    },
  },
  {
    name: "Disprin", manufacturer: "Reckitt Benckiser", packSizes: ["100 tablets"], notes: "Aspirin 300mg dispersible",
    info: {
      uses: "For pain, fever and headache. The tablet dissolves in water.",
      dosage: "Adults: 1–3 tablets dissolved in water, every 4–6 hours when needed.",
      sideEffects: "Stomach irritation or burning.",
      caution: "Not for children under 16. Avoid if you have a stomach ulcer or asthma.",
    },
  },
  {
    name: "Brufen", manufacturer: "Abbott", packSizes: ["100 tablets", "200ml syrup"], notes: "Ibuprofen 400mg",
    info: {
      uses: "For pain, swelling, fever, and joint or muscle pain.",
      dosage: "Adults: 1 tablet (400mg) every 6–8 hours, with food, when needed.",
      sideEffects: "Stomach pain, acidity, dizziness.",
      caution: "Always take with food. Avoid in pregnancy and kidney problems.",
    },
  },
  {
    name: "Arinac", manufacturer: "Abbott", packSizes: ["100 tablets"], notes: "Ibuprofen + pseudoephedrine",
    info: {
      uses: "For cold, blocked nose, sinus pressure and fever.",
      dosage: "Adults: 1 tablet every 6–8 hours when needed.",
      sideEffects: "Dry mouth, fast heartbeat, trouble sleeping.",
      caution: "Avoid if you have high blood pressure or heart disease.",
    },
  },
  {
    name: "Septran", manufacturer: "GSK", packSizes: ["100 tablets"], notes: "Co-trimoxazole",
    info: {
      uses: "Antibiotic for chest, urine and stomach infections.",
      dosage: "Usually 2 tablets twice a day, exactly as prescribed. Drink plenty of water.",
      sideEffects: "Rash, nausea; allergy in some people.",
      caution: "Prescription medicine. Stop it and see a doctor at once if a severe skin rash appears.",
    },
  },
  {
    name: "Flagyl", manufacturer: "Sanofi", packSizes: ["100 tablets", "200 tablets"], notes: "Metronidazole 400mg",
    info: {
      uses: "For stomach and gut infections, dysentery and dental infections.",
      dosage: "Usually 1 tablet three times a day, exactly as prescribed. Finish the full course.",
      sideEffects: "Metallic taste, nausea, dark urine.",
      caution: "Prescription medicine. Strictly no alcohol during the course and for 2 days after.",
    },
  },
  {
    name: "Risek", manufacturer: "Getz Pharma", packSizes: ["28 capsules"], notes: "Omeprazole 20mg",
    info: {
      uses: "For acidity, acid reflux and stomach ulcer.",
      dosage: "Usually 1 capsule once a day before breakfast.",
      sideEffects: "Headache, gas, loose stools.",
      caution: "If acidity keeps returning for weeks, see a doctor instead of just continuing it.",
    },
  },
  {
    name: "Getryl", manufacturer: "Getz Pharma", packSizes: ["30 tablets"], notes: "Glimepiride",
    info: {
      uses: "For type 2 diabetes — it controls blood sugar.",
      dosage: "Usually 1 tablet once a day with breakfast, exactly as prescribed.",
      sideEffects: "Low blood sugar (shakiness, sweating, hunger), weight gain.",
      caution: "Prescription medicine for sugar patients only. Never share it or change the dose yourself.",
    },
  },
  {
    name: "Xavor", manufacturer: "CCL", packSizes: ["30 tablets"], notes: "Losartan potassium",
    info: {
      uses: "For high blood pressure.",
      dosage: "Usually 1 tablet once a day at the same time daily, exactly as prescribed.",
      sideEffects: "Dizziness, tiredness, a light-headed feeling.",
      caution: "Prescription medicine. Do not stop it suddenly, and avoid it in pregnancy.",
    },
  },
  {
    name: "Nezeril", manufacturer: "Sami Pharmaceuticals", packSizes: ["15ml drops"], notes: "Oxymetazoline nasal",
    info: {
      uses: "Nasal drops for a blocked nose from cold or allergy.",
      dosage: "2–3 drops in each nostril, twice a day.",
      sideEffects: "Burning or dryness in the nose.",
      caution: "Do not use for more than 5–7 days — the nose can become dependent on it.",
    },
  },
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
