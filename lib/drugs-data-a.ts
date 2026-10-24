/**
 * The local medicine index — curated, offline-first.
 *
 * This file is DATA ONLY (no logic), so it can grow without touching the
 * verdict engine. Every entry carries plain-language details for the
 * result screen ("About this medicine").
 *
 * Editorial rules (please keep them when adding entries):
 *  - Manufacturer: only a maker we are confident about. Otherwise
 *    "Various" — and the verdict engine skips the manufacturer check for
 *    "Various" entries, so a genuine pack is never called AMBER just
 *    because its maker was not recorded.
 *  - Dosage: standard adult guidance for common over-the-counter
 *    medicines; for prescription medicines the dosage field says
 *    "exactly as prescribed" and never invents a dose. This app screens
 *    packs — it never prescribes.
 *  - Controlled / narcotic medicines are deliberately NOT listed.
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

/** Curated index — common medicines found in Pakistani pharmacies. */
export const LOCAL_DRUGS_A: LocalDrug[] = [
  {
    name: "Panadol", manufacturer: "GSK", packSizes: ["100 tablets", "200 tablets"], notes: "Paracetamol 500mg",
    info: { uses: "For fever, headache and body pain.", dosage: "Adults: 1–2 tablets (500mg) every 4–6 hours when needed. Maximum 8 tablets in 24 hours.", sideEffects: "Usually very safe. Rarely: skin rash or allergy.", caution: "Do not take with other medicines that contain paracetamol — too much harms the liver." },
  },
  {
    name: "Panadol Extra", manufacturer: "GSK", packSizes: ["48 tablets", "100 tablets"], notes: "Paracetamol + caffeine",
    info: { uses: "For strong headache, migraine and body pain.", dosage: "Adults: 1–2 tablets every 4–6 hours when needed. Maximum 8 tablets in 24 hours.", sideEffects: "The caffeine can cause restlessness or trouble sleeping in some people.", caution: "Do not combine with other paracetamol products, and avoid extra tea or coffee." },
  },
  {
    name: "Panadol Cold & Flu", manufacturer: "GSK", packSizes: ["24 tablets"], notes: "Paracetamol + phenylephrine",
    info: { uses: "For cold, flu, blocked nose, headache and fever.", dosage: "Adults: 1–2 tablets every 4–6 hours when needed. Maximum 8 tablets in 24 hours.", sideEffects: "Drowsiness, dry mouth, fast heartbeat in some people.", caution: "Do not combine with other paracetamol products. Avoid if you have high blood pressure." },
  },
  {
    name: "Augmentin", manufacturer: "GSK", packSizes: ["30 tablets"], notes: "Co-amoxiclav 625mg",
    info: { uses: "Antibiotic for bacterial infections — throat, chest, ear, teeth and skin.", dosage: "Usually 1 tablet two or three times a day, exactly as the doctor prescribed. Finish the full course.", sideEffects: "Loose stools, nausea, stomach upset.", caution: "Prescription medicine. Never start or stop an antibiotic on your own." },
  },
  {
    name: "Disprin", manufacturer: "Reckitt Benckiser", packSizes: ["100 tablets"], notes: "Aspirin 300mg dispersible",
    info: { uses: "For pain, fever and headache. The tablet dissolves in water.", dosage: "Adults: 1–3 tablets dissolved in water, every 4–6 hours when needed.", sideEffects: "Stomach irritation or burning.", caution: "Not for children under 16. Avoid if you have a stomach ulcer or asthma." },
  },
  {
    name: "Brufen", manufacturer: "Abbott", packSizes: ["100 tablets", "200ml syrup"], notes: "Ibuprofen 400mg",
    info: { uses: "For pain, swelling, fever, and joint or muscle pain.", dosage: "Adults: 1 tablet (400mg) every 6–8 hours, with food, when needed.", sideEffects: "Stomach pain, acidity, dizziness.", caution: "Always take with food. Avoid in pregnancy and kidney problems." },
  },
  {
    name: "Arinac", manufacturer: "Abbott", packSizes: ["100 tablets"], notes: "Ibuprofen + pseudoephedrine",
    info: { uses: "For cold, blocked nose, sinus pressure and fever.", dosage: "Adults: 1 tablet every 6–8 hours when needed.", sideEffects: "Dry mouth, fast heartbeat, trouble sleeping.", caution: "Avoid if you have high blood pressure or heart disease." },
  },
  {
    name: "Arinac Forte", manufacturer: "Abbott", packSizes: ["100 tablets"], notes: "Ibuprofen + pseudoephedrine (stronger)",
    info: { uses: "For strong cold, blocked nose, sinus pressure and fever.", dosage: "Adults: 1 tablet every 8 hours when needed, exactly as directed on the pack.", sideEffects: "Dry mouth, fast heartbeat, trouble sleeping.", caution: "Avoid if you have high blood pressure or heart disease." },
  },
  {
    name: "Septran", manufacturer: "GSK", packSizes: ["100 tablets"], notes: "Co-trimoxazole",
    info: { uses: "Antibiotic for chest, urine and stomach infections.", dosage: "Usually 2 tablets twice a day, exactly as prescribed. Drink plenty of water.", sideEffects: "Rash, nausea; allergy in some people.", caution: "Prescription medicine. Stop it and see a doctor at once if a severe skin rash appears." },
  },
  {
    name: "Flagyl", manufacturer: "Sanofi", packSizes: ["100 tablets", "200 tablets"], notes: "Metronidazole 400mg",
    info: { uses: "For stomach and gut infections, dysentery and dental infections.", dosage: "Usually 1 tablet three times a day, exactly as prescribed. Finish the full course.", sideEffects: "Metallic taste, nausea, dark urine.", caution: "Prescription medicine. Strictly no alcohol during the course and for 2 days after." },
  },
  {
    name: "Risek", manufacturer: "Getz Pharma", packSizes: ["28 capsules"], notes: "Omeprazole 20mg",
    info: { uses: "For acidity, acid reflux and stomach ulcer.", dosage: "Usually 1 capsule once a day before breakfast.", sideEffects: "Headache, gas, loose stools.", caution: "If acidity keeps returning for weeks, see a doctor instead of just continuing it." },
  },
  {
    name: "Getryl", manufacturer: "Getz Pharma", packSizes: ["30 tablets"], notes: "Glimepiride",
    info: { uses: "For type 2 diabetes — it controls blood sugar.", dosage: "Usually 1 tablet once a day with breakfast, exactly as prescribed.", sideEffects: "Low blood sugar (shakiness, sweating, hunger), weight gain.", caution: "Prescription medicine for sugar patients only. Never share it or change the dose yourself." },
  },
  {
    name: "Xavor", manufacturer: "CCL", packSizes: ["30 tablets"], notes: "Losartan potassium",
    info: { uses: "For high blood pressure.", dosage: "Usually 1 tablet once a day at the same time daily, exactly as prescribed.", sideEffects: "Dizziness, tiredness, a light-headed feeling.", caution: "Prescription medicine. Do not stop it suddenly, and avoid it in pregnancy." },
  },
  {
    name: "Nezeril", manufacturer: "Sami Pharmaceuticals", packSizes: ["15ml drops"], notes: "Oxymetazoline nasal",
    info: { uses: "Nasal drops for a blocked nose from cold or allergy.", dosage: "2–3 drops in each nostril, twice a day.", sideEffects: "Burning or dryness in the nose.", caution: "Do not use for more than 5–7 days — the nose can become dependent on it." },
  },
  {
    name: "Calpol", manufacturer: "GSK", packSizes: ["90ml suspension"], notes: "Paracetamol syrup for children",
    info: { uses: "For fever and pain in children.", dosage: "Give only the dose for the child's age and weight as printed on the pack, or as the doctor said.", sideEffects: "Usually very safe. Rarely: skin rash or allergy.", caution: "Do not combine with other paracetamol products. Keep out of children's reach." },
  },
  {
    name: "Ponstan", manufacturer: "Pfizer", packSizes: ["50 tablets"], notes: "Mefenamic acid 500mg",
    info: { uses: "For period pain, muscle pain and joint pain.", dosage: "Adults: 1 tablet three times a day with food, when needed.", sideEffects: "Stomach pain, nausea, dizziness.", caution: "Always take with food. Avoid in pregnancy, stomach ulcers and kidney problems." },
  },
  {
    name: "Voltral", manufacturer: "Novartis", packSizes: ["50 tablets"], notes: "Diclofenac sodium 50mg",
    info: { uses: "For joint pain, muscle pain, back pain and swelling.", dosage: "Adults: 1 tablet two or three times a day with food, when needed.", sideEffects: "Stomach pain, acidity, headache.", caution: "Always take with food. Avoid in pregnancy, stomach ulcers and heart disease." },
  },
  {
    name: "Cataflam", manufacturer: "Novartis", packSizes: ["50 tablets"], notes: "Diclofenac potassium 50mg",
    info: { uses: "For fast relief of pain, migraine, period pain and joint pain.", dosage: "Adults: 1 tablet two or three times a day, when needed.", sideEffects: "Stomach pain, nausea, dizziness.", caution: "Take with food if it upsets the stomach. Avoid in pregnancy and stomach ulcers." },
  },
  {
    name: "Voren", manufacturer: "Various", packSizes: ["50 tablets"], notes: "Diclofenac sodium",
    info: { uses: "For joint pain, muscle pain and swelling.", dosage: "Adults: 1 tablet two or three times a day with food, when needed.", sideEffects: "Stomach pain, acidity.", caution: "Always take with food. Avoid in stomach ulcers and heart disease." },
  },
  {
    name: "Nuberol Forte", manufacturer: "Various", packSizes: ["30 tablets"], notes: "Paracetamol + orphenadrine",
    info: { uses: "For muscle spasm, back pain and muscle stiffness.", dosage: "Adults: 1–2 tablets two or three times a day, when needed.", sideEffects: "Drowsiness, dry mouth, dizziness.", caution: "May make you sleepy — do not drive after taking it. Do not combine with other paracetamol products." },
  },
  {
    name: "Mefenamic Acid", manufacturer: "Various", packSizes: ["50 tablets"], notes: "Generic pain reliever",
    info: { uses: "For period pain, muscle pain and joint pain.", dosage: "Adults: 1 tablet three times a day with food, when needed.", sideEffects: "Stomach pain, nausea, dizziness.", caution: "Always take with food. Avoid in pregnancy and stomach ulcers." },
  },
  {
    name: "Diclofenac Sodium", manufacturer: "Various", packSizes: ["50 tablets"], notes: "Generic anti-inflammatory",
    info: { uses: "For joint pain, muscle pain, back pain and swelling.", dosage: "Adults: 1 tablet two or three times a day with food, when needed.", sideEffects: "Stomach pain, acidity, headache.", caution: "Always take with food. Avoid in pregnancy, stomach ulcers and heart disease." },
  },
  {
    name: "Naproxen", manufacturer: "Various", packSizes: ["30 tablets"], notes: "Generic anti-inflammatory",
    info: { uses: "For joint pain, muscle pain and period pain.", dosage: "Adults: 1 tablet twice a day with food, when needed.", sideEffects: "Stomach pain, acidity, headache.", caution: "Always take with food. Avoid in stomach ulcers and heart disease." },
  },
  {
    name: "Loprin", manufacturer: "Various", packSizes: ["30 tablets"], notes: "Aspirin 75mg (low dose)",
    info: { uses: "To prevent heart attack and stroke in people the doctor has advised it for.", dosage: "Usually 1 tablet once a day, exactly as prescribed.", sideEffects: "Stomach irritation, easy bruising.", caution: "Prescription/prevention medicine. Never start or stop it on your own, and tell your doctor before any surgery." },
  },
  {
    name: "Amoxil", manufacturer: "GSK", packSizes: ["30 capsules"], notes: "Amoxicillin 500mg",
    info: { uses: "Antibiotic for throat, chest, ear, teeth and urine infections.", dosage: "Usually 1 capsule three times a day, exactly as prescribed. Finish the full course.", sideEffects: "Loose stools, nausea, rash.", caution: "Prescription medicine. Tell your doctor if you are allergic to penicillin." },
  },
  {
    name: "Azomax", manufacturer: "Various", packSizes: ["6 tablets"], notes: "Azithromycin 500mg",
    info: { uses: "Antibiotic for chest, throat, skin and some stomach infections.", dosage: "Usually 1 tablet once a day for 3–5 days, exactly as prescribed.", sideEffects: "Nausea, loose stools, stomach cramps.", caution: "Prescription medicine. Finish the course even if you feel better." },
  },
  {
    name: "Zithromax", manufacturer: "Pfizer", packSizes: ["6 tablets"], notes: "Azithromycin 500mg",
    info: { uses: "Antibiotic for chest, throat, skin and some stomach infections.", dosage: "Usually 1 tablet once a day for 3–5 days, exactly as prescribed.", sideEffects: "Nausea, loose stools, stomach cramps.", caution: "Prescription medicine. Finish the course even if you feel better." },
  },
  {
    name: "Ciproxin", manufacturer: "Bayer", packSizes: ["20 tablets"], notes: "Ciprofloxacin 500mg",
    info: { uses: "Antibiotic for urine, stomach, skin and chest infections.", dosage: "Usually 1 tablet twice a day, exactly as prescribed. Drink plenty of water.", sideEffects: "Nausea, loose stools, dizziness, joint aches.", caution: "Prescription medicine. Avoid in children, pregnancy, and with dairy or antacids at the same time." },
  },
  {
    name: "Cefspan", manufacturer: "Various", packSizes: ["10 capsules"], notes: "Cefixime 400mg",
    info: { uses: "Antibiotic for urine, throat and chest infections.", dosage: "Usually 1 capsule once or twice a day, exactly as prescribed.", sideEffects: "Loose stools, nausea, stomach upset.", caution: "Prescription medicine. Tell your doctor if you are allergic to cephalosporin antibiotics." },
  },
  {
    name: "Velosef", manufacturer: "GSK", packSizes: ["24 capsules"], notes: "Cephradine 500mg",
    info: { uses: "Antibiotic for skin, throat, ear and urine infections.", dosage: "Usually 1 capsule two to four times a day, exactly as prescribed.", sideEffects: "Loose stools, nausea, rash.", caution: "Prescription medicine. Finish the full course." },
  },
  {
    name: "Erythrocin", manufacturer: "Various", packSizes: ["30 tablets"], notes: "Erythromycin 500mg",
    info: { uses: "Antibiotic for throat, chest, skin and eye infections.", dosage: "Usually 1 tablet two to four times a day, exactly as prescribed.", sideEffects: "Nausea, stomach cramps, loose stools.", caution: "Prescription medicine. Tell your doctor about other medicines you take." },
  },
  {
    name: "Doxycycline", manufacturer: "Various", packSizes: ["30 capsules"], notes: "Generic antibiotic",
    info: { uses: "Antibiotic for chest, skin, eye infections and malaria prevention.", dosage: "Usually 1 capsule once or twice a day, exactly as prescribed.", sideEffects: "Nausea, sun sensitivity, heartburn.", caution: "Prescription medicine. Take with a full glass of water and stay upright for 30 minutes. Avoid in pregnancy and children under 8." },
  },
  {
    name: "Levofloxacin", manufacturer: "Various", packSizes: ["10 tablets"], notes: "Generic antibiotic",
    info: { uses: "Antibiotic for chest, urine and skin infections.", dosage: "Usually 1 tablet once a day, exactly as prescribed.", sideEffects: "Nausea, dizziness, trouble sleeping, tendon pain.", caution: "Prescription medicine. Stop and see a doctor at once for tendon pain or swelling." },
  },
  {
    name: "Clarithromycin", manufacturer: "Various", packSizes: ["14 tablets"], notes: "Generic antibiotic",
    info: { uses: "Antibiotic for chest, throat, skin and stomach ulcer infections.", dosage: "Usually 1 tablet twice a day, exactly as prescribed.", sideEffects: "Metallic taste, nausea, loose stools.", caution: "Prescription medicine. Tell your doctor about heart medicines you take." },
  },
  {
    name: "Ciprofloxacin", manufacturer: "Various", packSizes: ["20 tablets"], notes: "Generic antibiotic",
    info: { uses: "Antibiotic for urine, stomach, skin and chest infections.", dosage: "Usually 1 tablet twice a day, exactly as prescribed. Drink plenty of water.", sideEffects: "Nausea, loose stools, dizziness.", caution: "Prescription medicine. Avoid in children and pregnancy." },
  },
  {
    name: "Co-Amoxiclav", manufacturer: "Various", packSizes: ["30 tablets"], notes: "Generic Augmentin-type antibiotic",
    info: { uses: "Antibiotic for throat, chest, ear, teeth and skin infections.", dosage: "Usually 1 tablet two or three times a day, exactly as prescribed. Finish the full course.", sideEffects: "Loose stools, nausea, stomach upset.", caution: "Prescription medicine. Tell your doctor if you are allergic to penicillin." },
  },
  {
    name: "Cephalexin", manufacturer: "Various", packSizes: ["30 capsules"], notes: "Generic antibiotic",
    info: { uses: "Antibiotic for skin, throat, ear and urine infections.", dosage: "Usually 1 capsule two to four times a day, exactly as prescribed.", sideEffects: "Loose stools, nausea, rash.", caution: "Prescription medicine. Finish the full course." },
  },
  {
    name: "Nitrofurantoin", manufacturer: "Various", packSizes: ["30 tablets"], notes: "Generic urine infection antibiotic",
    info: { uses: "For urine infections.", dosage: "Usually 1 tablet two to four times a day with food, exactly as prescribed.", sideEffects: "Nausea, headache, dark urine.", caution: "Prescription medicine. Take with food. Avoid in kidney problems." },
  },
  {
    name: "Fosfomycin", manufacturer: "Various", packSizes: ["1 sachet"], notes: "Generic urine infection antibiotic",
    info: { uses: "For simple urine infections.", dosage: "Usually 1 sachet dissolved in water, as a single dose, exactly as prescribed.", sideEffects: "Loose stools, nausea, headache.", caution: "Prescription medicine. Take on an empty stomach, at bedtime after passing urine." },
  },
  {
    name: "Metronidazole", manufacturer: "Various", packSizes: ["100 tablets"], notes: "Generic Flagyl-type medicine",
    info: { uses: "For stomach and gut infections, dysentery and dental infections.", dosage: "Usually 1 tablet three times a day, exactly as prescribed. Finish the full course.", sideEffects: "Metallic taste, nausea, dark urine.", caution: "Prescription medicine. Strictly no alcohol during the course and for 2 days after." },
  },
  {
    name: "Tinidazole", manufacturer: "Various", packSizes: ["10 tablets"], notes: "Generic anti-parasite antibiotic",
    info: { uses: "For dysentery, gut infections and dental infections.", dosage: "Usually as a short course, exactly as prescribed.", sideEffects: "Metallic taste, nausea, dizziness.", caution: "Prescription medicine. No alcohol during the course." },
  },
  {
    name: "Nexum", manufacturer: "AstraZeneca", packSizes: ["28 tablets"], notes: "Esomeprazole 40mg",
    info: { uses: "For acidity, acid reflux and stomach ulcer.", dosage: "Usually 1 tablet once a day before food, exactly as prescribed.", sideEffects: "Headache, nausea, loose stools.", caution: "If acidity keeps returning for weeks, see a doctor instead of just continuing it." },
  },
  {
    name: "Pantoprazole", manufacturer: "Various", packSizes: ["28 tablets"], notes: "Generic acidity medicine",
    info: { uses: "For acidity, acid reflux and stomach ulcer.", dosage: "Usually 1 tablet once a day before food, exactly as prescribed.", sideEffects: "Headache, nausea, loose stools.", caution: "If acidity keeps returning for weeks, see a doctor." },
  },
  {
    name: "Lansoprazole", manufacturer: "Various", packSizes: ["28 capsules"], notes: "Generic acidity medicine",
    info: { uses: "For acidity, acid reflux and stomach ulcer.", dosage: "Usually 1 capsule once a day before food, exactly as prescribed.", sideEffects: "Headache, nausea, loose stools.", caution: "If acidity keeps returning for weeks, see a doctor." },
  },
  {
    name: "Rabeprazole", manufacturer: "Various", packSizes: ["28 tablets"], notes: "Generic acidity medicine",
    info: { uses: "For acidity, acid reflux and stomach ulcer.", dosage: "Usually 1 tablet once a day before food, exactly as prescribed.", sideEffects: "Headache, nausea, loose stools.", caution: "If acidity keeps returning for weeks, see a doctor." },
  },
  {
    name: "Esomeprazole", manufacturer: "Various", packSizes: ["28 tablets"], notes: "Generic acidity medicine",
    info: { uses: "For acidity, acid reflux and stomach ulcer.", dosage: "Usually 1 tablet once a day before food, exactly as prescribed.", sideEffects: "Headache, nausea, loose stools.", caution: "If acidity keeps returning for weeks, see a doctor." },
  },
  {
    name: "Omeprazole", manufacturer: "Various", packSizes: ["28 capsules"], notes: "Generic acidity medicine",
    info: { uses: "For acidity, acid reflux and stomach ulcer.", dosage: "Usually 1 capsule once a day before breakfast, exactly as prescribed.", sideEffects: "Headache, gas, loose stools.", caution: "If acidity keeps returning for weeks, see a doctor." },
  },
  {
    name: "Famotidine", manufacturer: "Various", packSizes: ["30 tablets"], notes: "Generic acidity medicine",
    info: { uses: "For acidity, heartburn and stomach ulcer.", dosage: "Usually 1 tablet once or twice a day, exactly as prescribed.", sideEffects: "Headache, dizziness, constipation.", caution: "If heartburn keeps returning for weeks, see a doctor." },
  },
  {
    name: "Zantac", manufacturer: "GSK", packSizes: ["30 tablets"], notes: "Ranitidine 150mg",
    info: { uses: "For acidity, heartburn and stomach ulcer.", dosage: "Usually 1 tablet twice a day, exactly as prescribed.", sideEffects: "Headache, dizziness, constipation.", caution: "If heartburn keeps returning for weeks, see a doctor." },
  },
  {
    name: "Gaviscon", manufacturer: "Reckitt Benckiser", packSizes: ["150ml liquid"], notes: "Antacid liquid",
    info: { uses: "For heartburn and acidity — it forms a protective layer on the stomach.", dosage: "Adults: 10–20ml after meals and at bedtime, when needed.", sideEffects: "Constipation, bloating.", caution: "Keep a gap from other medicines (take them at a different time)." },
  },
  {
    name: "Digene", manufacturer: "Abbott", packSizes: ["170ml liquid"], notes: "Antacid liquid",
    info: { uses: "For acidity, heartburn, gas and stomach burning.", dosage: "Adults: 2 teaspoons after meals and at bedtime, when needed. Shake well first.", sideEffects: "Constipation or loose stools.", caution: "Keep a gap from other medicines." },
  },
  {
    name: "Motilium", manufacturer: "Janssen", packSizes: ["30 tablets"], notes: "Domperidone 10mg",
    info: { uses: "For nausea, vomiting, bloating and stomach fullness.", dosage: "Adults: 1 tablet three times a day before meals, exactly as prescribed.", sideEffects: "Dry mouth, headache, restlessness.", caution: "Do not use for a long time without a doctor's advice. Tell your doctor about heart problems." },
  },
  {
    name: "Domperidone", manufacturer: "Various", packSizes: ["30 tablets"], notes: "Generic anti-nausea medicine",
    info: { uses: "For nausea, vomiting, bloating and stomach fullness.", dosage: "Adults: 1 tablet three times a day before meals, exactly as prescribed.", sideEffects: "Dry mouth, headache.", caution: "Do not use for a long time without a doctor's advice." },
  },
  {
    name: "Maxolon", manufacturer: "Various", packSizes: ["30 tablets"], notes: "Metoclopramide 10mg",
    info: { uses: "For nausea, vomiting and migraine-related nausea.", dosage: "Adults: 1 tablet three times a day, exactly as prescribed, for a short course.", sideEffects: "Drowsiness, restlessness, muscle stiffness.", caution: "Short courses only. Stop and see a doctor for uncontrolled muscle movements." },
  },
  {
    name: "ORS", manufacturer: "Various", packSizes: ["10 sachets"], notes: "Oral rehydration salts",
    info: { uses: "To replace water and salts lost in diarrhoea, vomiting or heat.", dosage: "Dissolve 1 sachet in 1 litre of clean water. Sip it through the day.", sideEffects: "None when mixed correctly.", caution: "Mix exactly as directed — too much or too little salt is harmful. See a doctor for bloody diarrhoea or no urine." },
  },
  {
    name: "Imodium", manufacturer: "Johnson & Johnson", packSizes: ["12 capsules"], notes: "Loperamide 2mg",
    info: { uses: "For diarrhoea.", dosage: "Adults: 2 capsules first, then 1 after each loose stool. Maximum 8 capsules in 24 hours.", sideEffects: "Constipation, bloating, dizziness.", caution: "Do not use for bloody diarrhoea or high fever — see a doctor instead." },
  },
  {
    name: "Buscopan", manufacturer: "Boehringer Ingelheim", packSizes: ["20 tablets"], notes: "Hyoscine butylbromide 10mg",
    info: { uses: "For stomach cramps, period cramps and gut spasms.", dosage: "Adults: 1–2 tablets three times a day, when needed.", sideEffects: "Dry mouth, blurred vision, fast heartbeat.", caution: "Avoid if you have glaucoma or prostate problems." },
  },
  {
    name: "Colofac", manufacturer: "Various", packSizes: ["30 tablets"], notes: "Mebeverine 135mg",
    info: { uses: "For irritable bowel syndrome — cramps, bloating and irregular stools.", dosage: "Adults: 1 tablet three times a day before meals, exactly as prescribed.", sideEffects: "Skin rash, dizziness, constipation.", caution: "Prescription medicine. See a doctor for bloody stools or unexplained weight loss." },
  },
  {
    name: "Smecta", manufacturer: "Various", packSizes: ["10 sachets"], notes: "Diosmectite",
    info: { uses: "For diarrhoea — it coats and protects the gut.", dosage: "Adults: 1 sachet three times a day, mixed in water.", sideEffects: "Constipation.", caution: "Keep a gap from other medicines." },
  },
  {
    name: "Duphalac", manufacturer: "Various", packSizes: ["120ml liquid"], notes: "Lactulose",
    info: { uses: "For constipation and to soften stools.", dosage: "Adults: 15–30ml once a day, exactly as directed on the pack.", sideEffects: "Gas, bloating, loose stools.", caution: "Drink plenty of water. See a doctor for long-lasting constipation." },
  },
  {
    name: "Lactulose", manufacturer: "Various", packSizes: ["120ml liquid"], notes: "Generic constipation liquid",
    info: { uses: "For constipation and to soften stools.", dosage: "Adults: 15–30ml once a day, exactly as directed on the pack.", sideEffects: "Gas, bloating, loose stools.", caution: "Drink plenty of water." },
  },
  {
    name: "Senna", manufacturer: "Various", packSizes: ["30 tablets"], notes: "Herbal laxative",
    info: { uses: "For occasional constipation.", dosage: "Adults: 1–2 tablets at bedtime, when needed.", sideEffects: "Stomach cramps, loose stools.", caution: "Short use only. See a doctor for long-lasting constipation." },
  },
  {
    name: "Bisacodyl", manufacturer: "Various", packSizes: ["30 tablets"], notes: "Generic laxative",
    info: { uses: "For constipation.", dosage: "Adults: 1–2 tablets at bedtime, when needed. Swallow whole.", sideEffects: "Stomach cramps, loose stools.", caution: "Do not take with milk or antacids at the same time." },
  },
  {
    name: "Simethicone", manufacturer: "Various", packSizes: ["30 tablets"], notes: "Generic anti-gas medicine",
    info: { uses: "For gas, bloating and stomach pressure.", dosage: "Adults: 1–2 tablets after meals and at bedtime, when needed.", sideEffects: "Rarely any.", caution: "See a doctor for severe or long-lasting stomach pain." },
  },
  {
    name: "Rigix", manufacturer: "Getz Pharma", packSizes: ["30 tablets"], notes: "Cetirizine 10mg",
    info: { uses: "For allergy — sneezing, runny nose, itchy eyes and skin rash.", dosage: "Adults: 1 tablet once a day.", sideEffects: "Drowsiness, dry mouth, headache.", caution: "May make you sleepy — be careful while driving." },
  },
  {
    name: "Cetirizine", manufacturer: "Various", packSizes: ["30 tablets"], notes: "Generic allergy medicine",
    info: { uses: "For allergy — sneezing, runny nose, itchy eyes and skin rash.", dosage: "Adults: 1 tablet once a day.", sideEffects: "Drowsiness, dry mouth.", caution: "May make you sleepy." },
  },
  {
    name: "Loratadine", manufacturer: "Various", packSizes: ["30 tablets"], notes: "Generic allergy medicine",
    info: { uses: "For allergy — sneezing, runny nose, itchy eyes and hives.", dosage: "Adults: 1 tablet once a day.", sideEffects: "Headache, dry mouth, tiredness.", caution: "Usually does not cause sleepiness." },
  },
  {
    name: "Piriton", manufacturer: "GSK", packSizes: ["30 tablets"], notes: "Chlorpheniramine 4mg",
    info: { uses: "For allergy, sneezing, runny nose, itchy skin and insect bites.", dosage: "Adults: 1 tablet every 4–6 hours. Maximum 6 tablets in 24 hours.", sideEffects: "Strong sleepiness, dry mouth, blurred vision.", caution: "Makes you very sleepy — do not drive after taking it." },
  },
  {
    name: "Fexet", manufacturer: "Various", packSizes: ["30 tablets"], notes: "Fexofenadine 120mg",
    info: { uses: "For allergy — sneezing, runny nose, itchy eyes and hives.", dosage: "Adults: 1 tablet once a day before food.", sideEffects: "Headache, nausea, dizziness.", caution: "Do not take with fruit juice at the same time." },
  },
  {
    name: "Montika", manufacturer: "Various", packSizes: ["28 tablets"], notes: "Montelukast 10mg",
    info: { uses: "For asthma prevention and allergy — it keeps the airways open.", dosage: "Adults: 1 tablet once a day in the evening, exactly as prescribed.", sideEffects: "Headache, stomach pain, mood changes.", caution: "Prevention medicine, not for a sudden asthma attack. Tell your doctor about mood changes." },
  },
  {
    name: "Montelukast", manufacturer: "Various", packSizes: ["28 tablets"], notes: "Generic asthma/allergy medicine",
    info: { uses: "For asthma prevention and allergy.", dosage: "Adults: 1 tablet once a day in the evening, exactly as prescribed.", sideEffects: "Headache, stomach pain, mood changes.", caution: "Not for a sudden asthma attack." },
  },
  {
    name: "Ventolin", manufacturer: "GSK", packSizes: ["200 doses inhaler"], notes: "Salbutamol inhaler",
    info: { uses: "For sudden asthma breathlessness — it opens the airways fast.", dosage: "1–2 puffs when needed, exactly as the doctor taught you.", sideEffects: "Shaky hands, fast heartbeat, headache.", caution: "Reliever inhaler. If you need it more and more often, see your doctor urgently." },
  },
  {
    name: "Seretide", manufacturer: "GSK", packSizes: ["120 doses inhaler"], notes: "Salmeterol + fluticasone inhaler",
    info: { uses: "For daily asthma control — it prevents attacks.", dosage: "Usually 2 puffs twice a day, every day, exactly as prescribed.", sideEffects: "Hoarse voice, mouth thrush, headache.", caution: "Prevention inhaler — never stop it suddenly. Rinse your mouth after use." },
  },
  {
    name: "Mucosolvan", manufacturer: "Boehringer Ingelheim", packSizes: ["100ml syrup"], notes: "Ambroxol",
    info: { uses: "For chesty cough — it thins the mucus so it clears easily.", dosage: "Adults: 10ml three times a day, when needed.", sideEffects: "Nausea, loose stools, rash.", caution: "See a doctor for cough with blood or lasting more than 2 weeks." },
  },
  {
    name: "Ambroxol", manufacturer: "Various", packSizes: ["100ml syrup"], notes: "Generic mucus-thinning medicine",
    info: { uses: "For chesty cough — it thins the mucus.", dosage: "Adults: 10ml three times a day, when needed.", sideEffects: "Nausea, loose stools.", caution: "See a doctor for cough with blood." },
  },
  {
    name: "Bisolvon", manufacturer: "Boehringer Ingelheim", packSizes: ["100ml syrup"], notes: "Bromhexine",
    info: { uses: "For chesty cough — it loosens mucus.", dosage: "Adults: 10ml three times a day, when needed.", sideEffects: "Nausea, stomach upset.", caution: "See a doctor for cough lasting more than 2 weeks." },
  },
  {
    name: "Benylin", manufacturer: "Johnson & Johnson", packSizes: ["100ml syrup"], notes: "Cough syrup",
    info: { uses: "For dry cough and throat irritation.", dosage: "Adults: 10ml every 4–6 hours, when needed.", sideEffects: "Drowsiness, dizziness.", caution: "May make you sleepy. Do not combine with other cough or cold medicines." },
  },
  {
    name: "Strepsils", manufacturer: "Reckitt Benckiser", packSizes: ["24 lozenges"], notes: "Throat lozenges",
    info: { uses: "For sore throat and mouth irritation.", dosage: "Adults: suck 1 lozenge slowly every 2–3 hours. Maximum 12 in 24 hours.", sideEffects: "Rarely any.", caution: "Not for children under 6. See a doctor for sore throat with high fever." },
  },
  {
    name: "Otrivin", manufacturer: "Various", packSizes: ["10ml spray"], notes: "Xylometazoline nasal spray",
    info: { uses: "For a blocked nose from cold or allergy.", dosage: "Adults: 1 spray in each nostril, two or three times a day.", sideEffects: "Dry nose, sneezing, burning.", caution: "Do not use for more than 5–7 days — the nose can become dependent on it." },
  },
  {
    name: "Avil", manufacturer: "Sanofi", packSizes: ["30 tablets"], notes: "Pheniramine 25mg",
    info: { uses: "For allergy, itching, insect bites and travel sickness.", dosage: "Adults: 1 tablet two or three times a day, when needed.", sideEffects: "Strong sleepiness, dry mouth.", caution: "Makes you very sleepy — do not drive after taking it." },
  },
  {
    name: "Hydryllin", manufacturer: "Various", packSizes: ["120ml syrup"], notes: "Diphenhydramine syrup",
    info: { uses: "For cough, allergy and travel sickness.", dosage: "Adults: 10ml every 4–6 hours, when needed.", sideEffects: "Strong sleepiness, dry mouth.", caution: "Makes you very sleepy — do not drive after taking it." },
  },
  {
    name: "Actifed", manufacturer: "GSK", packSizes: ["30 tablets"], notes: "Pseudoephedrine + triprolidine",
    info: { uses: "For cold, blocked nose, sneezing and runny nose.", dosage: "Adults: 1 tablet three times a day, when needed.", sideEffects: "Sleepiness, dry mouth, fast heartbeat.", caution: "Avoid if you have high blood pressure or heart disease." },
  },
  {
    name: "Xynosine", manufacturer: "Various", packSizes: ["15ml drops"], notes: "Nasal decongestant drops",
    info: { uses: "For a blocked nose from cold or allergy.", dosage: "Adults: 2–3 drops in each nostril, two or three times a day.", sideEffects: "Dry nose, burning.", caution: "Do not use for more than 5–7 days." },
  },
  {
    name: "Flixonase", manufacturer: "GSK", packSizes: ["120 sprays"], notes: "Fluticasone nasal spray",
    info: { uses: "For allergy in the nose — sneezing, blocked nose and itching.", dosage: "Adults: 2 sprays in each nostril once a day, exactly as prescribed.", sideEffects: "Dry nose, nosebleeds, headache.", caution: "Daily prevention spray — it takes a few days to work fully." },
  },
  {
    name: "Guaifenesin", manufacturer: "Various", packSizes: ["120ml syrup"], notes: "Generic expectorant",
    info: { uses: "For chesty cough — it loosens mucus.", dosage: "Adults: 10ml every 4 hours, when needed. Drink plenty of water.", sideEffects: "Nausea, dizziness.", caution: "See a doctor for cough with blood." },
  },
  {
    name: "Saline Nasal Spray", manufacturer: "Various", packSizes: ["30ml spray"], notes: "Salt water nasal spray",
    info: { uses: "For a blocked or dry nose — it washes and moistens the nose.", dosage: "1–2 sprays in each nostril, as often as needed.", sideEffects: "None usual.", caution: "Safe for daily use, including for children." },
  },
  {
    name: "Glucophage", manufacturer: "Merck", packSizes: ["30 tablets"], notes: "Metformin 500mg",
    info: { uses: "For type 2 diabetes — it controls blood sugar.", dosage: "Usually 1 tablet two or three times a day with food, exactly as prescribed.", sideEffects: "Nausea, loose stools, stomach cramps.", caution: "Prescription medicine. Tell your doctor before any surgery or scan with dye." },
  },
  {
    name: "Metformin", manufacturer: "Various", packSizes: ["30 tablets"], notes: "Generic diabetes medicine",
    info: { uses: "For type 2 diabetes — it controls blood sugar.", dosage: "Usually 1 tablet two or three times a day with food, exactly as prescribed.", sideEffects: "Nausea, loose stools.", caution: "Prescription medicine. Take with food." },
  },
  {
    name: "Januvia", manufacturer: "MSD", packSizes: ["28 tablets"], notes: "Sitagliptin 100mg",
    info: { uses: "For type 2 diabetes — it controls blood sugar.", dosage: "Usually 1 tablet once a day, exactly as prescribed.", sideEffects: "Headache, stuffy nose, stomach upset.", caution: "Prescription medicine. Tell your doctor about pancreas problems." },
  },
  {
    name: "Gliclazide", manufacturer: "Various", packSizes: ["30 tablets"], notes: "Generic diabetes medicine",
    info: { uses: "For type 2 diabetes — it controls blood sugar.", dosage: "Usually 1 tablet once or twice a day with food, exactly as prescribed.", sideEffects: "Low blood sugar (shakiness, sweating, hunger), weight gain.", caution: "Prescription medicine. Never skip meals while taking it." },
  },
  {
    name: "Dapagliflozin", manufacturer: "Various", packSizes: ["28 tablets"], notes: "Generic diabetes medicine",
    info: { uses: "For type 2 diabetes — it removes extra sugar through urine.", dosage: "Usually 1 tablet once a day, exactly as prescribed.", sideEffects: "Urine infections, thirst, dizziness.", caution: "Prescription medicine. Drink plenty of water. Tell your doctor about foot sores." },
  },
  {
    name: "Empagliflozin", manufacturer: "Various", packSizes: ["28 tablets"], notes: "Generic diabetes medicine",
    info: { uses: "For type 2 diabetes and heart protection.", dosage: "Usually 1 tablet once a day, exactly as prescribed.", sideEffects: "Urine infections, thirst.", caution: "Prescription medicine. Drink plenty of water." },
  },
  {
    name: "Pioglitazone", manufacturer: "Various", packSizes: ["30 tablets"], notes: "Generic diabetes medicine",
    info: { uses: "For type 2 diabetes — it helps the body use insulin better.", dosage: "Usually 1 tablet once a day, exactly as prescribed.", sideEffects: "Weight gain, swelling of legs, headache.", caution: "Prescription medicine. Tell your doctor about heart failure." },
  },
  {
    name: "Mixtard", manufacturer: "Novo Nordisk", packSizes: ["5 pens"], notes: "Insulin (human, premixed)",
    info: { uses: "For diabetes — it replaces the insulin the body does not make.", dosage: "Injected under the skin, exactly as the doctor taught you. Dose depends on blood sugar.", sideEffects: "Low blood sugar (shakiness, sweating, confusion), injection-site lumps.", caution: "Prescription medicine. Always carry sugar with you. Never share pens or needles." },
  },
  {
    name: "Amlodipine", manufacturer: "Various", packSizes: ["30 tablets"], notes: "Generic blood pressure medicine",
    info: { uses: "For high blood pressure and chest pain.", dosage: "Usually 1 tablet once a day, exactly as prescribed.", sideEffects: "Swollen ankles, headache, flushing.", caution: "Prescription medicine. Do not stop it suddenly." },
  },
  {
    name: "Norvasc", manufacturer: "Pfizer", packSizes: ["30 tablets"], notes: "Amlodipine 5mg",
    info: { uses: "For high blood pressure and chest pain.", dosage: "Usually 1 tablet once a day, exactly as prescribed.", sideEffects: "Swollen ankles, headache, flushing.", caution: "Prescription medicine. Do not stop it suddenly." },
  },
  {
    name: "Losartan", manufacturer: "Various", packSizes: ["30 tablets"], notes: "Generic blood pressure medicine",
    info: { uses: "For high blood pressure.", dosage: "Usually 1 tablet once a day, exactly as prescribed.", sideEffects: "Dizziness, tiredness.", caution: "Prescription medicine. Do not stop it suddenly, and avoid it in pregnancy." },
  },
  {
    name: "Atenolol", manufacturer: "Various", packSizes: ["30 tablets"], notes: "Generic blood pressure medicine",
    info: { uses: "For high blood pressure, chest pain and fast heartbeat.", dosage: "Usually 1 tablet once a day, exactly as prescribed.", sideEffects: "Tiredness, cold hands and feet, slow pulse.", caution: "Prescription medicine. Never stop it suddenly — the heart can rebound." },
  },
  {
    name: "Bisoprolol", manufacturer: "Various", packSizes: ["30 tablets"], notes: "Generic blood pressure medicine",
    info: { uses: "For high blood pressure and heart failure.", dosage: "Usually 1 tablet once a day, exactly as prescribed.", sideEffects: "Tiredness, dizziness, cold hands and feet.", caution: "Prescription medicine. Never stop it suddenly." },
  },
  {
    name: "Enalapril", manufacturer: "Various", packSizes: ["30 tablets"], notes: "Generic blood pressure medicine",
    info: { uses: "For high blood pressure and heart failure.", dosage: "Usually 1 tablet once or twice a day, exactly as prescribed.", sideEffects: "Dry cough, dizziness, headache.", caution: "Prescription medicine. Avoid in pregnancy. Tell your doctor about swelling of lips or tongue at once." },
  },
  {
    name: "Valsartan", manufacturer: "Various", packSizes: ["28 tablets"], notes: "Generic blood pressure medicine",
    info: { uses: "For high blood pressure and heart failure.", dosage: "Usually 1 tablet once a day, exactly as prescribed.", sideEffects: "Dizziness, tiredness.", caution: "Prescription medicine. Avoid in pregnancy." },
  },
  {
    name: "Nebivolol", manufacturer: "Various", packSizes: ["28 tablets"], notes: "Generic blood pressure medicine",
    info: { uses: "For high blood pressure and heart failure.", dosage: "Usually 1 tablet once a day, exactly as prescribed.", sideEffects: "Headache, dizziness, tiredness.", caution: "Prescription medicine. Never stop it suddenly." },
  },
  {
    name: "Diltiazem", manufacturer: "Various", packSizes: ["30 tablets"], notes: "Generic blood pressure medicine",
    info: { uses: "For high blood pressure and chest pain.", dosage: "Usually 1 tablet two or three times a day, exactly as prescribed.", sideEffects: "Swollen ankles, headache, flushing.", caution: "Prescription medicine. Do not stop it suddenly." },
  },
  {
    name: "Lipiget", manufacturer: "Getz Pharma", packSizes: ["30 tablets"], notes: "Atorvastatin 20mg",
    info: { uses: "For high cholesterol — it lowers the risk of heart attack and stroke.", dosage: "Usually 1 tablet once a day in the evening, exactly as prescribed.", sideEffects: "Muscle pain, headache, nausea.", caution: "Prescription medicine. Tell your doctor at once about unexplained muscle pain." },
  },
  {
    name: "Atorvastatin", manufacturer: "Various", packSizes: ["30 tablets"], notes: "Generic cholesterol medicine",
    info: { uses: "For high cholesterol.", dosage: "Usually 1 tablet once a day, exactly as prescribed.", sideEffects: "Muscle pain, headache.", caution: "Prescription medicine. Tell your doctor about unexplained muscle pain." },
  },
  {
    name: "Rosuvastatin", manufacturer: "Various", packSizes: ["30 tablets"], notes: "Generic cholesterol medicine",
    info: { uses: "For high cholesterol.", dosage: "Usually 1 tablet once a day, exactly as prescribed.", sideEffects: "Muscle pain, headache, nausea.", caution: "Prescription medicine. Tell your doctor about unexplained muscle pain." },
  },
  {
    name: "Lasix", manufacturer: "Sanofi", packSizes: ["30 tablets"], notes: "Furosemide 40mg",
    info: { uses: "For extra body water — swelling, breathlessness and high blood pressure.", dosage: "Usually 1 tablet once a day in the morning, exactly as prescribed.", sideEffects: "Passing urine often, dizziness, muscle cramps.", caution: "Prescription medicine. It removes salts too — the doctor may check your blood." },
  },
  {
    name: "Spironolactone", manufacturer: "Various", packSizes: ["30 tablets"], notes: "Generic water tablet",
    info: { uses: "For extra body water, high blood pressure and heart failure.", dosage: "Usually 1 tablet once a day, exactly as prescribed.", sideEffects: "Dizziness, breast tenderness, stomach upset.", caution: "Prescription medicine. Avoid extra potassium (salt substitutes) unless the doctor says so." },
  },
  {
    name: "Clopidogrel", manufacturer: "Various", packSizes: ["30 tablets"], notes: "Generic blood thinner",
    info: { uses: "To prevent clots after a heart attack or stent.", dosage: "Usually 1 tablet once a day, exactly as prescribed.", sideEffects: "Easy bruising, nosebleeds, stomach upset.", caution: "Prescription medicine. Tell every doctor and dentist you take it before any procedure." },
  },
  {
    name: "Warfarin", manufacturer: "Various", packSizes: ["30 tablets"], notes: "Generic blood thinner",
    info: { uses: "To prevent harmful blood clots.", dosage: "The dose changes with blood tests (INR) — take exactly as prescribed, at the same time daily.", sideEffects: "Bleeding, bruising, nosebleeds.", caution: "Prescription medicine. Regular blood tests are a must. Tell your doctor about every other medicine and food change." },
  },
  {
    name: "Rivaroxaban", manufacturer: "Various", packSizes: ["28 tablets"], notes: "Generic blood thinner",
    info: { uses: "To prevent and treat blood clots.", dosage: "Usually 1 tablet once a day with food, exactly as prescribed.", sideEffects: "Bleeding, bruising.", caution: "Prescription medicine. Do not miss doses — a missed dose raises clot risk." },
  },
  {
    name: "Apixaban", manufacturer: "Various", packSizes: ["56 tablets"], notes: "Generic blood thinner",
    info: { uses: "To prevent and treat blood clots and stroke in atrial fibrillation.", dosage: "Usually 1 tablet twice a day, exactly as prescribed.", sideEffects: "Bleeding, bruising, nausea.", caution: "Prescription medicine. Do not stop it without the doctor's advice." },
  },
  {
    name: "Cilostazol", manufacturer: "Various", packSizes: ["30 tablets"], notes: "Generic circulation medicine",
    info: { uses: "For leg pain while walking (poor circulation).", dosage: "Usually 1 tablet twice a day, on an empty stomach, exactly as prescribed.", sideEffects: "Headache, diarrhoea, fast heartbeat.", caution: "Prescription medicine. Avoid in heart failure." },
  },
  {
    name: "Propranolol", manufacturer: "Various", packSizes: ["50 tablets"], notes: "Generic blood pressure/migraine medicine",
    info: { uses: "For high blood pressure, migraine prevention, tremor and stage fright.", dosage: "Usually 1 tablet two or three times a day, exactly as prescribed.", sideEffects: "Tiredness, cold hands, slow pulse, sleep problems.", caution: "Prescription medicine. Never stop it suddenly. Avoid in asthma." },
  },
  {
    name: "Flunarizine", manufacturer: "Various", packSizes: ["30 tablets"], notes: "Generic migraine prevention medicine",
    info: { uses: "To prevent migraine attacks.", dosage: "Usually 1 tablet once a day at bedtime, exactly as prescribed.", sideEffects: "Sleepiness, weight gain, low mood.", caution: "Prescription medicine. It prevents attacks — it does not stop one that has started." },
  },];
