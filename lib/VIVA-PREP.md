# MediLens — Viva / Demo Day Prep

Ma'am ke likely sawalat, aur unke crisp jawab. Har jawab asal code par based hai
(`lib/verdict.ts`, `lib/drugs.ts`, `app/` routes) — ratta nahi, samajh kar bolo.

---

## 30-second pitch

"MediLens ek AI medicine-authenticity checker hai. User dawa ki dabbi ki photo leta hai,
app label parrhta hai, usay drug databases se match karta hai, aur red/amber/green
verdict deta hai — genuine, attention, ya high risk. WHO ke mutabiq low/middle-income
countries mein 1 in 10 dawaiyan substandard ya falsified hain; MediLens aam aadmi ko
ye check ghar bethay karne deta hai. Sara project Rs 0 mein bana hai — sirf free tools."

## 1-minute demo script (demo day flow)

1. Home page kholo — hero, 3 steps, WHO stat dikhao.
2. "Scan a medicine" → scan page par **"Demo: genuine pack"** dabao.
3. Staged progress dekho: "Reading label…" → "Matching against drug databases…" →
   "Evaluating safety verdict…" → **green verdict** (Panadol, GSK, valid expiry).
4. Phir **"Demo: expired pack"** → **red verdict** ("EXPIRED — do not use").
5. "Download PDF report" dabao → pharmacist report ban jati hai.
6. Map page kholo → red/amber/green hotspot dots dikhao.
7. Closing line: "Har verdict ke saath reasons aur disclaimer — ye screening assistant
   hai, medical device nahi."

---

## Sawal-Jawab

### 1. Is mein "AI" kahan hai? Verdict to rules se nikalta hai?
"AI ka kaam **label parrhna** hai — Gemini vision API photo se drug name, manufacturer,
batch number aur expiry nikalta hai. Verdict **jaan boojh kar rule-based** rakha hai,
taake har faisla explain ho sake: 'red kyun aaya?' ka jawab reasons ki list mein hota hai.
AI verdict black-box hota; rule-based verdict examiner ko samajh aata hai. Ye design
decision hai, kami nahi."

### 2. Gemini free mein kaise? Limit khatam ho jaye to demo ruk jayega?
"Google AI Studio ka free tier **baghair credit card** ke key deta hai — Flash models
par rozana ~1000–1500 requests tak free (model ke hisaab se farq hai, live quota AI Studio
dashboard par nazar aata hai; Flash-Lite sab se generous hai). Demo mein sirf chand scans
hote hain, to limit ka koi masla nahi. Aur backup bhi hai: agar Gemini 503 de
(`AI_OCR_UNAVAILABLE`), to **Tesseract.js** browser mein on-device OCR chala leta hai —
100% free, offline. Demo rukega nahi."

### 3. Dawa ka data kahan se aata hai?
"Do sources, priority order mein: (1) **Local DB** — Pakistan market ki 12 common dawaiyan
(Panadol, Augmentin, Brufen, Flagyl, Risek…) curated list, jo **offline bhi kaam karti hai**
— yehi demo-safe source hai. (2) **openFDA** — US FDA ka free public API, jab local mein
match na mile. OCR mein halki misreading ho to **fuzzy matching** pakar leta hai."

### 4. Verdict ka faisla exactly kaise hota hai? (6 rules yaad rakho)
1. Drug name hi na parrha jaye → **red** (retake photo).
2. Dawa database mein na mile → **red** (misspelled, unregistered, ya counterfeit).
3. Manufacturer match na kare → **amber**.
4. Expiry: expired → **red**; parrhi na jaye → **amber**; valid → ok.
5. Batch number na mile → **amber** (genuine packs par batch hota hai).
6. OCR confidence weak ho → **amber**.
"Sab se sakht rule jeetta hai (worst-level-wins), har verdict ke saath **reasons ki list**
aur confidence % — is liye har faisla explainable hai."

### 5. Privacy ka kya khayal rakha?
"Teen cheezen: (1) Map par location **~1km round** karke save hoti hai — exact ghar ka
pata kabhi nahi. (2) **API keys kabhi frontend mein nahi** — sirf Next.js API routes
(server-side) se calls hoti hain. (3) Tasveer store nahi hoti — sirf nikla hua text
process hota hai."

