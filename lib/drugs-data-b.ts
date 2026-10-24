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

/** Second half of the local medicine index (see drugs-data.ts header for the editorial rules). */
export const LOCAL_DRUGS_B: LocalDrug[] = [
  {
    name: "Sumatriptan", manufacturer: "Various", packSizes: ["6 tablets"], notes: "Generic migraine medicine",
    info: { uses: "For a migraine attack that has already started.", dosage: "Usually 1 tablet at the start of the attack, exactly as prescribed.", sideEffects: "Tingling, warm feeling, chest tightness, dizziness.", caution: "Prescription medicine. Not for prevention. Tell your doctor about heart disease." },
  },
  {
    name: "Topiramate", manufacturer: "Various", packSizes: ["28 tablets"], notes: "Generic migraine/epilepsy medicine",
    info: { uses: "To prevent migraine and to control seizures.", dosage: "Usually 1 tablet once or twice a day, exactly as prescribed.", sideEffects: "Tingling, weight loss, trouble concentrating.", caution: "Prescription medicine. Never stop it suddenly. Avoid in pregnancy." },
  },
  {
    name: "Folic Acid", manufacturer: "Various", packSizes: ["30 tablets"], notes: "Vitamin B9",
    info: { uses: "For folate deficiency and in pregnancy to prevent birth defects.", dosage: "Usually 1 tablet once a day, exactly as prescribed.", sideEffects: "Rarely any.", caution: "Especially important before and during early pregnancy." },
  },
  {
    name: "Fefol", manufacturer: "GSK", packSizes: ["30 capsules"], notes: "Iron + folic acid",
    info: { uses: "For iron deficiency and anaemia, including in pregnancy.", dosage: "Usually 1 capsule once a day, exactly as prescribed.", sideEffects: "Dark stools, constipation, nausea.", caution: "Take with food if it upsets the stomach. Keep away from children — iron overdose is dangerous." },
  },
  {
    name: "Surbex-Z", manufacturer: "Abbott", packSizes: ["30 tablets"], notes: "Multivitamin + zinc",
    info: { uses: "For vitamin deficiency, tiredness and recovery after illness.", dosage: "Usually 1 tablet once a day with food.", sideEffects: "Nausea, dark urine.", caution: "Do not take extra vitamin A products with it." },
  },
  {
    name: "Evion", manufacturer: "Various", packSizes: ["30 capsules"], notes: "Vitamin E",
    info: { uses: "For vitamin E deficiency and skin health.", dosage: "Usually 1 capsule once a day, exactly as directed on the pack.", sideEffects: "Rarely any at normal doses.", caution: "High doses can increase bleeding — tell your doctor before surgery." },
  },
  {
    name: "Neurobion", manufacturer: "Merck", packSizes: ["30 tablets"], notes: "Vitamin B complex",
    info: { uses: "For nerve pain, tingling and B-vitamin deficiency.", dosage: "Usually 1 tablet once or twice a day, exactly as directed.", sideEffects: "Bright yellow urine, nausea.", caution: "Tell your doctor about numbness that does not improve." },
  },
  {
    name: "Osnate-D", manufacturer: "Various", packSizes: ["30 tablets"], notes: "Calcium + vitamin D",
    info: { uses: "For weak bones, calcium deficiency and in old age.", dosage: "Usually 1 tablet once or twice a day with food.", sideEffects: "Constipation, bloating.", caution: "Drink plenty of water. Tell your doctor about kidney stones." },
  },
  {
    name: "Calcium + Vitamin D", manufacturer: "Various", packSizes: ["30 tablets"], notes: "Generic bone supplement",
    info: { uses: "For weak bones and calcium deficiency.", dosage: "Usually 1 tablet once or twice a day with food.", sideEffects: "Constipation, bloating.", caution: "Tell your doctor about kidney stones." },
  },
  {
    name: "Vitamin D", manufacturer: "Various", packSizes: ["30 tablets"], notes: "Generic vitamin D",
    info: { uses: "For vitamin D deficiency, weak bones and low mood.", dosage: "Usually 1 tablet once a day or once a week, exactly as prescribed.", sideEffects: "Rarely any at normal doses.", caution: "Very high doses can harm the kidneys — do not exceed the prescribed dose." },
  },
  {
    name: "Iron", manufacturer: "Various", packSizes: ["30 tablets"], notes: "Generic iron supplement",
    info: { uses: "For iron deficiency and anaemia.", dosage: "Usually 1 tablet once or twice a day, exactly as prescribed.", sideEffects: "Dark stools, constipation, nausea.", caution: "Keep away from children — iron overdose is dangerous." },
  },
  {
    name: "Zinc", manufacturer: "Various", packSizes: ["30 tablets"], notes: "Generic zinc supplement",
    info: { uses: "For zinc deficiency, wound healing and childhood diarrhoea.", dosage: "Usually 1 tablet once a day, exactly as directed.", sideEffects: "Nausea, metallic taste.", caution: "Take at a different time from antibiotics and iron." },
  },
  {
    name: "Vitamin C", manufacturer: "Various", packSizes: ["30 tablets"], notes: "Generic vitamin C",
    info: { uses: "For vitamin C deficiency, gum health and immunity.", dosage: "Usually 1 tablet once a day.", sideEffects: "Loose stools at high doses.", caution: "Very high doses can cause kidney stones." },
  },
  {
    name: "Ca-C 1000 Plus", manufacturer: "Various", packSizes: ["20 effervescent tablets"], notes: "Calcium + vitamin C",
    info: { uses: "For calcium and vitamin C deficiency, weak bones.", dosage: "Usually 1 tablet dissolved in water once a day.", sideEffects: "Bloating, stomach upset.", caution: "Contains salt — be careful if you have high blood pressure." },
  },
  {
    name: "Betnovate", manufacturer: "GSK", packSizes: ["30g cream"], notes: "Betamethasone cream",
    info: { uses: "For eczema, skin allergy and itchy rashes.", dosage: "Apply a thin layer once or twice a day, exactly as prescribed.", sideEffects: "Skin thinning, stretch marks, burning.", caution: "Strong steroid cream. Never use on the face or for a long time without a doctor's advice." },
  },
  {
    name: "Hydrocortisone", manufacturer: "Various", packSizes: ["30g cream"], notes: "Generic mild steroid cream",
    info: { uses: "For mild eczema, insect bites and skin allergy.", dosage: "Apply a thin layer once or twice a day.", sideEffects: "Burning, skin thinning with long use.", caution: "Do not use on broken skin or for a long time without advice." },
  },
  {
    name: "Clotrimazole", manufacturer: "Various", packSizes: ["30g cream"], notes: "Generic antifungal cream",
    info: { uses: "For fungal skin infections — athlete's foot, ringworm, thrush.", dosage: "Apply a thin layer two or three times a day for at least 2 weeks.", sideEffects: "Burning, itching, redness.", caution: "Keep using it after the rash looks better, or it comes back." },
  },
  {
    name: "Miconazole", manufacturer: "Various", packSizes: ["30g cream"], notes: "Generic antifungal cream",
    info: { uses: "For fungal skin infections and thrush.", dosage: "Apply a thin layer twice a day.", sideEffects: "Burning, itching.", caution: "Finish the course even if the rash clears early." },
  },
  {
    name: "Nystatin", manufacturer: "Various", packSizes: ["30g cream"], notes: "Generic antifungal cream",
    info: { uses: "For fungal skin and mouth infections.", dosage: "Apply a thin layer two or three times a day.", sideEffects: "Burning, itching.", caution: "Finish the course." },
  },
  {
    name: "Lamisil", manufacturer: "Novartis", packSizes: ["30g cream"], notes: "Terbinafine cream",
    info: { uses: "For athlete's foot, ringworm and fungal nail infections.", dosage: "Apply a thin layer once or twice a day for 1–2 weeks.", sideEffects: "Burning, itching, peeling.", caution: "Keep using it after the rash looks better, or it comes back." },
  },
  {
    name: "Mupirocin", manufacturer: "Various", packSizes: ["15g ointment"], notes: "Generic antibiotic ointment",
    info: { uses: "For bacterial skin infections and infected cuts.", dosage: "Apply a thin layer three times a day for up to 10 days.", sideEffects: "Burning, itching.", caution: "Do not use inside the nose or eyes unless the doctor says so." },
  },
  {
    name: "Permethrin", manufacturer: "Various", packSizes: ["60ml lotion"], notes: "Generic scabies lotion",
    info: { uses: "For scabies and head lice.", dosage: "Apply to the whole body from neck down, leave overnight, then wash off. Repeat after 7 days if advised.", sideEffects: "Itching, burning, redness.", caution: "Treat close contacts at the same time. Wash clothes and bedding in hot water." },
  },
  {
    name: "Calamine Lotion", manufacturer: "Various", packSizes: ["120ml lotion"], notes: "Soothing skin lotion",
    info: { uses: "For itching from chickenpox, sunburn and insect bites.", dosage: "Shake well. Dab onto the skin with cotton, as often as needed.", sideEffects: "Dry skin.", caution: "For external use only. Do not use on broken skin." },
  },
  {
    name: "Polyfax", manufacturer: "GSK", packSizes: ["20g ointment"], notes: "Polymyxin + bacitracin ointment",
    info: { uses: "For infected cuts, wounds and skin sores.", dosage: "Apply a thin layer two or three times a day.", sideEffects: "Rash, itching.", caution: "Do not use for a long time or on large wounds." },
  },
  {
    name: "Fucidin", manufacturer: "LEO Pharma", packSizes: ["30g cream"], notes: "Fusidic acid cream",
    info: { uses: "For bacterial skin infections — impetigo, infected eczema.", dosage: "Apply a thin layer three or four times a day.", sideEffects: "Itching, burning.", caution: "Do not use for a long time. Keep away from the eyes." },
  },
  {
    name: "Dermovate", manufacturer: "GSK", packSizes: ["30g cream"], notes: "Clobetasol cream",
    info: { uses: "For severe eczema and psoriasis.", dosage: "Apply a very thin layer once or twice a day, exactly as prescribed, for a short course.", sideEffects: "Skin thinning, stretch marks, burning.", caution: "Very strong steroid cream. Never use on the face, groin or for a long time." },
  },
  {
    name: "Travocort", manufacturer: "Bayer", packSizes: ["15g cream"], notes: "Isoconazole + diflucortolone cream",
    info: { uses: "For fungal skin infections with inflammation and itching.", dosage: "Apply a thin layer twice a day for up to 2 weeks.", sideEffects: "Burning, skin thinning.", caution: "Do not use for a long time or on the face without advice." },
  },
  {
    name: "Nizoral", manufacturer: "Janssen", packSizes: ["100ml shampoo"], notes: "Ketoconazole shampoo",
    info: { uses: "For dandruff and fungal scalp infections.", dosage: "Wash the hair with it twice a week for 4 weeks, leave for 3–5 minutes, then rinse.", sideEffects: "Dry hair, itching.", caution: "For external use only. Keep away from the eyes." },
  },
  {
    name: "Clobetasol", manufacturer: "Various", packSizes: ["30g cream"], notes: "Generic strong steroid cream",
    info: { uses: "For severe eczema and psoriasis.", dosage: "Apply a very thin layer once or twice a day, exactly as prescribed, for a short course.", sideEffects: "Skin thinning, stretch marks.", caution: "Very strong steroid cream. Never use on the face or for a long time." },
  },
  {
    name: "Ketoconazole", manufacturer: "Various", packSizes: ["30g cream"], notes: "Generic antifungal cream",
    info: { uses: "For fungal skin infections and dandruff.", dosage: "Apply a thin layer once or twice a day.", sideEffects: "Burning, itching.", caution: "Finish the course." },
  },
  {
    name: "Urea Cream", manufacturer: "Various", packSizes: ["100g cream"], notes: "Generic moisturising cream",
    info: { uses: "For very dry, rough skin and cracked heels.", dosage: "Apply generously once or twice a day.", sideEffects: "Mild burning on cracked skin.", caution: "For external use only." },
  },
  {
    name: "Salicylic Acid", manufacturer: "Various", packSizes: ["30ml gel"], notes: "Generic acne/wart gel",
    info: { uses: "For acne, warts and rough skin patches.", dosage: "Apply a thin layer once a day to the affected area only.", sideEffects: "Peeling, dryness, burning.", caution: "Do not use on broken skin or near the eyes. Use sunscreen." },
  },
  {
    name: "Adapalene", manufacturer: "Various", packSizes: ["30g gel"], notes: "Generic acne gel",
    info: { uses: "For acne.", dosage: "Apply a thin layer once a day at bedtime to clean, dry skin.", sideEffects: "Dryness, peeling, redness at first.", caution: "Use sunscreen. Do not use with harsh scrubs." },
  },
  {
    name: "Benzac AC", manufacturer: "Galderma", packSizes: ["60g gel"], notes: "Benzoyl peroxide gel",
    info: { uses: "For acne.", dosage: "Apply a thin layer once or twice a day to the affected area.", sideEffects: "Dryness, peeling, redness.", caution: "It bleaches clothes and towels. Use sunscreen." },
  },
  {
    name: "Isotretinoin", manufacturer: "Various", packSizes: ["30 capsules"], notes: "Generic severe-acne medicine",
    info: { uses: "For severe acne that nothing else clears.", dosage: "Usually 1 capsule once or twice a day with food, exactly as prescribed, for months.", sideEffects: "Very dry lips and skin, nosebleeds, mood changes, muscle aches.", caution: "Prescription medicine. STRICTLY avoid in pregnancy — it causes birth defects. Regular blood tests are needed." },
  },
  {
    name: "Tretinoin", manufacturer: "Various", packSizes: ["30g cream"], notes: "Generic acne/skin cream",
    info: { uses: "For acne and sun-damaged skin.", dosage: "Apply a pea-sized amount once a day at bedtime.", sideEffects: "Peeling, redness, sun sensitivity.", caution: "Use sunscreen daily. Avoid in pregnancy." },
  },
  {
    name: "Hydroquinone", manufacturer: "Various", packSizes: ["30g cream"], notes: "Generic pigmentation cream",
    info: { uses: "For dark patches and pigmentation.", dosage: "Apply a thin layer twice a day to the dark area only.", sideEffects: "Burning, redness, irritation.", caution: "Use sunscreen. Stop if the skin becomes very irritated. Short courses only." },
  },
  {
    name: "Azelaic Acid", manufacturer: "Various", packSizes: ["30g gel"], notes: "Generic acne/pigmentation gel",
    info: { uses: "For acne and rosacea.", dosage: "Apply a thin layer twice a day.", sideEffects: "Burning, itching, dryness.", caution: "Use sunscreen." },
  },
  {
    name: "Clindamycin", manufacturer: "Various", packSizes: ["30 capsules"], notes: "Generic antibiotic",
    info: { uses: "Antibiotic for skin, teeth and bone infections, and acne.", dosage: "Usually 1 capsule two to four times a day, exactly as prescribed.", sideEffects: "Loose stools, nausea, stomach cramps.", caution: "Prescription medicine. Tell your doctor at once about severe diarrhoea." },
  },
  {
    name: "Tobramycin", manufacturer: "Various", packSizes: ["5ml eye drops"], notes: "Generic antibiotic eye drops",
    info: { uses: "For bacterial eye infections.", dosage: "Usually 1–2 drops every 4 hours, exactly as prescribed.", sideEffects: "Burning, itching, blurred vision for a few minutes.", caution: "Do not wear contact lenses during the infection. Do not share the bottle." },
  },
  {
    name: "Chloramphenicol", manufacturer: "Various", packSizes: ["10ml eye drops"], notes: "Generic antibiotic eye drops",
    info: { uses: "For bacterial eye infections.", dosage: "Usually 1 drop every 2–4 hours, exactly as prescribed.", sideEffects: "Burning, blurred vision.", caution: "Do not wear contact lenses during the infection." },
  },
  {
    name: "Refresh Tears", manufacturer: "Allergan", packSizes: ["15ml eye drops"], notes: "Artificial tears",
    info: { uses: "For dry, irritated eyes.", dosage: "1–2 drops in each eye, as often as needed.", sideEffects: "Brief blurring.", caution: "Do not touch the dropper tip to the eye." },
  },
  {
    name: "Betnesol-N", manufacturer: "GSK", packSizes: ["10ml drops"], notes: "Betamethasone + neomycin drops",
    info: { uses: "For infected, inflamed eyes and ears.", dosage: "Usually 1–2 drops two or three times a day, exactly as prescribed.", sideEffects: "Burning, blurred vision.", caution: "Prescription medicine. Do not use for a long time — it can raise eye pressure." },
  },
  {
    name: "Ciprofloxacin Eye Drops", manufacturer: "Various", packSizes: ["5ml eye drops"], notes: "Generic antibiotic eye drops",
    info: { uses: "For bacterial eye infections.", dosage: "Usually 1–2 drops every 4 hours, exactly as prescribed.", sideEffects: "Burning, white deposits, blurred vision.", caution: "Do not wear contact lenses during the infection." },
  },
  {
    name: "Diflucan", manufacturer: "Pfizer", packSizes: ["1 capsule"], notes: "Fluconazole 150mg",
    info: { uses: "For thrush and fungal infections.", dosage: "Usually 1 capsule as a single dose, exactly as prescribed.", sideEffects: "Headache, nausea, stomach pain.", caution: "Prescription medicine. Tell your doctor about other medicines you take." },
  },
  {
    name: "Fluconazole", manufacturer: "Various", packSizes: ["1 capsule"], notes: "Generic antifungal medicine",
    info: { uses: "For thrush and fungal infections.", dosage: "Usually 1 capsule as a single dose, or daily for longer infections, exactly as prescribed.", sideEffects: "Headache, nausea.", caution: "Prescription medicine." },
  },
  {
    name: "Itraconazole", manufacturer: "Various", packSizes: ["28 capsules"], notes: "Generic antifungal medicine",
    info: { uses: "For fungal nail, skin and internal infections.", dosage: "Usually 1 capsule once or twice a day with food, exactly as prescribed.", sideEffects: "Nausea, headache, dizziness.", caution: "Prescription medicine. Tell your doctor about heart problems and other medicines." },
  },
  {
    name: "Zentel", manufacturer: "GSK", packSizes: ["2 tablets"], notes: "Albendazole 400mg",
    info: { uses: "For worms — roundworm, threadworm, hookworm and tapeworm.", dosage: "Usually 1 tablet as a single dose, or a short course, exactly as prescribed.", sideEffects: "Stomach pain, nausea, headache.", caution: "Treat the whole family where advised. Wash hands and bedding." },
  },
  {
    name: "Vermox", manufacturer: "Janssen", packSizes: ["6 tablets"], notes: "Mebendazole 100mg",
    info: { uses: "For worms — threadworm, roundworm, whipworm and hookworm.", dosage: "Usually 1 tablet twice a day for 3 days, exactly as prescribed.", sideEffects: "Stomach pain, loose stools.", caution: "Treat the whole family where advised." },
  },
  {
    name: "Pyrantel", manufacturer: "Various", packSizes: ["30ml suspension"], notes: "Generic deworming medicine",
    info: { uses: "For threadworm, roundworm and hookworm.", dosage: "Usually a single dose based on body weight, exactly as prescribed.", sideEffects: "Stomach cramps, nausea.", caution: "Treat the whole family where advised." },
  },
  {
    name: "Praziquantel", manufacturer: "Various", packSizes: ["6 tablets"], notes: "Generic anti-parasite medicine",
    info: { uses: "For tapeworm and fluke infections.", dosage: "Usually a weight-based course, exactly as prescribed.", sideEffects: "Dizziness, nausea, stomach pain.", caution: "Prescription medicine." },
  },
  {
    name: "Ivermectin", manufacturer: "Various", packSizes: ["4 tablets"], notes: "Generic anti-parasite medicine",
    info: { uses: "For scabies, lice and some worm infections.", dosage: "Usually a single weight-based dose, exactly as prescribed.", sideEffects: "Dizziness, itching, nausea.", caution: "Prescription medicine. Do not use veterinary products on people." },
  },
  {
    name: "Benzyl Benzoate", manufacturer: "Various", packSizes: ["100ml lotion"], notes: "Generic scabies lotion",
    info: { uses: "For scabies.", dosage: "Apply to the whole body from neck down, leave overnight, repeat as advised.", sideEffects: "Burning, itching.", caution: "Treat close contacts at the same time. Wash clothes and bedding in hot water." },
  },
  {
    name: "Crotamiton", manufacturer: "Various", packSizes: ["100g cream"], notes: "Generic scabies/itch cream",
    info: { uses: "For scabies and itching.", dosage: "Apply to the whole body once a day for several days, exactly as directed.", sideEffects: "Burning, rash.", caution: "Treat close contacts at the same time." },
  },
  {
    name: "Acyclovir", manufacturer: "Various", packSizes: ["30 tablets"], notes: "Generic antiviral medicine",
    info: { uses: "For cold sores, shingles and genital herpes.", dosage: "Usually 1 tablet several times a day, exactly as prescribed. Start early for best effect.", sideEffects: "Headache, nausea, dizziness.", caution: "Prescription medicine. Drink plenty of water." },
  },
  {
    name: "Zovirax", manufacturer: "GSK", packSizes: ["30 tablets"], notes: "Acyclovir 400mg",
    info: { uses: "For cold sores, shingles and genital herpes.", dosage: "Usually 1 tablet several times a day, exactly as prescribed.", sideEffects: "Headache, nausea.", caution: "Prescription medicine. Drink plenty of water." },
  },
  {
    name: "Levothyroxine", manufacturer: "Various", packSizes: ["50 tablets"], notes: "Generic thyroid medicine",
    info: { uses: "For low thyroid (hypothyroidism).", dosage: "Usually 1 tablet once a day on an empty stomach, exactly as prescribed.", sideEffects: "Fast heartbeat, shakiness, sweating (if the dose is too high).", caution: "Prescription medicine. Take it at the same time daily, away from iron and calcium." },
  },
  {
    name: "Carbimazole", manufacturer: "Various", packSizes: ["50 tablets"], notes: "Generic overactive-thyroid medicine",
    info: { uses: "For overactive thyroid.", dosage: "Usually 1 tablet two or three times a day, exactly as prescribed.", sideEffects: "Rash, joint pain, sore throat.", caution: "Prescription medicine. Tell your doctor at once about fever or sore throat — blood tests may be needed." },
  },
  {
    name: "Allopurinol", manufacturer: "Various", packSizes: ["30 tablets"], notes: "Generic gout medicine",
    info: { uses: "To prevent gout attacks by lowering uric acid.", dosage: "Usually 1 tablet once a day, exactly as prescribed.", sideEffects: "Rash, nausea, stomach upset.", caution: "Prescription medicine. It prevents attacks — it does not stop one that has started. Stop and see a doctor for a severe rash." },
  },
  {
    name: "Colchicine", manufacturer: "Various", packSizes: ["30 tablets"], notes: "Generic gout medicine",
    info: { uses: "For a gout attack that has already started.", dosage: "Usually a short low-dose course, exactly as prescribed.", sideEffects: "Loose stools, nausea, stomach cramps.", caution: "Prescription medicine. Do not exceed the prescribed dose — it is toxic in overdose." },
  },
  {
    name: "Gabapentin", manufacturer: "Various", packSizes: ["30 capsules"], notes: "Generic nerve-pain medicine",
    info: { uses: "For nerve pain and seizures.", dosage: "Usually 1 capsule two or three times a day, exactly as prescribed.", sideEffects: "Dizziness, sleepiness, swelling of legs.", caution: "Prescription medicine. Never stop it suddenly." },
  },
  {
    name: "Pregabalin", manufacturer: "Various", packSizes: ["28 capsules"], notes: "Generic nerve-pain medicine",
    info: { uses: "For nerve pain, anxiety and seizures.", dosage: "Usually 1 capsule twice a day, exactly as prescribed.", sideEffects: "Dizziness, sleepiness, weight gain.", caution: "Prescription medicine. Never stop it suddenly." },
  },
  {
    name: "Amitriptyline", manufacturer: "Various", packSizes: ["30 tablets"], notes: "Generic antidepressant/nerve-pain medicine",
    info: { uses: "For depression, nerve pain and migraine prevention.", dosage: "Usually 1 tablet at bedtime, exactly as prescribed.", sideEffects: "Sleepiness, dry mouth, constipation, weight gain.", caution: "Prescription medicine. Never stop it suddenly." },
  },
  {
    name: "Sertraline", manufacturer: "Various", packSizes: ["28 tablets"], notes: "Generic antidepressant",
    info: { uses: "For depression, anxiety and panic attacks.", dosage: "Usually 1 tablet once a day, exactly as prescribed.", sideEffects: "Nausea, diarrhoea, trouble sleeping, shakiness.", caution: "Prescription medicine. It takes weeks to work fully. Never stop it suddenly." },
  },
  {
    name: "Fluoxetine", manufacturer: "Various", packSizes: ["28 capsules"], notes: "Generic antidepressant",
    info: { uses: "For depression, anxiety and obsessive thoughts.", dosage: "Usually 1 capsule once a day in the morning, exactly as prescribed.", sideEffects: "Nausea, trouble sleeping, shakiness.", caution: "Prescription medicine. It takes weeks to work fully. Never stop it suddenly." },
  },
  {
    name: "Escitalopram", manufacturer: "Various", packSizes: ["28 tablets"], notes: "Generic antidepressant",
    info: { uses: "For depression and anxiety.", dosage: "Usually 1 tablet once a day, exactly as prescribed.", sideEffects: "Nausea, headache, trouble sleeping.", caution: "Prescription medicine. It takes weeks to work fully. Never stop it suddenly." },
  },
  {
    name: "Venlafaxine", manufacturer: "Various", packSizes: ["28 capsules"], notes: "Generic antidepressant",
    info: { uses: "For depression and anxiety.", dosage: "Usually 1 capsule once a day, exactly as prescribed.", sideEffects: "Nausea, sweating, raised blood pressure, trouble sleeping.", caution: "Prescription medicine. Never stop it suddenly." },
  },
  {
    name: "Duloxetine", manufacturer: "Various", packSizes: ["28 capsules"], notes: "Generic antidepressant/nerve-pain medicine",
    info: { uses: "For depression, anxiety and nerve pain.", dosage: "Usually 1 capsule once a day, exactly as prescribed.", sideEffects: "Nausea, dry mouth, sleepiness.", caution: "Prescription medicine. Never stop it suddenly." },
  },
  {
    name: "Mirtazapine", manufacturer: "Various", packSizes: ["28 tablets"], notes: "Generic antidepressant",
    info: { uses: "For depression.", dosage: "Usually 1 tablet at bedtime, exactly as prescribed.", sideEffects: "Sleepiness, weight gain, dry mouth.", caution: "Prescription medicine. Never stop it suddenly." },
  },
  {
    name: "Trazodone", manufacturer: "Various", packSizes: ["28 tablets"], notes: "Generic antidepressant/sleep medicine",
    info: { uses: "For depression and trouble sleeping.", dosage: "Usually 1 tablet at bedtime, exactly as prescribed.", sideEffects: "Sleepiness, dizziness, dry mouth.", caution: "Prescription medicine. Rise slowly — it can drop blood pressure." },
  },
  {
    name: "Lithium", manufacturer: "Various", packSizes: ["50 tablets"], notes: "Generic mood medicine",
    info: { uses: "For bipolar disorder — it steadies mood.", dosage: "Usually 1 tablet once or twice a day, exactly as prescribed, with regular blood tests.", sideEffects: "Thirst, passing urine often, shakiness, weight gain.", caution: "Prescription medicine. Blood tests are a must. Never stop it suddenly." },
  },
  {
    name: "Olanzapine", manufacturer: "Various", packSizes: ["28 tablets"], notes: "Generic antipsychotic medicine",
    info: { uses: "For schizophrenia and bipolar disorder.", dosage: "Usually 1 tablet once a day at bedtime, exactly as prescribed.", sideEffects: "Sleepiness, weight gain, raised blood sugar.", caution: "Prescription medicine. Never stop it suddenly." },
  },
  {
    name: "Risperidone", manufacturer: "Various", packSizes: ["28 tablets"], notes: "Generic antipsychotic medicine",
    info: { uses: "For schizophrenia, bipolar disorder and irritability in autism.", dosage: "Usually 1 tablet once or twice a day, exactly as prescribed.", sideEffects: "Sleepiness, weight gain, stiffness.", caution: "Prescription medicine. Never stop it suddenly." },
  },
  {
    name: "Quetiapine", manufacturer: "Various", packSizes: ["30 tablets"], notes: "Generic antipsychotic medicine",
    info: { uses: "For schizophrenia, bipolar disorder and depression.", dosage: "Usually 1 tablet once or twice a day, exactly as prescribed.", sideEffects: "Sleepiness, weight gain, dizziness.", caution: "Prescription medicine. Never stop it suddenly." },
  },
  {
    name: "Haloperidol", manufacturer: "Various", packSizes: ["30 tablets"], notes: "Generic antipsychotic medicine",
    info: { uses: "For schizophrenia and severe agitation.", dosage: "Usually 1 tablet once or twice a day, exactly as prescribed.", sideEffects: "Stiffness, restlessness, shakiness.", caution: "Prescription medicine. Tell your doctor at once about muscle stiffness or high fever." },
  },
  {
    name: "Melatonin", manufacturer: "Various", packSizes: ["30 tablets"], notes: "Generic sleep medicine",
    info: { uses: "For trouble sleeping and jet lag.", dosage: "Usually 1 tablet 30–60 minutes before bedtime, exactly as directed.", sideEffects: "Headache, dizziness, daytime sleepiness.", caution: "Short courses. Keep a regular sleep routine." },
  },
  {
    name: "Diphenhydramine", manufacturer: "Various", packSizes: ["30 tablets"], notes: "Generic allergy/sleep medicine",
    info: { uses: "For allergy, itching and short-term trouble sleeping.", dosage: "Adults: 1 tablet at bedtime, when needed.", sideEffects: "Strong sleepiness, dry mouth, blurred vision.", caution: "Makes you very sleepy — do not drive after taking it." },
  },
  {
    name: "Hydroxyzine", manufacturer: "Various", packSizes: ["30 tablets"], notes: "Generic anxiety/itch medicine",
    info: { uses: "For anxiety, itching and nausea.", dosage: "Usually 1 tablet two or three times a day, exactly as prescribed.", sideEffects: "Sleepiness, dry mouth, headache.", caution: "Prescription medicine. May make you sleepy." },
  },
  {
    name: "Buspirone", manufacturer: "Various", packSizes: ["30 tablets"], notes: "Generic anxiety medicine",
    info: { uses: "For anxiety.", dosage: "Usually 1 tablet two or three times a day, exactly as prescribed.", sideEffects: "Dizziness, headache, nausea.", caution: "Prescription medicine. It takes weeks to work fully." },
  },
  {
    name: "Dexamethasone", manufacturer: "Various", packSizes: ["30 tablets"], notes: "Generic steroid medicine",
    info: { uses: "For severe allergy, inflammation and swelling.", dosage: "Usually a short course, exactly as prescribed.", sideEffects: "Raised blood sugar, trouble sleeping, stomach upset.", caution: "Prescription medicine. Never stop a long course suddenly." },
  },
  {
    name: "Prednisolone", manufacturer: "Various", packSizes: ["30 tablets"], notes: "Generic steroid medicine",
    info: { uses: "For allergy, asthma attacks, joint inflammation and skin disease.", dosage: "Usually a short course, exactly as prescribed.", sideEffects: "Raised appetite, trouble sleeping, stomach upset.", caution: "Prescription medicine. Never stop a long course suddenly." },
  },
  {
    name: "Methylprednisolone", manufacturer: "Various", packSizes: ["30 tablets"], notes: "Generic steroid medicine",
    info: { uses: "For allergy, asthma attacks and joint inflammation.", dosage: "Usually a short course, exactly as prescribed.", sideEffects: "Raised appetite, trouble sleeping.", caution: "Prescription medicine. Never stop a long course suddenly." },
  },
  {
    name: "Deflazacort", manufacturer: "Various", packSizes: ["30 tablets"], notes: "Generic steroid medicine",
    info: { uses: "For allergy, asthma and joint inflammation.", dosage: "Usually 1 tablet once a day, exactly as prescribed.", sideEffects: "Weight gain, raised blood sugar, trouble sleeping.", caution: "Prescription medicine. Never stop a long course suddenly." },
  },
  {
    name: "Methotrexate", manufacturer: "Various", packSizes: ["4 tablets"], notes: "Generic immune medicine",
    info: { uses: "For rheumatoid arthritis, psoriasis and some cancers.", dosage: "Usually ONCE A WEEK only, exactly as prescribed — never daily.", sideEffects: "Nausea, mouth ulcers, hair loss.", caution: "Prescription medicine. Weekly dosing only — daily use is dangerous. Regular blood tests are a must. Avoid in pregnancy." },
  },
  {
    name: "Azathioprine", manufacturer: "Various", packSizes: ["50 tablets"], notes: "Generic immune medicine",
    info: { uses: "To calm the immune system in arthritis, bowel disease and after transplant.", dosage: "Usually 1 tablet once or twice a day, exactly as prescribed.", sideEffects: "Nausea, low blood counts, infection risk.", caution: "Prescription medicine. Regular blood tests are a must." },
  },
  {
    name: "Hydroxychloroquine", manufacturer: "Various", packSizes: ["30 tablets"], notes: "Generic immune/malaria medicine",
    info: { uses: "For malaria prevention, lupus and rheumatoid arthritis.", dosage: "Usually 1 tablet once or twice a day, exactly as prescribed.", sideEffects: "Nausea, headache, vision changes.", caution: "Prescription medicine. Tell your doctor at once about vision changes — eye checks are needed." },
  },
  {
    name: "Sulfasalazine", manufacturer: "Various", packSizes: ["50 tablets"], notes: "Generic bowel/joint medicine",
    info: { uses: "For ulcerative colitis and rheumatoid arthritis.", dosage: "Usually 1 tablet two to four times a day with food, exactly as prescribed.", sideEffects: "Nausea, orange urine, rash.", caution: "Prescription medicine. Drink plenty of water." },
  },
  {
    name: "Mesalazine", manufacturer: "Various", packSizes: ["30 tablets"], notes: "Generic bowel medicine",
    info: { uses: "For ulcerative colitis.", dosage: "Usually 1 tablet two or three times a day, exactly as prescribed.", sideEffects: "Headache, nausea, stomach pain.", caution: "Prescription medicine." },
  },
  {
    name: "Chloroquine", manufacturer: "Various", packSizes: ["30 tablets"], notes: "Generic malaria medicine",
    info: { uses: "For malaria prevention and treatment.", dosage: "Usually a weekly dose for prevention, or a short course for treatment, exactly as prescribed.", sideEffects: "Nausea, headache, itching.", caution: "Prescription medicine. Tell your doctor about vision changes." },
  },
  {
    name: "Artemether", manufacturer: "Various", packSizes: ["24 tablets"], notes: "Generic malaria medicine",
    info: { uses: "For malaria treatment, usually combined with lumefantrine.", dosage: "Usually a 3-day course, exactly as prescribed.", sideEffects: "Headache, dizziness, nausea.", caution: "Prescription medicine. Finish the full 3-day course." },
  },
  {
    name: "Primaquine", manufacturer: "Various", packSizes: ["30 tablets"], notes: "Generic malaria medicine",
    info: { uses: "To fully clear malaria and prevent relapse.", dosage: "Usually 1 tablet once a day for 14 days, exactly as prescribed.", sideEffects: "Nausea, stomach cramps, dark urine.", caution: "Prescription medicine. A blood test (G6PD) is needed before use." },
  },
  {
    name: "Valproate", manufacturer: "Various", packSizes: ["30 tablets"], notes: "Generic epilepsy/mood medicine",
    info: { uses: "For seizures and bipolar disorder.", dosage: "Usually 1 tablet once or twice a day, exactly as prescribed.", sideEffects: "Weight gain, hair loss, shakiness.", caution: "Prescription medicine. Never stop it suddenly. Strictly avoid in pregnancy." },
  },
  {
    name: "Carbamazepine", manufacturer: "Various", packSizes: ["50 tablets"], notes: "Generic epilepsy/nerve-pain medicine",
    info: { uses: "For seizures, nerve pain and bipolar disorder.", dosage: "Usually 1 tablet two or three times a day, exactly as prescribed.", sideEffects: "Dizziness, sleepiness, rash.", caution: "Prescription medicine. Never stop it suddenly. Stop and see a doctor for a severe rash." },
  },
  {
    name: "Phenytoin", manufacturer: "Various", packSizes: ["50 capsules"], notes: "Generic epilepsy medicine",
    info: { uses: "For seizures.", dosage: "Usually 1 capsule two or three times a day, exactly as prescribed.", sideEffects: "Gum swelling, shakiness, sleepiness.", caution: "Prescription medicine. Never stop it suddenly. Regular blood tests are needed." },
  },
  {
    name: "Levetiracetam", manufacturer: "Various", packSizes: ["30 tablets"], notes: "Generic epilepsy medicine",
    info: { uses: "For seizures.", dosage: "Usually 1 tablet twice a day, exactly as prescribed.", sideEffects: "Sleepiness, mood changes, headache.", caution: "Prescription medicine. Never stop it suddenly." },
  },
  {
    name: "Lamotrigine", manufacturer: "Various", packSizes: ["28 tablets"], notes: "Generic epilepsy/mood medicine",
    info: { uses: "For seizures and bipolar disorder.", dosage: "Usually 1 tablet once or twice a day, exactly as prescribed, starting low and rising slowly.", sideEffects: "Headache, dizziness, rash.", caution: "Prescription medicine. Stop and see a doctor at once for a severe rash." },
  },
  {
    name: "Piracetam", manufacturer: "Various", packSizes: ["30 tablets"], notes: "Generic cognition medicine",
    info: { uses: "For memory and brain circulation problems.", dosage: "Usually 1 tablet two or three times a day, exactly as prescribed.", sideEffects: "Nervousness, trouble sleeping, weight gain.", caution: "Prescription medicine." },
  },
  {
    name: "Donepezil", manufacturer: "Various", packSizes: ["28 tablets"], notes: "Generic Alzheimer medicine",
    info: { uses: "For memory loss in Alzheimer's disease.", dosage: "Usually 1 tablet once a day at bedtime, exactly as prescribed.", sideEffects: "Nausea, loose stools, vivid dreams.", caution: "Prescription medicine. Tell your doctor about slow heartbeat." },
  },
  {
    name: "Memantine", manufacturer: "Various", packSizes: ["28 tablets"], notes: "Generic Alzheimer medicine",
    info: { uses: "For moderate to severe Alzheimer's disease.", dosage: "Usually 1 tablet once or twice a day, exactly as prescribed.", sideEffects: "Dizziness, headache, constipation.", caution: "Prescription medicine." },
  },
  {
    name: "Levodopa", manufacturer: "Various", packSizes: ["50 tablets"], notes: "Generic Parkinson medicine",
    info: { uses: "For Parkinson's disease — it restores movement.", dosage: "Usually 1 tablet two to four times a day, exactly as prescribed.", sideEffects: "Nausea, dizziness, uncontrolled movements.", caution: "Prescription medicine. Never stop it suddenly." },
  },
  {
    name: "Ondansetron", manufacturer: "Various", packSizes: ["10 tablets"], notes: "Generic anti-nausea medicine",
    info: { uses: "For nausea and vomiting, including after chemotherapy.", dosage: "Usually 1 tablet two or three times a day, exactly as prescribed.", sideEffects: "Headache, constipation.", caution: "Prescription medicine." },
  },
  {
    name: "Gravinate", manufacturer: "Various", packSizes: ["30 tablets"], notes: "Dimenhydrinate",
    info: { uses: "For travel sickness, nausea and dizziness.", dosage: "Adults: 1 tablet every 4–6 hours, when needed.", sideEffects: "Sleepiness, dry mouth.", caution: "May make you sleepy — do not drive after taking it." },
  },
  {
    name: "Mucolator", manufacturer: "Various", packSizes: ["20 sachets"], notes: "Acetylcysteine",
    info: { uses: "For thick mucus in chest infections.", dosage: "Usually 1 sachet two or three times a day dissolved in water.", sideEffects: "Nausea, stomach upset.", caution: "Tell your doctor about asthma." },
  },
  {
    name: "Docusate", manufacturer: "Various", packSizes: ["30 capsules"], notes: "Generic stool softener",
    info: { uses: "For constipation — it softens stools.", dosage: "Adults: 1 capsule two or three times a day, when needed.", sideEffects: "Stomach cramps, loose stools.", caution: "Drink plenty of water." },
  },
  {
    name: "Glycerin Suppositories", manufacturer: "Various", packSizes: ["12 suppositories"], notes: "Generic constipation suppositories",
    info: { uses: "For constipation — they work in the rectum.", dosage: "Adults: 1 suppository when needed, exactly as directed.", sideEffects: "Rectal irritation, cramps.", caution: "See a doctor for long-lasting constipation." },
  },
  {
    name: "Minocycline", manufacturer: "Various", packSizes: ["30 capsules"], notes: "Generic acne antibiotic",
    info: { uses: "For acne and some infections.", dosage: "Usually 1 capsule once or twice a day, exactly as prescribed.", sideEffects: "Dizziness, nausea, skin darkening.", caution: "Prescription medicine. Avoid in pregnancy. Use sunscreen." },
  },
  {
    name: "Tetracycline", manufacturer: "Various", packSizes: ["30 capsules"], notes: "Generic antibiotic",
    info: { uses: "Antibiotic for chest, skin and eye infections.", dosage: "Usually 1 capsule two to four times a day on an empty stomach, exactly as prescribed.", sideEffects: "Nausea, sun sensitivity.", caution: "Prescription medicine. Avoid in pregnancy and children under 8. Do not take with milk or antacids." },
  },
  {
    name: "Selenium Sulfide", manufacturer: "Various", packSizes: ["100ml shampoo"], notes: "Generic dandruff shampoo",
    info: { uses: "For dandruff and fungal scalp infections.", dosage: "Wash the hair with it twice a week, leave for a few minutes, then rinse.", sideEffects: "Dry hair, itching.", caution: "For external use only. Keep away from the eyes." },
  },
  {
    name: "Griseofulvin", manufacturer: "Various", packSizes: ["30 tablets"], notes: "Generic antifungal medicine",
    info: { uses: "For fungal infections of skin, hair and nails.", dosage: "Usually 1 tablet once or twice a day with fatty food, exactly as prescribed, for weeks.", sideEffects: "Headache, nausea, rash.", caution: "Prescription medicine. No alcohol during the course." },
  },
  {
    name: "Econazole", manufacturer: "Various", packSizes: ["30g cream"], notes: "Generic antifungal cream",
    info: { uses: "For fungal skin infections.", dosage: "Apply a thin layer twice a day.", sideEffects: "Burning, itching.", caution: "Finish the course." },
  },
  {
    name: "Desloratadine", manufacturer: "Various", packSizes: ["30 tablets"], notes: "Generic allergy medicine",
    info: { uses: "For allergy — sneezing, runny nose, itchy eyes and hives.", dosage: "Adults: 1 tablet once a day.", sideEffects: "Headache, dry mouth, tiredness.", caution: "Usually does not cause sleepiness." },
  },
  {
    name: "Rupatadine", manufacturer: "Various", packSizes: ["30 tablets"], notes: "Generic allergy medicine",
    info: { uses: "For allergy — sneezing, runny nose, itchy eyes and hives.", dosage: "Adults: 1 tablet once a day.", sideEffects: "Sleepiness, dry mouth, headache.", caution: "May make you sleepy." },
  },
  {
    name: "Bilastine", manufacturer: "Various", packSizes: ["30 tablets"], notes: "Generic allergy medicine",
    info: { uses: "For allergy — sneezing, runny nose, itchy eyes and hives.", dosage: "Adults: 1 tablet once a day on an empty stomach.", sideEffects: "Headache, sleepiness.", caution: "Do not take with fruit juice at the same time." },
  },
  {
    name: "Levocetirizine", manufacturer: "Various", packSizes: ["30 tablets"], notes: "Generic allergy medicine",
    info: { uses: "For allergy — sneezing, runny nose, itchy eyes and hives.", dosage: "Adults: 1 tablet once a day in the evening.", sideEffects: "Sleepiness, dry mouth, headache.", caution: "May make you sleepy." },
  },
  {
    name: "Ebastine", manufacturer: "Various", packSizes: ["30 tablets"], notes: "Generic allergy medicine",
    info: { uses: "For allergy — sneezing, runny nose and hives.", dosage: "Adults: 1 tablet once a day.", sideEffects: "Headache, dry mouth.", caution: "Usually does not cause sleepiness." },
  },];
