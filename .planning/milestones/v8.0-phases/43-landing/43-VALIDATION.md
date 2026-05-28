---
phase: 43
slug: landing
status: planned
nyquist_compliant: true
wave_0_complete: true
created: 2026-05-11
---

# Phase 43 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.4 + Vue Test Utils 2.4.6 + happy-dom 20.9.0 |
| **Config file** | `apps/web/vitest.config.ts` |
| **Quick run command** | `pnpm --filter @trip-map/web exec vitest run src/router/index.spec.ts src/App.spec.ts src/components/auth/AuthDialog.spec.ts` |
| **Full suite command** | `pnpm --filter @trip-map/web test` |
| **Build/typecheck command** | `pnpm --filter @trip-map/web build` |
| **Estimated runtime** | Focused specs under 30 seconds; full web suite/build depends on local machine state |

---

## Sampling Rate

- **After every task commit:** Run the focused spec for the edited area, usually `src/router/index.spec.ts`, `src/App.spec.ts`, `src/views/LandingPageView.spec.ts`, or `src/components/shell/AuthenticatedAppShell.spec.ts`.
- **After every plan wave:** Run `pnpm --filter @trip-map/web test`.
- **Before `$gsd-verify-work`:** Run `pnpm --filter @trip-map/web test` and `pnpm --filter @trip-map/web build`.
- **Max feedback latency:** Focused specs should stay below 30 seconds; if a focused command becomes slow, split it by route/shell/auth concern.

Planning status note: Phase 43 plans now include `<automated>` verification for every implementation task. The former Wave 0 gaps are covered inside Plans 01-04 as test creation/update tasks rather than a separate Wave 0 plan. The desktop screenshot check remains a blocking human-verify gate in Plan 04 and is intentionally not marked green until execution.

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 43-W0-01 | 43-01 | 1 | AUTH-01 | T-43-03 | Anonymous `/` must render landing without exposing authenticated app state. | component/router | `pnpm --filter @trip-map/web exec vitest run src/App.spec.ts src/views/LandingPageView.spec.ts` | Planned create/update in Plan 01/03 | pending |
| 43-W0-02 | 43-02 | 2 | AUTH-02 | T-43-01 | Authenticated `/` must resolve to `/map`; no redirect intent is preserved. | router unit | `pnpm --filter @trip-map/web exec vitest run src/router/index.spec.ts` | Planned update in Plan 02 | pending |
| 43-W0-03 | 43-02 | 2 | AUTH-03 | T-43-04 | Anonymous `/map`, `/journal`, and `/memories` must route to `/`; backend guards remain authoritative. | router unit | `pnpm --filter @trip-map/web exec vitest run src/router/index.spec.ts` | Planned update in Plan 02 | pending |
| 43-W0-04 | 43-01 | 1 | AUTH-04 | T-43-02 | Landing CTAs open `AuthDialog` in `register` or `login` mode without adding a second auth system. | component | `pnpm --filter @trip-map/web exec vitest run src/views/LandingPageView.spec.ts src/components/auth/AuthDialog.spec.ts` | Planned create/update in Plan 01/02 | pending |
| 43-W0-05 | 43-02 | 2 | AUTH-05 | T-43-01 / T-43-04 | Login/register success hydrates the existing auth snapshot and navigates to `/map`. | component/store | `pnpm --filter @trip-map/web exec vitest run src/components/auth/AuthDialog.spec.ts src/stores/auth-session.spec.ts src/App.spec.ts` | Planned update in Plan 02/03 | pending |
| 43-W0-06 | 43-03 | 2 | SHELL-01 | — | Authenticated shell shows exactly the three allowed nav entries. | component | `pnpm --filter @trip-map/web exec vitest run src/components/shell/AuthenticatedAppShell.spec.ts src/App.spec.ts` | Planned create/update in Plan 03 | pending |
| 43-W0-07 | 43-03 | 2 | SHELL-02 | — | Sidebar shows avatar + username + one illustration; no collection, summary, stats, badges, or progress UI. | component | `pnpm --filter @trip-map/web exec vitest run src/components/shell/AuthenticatedAppShell.spec.ts` | Planned create in Plan 03 | pending |
| 43-W0-08 | 43-03 | 2 | SHELL-03 | — | Mobile-specific shell behavior is intentionally not required by Phase 43 context. | component/doc assertion | `pnpm --filter @trip-map/web exec vitest run src/components/shell/AuthenticatedAppShell.spec.ts` | Planned assertion in Plan 03 | pending |
| 43-W0-09 | 43-04 | 3 | SHELL-04 | — | Route-facing copy uses `世界足迹`, `旅途手账`, `旅途回忆`, and Phase 43-owned `留下足迹`. | component + grep audit | `pnpm --filter @trip-map/web exec vitest run src/router/index.spec.ts src/App.spec.ts src/views/TimelinePageView.spec.ts src/views/StatisticsPageView.spec.ts` | Planned update in Plan 04 | pending |

