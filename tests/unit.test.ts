import { describe, it, expect, vi, beforeAll, afterAll, afterEach } from "vitest";
import {
  evaluateVerdict,
  parseExpiry,
  type DrugRecord,
  type ExtractedLabel,
} from "@/lib/verdict";
import { findLocalDrug, LOCAL_DRUGS } from "@/lib/drugs";
import { rateLimit } from "@/lib/rate-limit";
import { extractFromText } from "@/lib/ocr";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("rateLimit", () => {
  it("allows requests up to the limit", () => {
    const key = "test-allow";
    for (let i = 0; i < 10; i++) {
      expect(rateLimit(key, 10, 60_000).ok).toBe(true);
    }
  });

  it("blocks the request over the limit and says how long to wait", () => {
    const key = "test-block";
    for (let i = 0; i < 10; i++) rateLimit(key, 10, 60_000);
    const blocked = rateLimit(key, 10, 60_000);
    expect(blocked.ok).toBe(false);
    expect(blocked.retryAfter).toBeGreaterThan(0);
    expect(blocked.retryAfter).toBeLessThanOrEqual(60);
  });

  it("one user's limit does not block a different user", () => {
    const a = "test-user-a";
    for (let i = 0; i < 5; i++) rateLimit(a, 5, 60_000);
    expect(rateLimit(a, 5, 60_000).ok).toBe(false);
    expect(rateLimit("test-user-b", 5, 60_000).ok).toBe(true);
  });

  it("allows requests again after the window passes", () => {
    const key = "test-window";
    const start = Date.now();
    vi.spyOn(Date, "now").mockReturnValue(start);
    for (let i = 0; i < 3; i++) rateLimit(key, 3, 60_000);
    expect(rateLimit(key, 3, 60_000).ok).toBe(false);
    vi.spyOn(Date, "now").mockReturnValue(start + 61_000);
    expect(rateLimit(key, 3, 60_000).ok).toBe(true);
  });
});

describe("verdict engine (clock frozen at 2026-10-24)", () => {
beforeAll(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-10-24T10:00:00"));
});

const PANADOL: DrugRecord = {
  name: "Panadol",
  manufacturer: "GSK",
  source: "local",
};

function label(overrides: Partial<ExtractedLabel> = {}): ExtractedLabel {
  return {
    drugName: "Panadol",
    manufacturer: "GSK",
    batchNumber: "B12345",
    expiryDate: "08/27",
    ocrConfidence: 0.95,
    ...overrides,
  };
}

afterAll(() => {
  vi.useRealTimers();
});

describe("parseExpiry", () => {
  it("reads MM/YY as the end of that month", () => {
    const d = parseExpiry("08/27");
    expect(d?.getFullYear()).toBe(2027);
    expect(d?.getMonth()).toBe(7);
    expect(d?.getDate()).toBe(31);
  });

  it("reads YYYY-MM", () => {
    const d = parseExpiry("2027-08");
    expect(d?.getFullYear()).toBe(2027);
    expect(d?.getMonth()).toBe(7);
  });

  it("reads month names like AUG 2027", () => {
    const d = parseExpiry("AUG 2027");
    expect(d?.getFullYear()).toBe(2027);
    expect(d?.getMonth()).toBe(7);
  });

  it("returns null for nonsense instead of guessing", () => {
    expect(parseExpiry("13/27")).toBeNull();
    expect(parseExpiry("hello")).toBeNull();
    expect(parseExpiry(null)).toBeNull();
    expect(parseExpiry("")).toBeNull();
  });
});

describe("evaluateVerdict", () => {
  it("a genuine, in-date pack is GREEN at full confidence", () => {
    const v = evaluateVerdict(label(), PANADOL);
    expect(v.level).toBe("green");
    expect(v.confidence).toBe(0.92);
    expect(v.reasons.join(" ")).toContain("All critical checks passed");
  });

  it("an EXPIRED pack is RED", () => {
    const v = evaluateVerdict(label({ expiryDate: "01/20" }), PANADOL);
    expect(v.level).toBe("red");
    expect(v.reasons.join(" ")).toMatch(/EXPIRED/);
  });

  it("a pack expiring within 90 days is AMBER (expires soon)", () => {
    const v = evaluateVerdict(label({ expiryDate: "12/26" }), PANADOL);
    expect(v.level).toBe("amber");
    expect(v.reasons.join(" ")).toMatch(/Expires soon/);
  });

  it("a drug missing from every database is RED (unknown drug)", () => {
    const v = evaluateVerdict(label({ drugName: "WonderCure" }), null);
    expect(v.level).toBe("red");
    expect(v.reasons.join(" ")).toMatch(/not found in the drug databases/);
  });

  it("a missing batch number is AMBER (genuine packs always carry one)", () => {
    const v = evaluateVerdict(label({ batchNumber: null }), PANADOL);
    expect(v.level).toBe("amber");
    expect(v.reasons.join(" ")).toMatch(/No batch number/);
  });

  it("a blister strip (no batch, no expiry) is AMBER and points at the box", () => {
    const v = evaluateVerdict(
      label({ batchNumber: null, expiryDate: null }),
      PANADOL
    );
    expect(v.level).toBe("amber");
    expect(v.reasons.join(" ")).toMatch(/printed on the box, not the strip/);
  });

  it("a manufacturer that does not match the record is AMBER", () => {
    const v = evaluateVerdict(label({ manufacturer: "Unknown Labs" }), PANADOL);
    expect(v.level).toBe("amber");
    expect(v.reasons.join(" ")).toMatch(/does not match the registered manufacturer/);
  });

  it("a weak OCR reading is AMBER (retake the photo)", () => {
    const v = evaluateVerdict(label({ ocrConfidence: 0.4 }), PANADOL);
    expect(v.level).toBe("amber");
    expect(v.reasons.join(" ")).toMatch(/reading was uncertain/);
  });

  it("an unreadable drug name is RED immediately", () => {
    const v = evaluateVerdict(label({ drugName: null }), null);
    expect(v.level).toBe("red");
    expect(v.confidence).toBe(0.5);
    expect(v.reasons.join(" ")).toMatch(/Could not read the drug name/);
  });

  it("confidence drops as problems stack up, but never below 0.3", () => {
    const v = evaluateVerdict(
      label({
        expiryDate: "01/20",
        batchNumber: null,
        ocrConfidence: 0.2,
      }),
      PANADOL
    );
    expect(v.level).toBe("red");
    expect(v.confidence).toBeGreaterThanOrEqual(0.3);
    expect(v.confidence).toBeLessThan(0.92);
  });
});
});

