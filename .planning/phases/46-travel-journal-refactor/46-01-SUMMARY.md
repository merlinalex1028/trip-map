---
phase: 46-travel-journal-refactor
plan: 01
subsystem: ui
tags: [vue, vitest, router, shell, journal]
requires:
  - phase: 43-landing
    provides: authenticated shell and locked /journal route vocabulary
provides:
  - locked /journal route and legacy /timeline fallthrough tests
  - journal absence tests for add, collection, favorite, upload, and photo affordances
  - authenticated shell navigation reduced to world footprints, journal, and memories
affects: [travel-journal, authenticated-shell, route-guards]
tech-stack:
  added: []
  patterns:
    - TDD RED/GREEN commits for route/page and shell contracts
    - black-box Vue Test Utils assertions for forbidden UI surfaces
key-files:
  created:
    - .planning/phases/46-travel-journal-refactor/46-01-SUMMARY.md
  modified:
    - apps/web/src/components/shell/ShellSidebar.vue
    - apps/web/src/components/shell/AuthenticatedAppShell.spec.ts
    - apps/web/src/views/TimelinePageView.vue
    - apps/web/src/views/TimelinePageView.spec.ts
    - apps/web/src/router/index.spec.ts
key-decisions:
  - "The journal page header no longer renders a populated-state /map utility action; empty state owns the only /map guidance."
  - "The authenticated shell nav model exposes only map, journal, and memories entries."
patterns-established:
  - "Forbidden-affordance tests assert both user-visible copy and stable data selectors."
requirements-completed: [JOURNAL-01, JOURNAL-04, JOURNAL-05, JOURNAL-06]
duration: 8 min
completed: 2026-05-19
---

# Phase 46 Plan 01: Travel Journal Contract Summary

**Route, shell, and absence contracts now prevent legacy timeline paths, local add-trip affordances, and collection/favorite surfaces from returning to the travel journal.**

## Performance

- **Duration:** 8 min
- **Started:** 2026-05-19T02:51:00Z
- **Completed:** 2026-05-19T02:58:41Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments

- Added TDD route/page tests proving `/journal` stays protected as `travel-journal` while the legacy timeline path falls through to `/`.
- Added journal page absence tests for `添加新旅行`, `我的收藏`, `收藏`, upload/photo copy, and favorite/add selectors.
- Removed the extra journal header `/map` action so the empty state has exactly one allowed `/map` link: `去世界足迹留下足迹`.
- Reduced authenticated shell navigation to `世界足迹`, `旅途手账`, and `旅途回忆`.

## Task Commits

1. **Task 1 RED: Lock journal route and forbidden-affordance tests** - `40c2c02` (test)
2. **Task 1 GREEN: Enforce journal route absence contracts** - `7d2df4e` (feat)
3. **Task 2 RED: Shell navigation contract tests** - `5931114` (test)
4. **Task 2 GREEN: Remove excluded shell navigation entries** - `7519040` (feat)

**Plan metadata:** this summary commit

## Files Created/Modified

- `apps/web/src/components/shell/ShellSidebar.vue` - Authenticated sidebar nav is now exactly `map`, `journal`, and `memories`; disabled collection/future entries were removed.
- `apps/web/src/components/shell/AuthenticatedAppShell.spec.ts` - Shell tests now assert the three real nav keys, three icon images, absent collection/future copy, and active `/journal`.
- `apps/web/src/views/TimelinePageView.vue` - Removed the journal header map utility action so empty state is the only journal-local map guidance.
- `apps/web/src/views/TimelinePageView.spec.ts` - Added empty-state `/map` only and forbidden-affordance absence coverage.
- `apps/web/src/router/index.spec.ts` - Added explicit `/journal` protected route and legacy timeline fallthrough coverage using string concatenation.
- `.planning/phases/46-travel-journal-refactor/46-01-SUMMARY.md` - Execution summary.

## Decisions Made

- Kept `/journal` as the only journal route and did not add any `/timeline` alias or compatibility path.
- Removed excluded shell entries from the rendered nav model instead of hiding them with CSS.
- Changed the shell user level copy from `Lv.5 旅行收藏家` to `Lv.5 资深旅行家` so the shell does not expose collection wording.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Removed the journal header map action**
- **Found during:** Task 1 (Lock journal route and forbidden-affordance tests)
- **Issue:** The new empty-state test failed because `TimelinePageView.vue` rendered two `/map` links: the allowed empty-state CTA plus a header utility action. D-04/D-05 require only empty-state map guidance and no replacement header/tool affordance.
- **Fix:** Removed the header `返回世界足迹` link from `TimelinePageView.vue`.
- **Files modified:** `apps/web/src/views/TimelinePageView.vue`
- **Verification:** `pnpm --filter @trip-map/web test -- router TimelinePageView`
- **Committed in:** `7d2df4e`

**2. [Rule 2 - Missing Critical] Removed residual collection wording from shell profile copy**
- **Found during:** Task 2 (Remove collection and disabled future entries from authenticated shell)
- **Issue:** The nav cleanup removed `我的收藏`, but the profile level still said `Lv.5 旅行收藏家`, leaving collection language visible inside the authenticated shell.
- **Fix:** Changed the profile level to `Lv.5 资深旅行家`.
- **Files modified:** `apps/web/src/components/shell/ShellSidebar.vue`
- **Verification:** `pnpm --filter @trip-map/web test -- AuthenticatedAppShell TimelinePageView`
- **Committed in:** `7519040`

---

**Total deviations:** 2 auto-fixed (Rule 2: 2)
**Impact on plan:** Both fixes enforce existing D-04/D-05 correctness requirements. No new routes, features, dependencies, or data surfaces were added.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Known Stubs

- `apps/web/src/components/shell/AuthenticatedAppShell.spec.ts:124` has a pre-existing skipped logout TODO from Phase 43. It was not introduced by this plan and does not affect the 46-01 navigation or journal absence contracts.

## Threat Flags

None.

## Verification

- `pnpm --filter @trip-map/web test -- router TimelinePageView` - passed, 53 files / 461 tests.
- `pnpm --filter @trip-map/web test -- AuthenticatedAppShell TimelinePageView` - passed, 53 files / 461 tests.
- `pnpm --filter @trip-map/web test -- router TimelinePageView AuthenticatedAppShell` - passed, 53 files / 461 tests.
- `rg -n "path: '/timeline'|/timeline|name: 'timeline'" apps/web/src/router/index.ts apps/web/src/router/index.spec.ts` - no matches.
- `rg -n "添加新旅行|我的收藏|data-card-favorite|data-journal-add-trip|data-journal-create|data-journal-favorite|旅行照片|上传|照片" apps/web/src/views/TimelinePageView.vue apps/web/src/components/shell/ShellSidebar.vue` - no matches.

## Next Phase Readiness

Ready for downstream visual journal implementation. Future plans must keep the route, empty-state, shell, and forbidden-affordance tests green while building the journal stream and card visuals.

## Self-Check: PASSED

- Summary file exists at `.planning/phases/46-travel-journal-refactor/46-01-SUMMARY.md`.
- Task commits found: `40c2c02`, `7d2df4e`, `5931114`, `7519040`.
- `.planning/ROADMAP.md` and `.planning/REQUIREMENTS.md` were not modified by this plan.
- `.planning/STATE.md` had an existing unstaged modification and was intentionally left unstaged for the orchestrator.

---
*Phase: 46-travel-journal-refactor*
*Completed: 2026-05-19*
