---
phase: 48
slug: visual-qa-accessibility
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-05-27
---

# Phase 48 — Validation Strategy

> Per-phase validation contract for desktop-only visual QA, accessibility, reduced-motion, and regression sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest + Vue Test Utils + happy-dom for web; Vitest/Nest test runner for server; Vitest for contracts |
| **Config file** | `apps/web/vitest.config.ts`; `apps/server/vitest.config.ts`; contracts use package script |
| **Quick run command** | `pnpm --filter @trip-map/web test -- src/components/map-popup/FootprintDateDialog.spec.ts` |
| **Full suite command** | `pnpm --filter @trip-map/web test`; `pnpm --filter @trip-map/server test`; `pnpm --filter @trip-map/contracts test` |
| **Estimated runtime** | ~30-180 seconds depending on DB-backed server e2e availability |

---

## Sampling Rate

- **After every task commit:** Run the focused spec for the touched component/service, or record why the task is manual-evidence-only.
- **After every plan wave:** Run the affected package suite, normally `pnpm --filter @trip-map/web test` for frontend changes.
- **Before `$gsd-verify-work`:** Run web, server, and contracts suites. If server DB-backed e2e specs skip because `DATABASE_URL` is unreachable, record the environment note separately from logic failures.
- **Max feedback latency:** 180 seconds for focused frontend feedback; longer server DB setup is allowed only when explicitly needed.

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 48-W0-01 | TBD | 0 | QA-01, QA-02, QA-03, QA-04 | T-48-01 | Screenshots use normal authenticated/seeded flow, not auth bypasses | manual evidence | `pnpm --filter @trip-map/web dev` plus desktop screenshot capture | ❌ W0 | ⬜ pending |
| 48-W0-02 | TBD | 0 | QA-02 | T-48-02 | Fixed populated account/seed data makes map markers and all four memories charts reproducible | manual setup + regression | `pnpm --filter @trip-map/server test` when server changes | ❌ W0 | ⬜ pending |
| 48-A11Y-01 | TBD | TBD | QA-03 | T-48-03 | Core keyboard flow preserves focus and exposes readable labels | component/manual | `pnpm --filter @trip-map/web test -- src/components/map-popup/FootprintDateDialog.spec.ts src/components/map-popup/MapContextPopup.spec.ts` | ✅ | ⬜ pending |
| 48-MOTION-01 | TBD | TBD | QA-04 | — | Reduced motion disables non-essential motion while controls remain operable | source/manual + focused specs if changed | Changed component spec, or source assertion in review checklist | ⚠️ partial | ⬜ pending |
| 48-REG-01 | TBD | Final | QA-05 | T-48-04 | Auth, records, journal, memories, and shared contracts remain covered by existing suites | automated regression | `pnpm --filter @trip-map/web test`; `pnpm --filter @trip-map/server test`; `pnpm --filter @trip-map/contracts test` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky/partial*

---

## Wave 0 Requirements

- [ ] `.planning/phases/48-visual-qa-accessibility/evidence/desktop-checklist.md` — screenshot and manual QA checklist for landing, `/map`, `/journal`, `/memories`, and the opened footprint date dialog.
- [ ] `.planning/phases/48-visual-qa-accessibility/evidence/desktop-landing.png` — populated desktop landing/auth entry evidence.
- [ ] `.planning/phases/48-visual-qa-accessibility/evidence/desktop-map.png` — populated desktop map with Leaflet surface and star markers.
- [ ] `.planning/phases/48-visual-qa-accessibility/evidence/desktop-footprint-dialog.png` — opened `留下足迹` date dialog evidence.
- [ ] `.planning/phases/48-visual-qa-accessibility/evidence/desktop-journal.png` — populated journal evidence including long-text risk scan.
- [ ] `.planning/phases/48-visual-qa-accessibility/evidence/desktop-memories.png` — memories evidence showing all four ECharts charts.
- [ ] Fixed account or seed-data procedure — reproducible map markers and chart data for QA-02.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Desktop screenshot matrix has no overlap, truncation, unreadable text, or missing core visuals | QA-01 | Phase context explicitly chooses screenshot files plus checklist rather than browser visual automation | Capture desktop-only populated states and fill `evidence/desktop-checklist.md` with pass/fail notes and repair links |
| Leaflet map, star markers, and ECharts charts are visibly non-empty | QA-02 | Context chooses local manual run plus screenshot review instead of adding browser smoke tooling | Use fixed populated account/seed data, capture `/map` and `/memories`, confirm all four chart panels render visible graphics |
| Reduced-motion operation remains usable | QA-04 | Motion perception is partly visual and distributed across CSS utilities/components | Enable `prefers-reduced-motion: reduce`, verify core route decorations/hover/pulse effects downgrade and core controls still work |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or explicit manual evidence dependencies.
- [ ] Sampling continuity: no 3 consecutive code-changing tasks without focused automated feedback.
- [ ] Wave 0 covers all screenshot/checklist/seed-data gaps before visual claims are accepted.
- [ ] No watch-mode flags in verification commands.
- [ ] Server DB environment skips are documented separately from product logic failures.
- [ ] `nyquist_compliant: true` remains set in frontmatter after planner/checker review.

**Approval:** pending
