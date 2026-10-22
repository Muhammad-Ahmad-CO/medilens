# MediLens — Pre-Launch Security Audit

**Date:** 2026-10-09
**Auditor:** ahmad' agent (19-point security checklist, same list from the krishanu.builds reel)
**Code audited:** `~/workspace/medilens` (all of `app/`, `lib/`, `components/`, `next.config.js`, `supabase/schema.sql`)

## Verdict: ✅ GO for demo-day launch (after fixes below — already applied and build-verified)

No critical issue found. Two real fixes were made; everything else passes.

---

## What was checked

### 1. API KEYS — ✅ PASS
`GEMINI_API_KEY` is used only in `lib/ocr.ts`, which is imported only by the **server** route `app/api/scan/route.ts`. The browser code uses a separate file (`lib/ocr-client.ts`, on-device Tesseract) that never touches the key. Nothing leaks to the client bundle.

### 2. ENV VARS — ✅ PASS
- `.env.example` has **no real keys** in it (all values empty).
- No `.env` file exists in the project, so nothing secret can be uploaded by mistake.
- Supabase URL + anon key are `NEXT_PUBLIC_*` **by design** — the anon key is public-safe; real protection comes from Row Level Security (see #16).

### 3. ADMIN ROUTES — ✅ PASS (none exist)
No `/admin` pages or admin API endpoints.

### 4. AUTH — ⚠️ NOTE (public by design)
There is no login system — every endpoint is public. That is fine for a class demo, BUT it means anyone can call the APIs. The two risks this creates are fixed in #8.

### 5. ACCESS / IDOR — ✅ PASS
No user accounts, no per-user data, no `/api/users/[id]`-style endpoints. Nothing to steal.

### 6. FORMS / INPUT VALIDATION — ✅ PASS (with one new limit)
- `/api/scan` rejects bad JSON with `400`.
- `/api/reports` checks that `lat`/`lng` are numbers; `verdict` is restricted by the database itself.
- **New:** `/api/scan` now rejects images larger than ~6 MB with `413` — before, anyone could POST a giant file and waste server memory + AI quota.

### 7. XSS — ✅ PASS
The only `dangerouslySetInnerHTML` in the project (`app/layout.tsx`) is a **hardcoded** service-worker registration script. No user input ever goes into it.

### 8. RATE LIMIT — 🔧 FIXED
**Before:** no rate limit anywhere. Two real risks:
- `POST /api/scan` calls Gemini on every request — a bot could burn through your entire free-tier quota in minutes.
- `POST /api/reports` lets anyone insert hotspot reports — a bot could flood your map with fake red zones (data poisoning).

**Fix (applied):** new file `lib/rate-limit.ts` — simple per-IP limiter, no new dependency:
- `/api/scan`: 10 requests/minute per IP (a real person never scans faster).
- `/api/reports`: 20 requests/minute per IP.
- Over the limit → `429 Too Many Requests` with a `Retry-After` hint.

### 9. ENDPOINTS — ✅ reviewed
Only 3 routes, all public by design: `POST /api/scan`, `GET /api/drugs`, `GET/POST /api/reports`. No endpoint returns more data than the UI needs.

### 10. CORS — ✅ PASS
APIs are same-origin (no CORS config needed). Nothing to fix.

### 11. SECURITY HEADERS — 🔧 FIXED
**Before:** `next.config.js` had no security headers at all.
**Fix (applied):** added to every page —
- `X-Frame-Options: SAMEORIGIN` — blocks clickjacking (app can't be embedded in attacker's site).
- `X-Content-Type-Options: nosniff` — stops MIME-sniffing attacks.
- `Referrer-Policy: strict-origin-when-cross-origin` — URLs don't leak in referrers.
- (HTTPS on Vercel already gives you HSTS for free.)

### 12. DEBUG MODE — ✅ PASS
No `console.log`/`console.debug` anywhere in app code. Nothing sensitive is printed.

### 13. DEPENDENCIES — ⚠️ COULD NOT CHECK
`npm audit` was blocked by the sandbox network policy, so known-CVE scanning could not run. Stack: Next 14.2.13, React 18.3.1, Supabase JS 2.45, Tesseract 5.1.1, jsPDF 2.5.1, Leaflet 1.9.4. **Do this once on the deployed Vercel project** (Vercel's dashboard shows dependency alerts), or run `npm audit` from any machine with full internet.

### 14. UNUSED PACKAGES — ✅ PASS
Every dependency is actually used (Tesseract, jsPDF, Leaflet, Supabase, Next, React). Nothing to remove.

### 15. EXPOSED FILES — ✅ PASS (with one warning)
No `.env`, no `.git`, no backup files in the project. ⚠️ **When you upload to GitHub from the browser: upload the project files, but NEVER create/upload a `.env.local` file there.** Secrets go only into Vercel's Environment Variables page (the deploy guide already says this).

### 16. DATABASE — ✅ PASS (with a note)
- Row Level Security is **enabled** on both tables.
- Policies are "anyone can read, anyone can insert" — the schema comments say this is demo-friendly and intentional. For a class project this is acceptable; for real production you would require login.
- Coordinates are rounded to ~1 km **before** storage — no exact user location is ever saved. Good privacy design.
- All queries use the Supabase client (parameterized) — no SQL injection possible.

### 17. PASSWORDS — N/A
No login system, no passwords stored anywhere.

### 18. LEAKED SECRETS IN GIT HISTORY — ⚠️ COULD NOT CHECK
There is no `.git` history in this copy, so history scanning was not possible. The rule going forward: **never commit `.env.local`** — if a key is ever committed by mistake, rotate (replace) the key immediately; deleting the file later is not enough.

### 19. SUMMARY
| Severity | Count |
|---|---|
| CRITICAL | 0 |
| HIGH | 0 |
| LOW (fixed) | 2 — rate limiting, security headers |
| Notes | auth is public-by-design; RLS policies are demo-open; npm audit pending |

**Top fixes (all done):**
1. Rate limits on `/api/scan` (protects Gemini quota) and `/api/reports` (protects the map).
2. Security headers in `next.config.js`.
3. Max upload size on `/api/scan`.

---

## Verification
- `npx tsc --noEmit` → clean (one small iterator fix applied in `lib/rate-limit.ts`).
- `npm run build` → ✅ Compiled successfully, all 10 pages generated.
- Originals of the 3 changed files are backed up at `/tmp/medilens-backup-20261009/` if a rollback is ever needed.

## What is still on you (not code)
1. When uploading to GitHub: do **not** include `.env.local` (you don't have one — just don't create one there).
2. Run `npm audit` once from a machine with full internet, or check Vercel's dependency alerts after deploy.
3. If Supabase RLS was left demo-open, remember it's a demo choice — fine for the 1-Nov deadline.
