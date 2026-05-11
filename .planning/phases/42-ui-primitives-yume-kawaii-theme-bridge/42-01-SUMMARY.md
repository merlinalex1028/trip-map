# Plan 42-01 Summary

## Objective
Pin Phase 42 UI foundation dependencies and generate the locked shadcn-vue primitive set with `@` alias support.

## What Changed

### Task 1: Pin Dependencies
- Added exact-version dependencies to `apps/web/package.json`:
  - `echarts@6.0.0`, `vue-echarts@8.0.1`, `@iconify/vue@5.0.1`, `@internationalized/date@3.12.1`
  - `clsx@2.1.1`, `tailwind-merge@3.6.0`, `class-variance-authority@0.7.1`, `reka-ui@2.9.7`
- Added dev dependencies:
  - `@iconify/utils@3.1.3`, `@iconify-json/flat-color-icons@1.2.3`, `@iconify-json/solar@1.2.5`
- Also added `@radix-icons/vue@^1.0.0` to satisfy shadcn-vue generated component imports.
- Updated `pnpm-lock.yaml` via `pnpm install`.

### Task 2: Configure Alias and Generate Primitives
- Added `'@': fromWebRoot('./src')` to `apps/web/vite.config.ts` resolve aliases.
- Added `"@/*": ["./src/*"]` to `apps/web/tsconfig.json` compilerOptions.paths.
- Created `apps/web/components.json` with `style: new-york`, `tailwind.css: src/style.css`, and aliases mapping `ui` and `utils` to `@/components/ui` and `@/lib/utils`.
- Created `apps/web/src/lib/utils.ts` exporting `cn(...inputs: ClassValue[])` using `clsx` and `tailwind-merge`.
- Generated shadcn-vue primitives via `pnpm dlx shadcn-vue@2.6.2 add button card dialog popover calendar tabs sidebar dropdown-menu skeleton scroll-area`.
- All 10 required primitive directories exist under `apps/web/src/components/ui/*`.
- No business UI components (`AuthDialog`, `ConfirmDialog`, `TripDateForm`) were migrated.

## Verification
- `pnpm run typecheck` passes.
- Dependency version strings match researched target values.

## Commits
- `feat(42-01): pin Phase 42 UI foundation dependencies`
- `feat(42-01): configure @ alias and generate shadcn-vue primitives`