*Status values: pending, green, red, flaky.*

---

## Wave 0 Requirements

- [x] `apps/web/src/views/LandingPageView.spec.ts` — planned in 43-01 to cover AUTH-01 and AUTH-04.
- [x] `apps/web/src/components/shell/AuthenticatedAppShell.spec.ts` — planned in 43-03 to cover SHELL-01, SHELL-02, and the SHELL-03 context override.
- [x] `apps/web/src/router/index.spec.ts` — planned in 43-02/43-04 for `/`, `/map`, `/journal`, `/memories`, and no `/timeline` / `/statistics` compatibility.
- [x] `apps/web/src/App.spec.ts` and `apps/web/src/App.kawaii.spec.ts` — planned in 43-03/43-04 for public landing versus authenticated app shell branching.
- [x] `apps/web/src/components/auth/AuthDialog.spec.ts` — planned in 43-02 for post-login/register navigation expectations to `/map`.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Desktop landing high-fidelity frame uses the selected v8 slices without obvious mis-layering. | AUTH-01 | Full visual QA belongs to Phase 48, but Phase 43 has a high-fidelity landing risk that unit tests cannot prove. | In Plan 04 Task 3, run the app locally, visit `/` as anonymous, and check `1366x768`, `1440x900`, `1536x1024`, and `1920x1080`; confirm `1536px` centered stage, `1672px` background bleed without horizontal scroll, hero offset near `clamp(96px, 9vw, 144px)` and `128px` top, CTA panel dimensions, real DOM text, and no viewport-width font scaling. |
| Authenticated `/map` app shell uses the desktop shell contract. | SHELL-01 / SHELL-02 | Unit tests can assert structure, but desktop spacing/overlap needs a browser viewport pass. | In Plan 04 Task 3, log in/register, visit `/map`, and check `1366x768`, `1440x900`, `1536x1024`, and `1920x1080`; confirm `280px` left sidebar, exactly three nav entries, no old topbar/mobile drawer/bottom nav, and no main-content/sidebar overlap. |
| Sidebar illustration and avatar use selected semantic assets, not raw Chinese design filenames. | SHELL-02 | Asset choice requires visual inspection and file naming review. | Inspect rendered authenticated shell and verify product code imports assets from `apps/web/src/assets/v8/...` with English kebab-case filenames. |

---

## Validation Sign-Off

- [x] All implementation tasks have `<automated>` verify commands.
- [x] Sampling continuity: no 3 consecutive implementation tasks without automated verify.
- [x] Former Wave 0 gaps are assigned to concrete Phase 43 plans.
- [x] No watch-mode flags.
- [x] Feedback latency target is below 30 seconds for focused specs.
- [x] `nyquist_compliant: true` set in frontmatter after validation tasks are planned.
- [ ] Plan 04 blocking browser screenshot gate passes during execution.

**Approval:** pending
