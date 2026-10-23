export type VerdictLevel = "green" | "amber" | "red";

export interface ExtractedLabel {
  drugName: string | null;
  manufacturer: string | null;
  batchNumber: string | null;
  expiryDate: string | null;
  ocrConfidence: number;
}

export interface DrugRecord {
  name: string;
  manufacturer: string;
  source: "local" | "openfda";
  info?: import("./drugs").DrugInfo | null;
}

export interface VerdictResult {
  level: VerdictLevel;
  reasons: string[];
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

export function parseExpiry(raw: string | null): Date | null {
  if (!raw) return null;
  const t = raw.trim().toUpperCase();

  let m = t.match(/(?<!\d)(\d{4})[\/\-.](0?[1-9]|1[0-2])(?!\d)/);
  if (m) return new Date(parseInt(m[1], 10), parseInt(m[2], 10), 0);

  m = t.match(/(?<!\d)(0?[1-9]|1[0-2])[\/\-.](\d{2,4})(?!\d)/);
  if (m) {
    let year = parseInt(m[2], 10);
    if (year < 100) year += 2000;
    return new Date(year, parseInt(m[1], 10), 0);
  }

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

  if (!label.drugName) {
    return {
      level: "red",
      reasons: ["Could not read the drug name from the pack. Retake the photo with better light."],
      confidence: 0.5,
      matchedDrug: null,
      disclaimer: DISCLAIMER,
    };
  }

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

  if (!label.batchNumber) {
    raise("amber", "No batch number detected. Genuine packs always carry one.", 0.1);
  } else {
    reasons.push("Batch number present.");
  }

  if (drug && !label.batchNumber && !label.expiryDate) {
    reasons.push(
      "Batch and expiry are often printed on the box, not the strip — check the box if you have it."
    );
  }

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
