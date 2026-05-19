---
phase: 46-travel-journal-refactor
plan: 03
subsystem: ui
tags: [vue, vitest, travel-journal, dropdown-menu, accessibility]

requires:
  - phase: 46-travel-journal-refactor
    provides: Plan 46-02 journal helpers and decorative postcard thumbnail
provides:
  - Reading-first journal visit cards with deterministic decorative postcards
  - Quiet edit/delete management menu preserving inline edit and confirmation lifecycle
  - Focused card coverage for required journal fields, absence contracts, and CRUD flows
affects: [travel-journal, journal-cards, timeline]

tech-stack:
  added: []
  patterns:
    - TDD RED/GREEN commits for component behavior
    - shadcn-vue DropdownMenu for quiet card management actions
    - Vue computed values consuming pure journal helper outputs

key-files:
  created:
    - .planning/phases/46-travel-journal-refactor/46-03-SUMMARY.md
  modified:
    - apps/web/src/components/timeline/TimelineVisitCard.vue
    - apps/web/src/components/timeline/TimelineVisitCard.spec.ts

key-decisions:
  - "TimelineVisitCard keeps edit/delete lifecycle ownership while moving triggers into a quiet management menu."
  - "Readonly card rendering uses Plan 46-02 helper outputs and Vue interpolation only; no new record APIs or store paths were added."

patterns-established:
  - "Card readonly hierarchy: date, repeat badge when needed, place, natural location path, `旅行摘记`, summary, limited tag stickers, decorative postcard."
  - "Management menu contract: `data-card-management` trigger named `管理这条旅行记录`, with only `编辑` and `删除` actions."

requirements-completed: [JOURNAL-02, JOURNAL-03, JOURNAL-04, JOURNAL-05]

duration: 8min
completed: 2026-05-19
---

# Phase 46 Plan 03: Reading-First Journal Card Summary

**Timeline visit cards now read as travel journal postcards while edit and delete remain available through a quiet two-action management menu.**

## Performance

- **Duration:** 8 min
- **Started:** 2026-05-19T03:06:34Z
- **Completed:** 2026-05-19T03:14:02Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- Converted the readonly visit card from management-record blocks into a reading-first journal hierarchy with date, place, natural location path, `旅行摘记`, summary fallback, visible tag stickers, hidden tag count, repeat badge, and deterministic postcard.
- Integrated `JournalPostcardThumb.vue` and Plan 46-02 helpers without changing timeline/store data contracts.
- Moved edit/delete into a compact shadcn-vue dropdown trigger named `管理这条旅行记录`, with only `编辑` and `删除`.
- Preserved `TimelineEditForm` submit/cancel behavior and `ConfirmDialog` destructive delete behavior, including the final-record title.

## Task Commits

1. **Task 1 RED: Journal card hierarchy tests** - `66d35e5` (test)
2. **Task 1 GREEN: Reading-first postcard card** - `17eff1c` (feat)
3. **Task 2 RED: Quiet management menu tests** - `03bb150` (test)
4. **Task 2 GREEN: Dropdown management actions** - `24d2ae6` (feat)

**Plan metadata:** this summary commit

## Files Created/Modified

- `apps/web/src/components/timeline/TimelineVisitCard.vue` - Renders helper-derived journal content, decorative postcard, limited tag stickers, repeat badge, and quiet edit/delete dropdown.
- `apps/web/src/components/timeline/TimelineVisitCard.spec.ts` - Covers journal content hierarchy, postcard accessibility, absence of excluded copy, no `v-html`, management menu actions, edit submit, and delete confirmation.
- `.planning/phases/46-travel-journal-refactor/46-03-SUMMARY.md` - Execution summary.

## Decisions Made

- Used the existing local `DropdownMenu` primitive instead of a custom reveal control because it matches the Phase 46 UI contract and keeps keyboard/menu semantics local to the design system.
- Kept `TimelineVisitCard.vue` as the lifecycle owner for edit and delete so no new mutation path or API boundary was introduced.
- Left single-visit records without a repeat badge; repeated visits render exact `第 N 次 / 共 M 次` copy.

## Deviations from Plan

None - plan executed exactly as written.

## TDD Gate Compliance

- Task 1 RED commit present: `66d35e5`
- Task 1 GREEN commit present after RED: `17eff1c`
- Task 2 RED commit present: `03bb150`
- Task 2 GREEN commit present after RED: `24d2ae6`
- Refactor commits were not needed.

## Issues Encountered

- The first draft of the source-safety spec used a URL form that Vitest did not expose as a `file:` URL in this project. The test was corrected before the RED commit so the failing gate represented real card behavior.

## Known Stubs

None - stub scan found no placeholder/TODO/FIXME or hardcoded empty render values in the modified card files.

## Threat Flags

None - no new network endpoints, auth paths, file access surfaces, or persistence schema changes were introduced.

## User Setup Required

None - no external service configuration required.

## Verification

- `pnpm --filter @trip-map/web test -- TimelineVisitCard` - passed, 53 files / 465 tests / 2 skipped.
- `pnpm --filter @trip-map/web test -- TimelineVisitCard journal-thumbnails timeline` - passed, 53 files / 465 tests / 2 skipped.
- `pnpm --filter @trip-map/web build` - passed.
- `rg -n "v-html|国家 / 地区|备注|照片|上传|data-card-favorite|添加新旅行|我的收藏" apps/web/src/components/timeline/TimelineVisitCard.vue` - no matches.
- `rg -n "border-t border-white/80 pt-4|操作栏|full record-detail|详情|添加|收藏|分享|上传" apps/web/src/components/timeline/TimelineVisitCard.vue` - no matches.

## Next Phase Readiness

Ready for Plan 46-04 to place these cards into the glowing journal stream and route-level Yume Kawaii states while preserving the card selectors and lifecycle tests added here.

## Self-Check: PASSED

- Summary file exists at `.planning/phases/46-travel-journal-refactor/46-03-SUMMARY.md`.
- Task commits found: `66d35e5`, `17eff1c`, `03bb150`, `24d2ae6`.
- `.planning/STATE.md` and `.planning/ROADMAP.md` were not modified by this plan.

---
*Phase: 46-travel-journal-refactor*
*Completed: 2026-05-19*
