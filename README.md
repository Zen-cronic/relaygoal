# RelayGoal  *(working name — TENTATIVE, see naming note)*

> **Skip the call you can't make.** Type what you need; the agent makes the whole call and hands you back a verified answer — with the exact words it's based on.

RelayGoal is a **goal-driven** phone assistant for people who can't easily use the phone — Deaf, hard-of-hearing, and speech-disabled users. You type a goal in plain language; a CALL-E **Goal** places and conducts the entire outbound call (you are never on the line), then returns a **captioned transcript** *plus* a **verified result**: the answer, an honest `verified / unverified` state, and the **exact transcript quotes** the answer is grounded in.

## Architecture: one reusable core, two verticals
The hero is a standalone, reusable **`verified-phone-outcome` core** (the CALL-E Goal + `result_schema` + the honest transcript-quote grounding engine + safety scaffolding). Two thin verticals sit on top — proving "reusable by the community" concretely:
- **`accessibility-relay`** — the hero app + hosted demo (Deaf/HoH). Dodges identity-walls (it's the user's *own* call via accommodation).
- **`civic-logistics`** — a 2nd demo-beat (call a gov/utility office for non-authenticated logistics: hours, wait, required-docs, status readback), showcasing CALL-E's deep-IVR navigation. Ships identity-wall handling *as a feature*. Only becomes a separate submission if CE-1 finishes early.

**The wedge (why this isn't "an AI that makes calls"):** every existing relay service (Nagish, CaptionCall, federal TRS/VRS) is *synchronous* — you must sit on the live call reading captions — because FCC relay funding requires it. RelayGoal is *async*: the agent does the errand without you, and because you couldn't hear the call, it **proves what happened** with grounded evidence rather than asking you to trust a summary. That verification layer is the hero.

## What it uses (CALL-E, at runtime)
- **Goals** — a versioned, reusable "verified phone outcome" template (`input_schema` + `result_schema`), so the contribution is *reusable by the community*, not a one-off.
- **Structured extraction** — `result_schema` → `structured_result`, grounded against `transcript_turns` and `completion_confidence` + `evidence`.
- **Webhooks** — `call.completed` / `call.result_validation_failed` with `CALL-E-Event-Id` dedup + idempotency keys (fail-closed).
- **Batch `recipients[]`** — the "compare across N places" power feature (secondary demo beat).

## Safety posture (table stakes to merge — built in from commit #1)
Consent-first · strict E.164 before dialing · phone numbers masked everywhere · fail-closed on no-answer/ambiguous/empty-transcript · **no-call / fakecalle dry-run default + credential-free tests** · no real number/key/transcript ever in git.

## House vocabulary (adopt in all judge-facing copy)
goal-driven task · structured result · completion confidence · evidence · task_completed · "drops into any stack" · Goals / webhooks. **Avoid:** voicebot, campaign, robocall, bulk, collections.

## Submission deliverables (from state.md)
- [ ] PR to `CALLE-AI/awesome-phone-call-agents` — `apps/typescript/<name>/` (app) and/or `skills/<name>/` (reusable Goal-skill); passes `validate_repository.py`; conventional-commit title
- [ ] `< 3 min` demo video (public YouTube/Vimeo) — leads with ONE verified-call loop; teases batch
- [ ] Live no-login hosted demo (Vercel `--scope zencronics-projects`; verify not behind SSO)
- [ ] Text description + CALL-E account email on Devpost
- [ ] Feedback Survey (separate Most-Valuable-Feedback prize)

## Naming note
`RelayGoal` is a working title (panel placeholder). Checked against the field census — no collision — but rename before the PR if you prefer. Avoid `callproof` (an existing app in the repo).

---
*Concept locked 2026-08-22. Strategy + rationale live in the suite repo: `hackathon-agent/hackathons/call-e-2026/state.md`.*
