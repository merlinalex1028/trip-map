---
phase: 30-travel-statistics-and-completion-overview
reviewed: 2026-04-23T09:03:54Z
depth: standard
files_reviewed: 16
files_reviewed_list:
  - packages/contracts/src/index.ts
  - packages/contracts/src/stats.ts
  - apps/server/src/modules/records/records.repository.ts
  - apps/server/src/modules/records/records.service.ts
  - apps/server/src/modules/records/records.controller.ts
  - apps/server/src/modules/records/records.service.spec.ts
  - apps/web/src/services/api/stats.ts
  - apps/web/src/stores/stats.ts
  - apps/web/src/stores/stats.spec.ts
  - apps/web/src/components/statistics/StatCard.vue
  - apps/web/src/components/statistics/StatCard.spec.ts
  - apps/web/src/views/StatisticsPageView.vue
  - apps/web/src/views/StatisticsPageView.spec.ts
  - apps/web/src/router/index.ts
  - apps/web/src/components/auth/AuthTopbarControl.vue
  - apps/web/src/components/auth/AuthTopbarControl.spec.ts
findings:
  critical: 0
  warning: 1
  info: 0
  total: 1
status: issues_found
---

# Phase 30: Code Review Report

**Reviewed:** 2026-04-23T09:03:54Z
**Depth:** standard
**Files Reviewed:** 16
**Status:** issues_found

## Summary

本次基于最新代码复审了 Phase 30 指定的 16 个变更文件，并补读了 `auth-session`、`map-points`、`App.vue` 的相关状态流来确认统计页的真实行为。

结论是：除了 router history deep-link 风险外，未发现 Phase 30 仍然存在的新增 source-code warning。此前针对统计页“加载中发生旅行记录变更会丢刷新”的担忧，在最新代码里已经由 `pendingRefreshAfterLoad` 补发机制以及 `StatisticsPageView.spec.ts` 的回归测试覆盖，不再保留为 warning。

验证结果：

- `pnpm --filter @trip-map/web test -- src/stores/stats.spec.ts src/components/auth/AuthTopbarControl.spec.ts src/components/statistics/StatCard.spec.ts src/views/StatisticsPageView.spec.ts`
- `pnpm --filter @trip-map/server test -- src/modules/records/records.service.spec.ts`

上述共 5 个测试文件、24 个测试，全部通过。

## Warnings

### WR-01: 路由切到 history 模式后，仓库内仍缺少可见的 SPA fallback

**File:** `/Users/huangjingping/i/trip-map/apps/web/src/router/index.ts:1-29`
**Issue:** Phase 30 把路由切到了 `createWebHistory()`，并新增了 `/statistics` 入口；但按当前仓库最新代码搜索，只能看到前端路由定义与 Vite 开发代理，仍没有同仓提交的生产 rewrite / fallback 落地，例如 `ServeStaticModule` + `index.html` fallback、`_redirects`、`vercel.json`、`netlify.toml`、Nginx 配置等。结果是脱离 Vite dev server 后，用户直接访问或刷新 `/timeline`、`/statistics` 这类深链接时，请求会落到服务端真实路径解析并返回 404。这仍是 Phase 30 直接引入的回归风险。
**Fix:**
```ts
import { createRouter, createWebHashHistory } from 'vue-router'

export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    // ...
  ],
})
```

如果必须保留干净 URL，就需要把实际部署环境使用的 rewrite / fallback 配置一并提交到仓库，并补上 `/timeline`、`/statistics` 的直达与刷新回归验证。

---

_Reviewed: 2026-04-23T09:03:54Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
