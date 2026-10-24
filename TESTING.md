# MediLens — Testing Guide (simple words)

## What is testing?
Testing means we check the app with small automatic programs before real
people use it. If a check fails, we fix the code before the mistake can
reach a user. In MediLens, **40 automatic tests** run in about 2 seconds.

## The two kinds of tests in this project

**1. Unit testing — one small part at a time.**
Like testing a car's brake alone, before driving the whole car.
Examples in MediLens (folder `tests/`):
- The verdict brain: a good pack must be GREEN, an expired pack must be
  RED, a pack with no batch number must be AMBER.
- The drug database: typing "panadol" in small letters must still find
  Panadol.
- The speed limit: after 10 scans in one minute, the 11th must be blocked
  (this protects the free AI limit).

**2. Integration testing — parts working together.**
Like a full test drive. Examples:
- A photo goes in one end of the scan system and a GREEN verdict comes
  out of the other end (the AI's answer is faked in the test, so the test
  is free and fast).
- The pharmacy map: if the first map server is busy and sends an empty
  answer, the system must ask the next server — this test copies a real
  bug that happened on 2026-10-24, so it can never come back quietly.

## What is TDD?
TDD = **Test-Driven Development**. Three steps, again and again:

1. **RED** — write the test first. Run it. It fails, because the behaviour
   does not exist yet (or is wrong).
2. **GREEN** — write or fix the code until the test passes.
3. **REFACTOR** — clean the code, run the tests again to prove nothing
   broke.

## TDD found real bugs in MediLens
The tests were written first, and they caught real mistakes:

1. **Wrong expiry year.** A pack printed "2027-08" was being read as the
   year **2008** — so a good medicine could be called expired. A second
   bad date, "13/27", was being read as March 2027. Both are fixed, and
   the tests now guard them forever.
2. **Wrong drug details.** "Panadol Extra" was matched to plain "Panadol"
   because Panadol comes first in the list — so the app showed the wrong
   dosage and caution text. The matcher now prefers the exact name first,
   then the longest matching name. The same flaw was then found in the
   on-device OCR text reader and fixed the same way — a good example of
   why one bug should make you look for its brothers.

## How the tests run
- On my computer: `npm test`
- On GitHub: automatically on **every push** (GitHub Actions, file
  `.github/workflows/tests.yml`). A green ✅ on the commit means all 40
  tests passed. A red ❌ means a change broke something — fix it before
  trusting the site.

## What the tests do NOT do
Tests use fake AI answers and fake map answers, on purpose — they are
free, fast and always give the same result. They do not replace testing
on a real phone with a real medicine pack.
