---
phase: 48-visual-qa-accessibility
plan: 04
subsystem: ui
tags: [vue, vitest, visual-qa, long-text, reduced-motion, accessibility]

requires:
  - phase: 48-visual-qa-accessibility
    provides: "Desktop screenshot checklist plus auth/sidebar/map/dialog/chart accessibility baselines from Plans 01-03"
provides:
  - "Landing, journal, and memories desktop visual checklist closure under 48-04 owners"
  - "Journal card long text containment for place names, location paths, and note summaries"
  - "Memories country legend long-label containment while preserving server-authoritative stats flow"
  - "Reduced-motion guards for journal and memories hover displacement on repaired surfaces"
affects: [phase-48, landing, journal, memories, visual-qa, reduced-motion]

tech-stack:
  added: []
  patterns:
    - "Source-level containment assertions for visual QA long-text risks"
    - "Local component reduced-motion guards for transform-based hover movement"

key-files:
  created:
    - .planning/phases/48-visual-qa-accessibility/48-04-SUMMARY.md
  modified:
    - apps/web/src/views/LandingPageView.spec.ts
    - apps/web/src/views/TimelinePageView.vue
    - apps/web/src/views/TimelinePageView.spec.ts
    - apps/web/src/components/timeline/TimelineVisitCard.vue
    - apps/web/src/components/timeline/TimelineVisitCard.spec.ts
    - apps/web/src/views/StatisticsPageView.vue
    - apps/web/src/views/StatisticsPageView.spec.ts
    - apps/web/src/components/memories/MemoriesChartGrid.vue
    - apps/web/src/components/memories/MemoriesChartGrid.spec.ts
    - .planning/phases/48-visual-qa-accessibility/evidence/desktop-checklist.md

key-decisions:
  - "No screenshot recapture was needed because Plan 04 repaired source-level containment/motion gaps without changing any row from repair-needed to pass."
  - "Reduced-motion guards stay local to surfaces that still have decorative animation or transform-based hover movement."

patterns-established:
  - "Long-text visual QA fixes add stable containment hooks and focused Vitest assertions."
  - "Reduced-motion verification uses source assertions for local `prefers-reduced-motion` guards plus focused component tests."

requirements-completed: [QA-01, QA-04]

duration: 17min
completed: 2026-05-27
---

# Phase 48 Plan 04: Visual and Reduced-Motion Repair Summary

**Desktop visual QA closure with journal/memories long-text containment and local reduced-motion guards**

## Performance

- **Duration:** 17min
- **Started:** 2026-05-27T12:16:37Z
- **Completed:** 2026-05-27T12:33:44Z
- **Tasks:** 3
- **Files modified:** 10

## Accomplishments

- Added journal card containment for long place names, location paths, and note summaries so user/content text stays inside the card and away from controls/postcards.
- Added memories chart legend containment for long country/region labels while preserving all four chart panel selectors and server-provided stats flow.
- Added local reduced-motion guards for journal route controls, journal card hover/menu hover, and memories route controls.
- Updated `desktop-checklist.md` with `48-04-landing-visual`, `48-04-journal-visual`, `48-04-memories-visual`, and `48-04-reduced-motion` evidence rows.

## Task Commits

1. **Task 1 RED: Journal long-text containment gate** - `2247a31` (test)
2. **Task 1 GREEN: Journal card containment repair** - `8357ac4` (fix)
3. **Task 2 RED: Memories legend containment gate** - `30ea6c4` (test)
4. **Task 2 GREEN: Memories legend label containment** - `4777cd6` (fix)
5. **Task 3 RED: Reduced-motion source gates** - `f2f58e9` (test)
6. **Task 3 GREEN: Repaired surface motion guards** - `a7550dd` (fix)

_All three tasks followed the requested TDD flow with RED test commits before GREEN implementation commits._

## Files Created/Modified

- `apps/web/src/components/timeline/TimelineVisitCard.vue` - Adds `min-w-0`, `overflow-hidden`, `break-words`, stable text hooks, and a local reduced-motion guard for card/menu hover displacement.
- `apps/web/src/components/timeline/TimelineVisitCard.spec.ts` - Covers long text containment and reduced-motion source guard requirements.
- `apps/web/src/views/TimelinePageView.vue` - Disables journal state-panel hover displacement under reduced motion while preserving existing node/shimmer guards.
- `apps/web/src/views/TimelinePageView.spec.ts` - Covers journal route reduced-motion source guard requirements.
- `apps/web/src/components/memories/MemoriesChartGrid.vue` - Adds `overflow-wrap: anywhere` for country legend labels.
- `apps/web/src/components/memories/MemoriesChartGrid.spec.ts` - Covers source-level country legend containment.
- `apps/web/src/views/StatisticsPageView.vue` - Adds reduced-motion guards for memories route buttons/links.
- `apps/web/src/views/StatisticsPageView.spec.ts` - Covers memories route reduced-motion source guard requirements.
- `apps/web/src/views/LandingPageView.spec.ts` - Guards the existing landing CTA reduced-motion behavior.
- `.planning/phases/48-visual-qa-accessibility/evidence/desktop-checklist.md` - Records Plan 04 visual and reduced-motion pass evidence.

