---
phase: 29-timeline-page-and-account-entry
reviewed: 2026-04-23T04:31:56Z
depth: standard
files_reviewed: 16
files_reviewed_list:
  - apps/web/package.json
  - apps/web/src/App.kawaii.spec.ts
  - apps/web/src/App.spec.ts
  - apps/web/src/App.vue
  - apps/web/src/components/auth/AuthTopbarControl.spec.ts
  - apps/web/src/components/auth/AuthTopbarControl.vue
  - apps/web/src/components/timeline/TimelineVisitCard.vue
  - apps/web/src/main.ts
  - apps/web/src/router/index.ts
  - apps/web/src/services/timeline.spec.ts
  - apps/web/src/services/timeline.ts
  - apps/web/src/stores/map-points.spec.ts
  - apps/web/src/stores/map-points.ts
  - apps/web/src/views/MapHomeView.vue
  - apps/web/src/views/TimelinePageView.spec.ts
  - apps/web/src/views/TimelinePageView.vue
findings:
  critical: 0
  warning: 2
  info: 0
  total: 2
status: issues_found
---

# Phase 29: 代码审查报告

**Reviewed:** 2026-04-23T04:31:56Z
**Depth:** standard
**Files Reviewed:** 16
**Status:** issues_found

## Summary

本次按标准深度审查了时间轴页面、顶栏账号入口、时间轴聚合逻辑与 `map-points` store，并交叉核对了相关 `auth-session` / API 调用链。额外运行了以下相关测试命令，结果全部通过：

`pnpm --filter @trip-map/web test -- src/components/auth/AuthTopbarControl.spec.ts src/views/TimelinePageView.spec.ts src/services/timeline.spec.ts src/stores/map-points.spec.ts src/App.spec.ts`

共 5 个测试文件、80 个用例通过。未发现安全问题，但账号相关的两个用户操作在失败路径上缺少 UI 层兜底：当后端返回 5xx 或网络异常时，Promise 会直接冒泡成未处理 rejection，用户拿不到明确的错误反馈。

## Warnings

### WR-01: 退出登录失败会冒泡成未处理异常

**File:** `/Users/huangjingping/i/trip-map/apps/web/src/components/auth/AuthTopbarControl.vue:41-43`
**Issue:** `handleLogout()` 直接 `await logout()`，而 `logout()` 在非 401 错误时会继续 `throw`（交叉验证：`/Users/huangjingping/i/trip-map/apps/web/src/stores/auth-session.ts:269-287`）。这意味着用户点击“退出登录”后，如果接口返回 5xx 或网络断开，菜单会先被关闭，然后异常直接冒泡到 Vue 全局错误处理，界面没有任何失败提示，也不会恢复交互状态。
**Fix:**
```ts
import { useMapUiStore } from '../../stores/map-ui'

const mapUiStore = useMapUiStore()

async function handleLogout() {
  closeMenu()

  try {
    await logout()
  } catch {
    isMenuOpen.value = true
    mapUiStore.setInteractionNotice({
      tone: 'warning',
      message: '退出登录失败，请稍后重试。',
    })
  }
}
```

### WR-02: 本地记录导入失败时没有 UI 兜底

**File:** `/Users/huangjingping/i/trip-map/apps/web/src/App.vue:63-65`
**Issue:** `handleImportLocalRecords()` 通过 `void importLocalRecordsIntoAccount()` 丢弃了 Promise；而 `importLocalRecordsIntoAccount()` 在非 401 错误时会重新抛出异常（交叉验证：`/Users/huangjingping/i/trip-map/apps/web/src/stores/auth-session.ts:306-334`）。当导入接口失败时，这里会出现未处理 rejection，导入弹窗也不会向用户解释失败原因。对本阶段新增的账号接入与本地导入决策流来说，这条失败路径是实际可见的。
**Fix:**
```ts
async function handleImportLocalRecords() {
  try {
    await importLocalRecordsIntoAccount()
  } catch {
    mapUiStore.setInteractionNotice({
      tone: 'warning',
      message: '导入本地记录失败，请稍后重试。',
    })
  }
}
```

---

_Reviewed: 2026-04-23T04:31:56Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