describe("findLocalDrug", () => {
  it("finds Panadol by its exact name", () => {
    const d = findLocalDrug("Panadol");
    expect(d?.name).toBe("Panadol");
    expect(d?.manufacturer).toBe("GSK");
  });

  it("is case-insensitive (OCR rarely preserves case)", () => {
    expect(findLocalDrug("panadol")?.name).toBe("Panadol");
    expect(findLocalDrug("PANADOL")?.name).toBe("Panadol");
  });

  it("finds the variant, not just the base drug (Panadol Extra)", () => {
    expect(findLocalDrug("Panadol Extra")?.name).toBe("Panadol Extra");
  });

  it("returns null for a drug that is not in the database", () => {
    expect(findLocalDrug("WonderCure 500")).toBeNull();
    expect(findLocalDrug("")).toBeNull();
  });
});

describe("LOCAL_DRUGS data quality", () => {
  it("holds the 12 curated medicines", () => {
    expect(LOCAL_DRUGS.length).toBe(12);
  });

  it("every drug has complete plain-language info for the result card", () => {
    for (const d of LOCAL_DRUGS) {
      expect(d.info, `${d.name} is missing its info block`).toBeTruthy();
      expect(d.info!.uses.length, `${d.name}: uses`).toBeGreaterThan(0);
      expect(d.info!.dosage.length, `${d.name}: dosage`).toBeGreaterThan(0);
      expect(d.info!.sideEffects.length, `${d.name}: side effects`).toBeGreaterThan(0);
      expect(d.info!.caution.length, `${d.name}: caution`).toBeGreaterThan(0);
    }
  });
});

describe("extractFromText", () => {
  it("reads a normal box label completely", () => {
    const label = extractFromText(
      "PANADOL\nGSK\nParacetamol 500mg Tablets\nBatch No: B12345\nEXP: 08/27",
      0.9
    );
    expect(label.drugName).toBe("Panadol");
    expect(label.manufacturer).toBe("GSK");
    expect(label.batchNumber).toBe("B12345");
    expect(label.expiryDate).toBe("08/27");
    expect(label.ocrConfidence).toBe(0.9);
  });

  it("reads a blister strip: repeated name counts once, batch may be absent", () => {
    const label = extractFromText("PANADOL PANADOL PANADOL\nGSK GSK", 0.7);
    expect(label.drugName).toBe("Panadol");
    expect(label.manufacturer).toBe("GSK");
    expect(label.batchNumber).toBeNull();
    expect(label.expiryDate).toBeNull();
  });

  it("accepts the other batch spellings (B.No / Lot)", () => {
    expect(extractFromText("BRUFEN\nAbbott\nB.No. X9921", 0.8).batchNumber).toBe("X9921");
    expect(extractFromText("BRUFEN\nAbbott\nLot 42A", 0.8).batchNumber).toBe("42A");
  });

  it("accepts expiry written as a month name", () => {
    const label = extractFromText("DISPRIN\nReckitt\nEXP AUG 2027", 0.8);
    expect(label.expiryDate).toMatch(/AUG 2027/i);
  });

  it("falls back to the first line when no known drug is present", () => {
    const label = extractFromText("Somexyz Tablets\nMade somewhere", 0.5);
    expect(label.drugName).toBe("Somexyz Tablets");
    expect(label.manufacturer).toBeNull();
  });

  it("a variant name beats its base drug (Panadol Extra, not Panadol)", () => {
    const label = extractFromText(
      "PANADOL EXTRA\nGSK\nBatch No: B12345\nEXP: 08/27",
      0.9
    );
    expect(label.drugName).toBe("Panadol Extra");
  });
});
