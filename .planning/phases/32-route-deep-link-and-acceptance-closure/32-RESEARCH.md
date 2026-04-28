# Phase 32: Route Deep-Link & Acceptance Closure - Research

**Researched:** 2026-04-28 [VERIFIED: current_date]
**Domain:** Vue 3 + Vue Router clean-URL deep-link closure, auth-gated route entry, and Phase 29/30 acceptance/documentation closure [VERIFIED: `.planning/ROADMAP.md` + `.planning/phases/32-route-deep-link-and-acceptance-closure/32-CONTEXT.md`]
**Confidence:** MEDIUM [VERIFIED: codebase inspection + phase docs + official router/Vite docs]

<user_constraints>

## User Constraints (from CONTEXT.md)

Copied verbatim from `.planning/phases/32-route-deep-link-and-acceptance-closure/32-CONTEXT.md`. [VERIFIED: `32-CONTEXT.md`]

### Locked Decisions

- **D-01:** `/timeline` 与 `/statistics` 的 canonical route 继续使用 clean URL；`#/timeline` 与 `#/statistics` 视为历史文档漂移，需要在本阶段清理，而不是恢复成产品契约。
- **D-02:** 保留当前 `createWebHistory()` 路由语义。Phase 32 需要通过与生产部署形态一致的 preview / staging 环境，验证这两个路径的 direct-open / refresh 均有 SPA rewrite / fallback，不返回 404。
- **D-03:** 如果实际托管平台的 rewrite / fallback 配置可以纳入仓库，则本阶段应一并落地对应配置文件；如果部署回退规则只能存在于外部平台配置中，则必须在文档中明确记录该外部契约与验收证据。
- **D-04:** 未登录用户 direct-open `/timeline` 或 `/statistics` 时，应重定向回 `/`，而不是停留在对应页面的 anonymous state。
- **D-05:** 本阶段要锁定的是“未登录路由访问 fail closed 到地图首页”的策略，不扩展为新的认证产品流，也不重做页面文案或视觉层级。
- **D-06:** Phase 32 的部署验收以与生产路由行为一致的 preview / staging 环境为准；不要求把正式生产环境作为本阶段唯一通过门槛。
- **D-07:** `ROADMAP.md`、Phase 29/30 的 `HUMAN-UAT.md`、`VERIFICATION.md` 以及本阶段工件，必须全部与最终运行时路由写法和未登录访问策略一致；旧的 `#/timeline` / `#/statistics` 表述都应视为 drift 并清除。
- **D-08:** 人工 UAT 只覆盖主链路：已登录真实账号、真实旅行数据、桌面宽度与手机宽度下的 Timeline / Statistics 浏览与可读性。
- **D-09:** 人工 UAT 必须显式覆盖 `/timeline` 与 `/statistics` 的 direct-open 和 refresh 行为。
- **D-10:** anonymous state 与 empty state 不新增为本阶段的人肉验收范围；除非未登录重定向策略改动引出新的回归，否则沿用现有自动化覆盖即可。

### Claude's Discretion

- 路由层是使用 `beforeEach`、per-route guard、还是组件级最小重定向来实现未登录回首页，由规划与实现阶段决定，但必须保持行为一致且改动最小。
- 若发现现有 anonymous page shell 仍有测试价值，可以保留为实现兜底；若会造成契约漂移，也可以在不扩大范围的前提下收敛或移除。
- 具体采用哪种平台配置文件（若平台可仓库化）或如何记录外部平台 fallback runbook，由规划阶段依据实际部署目标决定。
- HUMAN-UAT / VERIFICATION / ROADMAP 的具体措辞、证据格式和状态回写顺序，由规划阶段决定，但必须维持 clean URL 契约和 preview/staging 验收边界。

### Deferred Ideas (OUT OF SCOPE)

None - discussion stayed within phase scope.

</user_constraints>

## Project Constraints (from CLAUDE.md)

- Always reply in Chinese to the user. [VERIFIED: `CLAUDE.md`]
- Explain the operation before implementation. [VERIFIED: `CLAUDE.md`]
- Keep code changes minimal and consistent with the existing project structure and style. [VERIFIED: `CLAUDE.md`]
- Frontend changes must use Vue 3 Composition API with `<script setup lang="ts">`. [VERIFIED: `CLAUDE.md`]
- Pinia is the frontend state-management standard. [VERIFIED: `CLAUDE.md`]
- Frontend automated tests run on Vitest with `happy-dom`. [VERIFIED: `CLAUDE.md` + `apps/web/vitest.config.ts`]
- Package-level commands should use `pnpm --filter @trip-map/web ...`. [VERIFIED: `CLAUDE.md` + `package.json`]
- No additional project skill files were discovered under `.claude/skills/` or `.agents/skills/`. [VERIFIED: repo `find .claude -maxdepth 3 -type f`]

