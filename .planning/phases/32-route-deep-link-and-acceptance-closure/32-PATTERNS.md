# Phase 32: Route Deep-Link & Acceptance Closure - Pattern Map

**Mapped:** 2026-04-28
**Files analyzed:** 10
**Analogs found:** 9 / 10

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `apps/web/src/router/index.ts` | route | request-response | `apps/web/src/router/index.ts` | exact |
| `apps/web/src/router/index.spec.ts` | test | request-response | `apps/web/src/App.spec.ts` | role-match |
| `.planning/phases/29-timeline-page-and-account-entry/29-HUMAN-UAT.md` | test | request-response | `.planning/phases/29-timeline-page-and-account-entry/29-HUMAN-UAT.md` | exact |
| `.planning/phases/29-timeline-page-and-account-entry/29-VERIFICATION.md` | test | request-response | `.planning/phases/29-timeline-page-and-account-entry/29-VERIFICATION.md` | exact |
| `.planning/phases/30-travel-statistics-and-completion-overview/30-HUMAN-UAT.md` | test | request-response | `.planning/phases/30-travel-statistics-and-completion-overview/30-HUMAN-UAT.md` | exact |
| `.planning/phases/30-travel-statistics-and-completion-overview/30-VERIFICATION.md` | test | request-response | `.planning/phases/30-travel-statistics-and-completion-overview/30-VERIFICATION.md` | exact |
| `.planning/phases/32-route-deep-link-and-acceptance-closure/32-HUMAN-UAT.md` | test | request-response | `.planning/phases/31-statistics-sync-refresh-hardening/31-HUMAN-UAT.md` | exact |
| `.planning/phases/32-route-deep-link-and-acceptance-closure/32-VERIFICATION.md` | test | request-response | `.planning/phases/31-statistics-sync-refresh-hardening/31-VERIFICATION.md` | exact |
| `.planning/ROADMAP.md` | config | transform | `.planning/ROADMAP.md` | exact |
| `<provider-specific SPA fallback config>` | config | request-response | none | no-analog |

## Pattern Assignments

### `apps/web/src/router/index.ts` (route, request-response)

**Analog:** `apps/web/src/router/index.ts`

**Current route-table pattern** (`apps/web/src/router/index.ts` lines 1-29):
```typescript
import { createRouter, createWebHistory } from 'vue-router'

import MapHomeView from '../views/MapHomeView.vue'
import StatisticsPageView from '../views/StatisticsPageView.vue'
import TimelinePageView from '../views/TimelinePageView.vue'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'map-home',
      component: MapHomeView,
    },
    {
      path: '/timeline',
      name: 'timeline',
      component: TimelinePageView,
    },
    {
      path: '/statistics',
      name: 'statistics',
      component: StatisticsPageView,
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
})
```

**Auth restore contract to reuse** (`apps/web/src/stores/auth-session.ts` lines 168-208):
```typescript
function restoreSession(): Promise<void> {
  if (restorePromise.value) {
    return restorePromise.value
  }

  if (hasRestoredOnce.value) {
    return Promise.resolve()
  }

  status.value = 'restoring'
  const pendingRestore = (async () => {
    try {
      const bootstrap = await fetchAuthBootstrap()

      if (!bootstrap.authenticated) {
        applyAnonymousSnapshot()
        return
      }

      applyAuthenticatedSnapshot(bootstrap)
    } catch (error) {
      if (isSessionUnauthorizedApiClientError(error)) {
        applyAnonymousSnapshot()
        return
      }

      applyAnonymousSnapshot({
        notice: {
          tone: 'warning',
          message: RESTORE_FAILED_NOTICE,
        },
      })
    } finally {
      hasRestoredOnce.value = true
      restorePromise.value = null
    }
  })()

  restorePromise.value = pendingRestore
  return pendingRestore
}
```

**Unauthorized boundary pattern** (`apps/web/src/stores/auth-session.ts` lines 292-299):
```typescript
function handleUnauthorized() {
  applyAnonymousSnapshot({
    notice: {
      tone: 'warning',
      message: SESSION_EXPIRED_NOTICE,
    },
  })
}
```

**Planner note:** Codebase has no existing router guard. Add `meta.requiresAuth` and a single `router.beforeEach(...)` here, and base it on the existing `status/currentUser/restoreSession()` contract from `auth-session.ts`. Do not move fail-closed policy into page templates unless the router layer proves insufficient.

