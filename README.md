# MediLens — AI Medicine Authenticity Checker

Point your phone camera at a medicine pack. MediLens reads the label, checks it
against drug databases, and gives an explained **red / amber / green** safety
verdict. A *screening assistant* — not a medical device.

Web Engineering course project · Solo build · Target: international-competition quality

---

## 100% free stack (Rs 0)

| Part | Technology | Cost |
|---|---|---|
| Frontend | Next.js 14 + TypeScript (App Router) | Free, open source |
| Hosting | Vercel (Hobby plan) | Free, no credit card |
| Vision OCR | Gemini API free tier (Google AI Studio) | Free, no credit card |
| OCR fallback | Tesseract.js (on-device, offline) | Free forever |
| Drug data | Curated local DB + openFDA API | Free |
| Database/Auth | Supabase (free tier) | Free, no credit card |
| Map | Leaflet + OpenStreetMap | Free, no API key |
| PDF reports | jsPDF (client-side) | Free |
| PWA/offline | Hand-rolled service worker | Free |

---

## Setup (15 minutes)

### 1. Prerequisites
- **Node.js LTS** (v20+) installed on your computer — https://nodejs.org
- A **GitHub** account (free) — for Vercel deployment

### 2. Install
```bash
cd medilens
npm install
```

### 3. Free API keys (all free, no credit card)

**a) Gemini (vision OCR)** — https://aistudio.google.com/apikey → *Create API key*
**b) Supabase** — https://supabase.com → *New project* (free tier) →
Settings → API → copy **Project URL** and **anon public key**.
Then open the **SQL editor** in Supabase and run the whole
`supabase/schema.sql` file once — this creates the `scans` and
`hotspot_reports` tables.

### 4. Environment
```bash
cp .env.example .env.local
```
Fill in `GEMINI_API_KEY`, `NEXT_PUBLIC_SUPABASE_URL`,
`NEXT_PUBLIC_SUPABASE_ANON_KEY`.

> The app works **without** these keys too: no Gemini key → it falls back to
> on-device Tesseract OCR; no Supabase keys → history/map show a setup hint
> instead of crashing. Perfect for gradual setup.

### 5. Run
```bash
npm run dev
```
Open http://localhost:3000 — on your phone, use your computer's LAN IP
(e.g. `http://192.168.1.5:3000`) so the camera works.

### 6. Deploy (free)
Push to GitHub → https://vercel.com → *Import project* → add the same three
environment variables → Deploy. Camera requires HTTPS — Vercel gives you that
automatically.

---

## How it works (the pipeline)

```
Camera photo
   → POST /api/scan { image }
   → Gemini vision extracts { drugName, manufacturer, batch, expiry }   [lib/ocr.ts]
   → (no key? → 503 → browser runs Tesseract.js, resubmits { text })    [lib/ocr-client.ts]
   → Match: local DB first → openFDA second                             [lib/drugs.ts]
   → Rule-based verdict: red / amber / green + reasons                   [lib/verdict.ts]
   → Save scan to Supabase (best effort)
   → VerdictCard UI + PDF export + optional hotspot report
```

The verdict engine is **rule-based, not a black box** — every verdict lists its
reasons. That explainability is the project's strongest talking point.

## Project structure

```
app/            pages: / (home), /scan, /history, /map + API routes
components/     CameraCapture, VerdictCard, HotspotMap
lib/            verdict.ts (rules), drugs.ts (DB + openFDA),
                ocr.ts (Gemini + text heuristics), ocr-client.ts (Tesseract),
                supabase.ts, pdf.ts (jsPDF reports)
public/         manifest.json, sw.js, icon.svg (PWA)
supabase/       schema.sql (run once in Supabase SQL editor)
```

## Demo-day tips
1. Seed the local DB (`lib/drugs.ts`) with the exact packs you'll demo.
2. Keep one "red" pack (expired/misspelled) and one "green" pack ready.
3. If the hall Wi-Fi dies, the local DB + Tesseract fallback keeps the demo alive.

## Troubleshooting
- **Camera doesn't open on laptop browser** → use the *Upload photo* button.
- **`AI_OCR_UNAVAILABLE`** → add `GEMINI_API_KEY` to `.env.local` and restart.
- **History/Map empty hints** → add Supabase keys + run `schema.sql`.
- **Build errors** → `rm -rf node_modules .next && npm install && npm run build`.
