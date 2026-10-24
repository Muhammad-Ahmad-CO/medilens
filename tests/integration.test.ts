/**
 * INTEGRATION TESTS — parts working together, end to end.
 *
 * The scan pipeline (request → AI reading → drug match → verdict) and the
 * pharmacies route (several map mirrors, first healthy answer wins) run
 * for real; only the outside services (Gemini, openFDA, Overpass) are
 * replaced with scripted fake answers, so the tests are fast and free.
 * Run with: npm test
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/scan/route";
import { GET } from "@/app/api/pharmacies/route";

/* ================= POST /api/scan ================= */
function geminiEnvelope(label: Record<string, unknown>) {
  return {
    candidates: [
      { content: { parts: [{ text: JSON.stringify(label) }] } },
    ],
  };
}

function stubFetch(gemini: () => Response) {
  return vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input);
    if (url.includes("generativelanguage.googleapis.com")) return gemini();
    if (url.includes("api.fda.gov"))
      return new Response("{}", { status: 404 });
    return new Response("{}", { status: 404 });
  });
}

function jsonResponse(obj: unknown, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

let ipCounter = 0;
function scanRequest(body: unknown) {
  ipCounter += 1;
  return new NextRequest("http://test/api/scan", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-forwarded-for": `10.0.0.${ipCounter}`,
    },
    body: JSON.stringify(body),
  });
}

const GENUINE = {
  drugName: "Panadol",
  manufacturer: "GSK",
  batchNumber: "B12345",
  expiryDate: "08/27",
  ocrConfidence: 0.97,
};

beforeEach(() => {
  vi.stubGlobal(
    "fetch",
    stubFetch(() => jsonResponse(geminiEnvelope(GENUINE)))
  );
});
afterEach(() => {
  vi.unstubAllGlobals();
});