---

### `apps/web/src/router/index.spec.ts` (test, request-response)

**Analog:** `apps/web/src/App.spec.ts`

**Pinia + router harness pattern** (`apps/web/src/App.spec.ts` lines 58-103):
```typescript
async function mountApp(
  setup?: (authSessionStore: ReturnType<typeof useAuthSessionStore>) => void,
  route = '/',
) {
  const pinia = createPinia()
  const appRouter = createRouter({
    history: createMemoryHistory(),
    routes: [
      {
        path: '/',
        name: 'map-home',
        component: MapHomeView,
      },
      {
        path: '/timeline',
        name: 'timeline',
        component: TimelinePageView,
      },
      {
        path: '/:pathMatch(.*)*',
        redirect: '/',
      },
    ],
  })
  setActivePinia(pinia)

  const authSessionStore = useAuthSessionStore()
  setup?.(authSessionStore)
  // ...
}
```

**Route assertion pattern** (`apps/web/src/App.spec.ts` lines 306-340):
```typescript
it('renders timeline route without LeafletMapStage', async () => {
  const { wrapper } = await mountApp((authSessionStore) => {
    authSessionStore.status = 'anonymous'
    authSessionStore.currentUser = null
    vi.spyOn(authSessionStore, 'restoreSession').mockResolvedValue(undefined)
  }, '/timeline')

  expect(wrapper.find('[data-route-view="timeline"]').exists()).toBe(true)
  expect(wrapper.find('[data-region="timeline-shell"]').exists()).toBe(true)
  expect(wrapper.find('[data-region="map-stage"]').exists()).toBe(false)
})
```

**Anti-pattern to avoid** (`.planning/phases/29-timeline-page-and-account-entry/29-VERIFICATION.md` lines 103-105):
```markdown
| `apps/web/src/App.spec.ts` | 63 | 测试内重复定义 memory router 路由表，而不是直接复用 `src/router/index.ts` | ⚠️ Warning | 如果运行时路由路径或命名未来发生漂移，而测试夹具未同步更新，route-shell 回归可能出现假阳性。 |
```

**Planner note:** New router regression should import the real `src/router/index.ts` instead of copying a local route table again. Reuse the Pinia setup / `restoreSession` spy shape from `App.spec.ts`, but make drift impossible by testing the actual router module.

---

### `.planning/phases/29-timeline-page-and-account-entry/29-HUMAN-UAT.md` (test, request-response)

**Analog:** `.planning/phases/29-timeline-page-and-account-entry/29-HUMAN-UAT.md`

**Frontmatter + pending-state pattern** (lines 1-12):
```markdown
---
status: partial
phase: 29-timeline-page-and-account-entry
source: [29-VERIFICATION.md]
started: 2026-04-23T04:45:19Z
updated: 2026-04-23T04:45:19Z
---

## Current Test

[awaiting human testing]
```

**Test matrix pattern** (lines 13-25):
```markdown
## Tests

### 1. 使用真实已登录账号，从用户名菜单点击“时间轴”进入 #/timeline
expected: 菜单先关闭，URL 切到 #/timeline，共享顶栏保留，地图舞台消失，并出现独立时间轴页面
result: [pending]
```

**Summary counters pattern** (lines 27-35):
```markdown
## Summary

total: 3
passed: 0
issues: 0
pending: 3
skipped: 0
blocked: 0
```

**Deep-link wording to borrow** (`.planning/phases/30-travel-statistics-and-completion-overview/30-HUMAN-UAT.md` lines 21-23):
```markdown
### 2. 部署环境 deep-link / refresh 验收
expected: 若继续使用 `createWebHistory()`，实际部署环境必须提供 SPA rewrite/fallback；直接访问和刷新 `/statistics`、`/timeline` 不应返回 404
result: pending
```

**Planner note:** Keep the current file structure, but replace all `#/timeline` wording with `/timeline`, add explicit direct-open + refresh checks, and keep this document phase-local instead of introducing a new Phase 29 UAT format.

---

### `.planning/phases/29-timeline-page-and-account-entry/29-VERIFICATION.md` (test, request-response)

**Analog:** `.planning/phases/29-timeline-page-and-account-entry/29-VERIFICATION.md`

