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
| 46-01-01 | 01 | 1 | JOURNAL-01, JOURNAL-04, JOURNAL-05, JOURNAL-06 | T-46-01 / T-46-03 | `/journal` stays protected; legacy `/timeline` falls through; add/favorite/collection/upload/photo affordances are absent; empty state only links to `/map` | router + page unit | `pnpm --filter @trip-map/web test -- router TimelinePageView` | ✅ / ❌ W0 | ⬜ pending |
| 46-01-02 | 01 | 1 | JOURNAL-01, JOURNAL-04, JOURNAL-05, JOURNAL-06 | T-46-02 / T-46-04 | Authenticated shell exposes only real v8 routes and no collection/add/future disabled entries | shell + page unit | `pnpm --filter @trip-map/web test -- AuthenticatedAppShell TimelinePageView` | ✅ / ❌ W0 | ⬜ pending |
| 46-02-01 | 02 | 1 | JOURNAL-03 | T-46-06 / T-46-07 / T-46-08 | Summary/location/tag helpers are deterministic, plain-text, and use only local `TimelineEntry` fields | helper unit | `pnpm --filter @trip-map/web test -- journal-thumbnails timeline` | ✅ / ❌ W0 | ⬜ pending |
| 46-02-02 | 02 | 1 | JOURNAL-03 | T-46-05 | Postcard thumbnail is CSS-only decorative media, `aria-hidden`, non-focusable, and free of photo/upload semantics | component/helper unit | `pnpm --filter @trip-map/web test -- journal-thumbnails` | ✅ / ❌ W0 | ⬜ pending |
| 46-03-01 | 03 | 2 | JOURNAL-02, JOURNAL-03, JOURNAL-04, JOURNAL-05 | T-46-11 / T-46-12 / T-46-13 | Readonly card hierarchy uses journal summary/location/tags/postcard, avoids `v-html`, and exposes no add/favorite/collection/upload/photo semantics | card + helper unit | `pnpm --filter @trip-map/web test -- TimelineVisitCard journal-thumbnails timeline` | ✅ / ❌ W0 | ⬜ pending |
| 46-03-02 | 03 | 2 | JOURNAL-02, JOURNAL-03, JOURNAL-04, JOURNAL-05 | T-46-09 / T-46-10 / T-46-11 | Edit/delete remain available only through quiet management; inline edit and destructive confirmation paths are preserved | card unit | `pnpm --filter @trip-map/web test -- TimelineVisitCard` | ✅ / ❌ W0 | ⬜ pending |
| 46-04-01 | 04 | 3 | JOURNAL-01, JOURNAL-02, JOURNAL-04, JOURNAL-05, JOURNAL-06 | T-46-14 / T-46-15 / T-46-16 / T-46-17 | Route view renders authenticated journal stream and state panels; motion is reduced under `prefers-reduced-motion`; header action leakage is absent; `/map` appears only in empty/error recovery | page/card unit + visual gate | `pnpm --filter @trip-map/web test -- TimelinePageView TimelineVisitCard`; visual gate: run `pnpm --filter @trip-map/web dev -- --host 127.0.0.1 --port 5173`, capture `screenshots/46-04-journal-desktop.png` at `1440x960` and `screenshots/46-04-journal-mobile-320.png` at `320x720`, inspect `[data-journal-stream]`, `[data-journal-line]`, `[data-journal-node]`, `[data-region="timeline-entry"]`, `[data-journal-postcard]` for no overlap/collision, and record pass/fail notes in `46-04-SUMMARY.md` | ✅ / ❌ W0 | ⬜ pending |
| 46-04-02 | 04 | 3 | JOURNAL-01, JOURNAL-02, JOURNAL-04, JOURNAL-05, JOURNAL-06 | T-46-18 | Final focused tests, production build, and production-file forbidden-affordance audit prove excluded add/favorite/collection/upload/photo surfaces are absent | final focused suite + build + grep audit | `pnpm --filter @trip-map/web test -- router TimelinePageView TimelineVisitCard timeline ShellSidebar AuthenticatedAppShell`; `pnpm --filter @trip-map/web build`; `rg -n "添加新旅行|我的收藏|data-card-favorite|data-journal-add-trip|data-journal-favorite|旅行照片|上传" apps/web/src/views/TimelinePageView.vue apps/web/src/components/timeline/TimelineVisitCard.vue apps/web/src/components/timeline/JournalPostcardThumb.vue apps/web/src/components/timeline/journal-thumbnails.ts apps/web/src/components/shell/ShellSidebar.vue` returns no matches | ✅ / ❌ W0 | ⬜ pending |

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