<phase_requirements>

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| `TRIP-04` | 已登录用户可以从点击用户名后展开的面板进入独立的旅行时间轴页面 | Existing menu entry and clean `/timeline` route already exist; Phase 32 must keep them while locking unauthenticated direct-open to `/` and proving preview/staging deep-link behavior. [VERIFIED: `.planning/REQUIREMENTS.md` + `apps/web/src/components/auth/AuthTopbarControl.vue` + `apps/web/src/router/index.ts`] |
| `TRIP-05` | 用户可以在时间轴页面按时间顺序查看自己的旅行记录 | Timeline rendering and ordering are already implemented; Phase 32 only needs route-entry policy closure, deploy acceptance, and doc/UAT closure around the existing page. [VERIFIED: `.planning/REQUIREMENTS.md` + `apps/web/src/views/TimelinePageView.vue` + `.planning/phases/29-timeline-page-and-account-entry/29-VERIFICATION.md`] |
| `STAT-01` | 用户可以查看基础旅行统计，包括总旅行次数、已去过地点数和已去过国家/地区数 | Statistics page and topbar entry already exist; Phase 32 must close direct-open/refresh acceptance and align docs with the clean `/statistics` contract. [VERIFIED: `.planning/REQUIREMENTS.md` + `apps/web/src/views/StatisticsPageView.vue` + `.planning/phases/30-travel-statistics-and-completion-overview/30-VERIFICATION.md`] |
| `STAT-02` | 用户可以查看国家/地区完成度 | Completion semantics are already server-authoritative and Phase 31 closed metadata-refresh drift; Phase 32 must prove deploy routing and complete human acceptance/doc status closure. [VERIFIED: `.planning/REQUIREMENTS.md` + `.planning/phases/31-statistics-sync-refresh-hardening/31-CONTEXT.md` + `.planning/phases/30-travel-statistics-and-completion-overview/30-VERIFICATION.md`] |

</phase_requirements>

## Summary

Phase 32 is a closure phase over existing `/timeline` and `/statistics` routes, not a redesign or feature-expansion phase. [VERIFIED: `.planning/ROADMAP.md` + `32-CONTEXT.md` + `32-UI-SPEC.md`] The repo already uses `createWebHistory()` with clean paths `/timeline` and `/statistics`, and the authenticated topbar already navigates to those paths. [VERIFIED: `apps/web/src/router/index.ts` + `apps/web/src/components/auth/AuthTopbarControl.vue`] The remaining runtime gaps are outside the core feature implementation: no repo-visible production SPA rewrite/fallback evidence exists, and both route views still treat anonymous access as a stable route-local end state. [VERIFIED: `apps/web/vite.config.ts` + `apps/server/src/main.ts` + repo grep for hosting config files + `TimelinePageView.vue` + `StatisticsPageView.vue`]