**Current frontmatter pattern** (lines 1-17):
```yaml
---
phase: 29-timeline-page-and-account-entry
verified: 2026-04-23T04:40:25Z
status: human_needed
score: 8/8 must-haves verified
overrides_applied: 0
human_verification:
  - test: "使用真实已登录账号，从用户名菜单点击“时间轴”进入 #/timeline"
    expected: "菜单先关闭，URL 切到 #/timeline，共享顶栏保留，地图舞台消失，并出现独立时间轴页面"
    why_human: "这属于真实浏览器用户流与视觉集成验证，组件测试无法完全替代"
---
```

**Human-verification section pattern** (lines 109-127):
```markdown
### 1. 已登录菜单跳转链路

**Test:** 使用真实已登录账号，点击顶栏用户名展开菜单，再点击“时间轴”。  
**Expected:** 菜单关闭，地址切到 `#/timeline`，共享顶栏保留，地图舞台消失，出现独立时间轴页面。  
**Why human:** 这是完整用户流和真实浏览器渲染验证，happy-dom 与 mock router 不能完全替代。
```

**Completion frontmatter to copy when closed** (`.planning/phases/31-statistics-sync-refresh-hardening/31-VERIFICATION.md` lines 1-13):
```yaml
---
phase: 31-statistics-sync-refresh-hardening
verified: 2026-04-27T09:19:40Z
status: passed
score: 7/7 must-haves verified
overrides_applied: 0
human_verification_status: approved
human_verification_approved_at: 2026-04-27T09:31:19Z
human_verification:
  - test: "真实浏览器下触发 bootstrap / same-user sync 后检查 Statistics 与 Timeline 同步"
    expected: "无需手动整页刷新，Statistics 的国家数/完成度会在权威 metadata 刷新后及时更新，并与 Timeline 的地点归类一致；无账号切换提示或额外 UI 抖动"
---
```

**Planner note:** Use the existing Phase 29 verification body as the base, but normalize all route strings to clean URLs and upgrade frontmatter/status to the passed pattern only after human evidence is written back.

---

### `.planning/phases/30-travel-statistics-and-completion-overview/30-HUMAN-UAT.md` (test, request-response)

**Analog:** `.planning/phases/30-travel-statistics-and-completion-overview/30-HUMAN-UAT.md`

**Pending checklist pattern** (lines 9-23):
```markdown
## Current Test

等待人工验收：
- 统计页真实浏览器可读性与三指标理解成本
- 部署环境 `/statistics` 与 `/timeline` deep-link / refresh

## Tests

### 1. 统计页真实浏览器验收
expected: 页面显示总旅行次数、已去过地点数、已去过国家/地区数三张卡片，并展示“当前支持覆盖 21 个国家/地区”的说明；三项统计之间的含义差异对用户清晰可理解
result: pending
```

**Deep-link test wording** (lines 21-23):
```markdown
### 2. 部署环境 deep-link / refresh 验收
expected: 若继续使用 `createWebHistory()`，实际部署环境必须提供 SPA rewrite/fallback；直接访问和刷新 `/statistics`、`/timeline` 不应返回 404
result: pending
```

**Completed-state summary pattern** (`.planning/phases/31-statistics-sync-refresh-hardening/31-HUMAN-UAT.md` lines 15-31):
```markdown
## Tests

### 1. 真实浏览器下触发 bootstrap / same-user sync 后检查 Statistics 与 Timeline 同步

expected: 无需手动整页刷新，Statistics 的国家数/完成度会在权威 metadata 刷新后及时更新，并与 Timeline 的地点归类一致；无账号切换提示或额外 UI 抖动。

result: pass
reported: "approved"
```

**Planner note:** Keep the current two-test shape, but close it with `result: pass` / `reported: "approved"` once Phase 32 evidence is available.

---

### `.planning/phases/30-travel-statistics-and-completion-overview/30-VERIFICATION.md` (test, request-response)

**Analog:** `.planning/phases/30-travel-statistics-and-completion-overview/30-VERIFICATION.md`

**Current human-needed frontmatter** (lines 16-22):
```yaml
human_verification:
  - test: "以已登录用户访问 /statistics，检查三项统计卡片与完成度说明"
    expected: "页面显示总旅行次数、已去过地点数、已去过国家/地区数，并展示“当前支持覆盖 21 个国家/地区”的说明"
    why_human: "自动化测试只验证状态切换和文本断言；视觉层级、卡片排版和真实浏览器交互仍需人工确认"
  - test: "在实际部署环境直接访问并刷新 /statistics 与 /timeline"
    expected: "若继续使用 createWebHistory()，部署必须提供 SPA rewrite/fallback，深链接直达和刷新不应返回 404"
    why_human: "仓库内未见可验证的生产 rewrite 配置，是否安全取决于外部托管环境"
