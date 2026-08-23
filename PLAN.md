# RelayGoal — day-by-day build plan

Deadline (plan-to): **Sep 13, 2026 11:45pm EDT** (Official-Rules binding time). Locked 2026-08-22 ⇒ ~15–16 effective solo build-days. Demo video reserved as a first-class deliverable. Stack: **TypeScript** (hosted-demo edge + `@call-e/calle` SDK), core packaged as a reusable **Goal-skill**.

> Iterate per `hackathon-agent/workflows/product-build.md`: one rubric-visible task per iteration → contract → build → verify → decide. Rubric-tag commits (`feat: … (Technical Depth)`).

## Gate 0 — operator actions (unblock the build)
- [ ] Create CALL-E account (20 free calls) via github.com/CALLE-AI/call-e-integrations
- [ ] **Submit the +200 credits form** (`credits-form-draft-2026-08-22.md`) — 1–5 business-day approval; do FIRST
- [ ] (opt) File deadline clarification with organizer

## Days 1–2 — Spine + disposable spike
- `.gitignore`-first ✓ → `npm init` skeleton, pin `@call-e/calle`, `.env.example`
- **Disposable spike:** ONE real SDK call to the test hotline `+1 276-322-9632` — validate `task → structured_result + transcript_turns + completion_confidence + evidence`. Delete after. (needs Gate 0)
- `fakecalle.ts` stub replaying canned transcripts → the whole app runs/testable **credential-free**

## Days 3–4 — The reusable core (the hero)
- Define the **Goal**: `input_schema` (goal, target, constraints) + `result_schema` + `recipient_result_schema`
- **Verified-outcome engine:** map `completion_confidence` + evidence → a conservative **verified / UNVERIFIED("call the business yourself")** decision; every answer bound to exact `transcript_turns` quote spans (offsets). *No dressed-up confidence %.*
- Webhooks (`call.completed`, `call.result_validation_failed`) + `CALL-E-Event-Id` dedup + payload-bound idempotency; **fail-closed** on no-answer/empty/ambiguous
- Safety lib: strict E.164, number masking everywhere, consent record. Credential-free unit tests (target the `leash` bar: many passing no-call tests)

## Day 5 — Design direction (BEFORE frontend)
- Run `design-direction` skill → one-page brief (tokens, layout, the ONE signature element = the verified-result card, accessible states). App must itself be exemplary-accessible (captions, keyboard, screen-reader, ASL-vs-text note)

## Days 6–9 — Hosted accessible app
- Flow: type goal → live "agent is calling…" status → **verified-result card** (answer + verified/unverified + quotes anchored to captioned transcript)
- Consent gate in-flow; masked previews; fail-closed states shown, not hidden

## Days 10–11 — Power feature + evidence
- Batch "compare across N places" (`recipients[]` + reconciliation → ranked table) — SECONDARY beat, scoped to a safe vertical
- Light user discovery: 1–2 Deaf/HoH testers or an accessibility-org note (RWI evidence the panel asked for)

## Day 12 — Deploy
- Vercel `--prod --scope zencronics-projects`; **verify not behind SSO** (curl effective-URL check); deterministic demo mode

## Days 13–14 — Demo film + README
- `demo-study` → `demo-director` → `<3 min` video: lead with ONE verified-call loop; tease batch; no unlicensed music
- README polish (house vocab, novelty statement, named `Bonuses` OSS section — truthful status)

## Day 15 (T-2) — Audit + submit
- `submission-audit`; run `validate_repository.py` locally; PR to awesome repo (conventional-commit title); Devpost fields; Feedback Survey; buffer for merge-review turnaround

## Parallel — OSS bonus (see `hackathon-agent/hackathons/call-e-2026/oss-contributions.md`)
- Log build-found SDK defects → crisp issues to `call-e-integrations` (unsaturated). Fast doc-fix to `calle-docs`. Budget ≤1 PR + ≤2 issues. **Filing = operator.**
