# Phase 43: Landing、登录门禁与应用壳 - Research

**Researched:** 2026-05-11  
**Domain:** Vue 3 SPA routing, cookie-session auth gate, high-fidelity landing assets, authenticated sidebar shell  
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

Content in this section is copied verbatim from `.planning/phases/43-landing/43-CONTEXT.md`. [VERIFIED: .planning/phases/43-landing/43-CONTEXT.md]

### Locked Decisions

### Landing Page Fidelity and Assets
- **D-01:** The landing page should prioritize full-page high-fidelity reproduction, not just a simplified first viewport. Phase 43 should use the available v8 landing asset slices to match the full landing design as closely as practical.
- **D-02:** `prd/v8.0/切图/落地页上半背景.png` and `prd/v8.0/切图/落地页下半背景.png` are the landing page's primary high-fidelity scene backgrounds.
- **D-03:** Background slices carry the large scene and atmosphere; interactive UI must be real DOM layered over the scene. Titles, CTA buttons, login/register triggers, and any meaningful text should remain accessible HTML, not baked into image-only UI.
- **D-04:** Other transparent assets in `prd/v8.0/切图` may be used for high-fidelity restoration. When used in product code, copy only the needed assets into `apps/web/src/assets/v8/...` and rename them with English kebab-case filenames; do not reference Chinese raw design filenames directly from Vue code.
- **D-05:** Desktop layout should follow the design frame ratio, centered and proportionally scaled. Use the high-fidelity design composition as the anchor, with wide screens extending the background tastefully and smaller desktop screens scaling/cropping to preserve the original spatial relationships.
- **D-06:** Mobile compatibility is explicitly out of scope for this phase and for the current system direction. Do not spend Phase 43 effort on mobile-specific landing reflow, bottom navigation, drawer behavior, or mobile shell adaptation. This user decision overrides the original `SHELL-03` mobile adaptation expectation for this phase.

### Authentication Gate and Redirects
- **D-07:** Login or registration success always navigates to `/map`. Do not preserve redirect intent from protected routes.
- **D-08:** Anonymous visits to protected application pages should route to `/` and show the normal high-fidelity landing page. Do not auto-open the login dialog and do not show an extra "login required" warning.
- **D-09:** On initial session restore, show a short restore/loading state before choosing between landing and `/map`. Avoid flashing the public landing page to already-authenticated users.
- **D-10:** Logout returns the user to `/` landing. The existing logout notice can remain as a lightweight global notice if it fits the new shell, but the route destination is fixed to landing.
- **D-11:** The public landing page is not inside the logged-in application shell. The left navigation shell applies only to authenticated application routes.

### Authenticated App Shell
- **D-12:** Logged-in application pages use the left sidebar as the primary shell. Remove the old topbar's logged-in navigation responsibilities; `AuthTopbarControl` should not remain the main authenticated navigation surface.
- **D-13:** The left sidebar should contain the brand area, user card, fixed navigation entries, one reliable illustration area, and logout. Do not add "我的收藏" or any future placeholder entries.
- **D-14:** Use one reliable sidebar illustration across authenticated pages instead of switching illustrations per route. Do not blindly reproduce the incorrect bottom-left illustration noted in `prd/v8.0/UI/世界足迹.png`; prefer a reliable character/cat/flower asset from the available v8 slices.
- **D-15:** The sidebar user card currently shows only the default avatar and username. The default avatar should come from the high-fidelity asset slices. Structure the component/data path so future user-uploaded avatars can replace the default, but do not implement upload in this phase.
- **D-16:** Do not show travel record summaries, badges, progress, or stats in the sidebar during Phase 43, despite earlier `SHELL-02` wording. Leave room for later extension if needed.
- **D-17:** Sidebar navigation is exactly three main entries: `世界足迹`, `旅途手账`, and `旅途回忆`. Each entry uses `KawaiiIcon` plus Chinese text, has current-route highlighting, and does not include disabled/future entries.

### Routes and Copy Migration
- **D-18:** Replace the old route semantics completely. Use `/map`, `/journal`, and `/memories` as the main application paths.
- **D-19:** Do not keep compatibility redirects for `/timeline` or `/statistics`. Old paths should fall through as unknown routes and route to `/`; authenticated users may then be redirected from `/` to `/map` by the root auth behavior.
- **D-20:** Update user-visible text and route/test semantics together. Page titles, navigation labels, CTA text, empty states, `data-route-view`, router route names, and relevant test descriptions should use `世界足迹`, `旅途手账`, and `旅途回忆` vocabulary.
- **D-21:** Do not force broad file/component renames such as `TimelinePageView.vue` or `StatisticsPageView.vue` solely for naming purity. Rename internals where it directly supports route/test clarity, but avoid large churn that does not improve behavior.
- **D-22:** Global copy replacement for this phase is user-facing first: `点亮` becomes `留下足迹`, `旅行统计` becomes `旅途回忆`, and `时间轴` becomes `旅途手账` where those strings appear in Phase 43-owned surfaces and route-facing tests. Deeper map popup/date dialog behavior belongs to Phase 44.

### the agent's Discretion
No user decisions were delegated to the agent's discretion. Downstream agents may choose component boundaries and exact CSS implementation details only within the decisions above.