```

**Current fallback-risk wording** (lines 122-149):
```markdown
### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
| --- | --- | --- | --- | --- |
| `apps/web/src/router/index.ts` | 1 | `createWebHistory()` without repo-visible SPA fallback | ⚠️ Warning | 该风险影响真实部署环境中的 deep-link / refresh，可导致 `/statistics`、`/timeline` 直达或刷新时返回 404；它不是 Phase 30 核心统计链路阻塞，但需要在实际部署环境中确认 rewrite/fallback。 |
```

**Passed-state closure pattern** (`.planning/phases/31-statistics-sync-refresh-hardening/31-VERIFICATION.md` lines 88-98):
```markdown
### Human Verification Completed

### 1. Bootstrap / Same-User Metadata Freshness

**Test:** 使用一个已经发生 overseas authoritative metadata 修正的真实账号，先查看 Timeline 中的地点标题/归类，然后保持 `/statistics` 打开状态触发 same-user sync；随后重新打开应用触发 `/auth/bootstrap` 并再次查看统计页。  
**Expected:** 无需手动刷新 `/statistics`，`已去过国家/地区数` 与 completion 文案会跟随新的 `parentLabel`/`displayName`/`typeLabel`/`subtitle` 更新，并与 Timeline 一致；过程中不出现“已切换到 ...”提示，也不新增额外 loading/banner。  
**Result:** pass — user approved on 2026-04-27T09:31:19Z.
```

**Planner note:** Keep the current statistics evidence body, but convert it from `human_needed` to a closed report only after deploy fallback proof and real-browser readability proof are both attached.

---

### `.planning/phases/32-route-deep-link-and-acceptance-closure/32-HUMAN-UAT.md` (test, request-response)

**Analog:** `.planning/phases/31-statistics-sync-refresh-hardening/31-HUMAN-UAT.md`

**Completed UAT file shape** (`.planning/phases/31-statistics-sync-refresh-hardening/31-HUMAN-UAT.md` lines 1-33):
```markdown
---
status: complete
phase: 31-statistics-sync-refresh-hardening
source: [31-VERIFICATION.md]
started: 2026-04-27T09:23:17Z
updated: 2026-04-27T09:31:19Z
---

# Phase 31 Human UAT

## Current Test

[testing complete]
```

**Multi-case checklist wording to reuse** (`.planning/phases/30-travel-statistics-and-completion-overview/30-HUMAN-UAT.md` lines 15-36):
```markdown
## Tests

### 1. 统计页真实浏览器验收
expected: 页面显示总旅行次数、已去过地点数、已去过国家/地区数三张卡片，并展示“当前支持覆盖 21 个国家/地区”的说明；三项统计之间的含义差异对用户清晰可理解
result: pending

### 2. 部署环境 deep-link / refresh 验收
expected: 若继续使用 `createWebHistory()`，实际部署环境必须提供 SPA rewrite/fallback；直接访问和刷新 `/statistics`、`/timeline` 不应返回 404
result: pending
```

**Planner note:** Phase 32 should keep this same `Current Test -> Tests -> Summary -> Gaps` structure, but combine both route pages into one closure doc: authenticated desktop/mobile readability plus `/timeline` and `/statistics` direct-open/refresh evidence.

---

### `.planning/phases/32-route-deep-link-and-acceptance-closure/32-VERIFICATION.md` (test, request-response)

**Analog:** `.planning/phases/31-statistics-sync-refresh-hardening/31-VERIFICATION.md`

**Frontmatter + report framing pattern** (`.planning/phases/31-statistics-sync-refresh-hardening/31-VERIFICATION.md` lines 1-20):
```yaml
---
phase: 31-statistics-sync-refresh-hardening
verified: 2026-04-27T09:19:40Z
status: passed
score: 7/7 must-haves verified
overrides_applied: 0
human_verification_status: approved
human_verification_approved_at: 2026-04-27T09:31:19Z
human_verification:
  - test: "真实浏览器下触发 bootstrap / same-user sync 后检查 Statistics 与 Timeline 同步"
    expected: "无需手动整页刷新，Statistics 的国家数/完成度会在权威 metadata 刷新后及时更新，并与 Timeline 的地点归类一致；无账号切换提示或额外 UI 抖动"