## Decisions Made

- Kept screenshot evidence unchanged because no row moved from `repair-needed` to `pass`; the repairs were source-level hardening of already-passing desktop evidence.
- Did not add reduced-motion blocks to memories components that have no non-essential animation or transform-based hover movement.
- Left decorative `alt=""` images and test-helper empty override objects unchanged; they are intentional accessibility/test patterns, not stubs.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- The landing/journal/memories screenshot rows were already passing, but source audit found long-text and reduced-motion risks not fully guarded by tests. These were handled within the planned TDD visual/motion tasks.
- Scope grep for landing/journal found the pre-existing landing sentence `收藏每一段回忆`; no favorite/collection affordance or new product entry was introduced by this plan.

## Auth Gates

None.

## Known Stubs

None found. The `alt=""`, `= {}` test helper defaults, and `= null` auth/test states found by the stub scan are intentional decorative-image, helper-default, or state-machine patterns.

## Threat Flags

None. Changes stayed within existing client-side Vue/CSS surfaces and did not add endpoints, auth paths, file access, schemas, or new trust boundaries.

## Verification

- `pnpm --filter @trip-map/web test -- src/views/LandingPageView.spec.ts src/views/TimelinePageView.spec.ts src/components/timeline/TimelineVisitCard.spec.ts` - passed, 34 tests.
- `pnpm --filter @trip-map/web test -- src/views/StatisticsPageView.spec.ts src/components/memories/MemoriesChartGrid.spec.ts src/components/memories/PopularFootprintsList.spec.ts src/components/memories/MemoryPostcardStrip.spec.ts` - passed, 25 tests.
- `pnpm --filter @trip-map/web test -- src/views/LandingPageView.spec.ts src/views/TimelinePageView.spec.ts src/components/timeline/TimelineVisitCard.spec.ts src/views/StatisticsPageView.spec.ts src/components/memories/MemoriesChartGrid.spec.ts src/components/memories/PopularFootprintsList.spec.ts src/components/memories/MemoryPostcardStrip.spec.ts` - passed, 63 tests.
- `grep -n "48-04-reduced-motion" .planning/phases/48-visual-qa-accessibility/evidence/desktop-checklist.md` - found the Plan 04 reduced-motion evidence row.
- `grep -n "prefers-reduced-motion" apps/web/src/components/landing/LandingHero.vue apps/web/src/components/landing/LandingTreasurePanel.vue apps/web/src/views/TimelinePageView.vue apps/web/src/components/timeline/TimelineVisitCard.vue apps/web/src/views/StatisticsPageView.vue apps/web/src/components/memories/MemoriesChartGrid.vue apps/web/src/components/memories/PopularFootprintsList.vue apps/web/src/components/memories/MemoryPostcardStrip.vue` - found guards in `LandingHero.vue`, `TimelinePageView.vue`, `TimelineVisitCard.vue`, and `StatisticsPageView.vue`.

## TDD Gate Compliance

- RED commit exists for Task 1: `2247a31`.
- GREEN commit exists for Task 1 after RED: `8357ac4`.
- RED commit exists for Task 2: `30ea6c4`.
- GREEN commit exists for Task 2 after RED: `4777cd6`.
- RED commit exists for Task 3: `f2f58e9`.
- GREEN commit exists for Task 3 after RED: `a7550dd`.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

Phase 48 can proceed to Plan 05 with desktop visual long-text and reduced-motion blockers closed for landing, journal, and memories surfaces.

## Self-Check: PASSED

- Found `.planning/phases/48-visual-qa-accessibility/48-04-SUMMARY.md`.
- Found Task 1 RED commit `2247a31`.
- Found Task 1 GREEN commit `8357ac4`.
- Found Task 2 RED commit `30ea6c4`.
- Found Task 2 GREEN commit `4777cd6`.
- Found Task 3 RED commit `f2f58e9`.
- Found Task 3 GREEN commit `a7550dd`.
- Plan-level focused verification passed with 7 files and 63 tests.

---
*Phase: 48-visual-qa-accessibility*
*Completed: 2026-05-27*