For planning, the work splits cleanly into two responsibilities. [VERIFIED: phase goal + codebase inspection] First, the client router must become the single enforcement point for "unauthenticated direct-open or refresh fails closed to `/`", because the current page-level anonymous shells contradict the locked Phase 32 contract. [VERIFIED: `32-UI-SPEC.md` + `TimelinePageView.vue` + `StatisticsPageView.vue`] Second, the hosting layer must prove HTML5 history fallback for `/timeline` and `/statistics` in a preview/staging shape that matches production, because Vue Router history mode requires the server to serve the same app entry for direct URL visits. [VERIFIED: `32-CONTEXT.md` + `apps/web/src/router/index.ts` + CITED: https://router.vuejs.org/guide/essentials/history-mode]

The most concrete planning risk is documentation and verification drift, not missing feature code. [VERIFIED: `.planning/milestones/v6.0-MILESTONE-AUDIT.md` + `29-HUMAN-UAT.md` + `29-VERIFICATION.md` + `30-HUMAN-UAT.md` + `30-VERIFICATION.md`] Phase 29/30 acceptance artifacts still contain `#/timeline`-style instructions or keep deploy fallback as a pending note, while the runtime router is already clean URL. [VERIFIED: `29-HUMAN-UAT.md` + `29-VERIFICATION.md` + `30-HUMAN-UAT.md` + `30-VERIFICATION.md` + `apps/web/src/router/index.ts`] Planning should therefore treat doc/UAT closure as first-class deliverables, not cleanup afterthoughts. [VERIFIED: `32-CONTEXT.md` + milestone audit]

**Primary recommendation:** Keep `createWebHistory()`, add route-level auth gating with actual router-backed tests, prove preview/staging SPA fallback for `/timeline` and `/statistics`, then close the phase by updating Phase 29/30 `HUMAN-UAT.md`, `VERIFICATION.md`, and `ROADMAP.md` to clean URLs and final acceptance state. [VERIFIED: `32-CONTEXT.md` + `32-UI-SPEC.md` + `apps/web/src/router/index.ts` + milestone audit + CITED: https://router.vuejs.org/guide/advanced/navigation-guards.html]

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| `/timeline` and `/statistics` direct-open / refresh fallback | CDN / Static | Frontend Server (if the actual host is server-rendered) | HTML5 history deep-link closure is owned by the deploy host's rewrite/fallback behavior, not by Vue component code. [VERIFIED: `apps/web/src/router/index.ts` + `apps/web/vite.config.ts` + `apps/server/src/main.ts` + CITED: https://router.vuejs.org/guide/essentials/history-mode] |
| Unauthenticated route-entry policy for protected pages | Browser / Client | API / Backend | The browser router decides whether the user may remain on `/timeline` or `/statistics`; the backend remains the source of truth for whether the session is authenticated via `/auth/bootstrap`. [VERIFIED: `apps/web/src/router/index.ts` + `apps/web/src/stores/auth-session.ts`] |
| Timeline / Statistics route rendering and state restoration | Browser / Client | API / Backend | Route views render shell/loading/empty/populated states, while auth bootstrap and stats data come from backend APIs. [VERIFIED: `TimelinePageView.vue` + `StatisticsPageView.vue` + `auth-session.ts`] |
| Acceptance evidence and doc status closure | Browser / Client | Repository Docs | Human UAT must be run in a real browser against preview/staging, then write back into phase docs and roadmap. [VERIFIED: `32-CONTEXT.md` + `29-HUMAN-UAT.md` + `30-HUMAN-UAT.md` + `ROADMAP.md`] |

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Vue | Installed `3.5.32` | App shell, route views, lifecycle hooks | Existing frontend framework for `App.vue`, timeline, and statistics pages; no framework change is needed for Phase 32. [VERIFIED: `apps/web/node_modules/vue/package.json` + `apps/web/package.json`] |
| Vue Router | Installed `4.6.4` | Clean URL routing, route meta, global guards | Existing router already uses `createWebHistory()`; official docs support HTML5 history mode and global guards for redirect/cancel logic. [VERIFIED: `apps/web/node_modules/vue-router/package.json` + `apps/web/src/router/index.ts` + CITED: https://router.vuejs.org/guide/essentials/history-mode + https://router.vuejs.org/guide/advanced/navigation-guards.html] |
| Pinia | Installed `3.0.4` | Auth/session truth for route gating | `auth-session` already owns restore, same-user refresh, and anonymous/authenticated state; Phase 32 should reuse it instead of inventing local route auth flags. [VERIFIED: `apps/web/node_modules/pinia/package.json` + `apps/web/src/stores/auth-session.ts`] |
| Vite | Installed `8.0.8` | Production build and local preview | Existing web build tool; `vite preview` is for local build preview and is not itself the production routing contract Phase 32 must accept against. [VERIFIED: `apps/web/node_modules/vite/package.json` + `apps/web/package.json` + CITED: https://vite.dev/guide/cli.html] |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Vitest | Installed `4.1.4` | Route/view/store regressions | Use for router/auth/view tests that lock unauthenticated redirects and preserve authenticated route entry. [VERIFIED: `node_modules/vitest/package.json` + `apps/web/vitest.config.ts`] |
| Vue Test Utils | Installed `2.4.6` | Mounting route views/components with Pinia | Use to mount `App.vue`, route views, and router-aware shells in `happy-dom`. [VERIFIED: `apps/web/node_modules/@vue/test-utils/package.json` + `apps/web/vitest.config.ts`] |
| `@trip-map/contracts` | workspace | Shared auth/travel/stats types | No new contract package is needed; Phase 32 is routing/acceptance closure around existing contracts. [VERIFIED: `packages/contracts/package.json` + codebase inspection] |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Clean URL + host rewrite | Hash routing (`#/timeline`, `#/statistics`) | Hash routing would avoid host rewrites but directly violates locked Phase 32 decisions and current runtime contract. [VERIFIED: `32-CONTEXT.md` + `apps/web/src/router/index.ts`] |
| Global router guard on actual routes | Component-level redirect inside each page | Component-level redirect still allows route-local anonymous shells to remain the apparent route end state and duplicates policy across views. [VERIFIED: `TimelinePageView.vue` + `StatisticsPageView.vue` + `32-UI-SPEC.md`] |
| Repo-managed host rewrite config | External platform-only runbook | Repo-managed config is preferable when the provider allows it because the fallback rule becomes reviewable and versioned; if not possible, the external contract must still be documented with acceptance evidence. [VERIFIED: `32-CONTEXT.md`] |

**Installation:** No new runtime dependency is recommended for Phase 32. [VERIFIED: codebase inspection]

```bash
# No install required for Phase 32.
pnpm --filter @trip-map/web exec vitest run src/App.spec.ts src/components/auth/AuthTopbarControl.spec.ts src/views/TimelinePageView.spec.ts src/views/StatisticsPageView.spec.ts src/stores/auth-session.spec.ts
pnpm --filter @trip-map/web typecheck
```

**Version verification:** Local installed versions were verified from `node_modules`. `npm view` registry freshness checks were attempted during research but did not return in the sandbox, so planning should treat the repo-installed versions above as the execution baseline. [VERIFIED: local `node -p require(...package.json).version` checks + attempted `npm view` sessions]

## Architecture Patterns

### System Architecture Diagram

```text
Browser hits /timeline or /statistics directly
  -> Hosting layer rewrites non-asset request to index.html
  -> Vue app boots
  -> auth-session.restoreSession() resolves to authenticated or anonymous
  -> router guard evaluates route meta.requiresAuth
     -> authenticated: stay on target route
     -> anonymous: redirect to /
  -> target route view renders existing shell/state
  -> human UAT runs in preview/staging
  -> docs write back final route contract and acceptance status
```

This phase succeeds only when both the hosting rewrite and the client-side route policy are closed together. [VERIFIED: `32-CONTEXT.md` + `32-UI-SPEC.md` + `apps/web/src/router/index.ts` + `auth-session.ts`]

### Recommended Project Structure

```text
apps/web/src/
├── router/
│   ├── index.ts            # actual route table, route meta, global guard [VERIFIED: existing file]
│   └── index.spec.ts       # new actual-router regression for Phase 32 [VERIFIED: recommended gap; file missing]
├── stores/
│   └── auth-session.ts     # existing restore/auth state source [VERIFIED: existing file]
├── views/
│   ├── TimelinePageView.vue      # existing route shell [VERIFIED: existing file]
│   └── StatisticsPageView.vue    # existing route shell [VERIFIED: existing file]
└── App.spec.ts            # shell-level route regression, but currently uses a duplicated router table [VERIFIED: existing file]
```

### Pattern 1: Mark Protected Routes and Enforce Them in One Global Guard

**What:** Put a `requiresAuth` policy on the actual `/timeline` and `/statistics` routes and enforce it in a single router-level guard. [VERIFIED: current router file + official navigation guard docs]

**When to use:** Use this when multiple routes share the same fail-closed contract and the app must avoid duplicating redirect behavior inside each view. [VERIFIED: `32-UI-SPEC.md` + current duplicated anonymous-state branches]

**Example:**

```typescript
// Source: https://router.vuejs.org/guide/advanced/navigation-guards.html
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthSessionStore } from '../stores/auth-session'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'map-home', component: MapHomeView },
    { path: '/timeline', name: 'timeline', component: TimelinePageView, meta: { requiresAuth: true } },
    { path: '/statistics', name: 'statistics', component: StatisticsPageView, meta: { requiresAuth: true } },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

router.beforeEach(async (to) => {
  const authSessionStore = useAuthSessionStore()

  if (authSessionStore.status === 'restoring') {
    await authSessionStore.restoreSession()
  }

  if (to.meta.requiresAuth && authSessionStore.status !== 'authenticated') {
    return { path: '/' }
  }

  return true
})
```

### Pattern 2: Treat Hosting Fallback as a Deploy Artifact, Not a Vue Workaround

**What:** The deploy target must rewrite direct requests for `/timeline` and `/statistics` to the SPA entry point (`index.html` or equivalent host entry), while leaving asset/API paths alone. [CITED: https://router.vuejs.org/guide/essentials/history-mode]

**When to use:** Use this whenever `createWebHistory()` is kept in a static or CDN-hosted deployment. [VERIFIED: `apps/web/src/router/index.ts`]

**Example:**

```text
Request: GET /statistics
Host rule: if request is not an existing asset and not /api/*, serve the SPA entry
Result: browser loads the same app bundle, router resolves /statistics, auth guard decides stay-or-redirect
```

### Pattern 3: Close Acceptance in the Same Pass as Runtime Contract

**What:** After runtime behavior is correct, update the pending human-UAT and verification artifacts in the same phase, rather than leaving docs behind one more phase. [VERIFIED: `32-CONTEXT.md` + milestone audit]

**When to use:** Use this for closure phases where remaining gaps are mostly deploy/UAT/doc drift instead of missing feature logic. [VERIFIED: `ROADMAP.md` + `STATE.md`]

**Example:**

```text
Preview/staging proof collected
  -> update 29-HUMAN-UAT.md
  -> update 29-VERIFICATION.md
  -> update 30-HUMAN-UAT.md
  -> update 30-VERIFICATION.md
  -> update ROADMAP.md Phase 29/30/32 states
```

### Anti-Patterns to Avoid

- **Switching back to hash URLs:** violates locked decisions and creates new drift against the existing router. [VERIFIED: `32-CONTEXT.md` + `apps/web/src/router/index.ts`]
- **Fixing only the router without host rewrite proof:** direct-open/refresh can still 404 even if in-app navigation works. [VERIFIED: milestone audit + CITED: https://router.vuejs.org/guide/essentials/history-mode]
- **Keeping anonymous route shells as an accepted end state:** Phase 32 explicitly requires unauthenticated direct-open/refresh to land on `/`, not on the page-local anonymous cards. [VERIFIED: `32-UI-SPEC.md` + current route views]
- **Using `vite preview` as deploy acceptance evidence:** local build preview is not the same thing as provider-specific production routing behavior. [CITED: https://vite.dev/guide/cli.html]
- **Updating only one artifact family:** route/UAT closure is incomplete if `ROADMAP.md`, `HUMAN-UAT.md`, and `VERIFICATION.md` disagree about URL shape or acceptance status. [VERIFIED: `32-CONTEXT.md` + milestone audit]

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Route-level auth policy | Per-view duplicated redirect logic | One actual-router guard on protected routes | Centralized policy is easier to test against the real router and better matches the shared contract for both routes. [VERIFIED: current route views + official guard docs] |
| SPA deep-link fallback | Custom ad hoc client workaround or route alias hack | Provider-native rewrite/fallback rule | Deep-link 404 is a host responsibility in HTML5 history mode. [CITED: https://router.vuejs.org/guide/essentials/history-mode] |
| Acceptance tracking | New standalone checklist file | Existing Phase 29/30 `HUMAN-UAT.md` and `VERIFICATION.md` plus `ROADMAP.md` | The audit already points to those artifacts as the remaining closure surface. [VERIFIED: milestone audit + `32-CONTEXT.md`] |
| Auth truth in route views | Local anonymous/authenticated booleans invented per page | Existing `auth-session` store status and `restoreSession()` | Auth bootstrap and same-user refresh are already centralized there. [VERIFIED: `apps/web/src/stores/auth-session.ts`] |

**Key insight:** Phase 32 is not "build a better router"; it is "bind the existing clean router to a real host fallback and a single fail-closed auth policy, then make the docs tell the same truth as the runtime." [VERIFIED: phase scope + codebase inspection]

## Common Pitfalls

### Pitfall 1: In-App Navigation Passes, but Direct-Open/Refresh Still Fails

**What goes wrong:** Clicking from the topbar works, but typing `/timeline` or refreshing `/statistics` returns 404 in preview/staging. [VERIFIED: milestone audit problem statement]
**Why it happens:** `createWebHistory()` requires the host to serve the same SPA entry for direct visits, and the repo currently shows no provider-specific fallback file or server static-entry setup. [VERIFIED: `apps/web/src/router/index.ts` + repo grep + `apps/server/src/main.ts` + CITED: https://router.vuejs.org/guide/essentials/history-mode]
**How to avoid:** Make host fallback proof an explicit task with either a committed provider config file or an external-platform runbook recorded in docs. [VERIFIED: `32-CONTEXT.md`]
**Warning signs:** The repo has clean routes but no `vercel.json`, `netlify.toml`, `_redirects`, `wrangler.toml`, `nginx.conf`, `Dockerfile`, or Fastify static SPA entry wiring. [VERIFIED: repo file search + `apps/server/src/main.ts`]

### Pitfall 2: Component-Level Redirect Leaves Route-Local Anonymous Shells in Place

**What goes wrong:** The user eventually ends up at `/`, but the route-local anonymous card can still flash or remain the stable route end state in some flows. [VERIFIED: current page branches + `32-UI-SPEC.md`]
**Why it happens:** Both `TimelinePageView.vue` and `StatisticsPageView.vue` currently render an `anonymous` state whenever `status !== 'authenticated'`. [VERIFIED: `TimelinePageView.vue` + `StatisticsPageView.vue`]
**How to avoid:** Gate access before the route view becomes the accepted page state, ideally at the actual router layer. [VERIFIED: `32-UI-SPEC.md` + official navigation guard docs]
**Warning signs:** Tests still assert `[data-state="anonymous"]` as the expected end state for unauthenticated route access instead of asserting redirect to `/`. [VERIFIED: `TimelinePageView.spec.ts` + `StatisticsPageView.spec.ts`]

### Pitfall 3: Router Tests Do Not Exercise the Actual Runtime Router

**What goes wrong:** Shell tests stay green while the real `src/router/index.ts` drifts. [VERIFIED: current test structure]
**Why it happens:** `App.spec.ts` currently builds a separate memory router with only `/` and `/timeline`, and does not import the actual router file or include `/statistics`. [VERIFIED: `apps/web/src/App.spec.ts`]
**How to avoid:** Add a router-specific spec that imports the real router module or refactor shell tests to reuse the actual route table. [VERIFIED: `App.spec.ts`]
**Warning signs:** Statistics route policy changes are not covered by any actual-router regression, and the duplicated test router lacks `/statistics`. [VERIFIED: `App.spec.ts` + repo grep]

### Pitfall 4: Acceptance Docs Close Against the Wrong URL Contract

**What goes wrong:** Human UAT passes on paper, but the written steps still reference `#/timeline` or stale commands/config files. [VERIFIED: existing docs]
**Why it happens:** Phase 29/30 docs were written while the contract was still drifting, and some files were never normalized after the runtime router settled on clean URLs. [VERIFIED: `29-HUMAN-UAT.md` + `29-VERIFICATION.md` + `29-VALIDATION.md` + `30-HUMAN-UAT.md` + `30-VALIDATION.md`]
**How to avoid:** Update acceptance docs in the same phase as the runtime closure, and explicitly grep for `#/timeline` and `#/statistics` before closing. [VERIFIED: `32-CONTEXT.md` + current doc drift]
**Warning signs:** `29-HUMAN-UAT.md` and `29-VERIFICATION.md` still instruct testing `#/timeline`, and `30-HUMAN-UAT.md` still lists deploy deep-link acceptance as pending. [VERIFIED: `29-HUMAN-UAT.md` + `29-VERIFICATION.md` + `30-HUMAN-UAT.md`]

## Code Examples

Verified patterns from official and local sources:

### Protected Clean-URL Routes

```typescript
// Source: Vue Router navigation guards + current auth-session/router architecture
router.beforeEach(async (to) => {
  const authSessionStore = useAuthSessionStore()

  if (authSessionStore.status === 'restoring') {
    await authSessionStore.restoreSession()
  }

  if (
    to.meta.requiresAuth
    && authSessionStore.status !== 'authenticated'
  ) {
    return { path: '/' }
  }

  return true
})
```

### Actual-Router Regression Shape

```typescript
// Source: current router/auth-session patterns
import { createPinia, setActivePinia } from 'pinia'
import router from './index'
import { useAuthSessionStore } from '../stores/auth-session'

it('redirects anonymous /timeline to / after restore settles anonymous', async () => {
  setActivePinia(createPinia())
  const authSessionStore = useAuthSessionStore()
  vi.spyOn(authSessionStore, 'restoreSession').mockImplementation(async () => {
    authSessionStore.status = 'anonymous'
    authSessionStore.currentUser = null
  })

  await router.push('/timeline')
  await router.isReady()

  expect(router.currentRoute.value.fullPath).toBe('/')
})
```

### Acceptance Evidence Matrix

```text
Authenticated account + real data
  -> /timeline direct-open
  -> /timeline refresh
  -> /statistics direct-open
  -> /statistics refresh
  -> desktop readability
  -> mobile readability
  -> update 29/30 HUMAN-UAT + VERIFICATION + ROADMAP
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Hash URLs as documentation fallback | Clean URLs with `createWebHistory()` | Locked by Phase 32 context on 2026-04-27 | Phase 32 must remove `#/timeline` and `#/statistics` drift instead of restoring it. [VERIFIED: `32-CONTEXT.md` + `apps/web/src/router/index.ts`] |
| Anonymous route-local timeline/statistics as accepted unauthenticated end state | Fail-closed redirect to `/` for unauthenticated direct-open/refresh | Locked by Phase 32 UI contract on 2026-04-27 | Route access policy must move ahead of or supersede the current anonymous shells. [VERIFIED: `32-UI-SPEC.md` + route views] |
| Feature-only verification for Phase 29/30 | Runtime closure plus deploy/UAT/doc write-back | Milestone audit on 2026-04-24 reopened the remaining gaps | Planning must include docs and acceptance evidence as deliverables, not just code. [VERIFIED: milestone audit + `ROADMAP.md`] |

**Deprecated/outdated:**

- `#/timeline` and `#/statistics` in accepted docs are outdated for this project. [VERIFIED: `32-CONTEXT.md` + `29-HUMAN-UAT.md` + `29-VERIFICATION.md`]
- `30-VALIDATION.md` is stale for current tooling because it references `apps/server/jest.config.ts` and `pnpm --filter web test run`, which do not match the current repo. [VERIFIED: `30-VALIDATION.md` + `apps/server/vitest.config.ts` + `package.json`]

## Assumptions Log

All material implementation claims in this research were verified from repo sources or official docs; no execution-critical assumption was left untagged. [VERIFIED: research content review]

## Open Questions

1. **Which preview/staging host actually matches production routing behavior?** [VERIFIED: unresolved by repo inspection]
   - What we know: The repo exposes no provider-specific hosting config file and the NestJS server does not currently serve the web build as a fallback SPA entry. [VERIFIED: repo file search + `apps/server/src/main.ts`]
   - What's unclear: The actual provider name, its preview/staging URL, and whether its rewrite rule can be committed to the repo. [VERIFIED: repo inspection found no answer]
   - Recommendation: Make provider discovery and acceptance-target confirmation the first planning task; if the provider allows repo-managed config, commit it, otherwise record the external rule and evidence in Phase 32 docs. [VERIFIED: `32-CONTEXT.md`]

2. **Should Phase 32 also normalize stale 29/30 `VALIDATION.md` files?** [VERIFIED: files inspected]
   - What we know: `29-VALIDATION.md` still teaches `#/timeline`, and `30-VALIDATION.md` contains outdated commands/config references. [VERIFIED: `29-VALIDATION.md` + `30-VALIDATION.md`]
   - What's unclear: `D-07` explicitly names `ROADMAP.md`, `HUMAN-UAT.md`, `VERIFICATION.md`, and Phase 32 artifacts, but does not explicitly require `VALIDATION.md` edits. [VERIFIED: `32-CONTEXT.md`]
   - Recommendation: Keep `VALIDATION.md` cleanup optional unless it naturally fits the same edit batch; do not let it block core Phase 32 closure. [VERIFIED: context scope boundary]

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | local route/view tests | ✓ | `v22.22.1` | - [VERIFIED: `node --version`] |
| pnpm | monorepo commands | ✓ | `10.33.0` | - [VERIFIED: `pnpm --version`] |
| npm | local package inspection | ✓ | `10.9.4` | - [VERIFIED: `npm --version`] |
| `@trip-map/web` Vitest setup | automated regressions | ✓ | local | - [VERIFIED: `apps/web/vitest.config.ts`] |
| Preview/staging URL matching production routing | deploy deep-link acceptance | ✗ not discoverable in repo | - | none; must be supplied by execution environment [VERIFIED: repo inspection + `32-CONTEXT.md`] |
| Provider-specific SPA rewrite contract | deploy deep-link acceptance | ✗ not discoverable in repo | - | document external platform rule if repo-managed config is impossible [VERIFIED: repo file search + `32-CONTEXT.md`] |
| Real authenticated account with timeline/statistics data | human UAT closure | ✗ not available in repo | - | none; required for narrow manual acceptance scope [VERIFIED: `32-CONTEXT.md` + `29-HUMAN-UAT.md` + `30-HUMAN-UAT.md`] |

**Missing dependencies with no fallback:**

- Preview/staging endpoint that matches production routing behavior. [VERIFIED: `32-CONTEXT.md` + repo inspection]
- Real authenticated browser-test account/data for human UAT. [VERIFIED: `32-CONTEXT.md`]

**Missing dependencies with fallback:**

- Provider-specific config in repo. If the real host does not support repo-managed rewrite files, the fallback is to document the external platform contract and capture acceptance evidence in phase docs. [VERIFIED: `32-CONTEXT.md`]

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest `4.1.4` with Vue Test Utils `2.4.6`. [VERIFIED: local installed packages] |
| Config file | `apps/web/vitest.config.ts` using `happy-dom`. [VERIFIED: `apps/web/vitest.config.ts`] |
| Quick run command | `pnpm --filter @trip-map/web exec vitest run src/App.spec.ts src/components/auth/AuthTopbarControl.spec.ts src/views/TimelinePageView.spec.ts src/views/StatisticsPageView.spec.ts src/stores/auth-session.spec.ts` [VERIFIED: existing files + package manager convention] |
| Full suite command | `pnpm --filter @trip-map/web test && pnpm --filter @trip-map/web typecheck` [VERIFIED: `apps/web/package.json`] |

### Phase Requirements -> Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| `TRIP-04` | Authenticated user can still enter `/timeline` from the topbar menu and anonymous direct-open resolves to `/`. | component + router | `pnpm --filter @trip-map/web exec vitest run src/components/auth/AuthTopbarControl.spec.ts src/router/index.spec.ts` | `AuthTopbarControl.spec.ts` exists; `router/index.spec.ts` is ❌ Wave 0 [VERIFIED: repo files] |
| `TRIP-05` | Authenticated `/timeline` renders the existing independent page shell; anonymous direct-open does not settle on the timeline anonymous shell. | router + shell | `pnpm --filter @trip-map/web exec vitest run src/router/index.spec.ts src/App.spec.ts src/views/TimelinePageView.spec.ts` | `App.spec.ts` / `TimelinePageView.spec.ts` exist; router spec is ❌ Wave 0 [VERIFIED: repo files] |
| `STAT-01` | Authenticated `/statistics` stays accessible and anonymous direct-open resolves to `/` without breaking the statistics page shell. | router + shell | `pnpm --filter @trip-map/web exec vitest run src/router/index.spec.ts src/views/StatisticsPageView.spec.ts src/App.spec.ts` | `StatisticsPageView.spec.ts` exists; router spec is ❌ Wave 0 [VERIFIED: repo files] |
| `STAT-02` | Preview/staging direct-open and refresh for `/statistics` and `/timeline` work with production-like fallback. | manual deploy acceptance | - manual-only in preview/staging | no repo-only automated proof [VERIFIED: `30-HUMAN-UAT.md` + `32-CONTEXT.md`] |

### Sampling Rate

- **Per task commit:** `pnpm --filter @trip-map/web exec vitest run src/components/auth/AuthTopbarControl.spec.ts src/views/TimelinePageView.spec.ts src/views/StatisticsPageView.spec.ts src/stores/auth-session.spec.ts src/router/index.spec.ts` once the router spec exists. [VERIFIED: file set + current tooling]
- **Per wave merge:** `pnpm --filter @trip-map/web test && pnpm --filter @trip-map/web typecheck`. [VERIFIED: `apps/web/package.json`]
- **Phase gate:** preview/staging manual deep-link/refresh proof plus updated `29/30 HUMAN-UAT.md`, `29/30 VERIFICATION.md`, and `ROADMAP.md` before `/gsd-verify-work`. [VERIFIED: `32-CONTEXT.md` + phase goal]

### Wave 0 Gaps

- [ ] `apps/web/src/router/index.spec.ts` - import the actual router and lock anonymous redirect / authenticated stay-on-route behavior for `/timeline` and `/statistics`. [VERIFIED: file missing + `App.spec.ts` drift]
- [ ] `apps/web/src/App.spec.ts` - stop relying on a duplicated reduced router table, or at minimum add `/statistics` and reuse the actual route definitions. [VERIFIED: `App.spec.ts`]
- [ ] Manual acceptance template in Phase 32 artifacts - capture preview/staging URL, direct-open result, refresh result, desktop/mobile readability, and evidence links/screenshots. [VERIFIED: `32-CONTEXT.md` + current pending UAT docs]

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | yes | Continue using `auth-session` bootstrap state as the only source of route-entry authentication truth. [VERIFIED: `apps/web/src/stores/auth-session.ts`] |
| V3 Session Management | yes | Preserve existing `sid` cookie session semantics and wait for `restoreSession()` before deciding protected-route entry. [VERIFIED: `CLAUDE.md` + `auth-session.ts`] |
| V4 Access Control | yes | Enforce `/timeline` and `/statistics` access through router-level redirect to `/` when unauthenticated. [VERIFIED: `32-UI-SPEC.md` + current route definitions + official guard docs] |
| V5 Input Validation | no new user input surface | Existing route matching plus catch-all redirect remain sufficient for this closure phase. [VERIFIED: `apps/web/src/router/index.ts` + phase scope] |
| V6 Cryptography | no | No cryptographic change is in scope. [VERIFIED: phase scope + codebase inspection] |

### Known Threat Patterns for This Stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Unauthenticated deep-link reveals protected route shell | Information Disclosure | Route-level auth guard redirects to `/` after restore settles anonymous. [VERIFIED: `32-UI-SPEC.md` + `auth-session.ts` + CITED: https://router.vuejs.org/guide/advanced/navigation-guards.html] |
| Refresh on protected route returns host 404 | Denial of Service | Provider-native SPA rewrite/fallback for non-asset routes. [CITED: https://router.vuejs.org/guide/essentials/history-mode] |
| Stale route tests miss real access-policy drift | Tampering / Regression | Test the actual router module instead of only a hand-built fixture router. [VERIFIED: `App.spec.ts`] |

## Sources

### Primary (HIGH confidence)

- `.planning/phases/32-route-deep-link-and-acceptance-closure/32-CONTEXT.md` - locked decisions, acceptance boundary, doc closure scope. [VERIFIED: file read]
- `.planning/phases/32-route-deep-link-and-acceptance-closure/32-UI-SPEC.md` - unauthenticated fail-closed contract and no-redesign boundary. [VERIFIED: file read]
- `.planning/ROADMAP.md`, `.planning/REQUIREMENTS.md`, `.planning/STATE.md` - phase goal, requirement mapping, active project state. [VERIFIED: file read]
- `.planning/milestones/v6.0-MILESTONE-AUDIT.md` - exact remaining gap categories and evidence references. [VERIFIED: file read]
- `.planning/phases/29-timeline-page-and-account-entry/29-HUMAN-UAT.md` and `29-VERIFICATION.md` - current timeline UAT/verification drift and pending items. [VERIFIED: file read]
- `.planning/phases/30-travel-statistics-and-completion-overview/30-HUMAN-UAT.md` and `30-VERIFICATION.md` - current statistics UAT/verification drift and deploy fallback pending note. [VERIFIED: file read]
- `apps/web/src/router/index.ts`, `apps/web/src/components/auth/AuthTopbarControl.vue`, `apps/web/src/views/TimelinePageView.vue`, `apps/web/src/views/StatisticsPageView.vue`, `apps/web/src/stores/auth-session.ts`, `apps/web/src/App.spec.ts` - runtime route/auth behavior and current test coverage. [VERIFIED: file read]
- `apps/web/vite.config.ts`, `apps/server/src/main.ts`, repo file search - absence of repo-visible production host fallback evidence. [VERIFIED: file read + repo search]

### Secondary (MEDIUM confidence)

- Vue Router official docs: History Mode - host rewrite requirement for HTML5 history mode. [CITED: https://router.vuejs.org/guide/essentials/history-mode]
- Vue Router official docs: Navigation Guards - global `beforeEach` redirect/cancel pattern. [CITED: https://router.vuejs.org/guide/advanced/navigation-guards.html]
- Vite official docs: CLI - `vite preview` is for previewing the build locally rather than defining the production deploy contract. [CITED: https://vite.dev/guide/cli.html]

### Tertiary (LOW confidence)

- None. [VERIFIED: research content review]

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH - current installed tooling and repo-owned framework choices are directly verifiable locally. [VERIFIED: local package inspection + package files]
- Architecture: HIGH - router/auth/view/doc drift is directly visible in repo files and phase artifacts. [VERIFIED: codebase inspection]
- Deploy closure specifics: MEDIUM - the actual hosting provider and preview/staging endpoint are not discoverable in repo, so the planning shape is clear but the provider-specific execution branch is still environment-dependent. [VERIFIED: repo inspection + `32-CONTEXT.md`]

**Research date:** 2026-04-28 [VERIFIED: current_date]
**Valid until:** 2026-05-28 for repo-specific architecture; refresh sooner if the hosting provider or preview/staging target becomes known. [VERIFIED: current unknowns are environment-specific]
