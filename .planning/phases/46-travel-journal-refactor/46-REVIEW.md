---
phase: 46-travel-journal-refactor
reviewed: 2026-05-20T02:09:18Z
depth: standard
files_reviewed: 11
files_reviewed_list:
  - apps/web/src/components/shell/AuthenticatedAppShell.spec.ts
  - apps/web/src/components/shell/AuthenticatedAppShell.vue
  - apps/web/src/components/shell/ShellSidebar.vue
  - apps/web/src/components/timeline/JournalPostcardThumb.vue
  - apps/web/src/components/timeline/TimelineVisitCard.spec.ts
  - apps/web/src/components/timeline/TimelineVisitCard.vue
  - apps/web/src/components/timeline/journal-thumbnails.spec.ts
  - apps/web/src/components/timeline/journal-thumbnails.ts
  - apps/web/src/router/index.spec.ts
  - apps/web/src/views/TimelinePageView.spec.ts
  - apps/web/src/views/TimelinePageView.vue
findings:
  critical: 1
  warning: 2
  info: 0
  total: 3
status: issues_found
---

# Phase 46: Code Review Report

**Reviewed:** 2026-05-20T02:09:18Z
**Depth:** standard
**Files Reviewed:** 11
**Status:** issues_found

## Summary

本次审查覆盖了 Phase 46 的 shell、journal card、journal route 与配套测试。发现 1 个 `BLOCKER` 和 2 个 `WARNING`：一个是已登录壳层把退出登录入口整个删掉了；另外两个分别是 `/journal` 把任意 warning 误报成“手账加载失败”，以及新增 mobile sidebar trigger 没有本地化的可访问名称。

## Critical Issues

### CR-01: BLOCKER - 已登录壳层移除了唯一的退出登录入口

**File:** `apps/web/src/components/shell/ShellSidebar.vue:27-31,177`
**Issue:** 侧边栏导航现在只保留了 `map` / `journal` / `memories` 三项，且源码注释明确写着 “Logout removed”。仓库内没有其他可达的 UI 会调用 `authSessionStore.logout()`，因此已登录用户在产品内已经没有办法主动结束会话。这是明确的功能回归，在共享设备上也会带来隐私风险。
**Fix:**
```vue
<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthSessionStore } from '@/stores/auth-session'

const router = useRouter()
const authSessionStore = useAuthSessionStore()

async function handleLogout() {
  await authSessionStore.logout()
  await router.replace('/')
}
</script>

<button
  type="button"
  data-shell-logout
  @click="handleLogout"
>
  退出登录
</button>
```

同时重新启用 `apps/web/src/components/shell/AuthenticatedAppShell.spec.ts:125-149` 的退出登录用例，避免这个回归继续被跳过。

## Warnings

### WR-01: WARNING - `/journal` 会把任意 warning notice 误报为“旅途手账加载失败”

**File:** `apps/web/src/views/TimelinePageView.vue:20-22,168-182`
**Issue:** `shouldShowWarningNotice` 只检查 `interactionNotice.tone === 'warning'`，但 `interactionNotice` 是全局共享通道，既承载“前台刷新失败”，也承载“编辑失败”“删除失败”等其他 warning。现在只要用户在 `/journal` 页上触发任意 warning，就会额外渲染固定文案“旅途手账暂时加载失败...”，即使手账数据本身已经正常加载，或失败来自完全不同的操作。这会误导用户，也会掩盖真实错误原因。
**Fix:**
```ts
const JOURNAL_REFRESH_WARNING =
  '云端记录刷新失败，当前仍显示上次同步结果，请稍后重试。'

const shouldShowWarningNotice = computed(
  () =>
    status.value === 'authenticated' &&
    interactionNotice.value?.tone === 'warning' &&
    interactionNotice.value.message === JOURNAL_REFRESH_WARNING,
)
```

模板里也应直接渲染 `interactionNotice.message`，不要把所有 warning 重写成统一的“加载失败”文案。

### WR-02: WARNING - 新增的 mobile sidebar trigger 没有中文可访问名称

**File:** `apps/web/src/components/shell/AuthenticatedAppShell.vue:26-30`
**Issue:** Phase 46 新增了 mobile offcanvas trigger，但这里直接复用了 `SidebarTrigger` 的默认无障碍文案。该基础组件的屏幕阅读器文本是英文 “Toggle Sidebar”，而旁边的“打开导航”只是普通段落文本，不会成为按钮的可访问名称。结果是中文界面里出现一个英文命名的关键导航按钮，这是实际的可访问性和本地化回归。
**Fix:**
```vue
<SidebarTrigger
  aria-label="打开导航"
  class="h-11 w-11 rounded-full border border-white/80 bg-white/88 text-[#8a77cc] shadow-[var(--shadow-button)]"
  data-shell-mobile-trigger
/>
```

如果 sidebar primitive 支持的话，进一步补上与展开状态联动的 `aria-expanded` / `aria-controls` 会更稳妥。

---

_Reviewed: 2026-05-20T02:09:18Z_
_Reviewer: the agent (gsd-code-reviewer)_
_Depth: standard_