---
```

**Deploy-fallback evidence wording to reuse** (`.planning/phases/30-travel-statistics-and-completion-overview/30-VERIFICATION.md` lines 136-140):
```markdown
### 2. 部署环境 deep-link / refresh 验收

**Test:** 在实际部署环境直接打开并刷新 `/statistics` 与 `/timeline`。  
**Expected:** 若继续使用 `createWebHistory()`，页面应由部署侧 rewrite/fallback 正常回到 SPA，不应返回 404。  
**Why human:** 仓库内没有可验证的生产 rewrite 配置；是否安全取决于外部托管环境，而不是仓库内代码本身。
```

**Timeline route-drift wording to fix** (`.planning/phases/29-timeline-page-and-account-entry/29-VERIFICATION.md` lines 111-127):
```markdown
### 1. 已登录菜单跳转链路

**Test:** 使用真实已登录账号，点击顶栏用户名展开菜单，再点击“时间轴”。  
**Expected:** 菜单关闭，地址切到 `#/timeline`，共享顶栏保留，地图舞台消失，出现独立时间轴页面。  
**Why human:** 这是完整用户流和真实浏览器渲染验证，happy-dom 与 mock router 不能完全替代。
```

**Planner note:** New Phase 32 verification should follow the passed-report format from Phase 31, but explicitly record both outcomes: repo-managed fallback file landed or external hosting contract captured with preview/staging evidence.

---

### `.planning/ROADMAP.md` (config, transform)

**Analog:** `.planning/ROADMAP.md`

**Phase table pattern** (lines 24-42):
```markdown
## Phases

- [ ] **Phase 29: Timeline Page & Account Entry** - 在用户名面板增加时间轴入口，并交付独立的个人旅行时间轴页面（实现已完成，审计后转入 gap closure pending）
- [ ] **Phase 30: Travel Statistics & Completion Overview** - 基于多次旅行记录与扩展后的覆盖范围，交付基础旅行统计与国家/地区完成度（实现已完成，审计后转入 gap closure pending）
- [x] **Phase 31: Statistics Sync Refresh Hardening** - 修复 authoritative metadata 刷新后 statistics 可能滞后的问题，确保统计与时间轴保持一致 (completed 2026-04-27)
- [ ] **Phase 32: Route Deep-Link & Acceptance Closure** - 收口 `/timeline` 与 `/statistics` 的 deep-link / refresh 闭环，并完成 Timeline / Statistics 的人工验收与文档对齐
```

**Phase detail block pattern** (lines 133-143):
```markdown
### Phase 32: Route Deep-Link & Acceptance Closure
**Goal:** `/timeline` 与 `/statistics` 的路由在目标部署环境可直达 / 刷新，同时 Timeline / Statistics 的人工验收与规划文档状态完成闭环。
**Depends on:** Phase 29, Phase 30, Phase 31
**Requirements:** TRIP-04, TRIP-05, STAT-01, STAT-02
**Gap Closure:** closes audit integration gap `Vue Router createWebHistory -> production hosting deep-link / refresh`，并收口 Phase 29 / Phase 30 的 human-needed 验收、`#/timeline` 文档漂移与 roadmap 状态不一致问题。
**Plans:** 0/0 plans drafted
```

**Completed-phase wording to copy** (lines 118-131 and 147-154):
```markdown
### Phase 31: Statistics Sync Refresh Hardening
**Goal:** authoritative metadata 经 bootstrap / same-user sync 刷新后，统计页会稳定重拉并与时间轴保持一致，不再出现国家数 / 完成度滞后。
**Depends on:** Phase 28, Phase 30
**Requirements:** STAT-03
**Gap Closure:** closes audit integration gap `Phase 28 metadata backfill / same-user sync -> Phase 30 statistics refresh`
**Plans:** 1/1 plans complete
```

**Planner note:** Update `Phase 29`, `Phase 30`, and `Phase 32` statuses in one pass only after the corresponding `HUMAN-UAT.md` and `VERIFICATION.md` files tell the same clean-URL truth.

## Shared Patterns

### Authentication / Fail-Closed Routing
**Source:** `apps/web/src/stores/auth-session.ts` lines 168-208 and 292-299  
**Apply to:** `apps/web/src/router/index.ts`, `apps/web/src/router/index.spec.ts`
```typescript
function restoreSession(): Promise<void> {
  if (restorePromise.value) {
    return restorePromise.value
  }

  if (hasRestoredOnce.value) {
    return Promise.resolve()
  }

  status.value = 'restoring'
  // ...
}