### Deferred Ideas (OUT OF SCOPE)
- User-uploaded avatar support is intentionally deferred. Phase 43 should only reserve the replacement path and use a default high-fidelity avatar asset.
- Sidebar travel summaries, badges, progress, or stats are deferred despite earlier shell wording.
- Mobile landing/shell compatibility is deferred/out of current system scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| AUTH-01 | 未登录用户访问 `/` 时看到 `8.0/落地页.png` 所表达的落地页，而不是直接进入地图。 | Define `/` as public `LandingPageView`, keep landing outside authenticated shell, and layer real DOM CTAs over copied v8 landing backgrounds. [VERIFIED: .planning/REQUIREMENTS.md] [VERIFIED: .planning/phases/43-landing/43-CONTEXT.md] [VERIFIED: prd/v8.0/UI/落地页.png] |
| AUTH-02 | 已登录用户访问 `/` 时自动进入地图应用页 `/map`。 | Add a root branch in the global router guard after `restoreSession()` resolves; Vue Router supports async `beforeEach` guards returning a route location. [VERIFIED: apps/web/src/router/index.ts] [CITED: https://github.com/vuejs/router/blob/main/packages/docs/guide/advanced/navigation-guards.md] |
| AUTH-03 | 地图、旅途手账、旅途回忆等应用页面均要求登录，匿名访问时回到落地页并可触发登录。 | Mark `/map`, `/journal`, and `/memories` with `meta.requiresAuth`, route anonymous users to `/`, and keep backend `SessionAuthGuard` as the data-security boundary. [VERIFIED: apps/web/src/router/index.ts] [VERIFIED: apps/server/src/modules/records/records.controller.ts] |
| AUTH-04 | 落地页的“开始记录旅途 / 免费注册”打开注册模式，“立即登录”打开登录模式。 | Reuse `useAuthSessionStore().openAuthModal('register' | 'login')` from landing buttons; `AuthDialog` already drives login/register modes. [VERIFIED: apps/web/src/stores/auth-session.ts] [VERIFIED: apps/web/src/components/auth/AuthDialog.vue] |
| AUTH-05 | 用户登录或注册成功后进入 `/map`，并看到同一账号的云端旅行记录。 | Existing `login()` and `register()` hydrate `/auth/bootstrap` records through `hydrateAuthenticatedSnapshot()`; Phase 43 must add post-success navigation to `/map`. [VERIFIED: apps/web/src/stores/auth-session.ts] [VERIFIED: apps/web/src/services/api/auth.ts] [VERIFIED: packages/contracts/src/bootstrap.ts] |
| SHELL-01 | 已登录应用使用左侧 Yume Kawaii 导航壳，提供世界足迹、旅途手账、旅途回忆入口。 | Use existing shadcn-vue sidebar primitives plus `KawaiiIcon` for exactly three `RouterLink` entries. [VERIFIED: apps/web/src/components/ui/sidebar/index.ts] [VERIFIED: apps/web/src/components/common/KawaiiIcon.vue] [CITED: https://github.com/unovue/shadcn-vue/blob/v1_0_3/apps/www/src/content/docs/components/sidebar.md] |
| SHELL-02 | 左侧导航显示当前用户卡片、旅行记录摘要和设计图风格插画/装饰，但不显示“我的收藏”入口。 | Phase context overrides summaries/stats for Phase 43; implement avatar + username + one reliable illustration + no collection entry. [VERIFIED: .planning/REQUIREMENTS.md] [VERIFIED: .planning/phases/43-landing/43-CONTEXT.md] |
| SHELL-03 | 移动端应用壳不会让侧边栏挤压地图主区域，导航可通过底部栏或可收起抽屉访问。 | Phase context explicitly supersedes this mobile adaptation expectation; planner should not allocate Phase 43 work to mobile bottom bars/drawers. [VERIFIED: .planning/REQUIREMENTS.md] [VERIFIED: .planning/phases/43-landing/43-CONTEXT.md] |
| SHELL-04 | 全局文案完成替换：`点亮` -> `留下足迹`，`旅行统计` -> `旅途回忆`，`时间轴` -> `旅途手账`。 | Route-facing surfaces and tests currently contain old route names/copy; Phase 43 should update owned surfaces while leaving map popup/date-dialog behavior for Phase 44. [VERIFIED: apps/web/src/router/index.ts] [VERIFIED: apps/web/src/views/TimelinePageView.vue] [VERIFIED: apps/web/src/views/StatisticsPageView.vue] [VERIFIED: .planning/phases/43-landing/43-CONTEXT.md] |
</phase_requirements>

## Project Constraints (from AGENTS.md)

- User-facing communication must remain Chinese unless the user explicitly requests another language. [VERIFIED: AGENTS.md]
- Before implementation, the executor must briefly describe the operations it will run. [VERIFIED: AGENTS.md]
- Code changes should stay minimal and follow the existing project structure and style. [VERIFIED: AGENTS.md]
- The user has authorized GSD workflows to start subagents or delegated agents when the workflow requires them. [VERIFIED: AGENTS.md]
- If subagents are used, downstream agents must wait for subagent results before continuing. [VERIFIED: AGENTS.md]
- Final summaries must describe changes, affected scope, and verification results in Chinese. [VERIFIED: AGENTS.md]
- No project-defined `.codex/skills` or `.agents/skills` directories were present in this repo. [VERIFIED: find .codex/skills .agents/skills]

## Summary

Phase 43 should be planned as a routing and shell migration around the existing auth/session store, not as a new authentication implementation. [VERIFIED: apps/web/src/stores/auth-session.ts] [VERIFIED: apps/server/src/modules/auth/auth.controller.ts] The current app still serves the map at `/`, still exposes `/timeline` and `/statistics`, and still uses `AuthTopbarControl` as authenticated navigation. [VERIFIED: apps/web/src/router/index.ts] [VERIFIED: apps/web/src/App.vue] [VERIFIED: apps/web/src/components/auth/AuthTopbarControl.vue]

The primary technical move is to make `/` a public landing route, move the map to `/map`, protect `/map`, `/journal`, and `/memories`, and let the async router guard await `restoreSession()` before deciding whether root goes to landing or `/map`. [VERIFIED: .planning/phases/43-landing/43-CONTEXT.md] [CITED: https://github.com/vuejs/router/blob/main/packages/docs/guide/advanced/navigation-guards.md] Runtime auth transitions still need explicit handling because route guards only run during navigation; logout and session-expired transitions should route protected pages back to `/`. [VERIFIED: apps/web/src/stores/auth-session.ts] [VERIFIED: apps/web/src/router/index.ts]

The visual work should copy only selected v8 assets into `apps/web/src/assets/v8/...`, import them through Vite, and keep all meaningful landing/shell text as real DOM. [VERIFIED: .planning/phases/43-landing/43-CONTEXT.md] [VERIFIED: prd/v8.0/ASSET-MANIFEST.md] [CITED: https://github.com/vitejs/vite/blob/v8.0.10/docs/guide/assets.md] `prd/v8.0/切图/落地页上半背景.png` and `prd/v8.0/切图/落地页下半背景.png` are required landing backgrounds, and the sidebar should use one reliable avatar/illustration slice instead of route-specific or collection-related art. [VERIFIED: prd/v8.0/切图/落地页上半背景.png] [VERIFIED: prd/v8.0/切图/落地页下半背景.png] [VERIFIED: .planning/phases/43-landing/43-CONTEXT.md]

**Primary recommendation:** Plan five implementation tracks in order: asset copy/naming, landing route and CTAs, router/auth redirect semantics, authenticated sidebar shell, then route/copy/test migration. [VERIFIED: .planning/phases/43-landing/43-CONTEXT.md] [VERIFIED: apps/web/src/router/index.ts] [VERIFIED: apps/web/src/App.spec.ts]

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|--------------|----------------|-----------|
| Public landing page | Browser / Client | Static assets | Vue renders real CTA/title DOM while Vite resolves copied PNG assets into build URLs. [VERIFIED: apps/web/vite.config.ts] [CITED: https://github.com/vitejs/vite/blob/v8.0.10/docs/guide/assets.md] |
| Root auth decision | Browser / Client | API / Backend | Vue Router decides public landing vs `/map` after the Pinia auth store restores `/auth/bootstrap`; the backend owns the session truth. [VERIFIED: apps/web/src/router/index.ts] [VERIFIED: apps/web/src/stores/auth-session.ts] [VERIFIED: apps/server/src/modules/auth/auth.controller.ts] |
| Protected application routes | Browser / Client | API / Backend | Client route guards provide UX routing, while records/stats APIs remain protected by `SessionAuthGuard`. [VERIFIED: apps/web/src/router/index.ts] [VERIFIED: apps/server/src/modules/records/records.controller.ts] |
| Login/register modal | Browser / Client | API / Backend | `AuthDialog` submits credentials through the existing auth store and backend endpoints; Phase 43 only adds correct triggers and success navigation. [VERIFIED: apps/web/src/components/auth/AuthDialog.vue] [VERIFIED: apps/web/src/stores/auth-session.ts] |
| Authenticated app shell | Browser / Client | Static assets | The shell is a Vue layout using local sidebar primitives, `KawaiiIcon`, copied avatar/illustration assets, and `RouterLink` navigation. [VERIFIED: apps/web/src/components/ui/sidebar/index.ts] [VERIFIED: apps/web/src/components/common/KawaiiIcon.vue] |
| Route/copy migration | Browser / Client | Test suite | User-facing route names, labels, and specs change together; server contracts do not need route-name changes. [VERIFIED: apps/web/src/router/index.spec.ts] [VERIFIED: apps/web/src/App.spec.ts] [VERIFIED: packages/contracts/src] |
| Session cookie and records hydration | API / Backend | Browser / Client | Backend sets/clears the `sid` cookie and returns bootstrap records; frontend fetch uses `credentials: 'include'`. [VERIFIED: apps/server/src/modules/auth/auth.controller.ts] [VERIFIED: apps/web/src/services/api/client.ts] |

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `vue` | installed `3.5.32`; registry latest `3.5.34`, modified 2026-05-07 | Vue SFC runtime for landing, shell, and route views. | The repo already uses Vue 3 Composition API with `<script setup lang="ts">`; keep the installed major/minor behavior instead of introducing a framework migration. [VERIFIED: apps/web/package.json] [VERIFIED: pnpm-lock.yaml] [VERIFIED: npm registry] [VERIFIED: vue-best-practices skill] |
| `vue-router` | installed `4.6.4`; registry latest `5.0.6`, modified 2026-04-22 | SPA routing, route meta, async guards, redirects. | Existing code uses Vue Router 4, and official docs support async `beforeEach` guards that return route locations for auth redirects. [VERIFIED: apps/web/package.json] [VERIFIED: pnpm-lock.yaml] [VERIFIED: npm registry] [CITED: https://github.com/vuejs/router/blob/main/packages/docs/guide/advanced/navigation-guards.md] |
| `pinia` | installed/latest `3.0.4`, modified 2025-11-05 | Auth/session, map points, stats state. | Existing stores use Pinia setup stores and `storeToRefs`; the auth store already owns restore/login/register/logout/hydration. [VERIFIED: apps/web/package.json] [VERIFIED: apps/web/src/stores/auth-session.ts] [VERIFIED: npm registry] |
| `reka-ui` via shadcn-vue primitives | installed/latest `2.9.7`, modified 2026-05-05 | Accessible primitive behavior behind generated Sidebar/Dialog components. | Phase 42 generated local sidebar/dialog primitives, and shadcn-vue Sidebar docs use `SidebarProvider`, `Sidebar`, `SidebarInset`, and `SidebarMenuButton`. [VERIFIED: apps/web/src/components/ui/sidebar/index.ts] [VERIFIED: npm registry] [CITED: https://github.com/unovue/shadcn-vue/blob/v1_0_3/apps/www/src/content/docs/components/sidebar.md] |
| `@iconify/vue` + local registry | installed/latest `5.0.1`, modified 2026-05-06 | `KawaiiIcon` semantic icons. | `KawaiiIcon` already maps semantic names including `map`, `journal`, and `memories`, so shell nav should reuse it instead of raw icon IDs. [VERIFIED: apps/web/src/components/common/KawaiiIcon.vue] [VERIFIED: apps/web/src/lib/icons/semantic-icons.ts] [VERIFIED: npm registry] |
| `vite` | installed `8.0.8`; registry latest `8.0.12`, modified 2026-05-11 | Asset bundling, dev server, app build. | Vite supports importing image assets as URLs and `new URL(..., import.meta.url)`, which matches the required asset-copy workflow. [VERIFIED: apps/web/package.json] [VERIFIED: npm registry] [CITED: https://github.com/vitejs/vite/blob/v8.0.10/docs/guide/assets.md] |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@vue/test-utils` | installed `2.4.6`; registry latest `2.4.10`, modified 2026-04-30 | Mount Vue components in Vitest. | Use for `LandingPageView`, `AuthenticatedAppShell`, `AuthDialog`, and updated `App` specs. [VERIFIED: apps/web/package.json] [VERIFIED: apps/web/src/App.spec.ts] [VERIFIED: npm registry] |
| `vitest` | installed `4.1.4`; registry latest `4.1.5`, modified 2026-05-05 | Unit/component test runner. | Existing `apps/web/vitest.config.ts` uses `happy-dom` and includes `src/**/*.spec.ts`. [VERIFIED: apps/web/vitest.config.ts] [VERIFIED: npm registry] |
| `happy-dom` | installed/latest `20.9.0`, modified 2026-04-13 | DOM environment for Vue component tests. | Existing web tests already run in `happy-dom`, so new landing/shell tests should stay there. [VERIFIED: apps/web/vitest.config.ts] [VERIFIED: npm registry] |
| `tailwindcss` / `@tailwindcss/vite` | installed `4.2.2`; registry latest `4.3.0`, modified 2026-05-08 | Utility CSS and Tailwind v4 Vite integration. | Existing styling is Tailwind v4 plus token CSS, so Phase 43 should use current token/utilities rather than adding a parallel CSS framework. [VERIFIED: apps/web/src/style.css] [VERIFIED: apps/web/package.json] [VERIFIED: npm registry] |
| `vue-tsc` / TypeScript | `typescript` installed `5.9.3`; `vue-tsc` installed `3.2.6`, registry latest `3.2.8`, modified 2026-05-04 | Type checking for Vue SFCs. | The web build script already runs `vue-tsc --noEmit && vite build`, so phase gate should include the same command. [VERIFIED: apps/web/package.json] [VERIFIED: npm registry] |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Existing `AuthDialog` and auth store | New landing-only auth form | A second auth implementation would duplicate validation, focus handling, session hydration, and local-import behavior already present. [VERIFIED: apps/web/src/components/auth/AuthDialog.vue] [VERIFIED: apps/web/src/stores/auth-session.ts] |
| Vue Router guard + runtime route sync | Component-only `watch()` redirects | Component-only redirects can flash the public landing during initial restore; official async guards can keep navigation pending until restore resolves. [VERIFIED: apps/web/src/router/index.ts] [CITED: https://github.com/vuejs/router/blob/main/packages/docs/guide/advanced/navigation-guards.md] |
| shadcn-vue Sidebar primitives | Handwritten sidebar layout/menu | Existing local primitives already encode provider, menu button, tooltip, and width behavior; use them and set `collapsible="none"` if mobile/collapse is out of scope. [VERIFIED: apps/web/src/components/ui/sidebar/Sidebar.vue] [VERIFIED: apps/web/src/components/ui/sidebar/SidebarProvider.vue] |
| Vite asset imports | Referencing `prd/v8.0/切图/...` directly from Vue | Direct raw design paths violate locked asset handling and bypass Vite bundling/hash behavior. [VERIFIED: .planning/phases/43-landing/43-CONTEXT.md] [CITED: https://github.com/vitejs/vite/blob/v8.0.10/docs/guide/assets.md] |
| Preserving `/timeline` and `/statistics` redirects | Compatibility route redirects | Locked decisions explicitly require no compatibility redirects; old paths should fall through to `/`. [VERIFIED: .planning/phases/43-landing/43-CONTEXT.md] |

**Installation:**

```bash
# No new npm packages are required for Phase 43.
pnpm install
```

**Version verification:** Recommended package versions were checked with `npm view <package> version time.modified` on 2026-05-11, and installed versions were cross-checked against `apps/web/package.json` and `pnpm-lock.yaml`. [VERIFIED: npm registry] [VERIFIED: apps/web/package.json] [VERIFIED: pnpm-lock.yaml]

## Architecture Patterns

### System Architecture Diagram

```text
Browser navigation
  -> Vue Router beforeEach
       -> if auth status is restoring: await authSessionStore.restoreSession()
       -> if target is "/" and authenticated: redirect to "/map"
       -> if target requires auth and anonymous: redirect to "/"
       -> otherwise allow navigation
  -> RouterView branch
       -> "/" public route
            -> LandingPageView
            -> DOM title/copy/CTA buttons
            -> copied v8 landing backgrounds imported by Vite
            -> openAuthModal("register" | "login")
       -> authenticated route: "/map" | "/journal" | "/memories"
            -> AuthenticatedAppShell
                 -> SidebarProvider + Sidebar + SidebarInset
                 -> brand + avatar/username card
                 -> exactly three RouterLink nav entries
                 -> one copied sidebar illustration
                 -> logout action -> authSessionStore.logout() -> router.replace("/")
            -> route content view
                 -> MapHomeView, TimelinePageView-as-journal, StatisticsPageView-as-memories
  -> Root overlays
       -> AuthDialog
            -> login/register via existing auth store
            -> hydrate bootstrap records
            -> router.replace("/map")
       -> LocalImportDecisionDialog
            -> uses existing post-login local import flow
       -> global interaction notice
            -> shows auth/session/import notices outside the sidebar shell
```

The diagram maps data flow and routing decisions; file placement belongs in the structure table below. [VERIFIED: apps/web/src/router/index.ts] [VERIFIED: apps/web/src/App.vue] [VERIFIED: apps/web/src/stores/auth-session.ts]

### Recommended Project Structure

```text
apps/web/src/
├── assets/
│   └── v8/
│       ├── landing/
│       │   ├── landing-upper-bg.png
│       │   └── landing-lower-bg.png
│       └── shell/
│           ├── default-avatar.png
│           └── sidebar-illustration.png
├── components/
│   ├── landing/
│   │   ├── LandingPage.vue
│   │   ├── LandingHero.vue
│   │   └── LandingTreasurePanel.vue
│   └── shell/
│       ├── AuthenticatedAppShell.vue
│       └── ShellSidebar.vue
├── router/
│   └── index.ts
├── views/
│   ├── LandingPageView.vue
│   ├── MapHomeView.vue
│   ├── TimelinePageView.vue
│   └── StatisticsPageView.vue
└── App.vue
```

Route views should stay thin composition surfaces, and substantial landing/shell markup should live under feature components. [VERIFIED: vue-best-practices skill] [VERIFIED: apps/web/src/views/MapHomeView.vue] `TimelinePageView.vue` and `StatisticsPageView.vue` may remain physically named as-is while their route path, route name, `data-route-view`, and visible copy move to `journal`/`memories`. [VERIFIED: .planning/phases/43-landing/43-CONTEXT.md]

### Pattern 1: Auth-Restoring Router Guard

**What:** The global guard should await `restoreSession()` before redirecting root or protected routes. [VERIFIED: apps/web/src/router/index.ts] [CITED: https://github.com/vuejs/router/blob/main/packages/docs/guide/advanced/navigation-guards.md]  
**When to use:** Use for every navigation because root and protected routes both depend on auth status. [VERIFIED: .planning/phases/43-landing/43-CONTEXT.md]

```ts
// Source: Vue Router global guard docs and existing auth-session store.
router.beforeEach(async (to) => {
  const authSessionStore = useAuthSessionStore()

  if (authSessionStore.status === 'restoring') {
    await authSessionStore.restoreSession()
  }

  if (to.path === '/' && authSessionStore.status === 'authenticated') {
    return { path: '/map', replace: true }
  }

  if (to.meta.requiresAuth && authSessionStore.status !== 'authenticated') {
    return { path: '/', replace: true }
  }

  return true
})
```

### Pattern 2: AuthDialog Success Navigates to `/map`

**What:** Reuse `AuthDialog`, but add post-success navigation after the existing store hydration succeeds. [VERIFIED: apps/web/src/components/auth/AuthDialog.vue] [VERIFIED: apps/web/src/stores/auth-session.ts]  
**When to use:** Use for both login and registration because redirect intent is explicitly disabled. [VERIFIED: .planning/phases/43-landing/43-CONTEXT.md]

```ts
// Source: existing AuthDialog submit flow plus Phase 43 redirect decision.
const router = useRouter()

async function handleSubmit() {
  if (activeMode.value === 'login') {
    await login({ email: loginForm.email, password: loginForm.password })
  } else {
    await register({
      username: registerForm.username.trim(),
      email: registerForm.email,
      password: registerForm.password,
    })
  }

  closeAuthModal()
  await router.replace('/map')
}
```

### Pattern 3: Sidebar Primitives as Authenticated Shell

**What:** Build `AuthenticatedAppShell` from existing Sidebar primitives and pass route content through a slot. [VERIFIED: apps/web/src/components/ui/sidebar/index.ts] [CITED: https://github.com/unovue/shadcn-vue/blob/v1_0_3/apps/www/src/content/docs/components/sidebar.md]  
**When to use:** Use only for authenticated application routes, never for `/`. [VERIFIED: .planning/phases/43-landing/43-CONTEXT.md]

```vue
<!-- Source: shadcn-vue Sidebar docs, adapted to locked Phase 43 nav. -->
<template>
  <SidebarProvider style="--sidebar-width: 18rem;">
    <Sidebar collapsible="none" class="border-r border-white/70 bg-white/84">
      <ShellSidebar />
    </Sidebar>
    <SidebarInset class="min-w-0 bg-transparent">
      <slot />
    </SidebarInset>
  </SidebarProvider>
</template>
```

### Pattern 4: Vite-Managed Landing Assets

**What:** Copy used slices to English kebab-case asset paths and import them from Vue/CSS. [VERIFIED: .planning/phases/43-landing/43-CONTEXT.md] [CITED: https://github.com/vitejs/vite/blob/v8.0.10/docs/guide/assets.md]  
**When to use:** Use for landing backgrounds, default avatar, and sidebar illustration. [VERIFIED: prd/v8.0/ASSET-MANIFEST.md]

```ts
// Source: Vite static asset import docs.
import upperBackgroundUrl from '@/assets/v8/landing/landing-upper-bg.png'
import lowerBackgroundUrl from '@/assets/v8/landing/landing-lower-bg.png'
```

### Anti-Patterns to Avoid

- **Landing inside authenticated shell:** This contradicts the locked public/private shell boundary and will show sidebar/topbar on `/`. [VERIFIED: .planning/phases/43-landing/43-CONTEXT.md]
- **Redirect intent preservation:** This contradicts the fixed `/map` success destination. [VERIFIED: .planning/phases/43-landing/43-CONTEXT.md]
- **Compatibility redirects for `/timeline` or `/statistics`:** This contradicts the route replacement decision. [VERIFIED: .planning/phases/43-landing/43-CONTEXT.md]
- **Counting image-baked text as product copy:** Background slices can be decorative, but titles, CTAs, and auth triggers must be accessible HTML. [VERIFIED: .planning/phases/43-landing/43-CONTEXT.md] [VERIFIED: prd/v8.0/CUTTING-GUIDE.md]
- **Moving auth/session state into components:** Existing Pinia store already centralizes session boundary, bootstrap hydration, and local-import state. [VERIFIED: apps/web/src/stores/auth-session.ts]
- **Treating client route guards as security boundaries:** Records and stats access must remain protected by backend guards. [VERIFIED: apps/server/src/modules/records/records.controller.ts]

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Session restoration and account snapshot hydration | New landing-specific auth store | `useAuthSessionStore()` | Existing store handles restore, login, register, logout, cloud records, session boundary resets, and local-import staging. [VERIFIED: apps/web/src/stores/auth-session.ts] |
| Login/register UI | New auth form/modal | `AuthDialog` + `openAuthModal()` | Existing dialog already owns login/register modes, form validation, errors, focus restore, and submit flow. [VERIFIED: apps/web/src/components/auth/AuthDialog.vue] |
| Protected route redirect logic | Per-view anonymous checks | Vue Router `meta.requiresAuth` + global `beforeEach` | Vue Router officially supports async global guards and route-location redirects. [CITED: https://github.com/vuejs/router/blob/main/packages/docs/guide/advanced/navigation-guards.md] |
| Sidebar interaction/focus primitives | Custom menu/button/provider implementation | Generated `components/ui/sidebar/*` | Existing shadcn-vue sidebar components provide provider/menu/button/inset primitives already generated in the repo. [VERIFIED: apps/web/src/components/ui/sidebar/index.ts] |
| App nav icons | Raw SVGs or raw Iconify IDs in page code | `KawaiiIcon` semantic names | `KawaiiIcon` already exposes `map`, `journal`, and `memories` names and hides asset/icon details. [VERIFIED: apps/web/src/components/common/KawaiiIcon.vue] |
| Asset serving | Runtime references to `prd/v8.0/切图` | Copy to `apps/web/src/assets/v8/...` and import with Vite | Locked asset rule requires English kebab-case product assets, and Vite resolves imported assets for production builds. [VERIFIED: .planning/phases/43-landing/43-CONTEXT.md] [CITED: https://github.com/vitejs/vite/blob/v8.0.10/docs/guide/assets.md] |
| Mobile bottom nav/drawer | New mobile shell system | No Phase 43 implementation | Mobile compatibility is explicitly out of scope for this phase. [VERIFIED: .planning/phases/43-landing/43-CONTEXT.md] |

**Key insight:** Phase 43 is risky because it changes app entry semantics and route vocabulary, not because it needs new low-level primitives. [VERIFIED: apps/web/src/router/index.ts] [VERIFIED: apps/web/src/App.spec.ts] Reuse the existing auth/session and Phase 42 UI foundation, then focus verification on redirect order, shell boundary, and old-route/copy removal. [VERIFIED: apps/web/src/stores/auth-session.ts] [VERIFIED: apps/web/src/components/ui/sidebar/index.ts]

## Runtime State Inventory

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | PostgreSQL stores users, auth sessions, and travel records; route strings `/timeline` and `/statistics` were not found in Prisma schema or contract record types. [VERIFIED: apps/server/prisma/schema.prisma] [VERIFIED: packages/contracts/src/records.ts] | No data migration for route/copy rename; keep session and records data model unchanged. [VERIFIED: apps/server/src/modules/auth/auth.service.ts] |
| Stored data | Browser `localStorage` key `trip-map:point-state:v2` stores legacy point snapshots for import and does not store route names. [VERIFIED: apps/web/src/services/legacy-point-storage.ts] | No localStorage key migration for Phase 43; keep existing local-import flow after login. [VERIFIED: apps/web/src/stores/auth-session.ts] |
| Live service config | Repository contains `apps/server/.env` and `.env.example`; env names are database connection keys and do not contain route/copy strings. [VERIFIED: apps/server/.env.example] [VERIFIED: apps/server/.env] | Do not rename secret/env keys; do not print or commit secret values. [VERIFIED: .gitignore] |
| Live service config | No `.github` directory or Docker/compose service config was found in the repo. [VERIFIED: find .github] [VERIFIED: find Dockerfile docker-compose*.yml] | No repo service config patch required. [VERIFIED: find .github] |
| OS-registered state | No launchd plist, systemd service, pm2 ecosystem config, or Dockerfile was found in the repo. [VERIFIED: find *.plist *.service ecosystem.config.* pm2*.json Dockerfile] | No repo-tracked OS registration update required; OS-wide registries were not queried. [VERIFIED: find *.plist *.service ecosystem.config.* pm2*.json Dockerfile] |
| Secrets/env vars | `VITE_API_BASE_URL`, `VITE_BING_MAPS_KEY`, `DATABASE_URL`, `DIRECT_URL`, and `SHADOW_DATABASE_URL` are the relevant env names discovered. [VERIFIED: apps/web/src/services/api/client.ts] [VERIFIED: apps/web/src/composables/useLeafletMap.ts] [VERIFIED: apps/server/.env.example] | No secret/env var rename is required for route/copy migration. [VERIFIED: rg VITE_ DATABASE_URL DIRECT_URL SHADOW_DATABASE_URL] |
| Build artifacts | Ignored build/cache directories exist: `dist`, `apps/web/dist`, `apps/server/dist`, `packages/contracts/dist`, `.turbo`, and Vite/node module caches. [VERIFIED: find dist .turbo node_modules/.vite] [VERIFIED: .gitignore] | Rebuild after source changes if validating built output; do not edit ignored artifacts as source. [VERIFIED: .gitignore] |

**Nothing found in category:** No runtime data migration is required for `/timeline` -> `/journal`, `/statistics` -> `/memories`, or copy changes. [VERIFIED: rg timeline statistics 点亮 旅行统计 时间轴 apps/server packages/contracts] Build artifacts may still contain stale text until rebuilt because ignored `apps/web/dist` currently contains compiled old strings. [VERIFIED: rg timeline statistics 点亮 apps/web/dist]

## Common Pitfalls

### Pitfall 1: Landing Flash for Authenticated Users

**What goes wrong:** Authenticated users briefly see `/` landing before `/map`. [VERIFIED: .planning/phases/43-landing/43-CONTEXT.md]  
**Why it happens:** Root redirect happens after component mount instead of inside an async router guard that awaits `restoreSession()`. [VERIFIED: apps/web/src/router/index.ts]  
**How to avoid:** Put root redirect in `router.beforeEach` after restore resolves, and keep `App.vue` restore idempotent. [VERIFIED: apps/web/src/stores/auth-session.ts] [CITED: https://github.com/vuejs/router/blob/main/packages/docs/guide/advanced/navigation-guards.md]  
**Warning signs:** Tests need `await router.isReady()` and still observe landing for an authenticated root navigation. [VERIFIED: apps/web/src/router/index.spec.ts]

### Pitfall 2: Redirect Loops Between `/` and `/map`

**What goes wrong:** Anonymous `/map` redirects to `/`, while root logic immediately redirects again. [VERIFIED: apps/web/src/router/index.ts]  
**Why it happens:** Guard checks root before final auth status, or root redirect ignores anonymous status. [VERIFIED: apps/web/src/stores/auth-session.ts]  
**How to avoid:** Order checks as restore first, authenticated-root redirect second, protected-anonymous redirect third. [CITED: https://github.com/vuejs/router/blob/main/packages/docs/guide/advanced/navigation-guards.md]  
**Warning signs:** `router.push('/map')` never settles or current route oscillates in tests. [VERIFIED: apps/web/src/router/index.spec.ts]

### Pitfall 3: Leaving Old Topbar as Hidden Navigation

**What goes wrong:** Users can still see or trigger `时间轴`/`查看统计` through `AuthTopbarControl`. [VERIFIED: apps/web/src/components/auth/AuthTopbarControl.vue]  
**Why it happens:** The shell is added without removing old authenticated navigation responsibilities. [VERIFIED: .planning/phases/43-landing/43-CONTEXT.md]  
**How to avoid:** Move authenticated navigation into `ShellSidebar` and either remove `AuthTopbarControl` from `App.vue` or narrow it so it is not the primary authenticated nav. [VERIFIED: apps/web/src/App.vue]  
**Warning signs:** Specs still assert `data-auth-menu-item="timeline"` or `data-auth-menu-item="statistics"`. [VERIFIED: apps/web/src/components/auth/AuthTopbarControl.spec.ts]

### Pitfall 4: Old Route Compatibility Sneaks Back In

**What goes wrong:** `/timeline` or `/statistics` remain explicit routes or redirects. [VERIFIED: apps/web/src/router/index.ts]  
**Why it happens:** Tests are updated to preserve legacy paths instead of replacing route semantics. [VERIFIED: apps/web/src/router/index.spec.ts]  
**How to avoid:** Define only `/map`, `/journal`, `/memories`, `/__ui`, and catch-all to `/`; old paths should use catch-all behavior. [VERIFIED: .planning/phases/43-landing/43-CONTEXT.md]  
**Warning signs:** `router.resolve('/timeline').name` is not the catch-all/root result. [VERIFIED: apps/web/src/router/index.spec.ts]

### Pitfall 5: Treating Background PNG Text as Accessible Copy

**What goes wrong:** Screen readers and tests cannot find landing CTAs/title, or old baked text contradicts real copy. [VERIFIED: prd/v8.0/切图/落地页上半背景.png]  
**Why it happens:** The design slice is used as a full UI screenshot rather than decorative scene art. [VERIFIED: prd/v8.0/CUTTING-GUIDE.md]  
**How to avoid:** Mark scene images decorative and render title, CTA buttons, auth triggers, and meaningful section copy as HTML. [VERIFIED: .planning/phases/43-landing/43-CONTEXT.md]  
**Warning signs:** Tests assert no real button text for `免费注册` or `立即登录`. [VERIFIED: apps/web/src/components/auth/AuthDialog.spec.ts]

### Pitfall 6: Client Guard Treated as Data Security

**What goes wrong:** Planner relies on client route guards and weakens backend record protection. [VERIFIED: apps/server/src/modules/records/records.controller.ts]  
**Why it happens:** UI auth gating and API access control are conflated. [VERIFIED: apps/web/src/router/index.ts]  
**How to avoid:** Keep `SessionAuthGuard` on records/stats endpoints and keep `credentials: 'include'` in API client. [VERIFIED: apps/server/src/modules/records/records.controller.ts] [VERIFIED: apps/web/src/services/api/client.ts]  
**Warning signs:** Records/stats endpoints lose `@UseGuards(SessionAuthGuard)`. [VERIFIED: apps/server/src/modules/records/records.controller.ts]

## Code Examples

Verified patterns from current code and official sources:

### Route Definitions

```ts
// Source: current router plus Vue Router route-meta guard pattern.
const protectedRouteMeta = { requiresAuth: true }

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'landing', component: LandingPageView },
    { path: '/map', name: 'world-footprints', component: MapHomeView, meta: protectedRouteMeta },
    { path: '/journal', name: 'travel-journal', component: TimelinePageView, meta: protectedRouteMeta },
    { path: '/memories', name: 'travel-memories', component: StatisticsPageView, meta: protectedRouteMeta },
    {
      path: '/__ui',
      name: 'ui-showcase',
      beforeEnter: () => (import.meta.env.DEV ? true : { path: '/' }),
      component: () => import('../views/UiShowcaseView.vue'),
    },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})
```

### Landing CTA Triggers

```vue
<!-- Source: existing auth store openAuthModal API. -->
<script setup lang="ts">
import { useAuthSessionStore } from '@/stores/auth-session'

const authSessionStore = useAuthSessionStore()
</script>

<template>
  <button type="button" data-auth-trigger="landing-register" @click="authSessionStore.openAuthModal('register')">
    免费注册
  </button>
  <button type="button" data-auth-trigger="landing-login" @click="authSessionStore.openAuthModal('login')">
    立即登录
  </button>
</template>
```

### Sidebar Nav Entries

```vue
<!-- Source: shadcn-vue SidebarMenuButton asChild pattern plus KawaiiIcon semantic names. -->
<SidebarMenuItem v-for="item in navItems" :key="item.to">
  <SidebarMenuButton as-child :data-active="route.path === item.to">
    <RouterLink :to="item.to">
      <KawaiiIcon :name="item.icon" :label="item.label" :decorative="false" :size="22" />
      <span>{{ item.label }}</span>
    </RouterLink>
  </SidebarMenuButton>
</SidebarMenuItem>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `/` mounted the map directly. | `/` becomes public landing; authenticated root redirects to `/map`. | Phase 43 decision, 2026-05-11. [VERIFIED: .planning/phases/43-landing/43-CONTEXT.md] | Tests and memory routers must stop assuming map at root. [VERIFIED: apps/web/src/App.spec.ts] |
| `/timeline` and `/statistics` were protected app routes. | `/journal` and `/memories` replace old route semantics. | Phase 43 decision, 2026-05-11. [VERIFIED: .planning/phases/43-landing/43-CONTEXT.md] | Route names, `data-route-view`, nav labels, and tests need synchronized vocabulary. [VERIFIED: apps/web/src/router/index.spec.ts] |
| `AuthTopbarControl` carried authenticated navigation. | Authenticated app shell uses a left sidebar as primary navigation. | Phase 43 decision, 2026-05-11. [VERIFIED: .planning/phases/43-landing/43-CONTEXT.md] | Remove topbar nav assertions and add sidebar assertions. [VERIFIED: apps/web/src/components/auth/AuthTopbarControl.spec.ts] |
| Landing/auth entry was a topbar chip over the app shell. | Landing has full-page high-fidelity scene and real DOM auth CTAs. | Phase 43 decision, 2026-05-11. [VERIFIED: .planning/phases/43-landing/43-CONTEXT.md] | Landing tests should assert actual button behavior and absence of authenticated shell. [VERIFIED: apps/web/src/App.vue] |
| Mobile shell adaptation was a requirement in `SHELL-03`. | Mobile compatibility is explicitly out of scope for this phase. | Phase 43 context, 2026-05-11. [VERIFIED: .planning/phases/43-landing/43-CONTEXT.md] | Planner should not allocate mobile drawer/bottom-nav tasks in Phase 43. [VERIFIED: .planning/phases/43-landing/43-CONTEXT.md] |

**Deprecated/outdated:**
- `data-route-view="timeline"` and `data-route-view="statistics"` are route-facing semantics that should become `journal` and `memories`. [VERIFIED: apps/web/src/views/TimelinePageView.vue] [VERIFIED: apps/web/src/views/StatisticsPageView.vue]
- User-facing `时间轴` and `旅行统计` copy in Phase 43-owned pages should become `旅途手账` and `旅途回忆`. [VERIFIED: .planning/phases/43-landing/43-CONTEXT.md]
- User-facing `点亮` copy in Phase 43-owned surfaces should become `留下足迹`; map popup/date-dialog behavior remains Phase 44. [VERIFIED: .planning/phases/43-landing/43-CONTEXT.md]

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| — | No `[ASSUMED]` claims were used. | All sections | — |

**If this table is empty:** All claims in this research were verified or cited; no user confirmation is needed for research conclusions. [VERIFIED: RESEARCH.md self-check]

## Open Questions (RESOLVED)

1. **RESOLVED: Selected transparent `切图 X@2x.png` asset mapping for Phase 43.**  
   - Landing backgrounds are fixed by D-02 and the UI-SPEC asset contract: `prd/v8.0/切图/落地页上半背景.png` -> `apps/web/src/assets/v8/landing/landing-upper-bg.png`; `prd/v8.0/切图/落地页下半背景.png` -> `apps/web/src/assets/v8/landing/landing-lower-bg.png`. [VERIFIED: .planning/phases/43-landing/43-CONTEXT.md] [VERIFIED: .planning/phases/43-landing/43-UI-SPEC.md]  
   - Landing support assets are selected for optional high-fidelity restoration: `prd/v8.0/切图/切图 5@2x.png` -> `apps/web/src/assets/v8/landing/travel-postcards.png`; `prd/v8.0/切图/切图 12@2x.png` -> `apps/web/src/assets/v8/landing/cta-mascot.png`; `prd/v8.0/切图/切图 6@2x.png` -> `apps/web/src/assets/v8/mascots/logo-cat-outline.png`. [VERIFIED: .planning/phases/43-landing/43-UI-SPEC.md]  
   - Shell assets are selected explicitly: `prd/v8.0/切图/切图 13@2x.png` -> `apps/web/src/assets/v8/shell/default-avatar.png`; `prd/v8.0/切图/切图 17@2x.png` -> `apps/web/src/assets/v8/shell/sidebar-illustration.png`. [VERIFIED: .planning/phases/43-landing/43-UI-SPEC.md]  
   - Phase 43 Plan 01 Task 1 implements this mapping as copy-only asset work before landing/shell UI imports these semantic English paths. [VERIFIED: .planning/phases/43-landing/43-01-PLAN.md]

2. **RESOLVED: Phase 43 includes lightweight browser screenshot verification, while broad visual QA remains Phase 48.**  
   - Plan 04 now includes a blocking browser/manual screenshot gate for `/` and `/map` at desktop viewports `1366x768`, `1440x900`, `1536x1024`, and `1920x1080`. [VERIFIED: .planning/phases/43-landing/43-04-PLAN.md]  
   - The gate checks the UI-SPEC desktop constraints most likely to regress in implementation: centered `1536px` landing stage, `1672px` scene background bleed, hero text offset near `clamp(96px, 9vw, 144px)` and `128px` top, bottom CTA panel width `min(1240px, calc(100vw - 160px))` with at least `120px` height, no viewport-width font scaling, and authenticated `/map` shell sidebar width `280px` without old topbar/navigation overlap. [VERIFIED: .planning/phases/43-landing/43-UI-SPEC.md]  
   - Phase 48 still owns broad multi-page visual QA across desktop/mobile, maps, charts, dialogs, and motion/accessibility regression. [VERIFIED: .planning/ROADMAP.md]

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|-------------|-----------|---------|----------|
| Node.js | Vite/Vitest/Vue tooling | ✓ | `v24.15.0` | — |
| pnpm | Workspace scripts | ✓ | `10.33.0`; sandbox `pnpm --version` initially failed with `fetch failed`, and escalated command verified availability. [VERIFIED: pnpm --version] | Use approved/escalated pnpm execution if sandbox self-fetch repeats. |
| npm | Registry version verification | ✓ | `11.12.1` | — |
| Vitest | Web unit/component tests | ✓ | `vitest/4.1.4 darwin-arm64 node-v24.15.0` | — |
| vue-tsc / TypeScript | Web typecheck/build | ✓ | TypeScript `5.9.3`; `vue-tsc` installed `3.2.6`. [VERIFIED: pnpm --filter @trip-map/web exec vue-tsc --version] [VERIFIED: apps/web/package.json] | — |
| Vite | Dev/build and asset bundling | ✓ | installed `8.0.8` | — |
| v8 PNG assets | Landing/shell visual restoration | ✓ | `prd/v8.0/UI/落地页.png` is `1536 x 1024`; landing backgrounds are `1672 x 941`. [VERIFIED: file prd/v8.0/UI/落地页.png prd/v8.0/切图/落地页上半背景.png prd/v8.0/切图/落地页下半背景.png] | Use existing design PNGs as visual authority if a transparent slice is unsuitable. [VERIFIED: prd/v8.0/CUTTING-GUIDE.md] |

**Missing dependencies with no fallback:**
- None found for Phase 43 research and planned implementation. [VERIFIED: environment audit]

**Missing dependencies with fallback:**
- None found; pnpm may require non-sandbox execution if Corepack/package-manager self-fetch fails inside the sandbox. [VERIFIED: pnpm --version]

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest `4.1.4` + Vue Test Utils `2.4.6` + `happy-dom` `20.9.0`. [VERIFIED: apps/web/package.json] [VERIFIED: apps/web/vitest.config.ts] |
| Config file | `apps/web/vitest.config.ts`. [VERIFIED: apps/web/vitest.config.ts] |
| Quick run command | `pnpm --filter @trip-map/web exec vitest run src/router/index.spec.ts src/App.spec.ts src/components/auth/AuthDialog.spec.ts` |
| Full suite command | `pnpm --filter @trip-map/web test` |
| Build/typecheck command | `pnpm --filter @trip-map/web build` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| AUTH-01 | Anonymous `/` renders landing and not map shell. | component/router | `pnpm --filter @trip-map/web exec vitest run src/App.spec.ts src/views/LandingPageView.spec.ts` | ❌ Wave 0 for landing spec |
| AUTH-02 | Authenticated `/` redirects to `/map` after restore. | router unit | `pnpm --filter @trip-map/web exec vitest run src/router/index.spec.ts` | ✅ update existing |
| AUTH-03 | Anonymous `/map`, `/journal`, `/memories` redirect to `/`. | router unit | `pnpm --filter @trip-map/web exec vitest run src/router/index.spec.ts` | ✅ update existing |
| AUTH-04 | Landing register/login CTAs open correct auth modes. | component | `pnpm --filter @trip-map/web exec vitest run src/views/LandingPageView.spec.ts src/components/auth/AuthDialog.spec.ts` | ❌ Wave 0 for landing spec |
| AUTH-05 | Login/register success hydrates records and navigates `/map`. | component/store | `pnpm --filter @trip-map/web exec vitest run src/components/auth/AuthDialog.spec.ts src/stores/auth-session.spec.ts src/App.spec.ts` | ✅ update existing |
| SHELL-01 | Authenticated app shell shows exactly three nav entries. | component | `pnpm --filter @trip-map/web exec vitest run src/components/shell/AuthenticatedAppShell.spec.ts src/App.spec.ts` | ❌ Wave 0 |
| SHELL-02 | Sidebar shows avatar + username + illustration, no collection/stats/summary. | component | `pnpm --filter @trip-map/web exec vitest run src/components/shell/AuthenticatedAppShell.spec.ts` | ❌ Wave 0 |
| SHELL-03 | Mobile shell adaptation is out of scope by context override. | documentation/assertion | `pnpm --filter @trip-map/web exec vitest run src/components/shell/AuthenticatedAppShell.spec.ts` can assert no mobile-only nav is required. | ❌ Wave 0 if asserted |
| SHELL-04 | Route-facing copy and tests use `世界足迹`, `旅途手账`, `旅途回忆`, and Phase 43-owned `留下足迹`. | component + grep audit | `pnpm --filter @trip-map/web exec vitest run src/router/index.spec.ts src/App.spec.ts src/views/TimelinePageView.spec.ts src/views/StatisticsPageView.spec.ts` | ✅ update existing |

### Sampling Rate

- **Per task commit:** Run the focused spec for the edited area, usually `src/router/index.spec.ts`, `src/App.spec.ts`, `src/views/LandingPageView.spec.ts`, or `src/components/shell/AuthenticatedAppShell.spec.ts`. [VERIFIED: apps/web/vitest.config.ts]
- **Per wave merge:** Run `pnpm --filter @trip-map/web test`. [VERIFIED: apps/web/package.json]
- **Phase gate:** Run `pnpm --filter @trip-map/web test` and `pnpm --filter @trip-map/web build` before `$gsd-verify-work`. [VERIFIED: apps/web/package.json]

### Wave 0 Gaps

- [ ] `apps/web/src/views/LandingPageView.spec.ts` — covers AUTH-01 and AUTH-04. [VERIFIED: rg LandingPageView.spec.ts]
- [ ] `apps/web/src/components/shell/AuthenticatedAppShell.spec.ts` — covers SHELL-01, SHELL-02, and the SHELL-03 context override. [VERIFIED: rg AuthenticatedAppShell.spec.ts]
- [ ] Update `apps/web/src/router/index.spec.ts` — covers `/`, `/map`, `/journal`, `/memories`, no `/timeline`/`/statistics` compatibility. [VERIFIED: apps/web/src/router/index.spec.ts]
- [ ] Update `apps/web/src/App.spec.ts` and `apps/web/src/App.kawaii.spec.ts` — covers public landing vs authenticated shell branching. [VERIFIED: apps/web/src/App.spec.ts] [VERIFIED: apps/web/src/App.kawaii.spec.ts]
- [ ] Update `apps/web/src/components/auth/AuthDialog.spec.ts` — covers post-login/register navigation to `/map`. [VERIFIED: apps/web/src/components/auth/AuthDialog.spec.ts]

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | yes | Reuse existing login/register endpoints and `AuthDialog`; backend validates DTOs and hashes passwords with argon2. [VERIFIED: apps/server/src/modules/auth/dto/login.dto.ts] [VERIFIED: apps/server/src/modules/auth/dto/register.dto.ts] [VERIFIED: apps/server/src/modules/auth/auth.service.ts] [CITED: https://owasp.org/www-project-application-security-verification-standard/] |
| V3 Session Management | yes | Backend `sid` cookie is `httpOnly`, `sameSite: 'lax'`, path `/`, production `secure`, and 30-day max-age; frontend fetch includes credentials. [VERIFIED: apps/server/src/modules/auth/auth.controller.ts] [VERIFIED: apps/web/src/services/api/client.ts] [CITED: https://owasp.org/www-project-application-security-verification-standard/] |
| V4 Access Control | yes | Client route guard is UX only; backend `SessionAuthGuard` protects records and stats endpoints. [VERIFIED: apps/web/src/router/index.ts] [VERIFIED: apps/server/src/modules/records/records.controller.ts] [CITED: https://owasp.org/www-project-application-security-verification-standard/] |
| V5 Input Validation | yes | Existing backend `ValidationPipe` and auth DTOs validate login/register input; Phase 43 should not bypass them. [VERIFIED: apps/server/src/main.ts] [VERIFIED: apps/server/src/modules/auth/dto/login.dto.ts] [VERIFIED: apps/server/src/modules/auth/dto/register.dto.ts] |
| V6 Cryptography | yes | Password hashing is already handled with `argon2`; Phase 43 must not add custom cryptography. [VERIFIED: apps/server/src/modules/auth/auth.service.ts] |

### Known Threat Patterns for Vue SPA + Cookie Session

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Open redirect after login | Spoofing | Do not preserve redirect intent; always navigate to `/map` after login/register. [VERIFIED: .planning/phases/43-landing/43-CONTEXT.md] |
| Data exposure through client-only protection | Information Disclosure | Keep backend `SessionAuthGuard` on records/stats APIs and treat client guard as routing UX. [VERIFIED: apps/server/src/modules/records/records.controller.ts] |
| Session restore flash exposing wrong UI | Information Disclosure | Await `restoreSession()` before root route decision and show restore/loading state. [VERIFIED: .planning/phases/43-landing/43-CONTEXT.md] [VERIFIED: apps/web/src/stores/auth-session.ts] |
| Forged user identity in request body/header | Elevation of Privilege | Backend guard resolves current user from `cookies.sid`; existing guard tests ignore forged owner hints. [VERIFIED: apps/server/src/modules/auth/guards/session-auth.guard.ts] [VERIFIED: apps/server/src/modules/auth/guards/session-auth.guard.spec.ts] |
| CSRF pressure on cookie-auth mutating endpoints | Tampering | Phase 43 adds no new mutating backend endpoint and must preserve `sameSite: 'lax'` cookie settings. [VERIFIED: apps/server/src/modules/auth/auth.controller.ts] |

## Sources

### Primary (HIGH confidence)

- `.planning/phases/43-landing/43-CONTEXT.md` — locked user decisions for landing fidelity, auth redirects, shell, routes, copy, and out-of-scope mobile work. [VERIFIED: .planning/phases/43-landing/43-CONTEXT.md]
- `.planning/REQUIREMENTS.md` — AUTH-01 through AUTH-05 and SHELL-01 through SHELL-04. [VERIFIED: .planning/REQUIREMENTS.md]
- `.planning/ROADMAP.md` — Phase 43 scope, dependencies, and Phase 48 visual QA boundary. [VERIFIED: .planning/ROADMAP.md]
- `apps/web/src/router/index.ts`, `apps/web/src/App.vue`, `apps/web/src/stores/auth-session.ts`, `apps/web/src/components/auth/AuthDialog.vue`, and `apps/web/src/components/auth/AuthTopbarControl.vue` — current frontend routing/auth/shell implementation. [VERIFIED: codebase grep/read]
- `apps/server/src/modules/auth/*`, `apps/server/src/modules/records/records.controller.ts`, `packages/contracts/src/auth.ts`, and `packages/contracts/src/bootstrap.ts` — current auth/session/API contract. [VERIFIED: codebase grep/read]
- `prd/v8.0/UI/落地页.png`, `prd/v8.0/UI/世界足迹.png`, `prd/v8.0/UI/旅途手帐.png`, `prd/v8.0/UI/旅途回忆.png`, `prd/v8.0/ASSET-MANIFEST.md`, and `prd/v8.0/CUTTING-GUIDE.md` — visual and asset authority. [VERIFIED: image/file/read]
- Context7 `/vuejs/router` — global navigation guards, async guards, and redirect returns. [CITED: https://github.com/vuejs/router/blob/main/packages/docs/guide/advanced/navigation-guards.md]
- Context7 `/vuejs/pinia` — store usage outside setup/router guard considerations. [CITED: https://github.com/vuejs/pinia/blob/v4/packages/docs/ssr/index.md]
- Context7 `/vitejs/vite/v8.0.10` — static asset imports and `new URL(..., import.meta.url)`. [CITED: https://github.com/vitejs/vite/blob/v8.0.10/docs/guide/assets.md]
- Context7 `/unovue/shadcn-vue/v1_0_3` — Sidebar provider, inset, menu button, and `asChild` patterns. [CITED: https://github.com/unovue/shadcn-vue/blob/v1_0_3/apps/www/src/content/docs/components/sidebar.md]
- OWASP ASVS project page — security category frame used for V2/V3/V4/V5/V6 mapping. [CITED: https://owasp.org/www-project-application-security-verification-standard/]
- npm registry — package latest versions and modification times. [VERIFIED: npm registry]

### Secondary (MEDIUM confidence)

- `.planning/research/SUMMARY.md` — v8 milestone research summary for landing/auth/shell dependency choices, cross-checked against current code and Phase 43 context. [VERIFIED: .planning/research/SUMMARY.md]
- Phase 42 context/research — generated primitives, `KawaiiIcon`, and v8 token bridge availability, cross-checked against current files. [VERIFIED: .planning/phases/42-ui-primitives-yume-kawaii-theme-bridge/42-CONTEXT.md] [VERIFIED: apps/web/src/components/ui/sidebar/index.ts]

### Tertiary (LOW confidence)

- None. [VERIFIED: source audit]

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — installed packages, lockfile versions, registry versions, and generated files were verified. [VERIFIED: apps/web/package.json] [VERIFIED: pnpm-lock.yaml] [VERIFIED: npm registry]
- Architecture: HIGH — current router/auth/App code and official Vue Router docs directly support the recommended guard/shell split. [VERIFIED: apps/web/src/router/index.ts] [VERIFIED: apps/web/src/App.vue] [CITED: https://github.com/vuejs/router/blob/main/packages/docs/guide/advanced/navigation-guards.md]
- Pitfalls: HIGH — pitfalls are grounded in current old route/topbar/copy tests and locked Phase 43 decisions. [VERIFIED: apps/web/src/router/index.spec.ts] [VERIFIED: apps/web/src/components/auth/AuthTopbarControl.spec.ts] [VERIFIED: .planning/phases/43-landing/43-CONTEXT.md]
- Runtime state: MEDIUM-HIGH — repo, env names, localStorage code, and build artifacts were checked; OS-wide service registries and external cloud dashboards were not queried. [VERIFIED: rg/find audits]
- Security: HIGH — backend cookie/session controls, API credentials, auth DTOs, and records guards were verified in source. [VERIFIED: apps/server/src/modules/auth/auth.controller.ts] [VERIFIED: apps/server/src/modules/records/records.controller.ts]

**Research date:** 2026-05-11  
**Valid until:** 2026-06-10
