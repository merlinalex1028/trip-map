---
phase: 46
slug: travel-journal-refactor
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-05-18
---

# Phase 46 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest `4.1.4` with Vue Test Utils `2.4.x` and happy-dom |
| **Config file** | No dedicated `vitest.config.*` found; tests run through package scripts |
| **Quick run command** | `pnpm --filter @trip-map/web test -- TimelinePageView TimelineVisitCard timeline` |
| **Full suite command** | `pnpm --filter @trip-map/web test` |
| **Estimated runtime** | ~60 seconds for focused suite; full suite runtime to be measured during execution |

---

## Sampling Rate

- **After every task commit:** Run `pnpm --filter @trip-map/web test -- TimelinePageView TimelineVisitCard timeline`
- **After every plan wave:** Run `pnpm --filter @trip-map/web test -- router TimelinePageView TimelineVisitCard timeline ShellSidebar`
- **Before `$gsd-verify-work`:** Run `pnpm --filter @trip-map/web test` and `pnpm --filter @trip-map/web build`
- **Max feedback latency:** 120 seconds for focused suites

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 46-01-01 | 01 | 1 | JOURNAL-01, JOURNAL-04, JOURNAL-05 | T-46-01 / T-46-02 | Auth guard preserved; add/favorite/collection affordances absent | router/page/component unit | `pnpm --filter @trip-map/web test -- router TimelinePageView ShellSidebar` | ✅ / ❌ W0 | ⬜ pending |
| 46-02-01 | 02 | 1 | JOURNAL-02, JOURNAL-03 | — | Decorative media is non-interactive and hidden from assistive tech | component unit | `pnpm --filter @trip-map/web test -- TimelineVisitCard timeline` | ✅ / ❌ W0 | ⬜ pending |
| 46-03-01 | 03 | 2 | JOURNAL-02, JOURNAL-06 | T-46-03 / — | Responsive journal states avoid overlap and keep auth restoration behavior | page/component unit + manual visual | `pnpm --filter @trip-map/web test -- TimelinePageView TimelineVisitCard` | ✅ / ❌ W0 | ⬜ pending |
| 46-04-01 | 04 | 2 | JOURNAL-03, JOURNAL-04, JOURNAL-05 | T-46-02 / T-46-04 | Edit/delete retain confirmation and do not introduce photo/upload/favorite semantics | component unit | `pnpm --filter @trip-map/web test -- TimelineVisitCard timeline` | ✅ / ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `apps/web/src/views/TimelinePageView.spec.ts` — add absence tests for `添加新旅行`, `收藏`, `我的收藏`, and empty-state `/map`-only navigation.
- [ ] `apps/web/src/components/timeline/TimelineVisitCard.spec.ts` — add tests for summary derivation, decorative thumbnail accessibility, stable variant mapping, and quiet management entry.
- [ ] `apps/web/src/components/shell/ShellSidebar.spec.ts` or equivalent shell coverage — assert v8 shell on journal does not expose `我的收藏` if shell cleanup remains in scope.
- [ ] Error-state source test — identify existing app/store error path or document manual-only fallback if no journal-local error branch exists.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Mobile and desktop visual rhythm of glowing vertical line, star nodes, card stream, and thumbnail placement | JOURNAL-02, JOURNAL-03, JOURNAL-06 | Unit tests can verify DOM classes/structure, but overlap and visual polish require viewport inspection | Run local web app, open `/journal` with seeded/authenticated records, capture desktop and mobile screenshots, confirm no text truncation or overlap |
| Lightweight Yume Kawaii motion with reduced-motion fallback | JOURNAL-02, JOURNAL-06 | Motion comfort and visual tone require human review in addition to CSS assertions | Inspect default and `prefers-reduced-motion: reduce` modes; confirm decorative effects stop or become static when reduced motion is active |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 120s for focused suites
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
