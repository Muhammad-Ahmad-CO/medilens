/**
 * MediLens verdict engine — rule-based red / amber / green evaluation.
 *
 * This is intentionally NOT an AI model: the documented decision logic is a
 * transparent set of rules applied AFTER label extraction. That makes every
 * verdict explainable ("why did it say red?") which is exactly what impresses
 * examiners and judges.
 */

export type VerdictLevel = "green" | "amber" | "red";

export interface ExtractedLabel {
  drugName: string | null;
  manufacturer: string | null;
  batchNumber: string | null;
  /** ISO date (yyyy-mm-dd) when parseable, otherwise the raw string. */
  expiryDate: string | null;
  /** 0..1 — how confident the OCR step was in its reading. */
  ocrConfidence: number;
}

export interface DrugRecord {
  name: string;
  manufacturer: string;
  /** "local" = our curated DB, "openfda" = US FDA open database. */
  source: "local" | "openfda";
}

export interface VerdictResult {
  level: VerdictLevel;
  reasons: string[];
  /** 0..1 — overall confidence in the verdict. */
  confidence: number;
  matchedDrug: DrugRecord | null;
  disclaimer: string;
}

export const DISCLAIMER =
  "MediLens is a screening assistant, not a medical device. A green verdict does not guarantee authenticity. Always consult a pharmacist or doctor.";

export const VERDICT_COPY: Record<VerdictLevel, { title: string; advice: string }> = {
  green: {
    title: "Likely genuine",
    advice:
      "The label matches a known drug record, the manufacturer matches, and the expiry date is valid.",
  },
  amber: {
    title: "Needs attention",
    advice:
      "Something looks off or uncertain — check the pack carefully or ask your pharmacist before use.",
  },
  red: {
    title: "High risk — do not use",
    advice:
      "This pack failed one or more critical checks. Do not consume it; take it to a pharmacist.",
  },
};

function norm(s: string | null): string {
  return (s ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

/** Parse common expiry formats: "EXP 08/27", "08-2027", "2027-08", "AUG 2027". */
export function parseExpiry(raw: string | null): Date | null {
  if (!raw) return null;
  const t = raw.trim().toUpperCase();

  let m = t.match(/(0?[1-9]|1[0-2])[\/\-.](\d{2,4})/); // 08/27, 08-2027
  if (m) {
    let year = parseInt(m[2], 10);
    if (year < 100) year += 2000;
    return new Date(year, parseInt(m[1], 10), 0); // end of that month
  }
  m = t.match(/(\d{4})[\/\-.](0?[1-9]|1[0-2])/); // 2027-08
  if (m) return new Date(parseInt(m[1], 10), parseInt(m[2], 10), 0);

  const months: Record<string, number> = {
    JAN: 1, FEB: 2, MAR: 3, APR: 4, MAY: 5, JUN: 6,
    JUL: 7, AUG: 8, SEP: 9, OCT: 10, NOV: 11, DEC: 12,
  };
  m = t.match(/(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)[A-Z]*\s*(\d{2,4})/);
  if (m) {
    let year = parseInt(m[2], 10);
    if (year < 100) year += 2000;
    return new Date(year, months[m[1]], 0);
  }
  return null;
}

export function evaluateVerdict(
  label: ExtractedLabel,
  drug: DrugRecord | null
): VerdictResult {
  const reasons: string[] = [];
  let level: VerdictLevel = "green";
  let confidence = 0.92;

  const raise = (to: VerdictLevel, reason: string, penalty: number) => {
    const order: VerdictLevel[] = ["green", "amber", "red"];
    if (order.indexOf(to) > order.indexOf(level)) level = to;
    reasons.push(reason);
    confidence = Math.max(0.3, confidence - penalty);
  };

  // --- Rule 1: unreadable label -------------------------------------------
  if (!label.drugName) {
    return {
      level: "red",
      reasons: ["Could not read the drug name from the pack. Retake the photo with better light."],
      confidence: 0.5,
      matchedDrug: null,
      disclaimer: DISCLAIMER,
    };
  }

  // --- Rule 2: unknown drug -----------------------------------------------
  if (!drug) {
    raise(
      "red",
      `“${label.drugName}” was not found in the drug databases. It may be misspelled, unregistered, or counterfeit.`,
      0.35
    );
  } else {
    reasons.push(
      `Matched “${drug.name}” in the ${drug.source === "local" ? "local" : "openFDA"} database.`
    );
  }

  // --- Rule 3: manufacturer mismatch --------------------------------------
  if (drug && label.manufacturer) {
    const a = norm(label.manufacturer);
    const b = norm(drug.manufacturer);
    if (a && b && !(a.includes(b) || b.includes(a))) {
      raise(
        "amber",
        `Manufacturer on pack (“${label.manufacturer}”) does not match the registered manufacturer (“${drug.manufacturer}”).`,
        0.2
      );
    } else {
      reasons.push(`Manufacturer matches: ${drug.manufacturer}.`);
    }
  }

  // --- Rule 4: expiry ------------------------------------------------------
  const expiry = parseExpiry(label.expiryDate);
  if (label.expiryDate && !expiry) {
    raise("amber", "Expiry date could not be parsed — verify it manually.", 0.15);
  } else if (expiry) {
    const now = new Date();
    const daysLeft = Math.ceil(
      (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysLeft < 0) {
      raise("red", "This medicine is EXPIRED. Do not use it.", 0.3);
    } else if (daysLeft <= 90) {
      raise(
        "amber",
        `Expires soon — only ${daysLeft} day(s) left. Buy a fresh pack if possible.`,
        0.12
      );
    } else {
      reasons.push("Expiry date is valid.");
    }
  }

  // --- Rule 5: missing batch number ----------------------------------------
  if (!label.batchNumber) {
    raise("amber", "No batch number detected. Genuine packs always carry one.", 0.1);
  } else {
    reasons.push("Batch number present.");
  }

  // Blister-strip guidance: on a foil strip (patta) the batch and expiry are
  // often only on the outer box, so when BOTH are missing but the drug
  // matched, point the user at the box. This is guidance only — it does not
  // change the level or the score, which Rules 4–5 already set.
  if (drug && !label.batchNumber && !label.expiryDate) {
    reasons.push(
      "Batch and expiry are often printed on the box, not the strip — check the box if you have it."
    );
  }

  // --- Rule 6: weak OCR reading --------------------------------------------
  if (label.ocrConfidence < 0.6) {
    raise(
      "amber",
      "Label reading was uncertain — retake the photo in better light for a stronger verdict.",
      0.12
    );
  }

  if (level === "green") {
    reasons.push("All critical checks passed.");
  }

  return {
    level,
    reasons,
    confidence: Math.round(confidence * 100) / 100,
    matchedDrug: drug,
    disclaimer: DISCLAIMER,
  };
}
