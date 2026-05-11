---
phase: 43
slug: landing
status: draft
nyquist_compliant: false
wave_0_complete: false
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

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 43-W0-01 | TBD | 0 | AUTH-01 | T-43-03 | Anonymous `/` must render landing without exposing authenticated app state. | component/router | `pnpm --filter @trip-map/web exec vitest run src/App.spec.ts src/views/LandingPageView.spec.ts` | Missing: `apps/web/src/views/LandingPageView.spec.ts` | pending |
| 43-W0-02 | TBD | 0 | AUTH-02 | T-43-01 | Authenticated `/` must resolve to `/map`; no redirect intent is preserved. | router unit | `pnpm --filter @trip-map/web exec vitest run src/router/index.spec.ts` | Exists, update required | pending |
| 43-W0-03 | TBD | 0 | AUTH-03 | T-43-04 | Anonymous `/map`, `/journal`, and `/memories` must route to `/`; backend guards remain authoritative. | router unit | `pnpm --filter @trip-map/web exec vitest run src/router/index.spec.ts` | Exists, update required | pending |
| 43-W0-04 | TBD | 0 | AUTH-04 | T-43-02 | Landing CTAs open `AuthDialog` in `register` or `login` mode without adding a second auth system. | component | `pnpm --filter @trip-map/web exec vitest run src/views/LandingPageView.spec.ts src/components/auth/AuthDialog.spec.ts` | Missing: `apps/web/src/views/LandingPageView.spec.ts` | pending |
| 43-W0-05 | TBD | 0 | AUTH-05 | T-43-01 / T-43-04 | Login/register success hydrates the existing auth snapshot and navigates to `/map`. | component/store | `pnpm --filter @trip-map/web exec vitest run src/components/auth/AuthDialog.spec.ts src/stores/auth-session.spec.ts src/App.spec.ts` | Exists, update required | pending |
| 43-W0-06 | TBD | 0 | SHELL-01 | — | Authenticated shell shows exactly the three allowed nav entries. | component | `pnpm --filter @trip-map/web exec vitest run src/components/shell/AuthenticatedAppShell.spec.ts src/App.spec.ts` | Missing: `apps/web/src/components/shell/AuthenticatedAppShell.spec.ts` | pending |
| 43-W0-07 | TBD | 0 | SHELL-02 | — | Sidebar shows avatar + username + one illustration; no collection, summary, stats, badges, or progress UI. | component | `pnpm --filter @trip-map/web exec vitest run src/components/shell/AuthenticatedAppShell.spec.ts` | Missing: `apps/web/src/components/shell/AuthenticatedAppShell.spec.ts` | pending |
| 43-W0-08 | TBD | 0 | SHELL-03 | — | Mobile-specific shell behavior is intentionally not required by Phase 43 context. | component/doc assertion | `pnpm --filter @trip-map/web exec vitest run src/components/shell/AuthenticatedAppShell.spec.ts` | Missing: `apps/web/src/components/shell/AuthenticatedAppShell.spec.ts` | pending |
| 43-W0-09 | TBD | 0 | SHELL-04 | — | Route-facing copy uses `世界足迹`, `旅途手账`, `旅途回忆`, and Phase 43-owned `留下足迹`. | component + grep audit | `pnpm --filter @trip-map/web exec vitest run src/router/index.spec.ts src/App.spec.ts src/views/TimelinePageView.spec.ts src/views/StatisticsPageView.spec.ts` | Exists, update required | pending |

*Status values: pending, green, red, flaky.*

---

## Wave 0 Requirements

- [ ] `apps/web/src/views/LandingPageView.spec.ts` — covers AUTH-01 and AUTH-04.
- [ ] `apps/web/src/components/shell/AuthenticatedAppShell.spec.ts` — covers SHELL-01, SHELL-02, and the SHELL-03 context override.
- [ ] `apps/web/src/router/index.spec.ts` — update for `/`, `/map`, `/journal`, `/memories`, and no `/timeline` / `/statistics` compatibility.
- [ ] `apps/web/src/App.spec.ts` and `apps/web/src/App.kawaii.spec.ts` — update for public landing versus authenticated app shell branching.
- [ ] `apps/web/src/components/auth/AuthDialog.spec.ts` — update post-login/register navigation expectations to `/map`.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Desktop landing high-fidelity frame uses the selected v8 slices without obvious mis-layering. | AUTH-01 | Full visual QA belongs to Phase 48, but Phase 43 has a high-fidelity landing risk that unit tests cannot prove. | Run the app locally, visit `/` as anonymous on a desktop viewport, and compare against `prd/v8.0/UI/落地页.png`; confirm upper/lower background slices and interactive DOM overlays are visible. |
| Sidebar illustration and avatar use selected semantic assets, not raw Chinese design filenames. | SHELL-02 | Asset choice requires visual inspection and file naming review. | Inspect rendered authenticated shell and verify product code imports assets from `apps/web/src/assets/v8/...` with English kebab-case filenames. |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies.
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify.
- [ ] Wave 0 covers all missing references listed above.
- [ ] No watch-mode flags.
- [ ] Feedback latency target is below 30 seconds for focused specs.
- [ ] `nyquist_compliant: true` set in frontmatter after Wave 0 validation tasks are planned.

**Approval:** pending
