---
phase: 30-travel-statistics-and-completion-overview
reviewed: 2026-04-23T10:23:24Z
depth: standard
files_reviewed: 16
files_reviewed_list:
  - packages/contracts/src/index.ts
  - packages/contracts/src/stats.ts
  - packages/contracts/src/generated/geometry-manifest.generated.ts
  - apps/server/src/modules/canonical-places/place-metadata-catalog.ts
  - apps/server/src/modules/records/records.repository.ts
  - apps/server/src/modules/records/records.repository.spec.ts
  - apps/server/src/modules/records/records.service.ts
  - apps/server/src/modules/records/records.service.spec.ts
  - apps/web/public/geo/2026-04-21-geo-v3/overseas/layer.json
  - apps/web/src/constants/overseas-support.ts
  - apps/web/src/router/index.ts
  - apps/web/src/services/api/stats.ts
  - apps/web/src/stores/stats.ts
  - apps/web/src/stores/stats.spec.ts
  - apps/web/src/views/StatisticsPageView.vue
  - apps/web/src/views/StatisticsPageView.spec.ts
findings:
  critical: 0
  warning: 1
  info: 0
  total: 1
status: issues_found
---

# Phase 30: Code Review Report

**Reviewed:** 2026-04-23T10:23:24Z
**Depth:** standard
**Files Reviewed:** 16
**Status:** issues_found

## Summary

本次基于最新代码状态重新执行了 Phase 30 的 code review gate，重点复核了统计链路相关的后端口径、前端 store/view wiring 与回归测试。

上一次阻塞问题 `totalSupportedCountries` 分母偏大已确认关闭。当前实现中，[`place-metadata-catalog.ts`](/Users/huangjingping/i/trip-map/apps/server/src/modules/canonical-places/place-metadata-catalog.ts) 会从 authoritative canonical metadata 动态计算 `TOTAL_SUPPORTED_TRAVEL_COUNTRIES`，而 [`records.repository.ts`](/Users/huangjingping/i/trip-map/apps/server/src/modules/records/records.repository.ts) 直接复用该常量。独立核对 [`layer.json`](/Users/huangjingping/i/trip-map/apps/web/public/geo/2026-04-21-geo-v3/overseas/layer.json) 后，当前 authoritative overseas 覆盖为 20 个唯一海外国家，因此统计分母应为 `20 + 1 = 21`，与现有实现和 [`records.service.spec.ts`](/Users/huangjingping/i/trip-map/apps/server/src/modules/records/records.service.spec.ts) 的断言一致。虽然 [`geometry-manifest.generated.ts`](/Users/huangjingping/i/trip-map/packages/contracts/src/generated/geometry-manifest.generated.ts) 中的 `SUPPORTED_OVERSEAS_COUNTRY_SUMMARIES` 仍保留 21 项且包含 `Singapore`，但它已经不再参与统计页分母计算，因此此前统计口径阻塞不再成立。

已执行验证：

- `pnpm --filter @trip-map/server test -- src/modules/records/records.service.spec.ts`
- `pnpm --filter @trip-map/web test -- src/stores/stats.spec.ts src/views/StatisticsPageView.spec.ts`
- `pnpm --filter @trip-map/contracts build`
- `pnpm --filter @trip-map/web typecheck`

以上验证均通过。

当前结论：Phase 30 核心统计链路（repository -> service/API -> stats store -> StatisticsPageView）已 clean。本轮 remaining issue 只剩一个部署侧 history 路由 fallback 风险。

## Warnings

### WR-01: `createWebHistory()` 的生产 deep-link / refresh 风险仍未在仓库内闭环

**File:** `/Users/huangjingping/i/trip-map/apps/web/src/router/index.ts:1-29`
**Issue:** 统计页与时间轴仍基于 `createWebHistory()` 暴露 `/statistics`、`/timeline`，但本仓库中没有同时提交生产 rewrite / SPA fallback 配置。我补查了常见部署文件（如 `vercel.json`、`netlify.toml`、`_redirects`、`nginx.conf`、`staticwebapp.config.json` 等），当前仓库内未发现对应配置。结果是在脱离 Vite dev server 的真实部署环境中，用户直接访问或刷新深链接时仍可能返回 404。该问题不再阻塞 Phase 30 统计口径，但会影响路由可达性。
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

如果必须保留 clean URL，则需要把实际生产环境使用的 rewrite / SPA fallback 配置纳入仓库，并补上 `/statistics`、`/timeline` 的直达/刷新回归验证。

## Residual Risk

上次 review 中关于统计页“加载中发生旅行记录变更会丢刷新”的担忧，本次未再复现：[`StatisticsPageView.vue`](/Users/huangjingping/i/trip-map/apps/web/src/views/StatisticsPageView.vue) 的 `pendingRefreshAfterLoad` 逻辑与 [`StatisticsPageView.spec.ts`](/Users/huangjingping/i/trip-map/apps/web/src/views/StatisticsPageView.spec.ts) 的回归测试仍然成立。当前 gate 若只看 Phase 30 核心统计链路，可以视为 clean；若把部署配置一并计入，则仍有上述 1 个外部风险待闭环。

---

_Reviewed: 2026-04-23T10:23:24Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
