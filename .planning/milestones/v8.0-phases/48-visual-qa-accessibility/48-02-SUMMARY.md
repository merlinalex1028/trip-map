---
phase: 48-visual-qa-accessibility
plan: 02
subsystem: accessibility
tags: [vue, vitest, auth, sidebar, aria, keyboard, focus]

requires:
  - phase: 48-visual-qa-accessibility
    provides: "Desktop evidence harness, fixed QA account, screenshots, and checklist baseline"
provides:
  - "Auth dialog keyboard/focus/error-status regression coverage"
  - "Auth submit errors linked to the dialog through aria-describedby"
  - "Authenticated sidebar limited to map, journal, and memories destinations"
  - "Current-route aria-current and long username containment coverage"
affects: [phase-48, auth-dialog, authenticated-shell, sidebar-navigation, visual-qa]

tech-stack:
  added: []
  patterns:
    - "Component accessibility repairs backed by focused Vitest component gates"
    - "Sidebar navigation assertions use stable data-nav-key route identifiers"

key-files:
  created:
    - .planning/phases/48-visual-qa-accessibility/48-02-SUMMARY.md
  modified:
    - apps/web/src/components/auth/AuthDialog.vue
    - apps/web/src/components/auth/AuthDialog.spec.ts
    - apps/web/src/components/shell/ShellSidebar.vue
    - apps/web/src/components/shell/AuthenticatedAppShell.vue
    - apps/web/src/components/shell/AuthenticatedAppShell.spec.ts
    - .planning/phases/48-visual-qa-accessibility/evidence/desktop-checklist.md

key-decisions:
  - "Sidebar active app destinations are limited to `map`, `journal`, and `memories` for QA-03."
  - "Auth submit errors describe the open dialog only while a submit error is present."

patterns-established:
  - "Auth dialog specs must cover focus entry, close focus restoration, tab semantics, and readable submit errors."
  - "Authenticated sidebar specs must assert the visible destination set and the active link's aria-current state."

requirements-completed: [QA-03]

duration: 12min
completed: 2026-05-27
---

# Phase 48 Plan 02: Auth Shell Accessibility Summary

**Keyboard and ARIA gates for the auth entry plus three-link authenticated sidebar with long username containment**

## Performance

- **Duration:** 12min
- **Started:** 2026-05-27T11:28:08Z
- **Completed:** 2026-05-27T11:39:30Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments

- Added focused auth dialog tests for focus entry, close focus restoration, tablist/tab semantics, and readable submit errors.
- Linked auth submit errors to the dialog with `aria-describedby` and a stable `auth-submit-error` alert id.
- Repaired the authenticated sidebar to expose only `世界足迹`, `旅途手账`, and `旅途回忆` as active app destinations.
- Added current-route `aria-current="page"` and long QA username containment coverage for the 280px sidebar.
- Updated the desktop checklist with `48-02-auth-shell-a11y` evidence rows.

## Task Commits

1. **Task 1 RED: Auth dialog accessibility gate** - `6404b9d` (test)
2. **Task 1 GREEN: Auth dialog error status repair** - `6a8d10f` (fix)
3. **Task 2 RED: Sidebar accessibility gate** - `aa948d5` (test)
4. **Task 2 GREEN: Sidebar navigation semantics repair** - `fe55979` (fix)

_Note: Both tasks used the plan's TDD flow, so each task has a RED test commit followed by a GREEN fix commit._

## Files Created/Modified

- `apps/web/src/components/auth/AuthDialog.vue` - Adds conditional `aria-describedby` linking submit errors to the dialog.
- `apps/web/src/components/auth/AuthDialog.spec.ts` - Covers focus entry, focus restoration, tabs, and readable auth submit errors.
- `apps/web/src/components/shell/ShellSidebar.vue` - Limits navigation to the three active app routes, exposes `data-nav-key`, and tags username containment.
- `apps/web/src/components/shell/AuthenticatedAppShell.vue` - Restores the authenticated sidebar width contract to 280px.
- `apps/web/src/components/shell/AuthenticatedAppShell.spec.ts` - Covers three-route navigation, active link semantics, and long username containment.
- `.planning/phases/48-visual-qa-accessibility/evidence/desktop-checklist.md` - Records auth/sidebar QA-03 evidence under `48-02-auth-shell-a11y`.

## Decisions Made