function handleUnauthorized() {
  applyAnonymousSnapshot({
    notice: {
      tone: 'warning',
      message: SESSION_EXPIRED_NOTICE,
    },
  })
}
```

### Preserve Existing Route Shells
**Source:** `apps/web/src/views/TimelinePageView.vue` lines 29-66 and `apps/web/src/views/StatisticsPageView.vue` lines 107-145  
**Apply to:** all route-policy work; do not redesign these pages in Phase 32
```vue
<section data-region="timeline-shell" data-route-view="timeline">
  <header>
    <RouterLink to="/">返回地图</RouterLink>
  </header>
</section>

<section data-region="statistics-shell" data-route-view="statistics">
  <header>
    <RouterLink to="/">返回地图</RouterLink>
  </header>
</section>
```

### Authenticated Menu Entry Pattern
**Source:** `apps/web/src/components/auth/AuthTopbarControl.vue` lines 36-44 and 137-174  
**Apply to:** route-entry evidence and any navigation regression references
```typescript
function handleNavigateToTimeline() {
  closeMenu()
  void router.push('/timeline')
}

function handleNavigateToStatistics() {
  closeMenu()
  void router.push('/statistics')
}
```

### Human-UAT Completion Format
**Source:** `.planning/phases/31-statistics-sync-refresh-hardening/31-HUMAN-UAT.md` lines 1-33 and `.planning/phases/30-travel-statistics-and-completion-overview/30-HUMAN-UAT.md` lines 15-36  
**Apply to:** `32-HUMAN-UAT.md`, `29-HUMAN-UAT.md`, `30-HUMAN-UAT.md`
```markdown
## Tests

### 1. ...
expected: ...
result: pass
reported: "approved"

## Summary

total: 1
passed: 1
issues: 0
pending: 0
```

### Verification Report Closure Format
**Source:** `.planning/phases/31-statistics-sync-refresh-hardening/31-VERIFICATION.md` lines 1-13 and 88-103  
**Apply to:** `32-VERIFICATION.md`, `29-VERIFICATION.md`, `30-VERIFICATION.md`
```yaml
status: passed
human_verification_status: approved
human_verification_approved_at: 2026-04-27T09:31:19Z
```

```markdown
### Human Verification Completed

**Result:** pass — user approved on ...
```

### Deploy Fallback Evidence Boundary
**Source:** `apps/web/vite.config.ts` lines 20-31 and `.planning/phases/30-travel-statistics-and-completion-overview/30-VERIFICATION.md` lines 122-149  
**Apply to:** provider config work, `32-VERIFICATION.md`, ROADMAP status updates
```typescript
server: {
  proxy: {
    '/api': {
      target: 'http://127.0.0.1:4000',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, ''),
    }
  },
  fs: {
    allow: [repoRoot]
  }
}
```

```markdown
| `apps/web/src/router/index.ts` | 1 | `createWebHistory()` without repo-visible SPA fallback | ⚠️ Warning | ... |
```

## No Analog Found

Files with no close match in the codebase (planner should use platform-native docs or external hosting evidence):

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `<provider-specific SPA fallback config>` | config | request-response | Repo search found no existing `vercel.json`, `netlify.toml`, `_redirects`, `wrangler.toml`, `nginx.conf`, or `Dockerfile`; planner must either introduce the real host config file or record the external-platform rewrite contract in `32-VERIFICATION.md`. |

## Metadata

**Analog search scope:** `apps/web/src`, `apps/web/vite.config.ts`, `.planning/ROADMAP.md`, `.planning/phases/29-*`, `.planning/phases/30-*`, `.planning/phases/31-*`, repo-root deploy config filenames  
**Files scanned:** 22  
**Pattern extraction date:** 2026-04-28
