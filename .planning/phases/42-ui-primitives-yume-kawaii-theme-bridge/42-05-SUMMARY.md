# Plan 42-05 Summary

## Objective
Wire the Phase 42 developer showcase route and final smoke gate.

## What Changed

### Task 1: Assemble thin /__ui showcase view
- Created `apps/web/src/components/showcase/UiIconShowcase.vue`:
  - Renders all 8 semantic `KawaiiIcon` examples with product preview labels (世界足迹, 旅途手账, etc.).
- Created `apps/web/src/components/showcase/UiChartShowcase.vue`:
  - Composes `BaseChart` with demo line option, loading, empty, and error states.
- Created `apps/web/src/views/UiShowcaseView.vue`:
  - Thin route-level composition importing `UiPrimitiveShowcase`, `UiIconShowcase`, and `UiChartShowcase`.
  - No stores, APIs, or real travel data.
- Created `apps/web/src/views/UiShowcaseView.spec.ts`:
  - Verifies all showcase sections render.
  - Checks icon `data-icon-name` attributes.
  - Checks chart states (loading, empty, error, demo option).
  - Tests dialog trigger interaction.

### Task 2: Add dev-only /__ui route guard and phase gate
- Updated `apps/web/src/router/index.ts`:
  - Added `/__ui` route before `/:pathMatch(.*)*` with `name: 'ui-showcase'`.
  - Route-level `beforeEnter: () => (import.meta.env.DEV ? true : { path: '/' })`.
  - Lazy-loaded component `() => import('../views/UiShowcaseView.vue')`.
- Extended `apps/web/src/router/index.spec.ts`:
  - Tests `/__ui` route exists before catch-all.
  - Tests production redirect using `vi.stubEnv('DEV', false)`.
  - Existing auth guard tests preserved.

## Verification
- `pnpm run test -- src/router/index.spec.ts src/views/UiShowcaseView.spec.ts` passes (12/12).
- `pnpm run test` passes (415/415).
- `pnpm run build` passes.
- `rg` scan confirms `/__ui` and `ui-showcase` do not appear in product navigation code outside router/view/showcase files.

## Commits
- `feat(42-05): wire dev-only /__ui showcase route and phase gate`