describe("POST /api/scan", () => {
  it("a genuine pack photo scans end-to-end to GREEN with drug details", async () => {
    const res = await POST(scanRequest({ image: "aGVsbG8=" }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.label.drugName).toBe("Panadol");
    expect(data.drug?.source).toBe("local");
    expect(data.drug?.info?.uses).toContain("fever");
    expect(data.verdict.level).toBe("green");
  });

  it("an expired pack scans end-to-end to RED", async () => {
    vi.stubGlobal(
      "fetch",
      stubFetch(() =>
        jsonResponse(
          geminiEnvelope({
            drugName: "Brufen",
            manufacturer: "Abbott",
            batchNumber: "X123",
            expiryDate: "01/20",
            ocrConfidence: 0.95,
          })
        )
      )
    );
    const res = await POST(scanRequest({ image: "aGVsbG8=" }));
    const data = await res.json();
    expect(data.verdict.level).toBe("red");
    expect(data.verdict.reasons.join(" ")).toMatch(/EXPIRED/);
  });

  it("when the AI is down, the route says so (503) instead of guessing", async () => {
    vi.stubGlobal(
      "fetch",
      stubFetch(() => new Response("overloaded", { status: 503 }))
    );
    const res = await POST(scanRequest({ image: "aGVsbG8=" }));
    expect(res.status).toBe(503);
    const data = await res.json();
    expect(data.error).toBe("AI_OCR_UNAVAILABLE");
  });

  it("the on-device text path works with no AI call at all", async () => {
    const res = await POST(
      scanRequest({
        text: "PANADOL\nGSK\nBatch No: B12345\nEXP: 08/27",
        ocrConfidence: 0.9,
      })
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.verdict.level).toBe("green");
    expect(data.drug?.name).toBe("Panadol");
  });

  it("two photos of one pack merge into a single GREEN verdict", async () => {
    // Photo 1 carries only the name, photo 2 only the batch/expiry —
    // the real-world split-face problem. Neither photo alone is GREEN.
    const labels = [
      {
        drugName: "Panadol",
        manufacturer: "GSK",
        batchNumber: null,
        expiryDate: null,
        ocrConfidence: 0.95,
      },
      {
        drugName: null,
        manufacturer: null,
        batchNumber: "B12345",
        expiryDate: "08/27",
        ocrConfidence: 0.9,
      },
    ];
    let call = 0;
    vi.stubGlobal(
      "fetch",
      stubFetch(() => jsonResponse(geminiEnvelope(labels[call++ % labels.length])))
    );
    const res = await POST(scanRequest({ images: ["AAA", "BBB"] }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.label.drugName).toBe("Panadol");
    expect(data.label.batchNumber).toBe("B12345");
    expect(data.label.expiryDate).toBe("08/27");
    expect(data.verdict.level).toBe("green");
    expect(data.photosUsed).toBe(2);
  });

  it("photos of two different drugs never score GREEN (conflict guard)", async () => {
    const labels = [
      {
        drugName: "Panadol",
        manufacturer: "GSK",
        batchNumber: "B1",
        expiryDate: "08/27",
        ocrConfidence: 0.95,
      },
      {
        drugName: "Brufen",
        manufacturer: "Abbott",
        batchNumber: "X9",
        expiryDate: "08/27",
        ocrConfidence: 0.95,
      },
    ];
    let call = 0;
    vi.stubGlobal(
      "fetch",
      stubFetch(() => jsonResponse(geminiEnvelope(labels[call++ % labels.length])))
    );
    const res = await POST(scanRequest({ images: ["AAA", "BBB"] }));
    const data = await res.json();
    expect(data.verdict.level).toBe("amber");
    expect(data.verdict.reasons.join(" ")).toMatch(/different medicine names/);
  });

  it("rejects photo counts outside 1–3 (400)", async () => {
    const empty = await POST(scanRequest({ images: [] }));
    expect(empty.status).toBe(400);
    const four = await POST(
      scanRequest({ images: ["A", "B", "C", "D"] })
    );
    expect(four.status).toBe(400);
  });

  it("rejects a request with neither image nor text (400)", async () => {
    const res = await POST(scanRequest({ hello: "world" }));
    expect(res.status).toBe(400);
  });

  it("rejects an absurdly large image before any AI work (413)", async () => {
    const res = await POST(
      scanRequest({ image: "A".repeat(6 * 1024 * 1024 + 1) })
    );
    expect(res.status).toBe(413);
  });
});

/* ================= GET /api/pharmacies ================= */
// Two pharmacies near Clifton, Karachi (24.8138, 67.0404).
const CLIFTON_ELEMENTS = [
  { lat: 24.8148, lon: 67.0414, tags: { name: "Near Pharmacy" } },
  { lat: 24.8238, lon: 67.0504, tags: { name: "Far Pharmacy" } },
];

let pharmIpCounter = 100;
function pharmRequest(query = "lat=24.8138&lng=67.0404") {
  pharmIpCounter += 1;
  return new NextRequest(`http://test/api/pharmacies?${query}`, {
    headers: { "x-forwarded-for": `10.1.0.${pharmIpCounter}` },
  });
}

describe("GET /api/pharmacies", () => {
  it("uses the healthy mirror when the first one times out empty (the 2026-10-24 bug)", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);
        if (url.includes("overpass-api.de"))
          // Exactly what a timed-out Overpass query returns: 200, no
          // elements, just a remark.
          return jsonResponse({
            elements: [],
            remark: "runtime error: Query timed out in manchester at line 1.",
          });
        if (url.includes("overpass.kumi.systems"))
          return jsonResponse({ elements: CLIFTON_ELEMENTS });
        return jsonResponse({ elements: [] });
      })
    );

    const res = await GET(pharmRequest());
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.pharmacies).toHaveLength(2);
    expect(data.pharmacies[0].name).toBe("Near Pharmacy");
    // Nearest first, with a sane distance attached.
    expect(data.pharmacies[0].distM).toBeLessThan(data.pharmacies[1].distM);
    expect(data.pharmacies[0].distM).toBeGreaterThan(0);
  });

  it("returns an honest empty list when every mirror agrees there is nothing", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => jsonResponse({ elements: [] }))
    );
    const res = await GET(pharmRequest());
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.pharmacies).toEqual([]);
  });

  it("fails honestly (502) when every mirror is down", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("network down");
      })
    );
    const res = await GET(pharmRequest());
    expect(res.status).toBe(502);
    const data = await res.json();
    expect(data.error).toBe("PHARMACY_LOOKUP_FAILED");
  });

  it("rejects a request without valid coordinates (400)", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => jsonResponse({ elements: [] }))
    );
    const res = await GET(pharmRequest("lat=abc&lng="));
    expect(res.status).toBe(400);
  });
});