### 6. Poora free kaise? Koi paid service nahi?
"Rs 0: Next.js (open source) + **Vercel free** hosting, **Gemini free tier** OCR,
**Tesseract.js** free offline, **openFDA** free API, **Supabase free** plan (DB/auth),
**Leaflet + OpenStreetMap** map (koi key nahi), **jsPDF** free, **next-pwa** free.
Sirf 4 free accounts banane parte hain: GitHub, Google AI Studio, Supabase, Vercel."

### 7. Map kaise banta hai?
"User 'Report to map' dabata hai → geolocation lekar `/api/reports` par POST hota hai
(rounded location ke saath) → `/map` page par **Leaflet + OpenStreetMap** red/amber/green
circle markers dikhata hai. Crowdsourced hotspot map — jahan zyada red dots, wahan
authorities ke liye signal."

### 8. Offline / bina internet ke chalega?
"Poori tarah nahi, lekin demo-safe hai: **PWA service worker** app shell cache karta hai,
**Tesseract.js** on-device OCR internet ke baghair chalta hai, aur **local drug DB**
offline match karta hai. Scan page par **demo mode buttons** hain — camera ya net na ho
to bhi one-click par asli pipeline chalta hai."

### 9. Limitations kya hain? (Honest jawab = marks)
"Teen imaandari se: (1) OCR 100% accurate nahi — kharab roshni ya phati dabbi par
misread ho sakta hai, is liye weak confidence par amber aata hai. (2) openFDA **US**
ka data hai — Pakistan ki DRAP database publicly available nahi, is liye local curated
DB rakhi hai. (3) Ye **medical device nahi** — har verdict screen par disclaimer hai:
'A green verdict does not guarantee authenticity. Always consult a pharmacist or doctor.'
Limitations chhupana nahi, batana impressive lagta hai."

### 10. Sab se mushkil technical hissa kya tha?
"Pakistani packs par 'Batch No. B12345' likha hota hai — mera pehla OCR regex isay
pakar nahi raha tha. Testing mein **asal bug mila aur fix kiya**: regex ab 'Batch No.',
'B.No.', 'Lot' sab formats pakarta hai. Doosra: phone camera ke liye **HTTPS zaroori**
hai (`getUserMedia` insecure context par nahi chalta) — is liye Vercel deploy lazmi hai,
`localhost` par phone se test nahi hota."

### 11. Agar dobara banao to kya behtar karoge? (Future scope)
"DRAP Pakistan se official drug registry integrate karna, **Urdu interface**, manufacturer
batch-verification API, aur local DB ko 12 se 40–50 dawaiyon tak barhana. Aur barcode/QR
scan — asal packs par QR hota hai, wo OCR se zyada reliable hai."

### 12. Ye 'international level' kyun hai?
"Problem global hai (WHO 1-in-10 stat), solution mobile-first PWA hai jo low-end phones
par bhi chalta hai, Rs 0 cost par developing countries mein deploy ho sakta hai,
privacy-by-design hai, aur har faisla explainable hai. Plus craft: cinematic landing,
laser-scan animation, staged progress, branded 404, accessibility
(`prefers-reduced-motion`, keyboard focus) — ye sab international standard ki nishani hai."

---

## Demo-day checklist (ek din pehle)

- [ ] Vercel ka live link phone par kholo — camera chalta hai?
- [ ] Dono demo buttons try karo (genuine → green, expired → red)
- [ ] PDF download ek dafa nikaal kar dekho
- [ ] Map page par markers nazar aa rahe hain?
- [ ] Backup: project ka zip + 2-3 screenshots phone mein rakho (net na ho to bhi dikha sako)
- [ ] Upar wala 30-second pitch 2 dafa zor se bol kar practice karo

## Agar phans jao to

- **Camera na khule:** "HTTPS required hai — is liye Vercel deploy par demo dunga; upload-photo fallback bhi hai."
- **"AI kahan hai?"** → Q1 wala jawab.
- **Kuch bhool jao:** ye ek line yaad rakho — *"Verdict rule-based hai taake har faisla explain ho sake; AI ka kaam label parrhna hai."*
- **Ma'am code dekhein:** `lib/verdict.ts` mein 6 numbered rules hain — wahan le jao, sab se strong file hai.