- Kept the auth dialog custom implementation and added only the missing error-description relationship; focus behavior already existed and is now guarded.
- Removed disabled sidebar destinations from the active navigation model because Phase 48's threat model requires the nav model to stay limited to `map`, `journal`, and `memories`.
- Kept logout placement unchanged because the existing shell marks it as pending design review; this plan's acceptance criteria centered on the auth entry and the three active sidebar links.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Linked auth submit errors to the dialog**
- **Found during:** Task 1 (Gate auth entry keyboard and readable status behavior)
- **Issue:** The dialog displayed `role="alert"` text, but the dialog did not reference the error as its readable description.
- **Fix:** Added conditional `aria-describedby` and stable `auth-submit-error` id.
- **Files modified:** `apps/web/src/components/auth/AuthDialog.vue`, `apps/web/src/components/auth/AuthDialog.spec.ts`
- **Verification:** `pnpm --filter @trip-map/web test -- src/components/auth/AuthDialog.spec.ts`
- **Committed in:** `6a8d10f`

**2. [Rule 1 - Bug] Repaired sidebar route vocabulary and destination set**
- **Found during:** Task 2 (Gate sidebar navigation semantics and long username containment)
- **Issue:** The sidebar still rendered extra disabled destinations and used `atlas` / `旅行图鉴` for `/memories`.
- **Fix:** Limited `navItems` to `map`, `journal`, and `memories`, changed the memories label to `旅途回忆`, added stable `data-nav-key`, and restored the 280px width contract.
- **Files modified:** `apps/web/src/components/shell/ShellSidebar.vue`, `apps/web/src/components/shell/AuthenticatedAppShell.vue`, `apps/web/src/components/shell/AuthenticatedAppShell.spec.ts`
- **Verification:** `pnpm --filter @trip-map/web test -- src/components/shell/AuthenticatedAppShell.spec.ts`; `grep -n "aria-current" apps/web/src/components/shell/ShellSidebar.vue apps/web/src/components/shell/AuthenticatedAppShell.spec.ts`
- **Committed in:** `fe55979`

---

**Total deviations:** 2 auto-fixed (Rule 1: 1, Rule 2: 1)
**Impact on plan:** Both fixes were required for QA-03 correctness and stayed within the auth/sidebar files named by the plan.

## Issues Encountered

- The existing sidebar spec still reflected the older high-fidelity six-item shell contract. It was updated to the Phase 48 QA-03 contract before production changes.

## Auth Gates

None.

## Known Stubs

| File | Line | Reason |
|---|---:|---|
| `apps/web/src/components/shell/AuthenticatedAppShell.spec.ts` | 148 | Pre-existing skipped logout tests remain because logout placement is still pending design review in the existing shell contract. |

## Threat Flags

None. Changes were limited to existing client-side auth/sidebar accessibility surfaces and did not add endpoints, auth bypasses, file access, or schema changes.

## Verification

- `pnpm --filter @trip-map/web test -- src/components/auth/AuthDialog.spec.ts` - passed, 10 tests.
- `pnpm --filter @trip-map/web test -- src/components/shell/AuthenticatedAppShell.spec.ts` - passed, 5 tests and 2 pre-existing skipped logout tests.
- `pnpm --filter @trip-map/web test -- src/components/auth/AuthDialog.spec.ts src/components/shell/AuthenticatedAppShell.spec.ts` - passed, 15 tests and 2 skipped.
- `grep -n "aria-current" apps/web/src/components/shell/ShellSidebar.vue apps/web/src/components/shell/AuthenticatedAppShell.spec.ts` - found source and spec assertions.

## TDD Gate Compliance

- RED commit exists for Task 1: `6404b9d`.
- GREEN commit exists for Task 1 after RED: `6a8d10f`.
- RED commit exists for Task 2: `aa948d5`.
- GREEN commit exists for Task 2 after RED: `fe55979`.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

Phase 48 can continue to Plan 03 with the auth entry and authenticated sidebar QA-03 surface covered by focused regression tests and checklist evidence.

## Self-Check: PASSED

- Found `.planning/phases/48-visual-qa-accessibility/48-02-SUMMARY.md`.
- Found Task 1 RED commit `6404b9d`.
- Found Task 1 GREEN commit `6a8d10f`.
- Found Task 2 RED commit `aa948d5`.
- Found Task 2 GREEN commit `fe55979`.

---
*Phase: 48-visual-qa-accessibility*
*Completed: 2026-05-27*
