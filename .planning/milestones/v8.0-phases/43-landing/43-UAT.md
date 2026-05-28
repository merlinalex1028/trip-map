---
status: complete
phase: 43-landing
source:
  - 43-01-SUMMARY.md
  - 43-02-SUMMARY.md
  - 43-03-SUMMARY.md
  - 43-04-SUMMARY.md
started: "2026-05-12T00:00:00.000Z"
updated: "2026-05-12T00:17:00.000Z"
---

## Current Test

[testing complete]

## Tests

### 13. Desktop 截图视觉检查
expected: |
  `/` 在 1366x768 / 1440x900 / 1536x1024 / 1920x1080 视口下：
  - 完整背景按宽度铺满
  - Hero 区域左对齐、标题清晰可读
  - 下半区标题/统计/拍立得相对底边协调
  - 无底部 CTA 条
  `/map` 在相同视口下：
  - 280px 左侧 sidebar 可见
  - 三项固定导航正常
  - 无旧 topbar/drawer/bottom nav
  - 主内容不与 sidebar 重叠
result: pass

## Summary

total: 13
passed: 12
issues: 1
pending: 0
skipped: 0

## Gaps

- truth: "Sidebar 用户卡使用正确的高保真切图头像"
  status: resolved
  reason: "User reported: 头像错误，不是高保中的切图，应该是 @prd/v8.0/切图/切图 15@2x.png 才对"
  severity: major
  test: 10
  root_cause: "ShellSidebar.vue 使用了错误的 default-avatar.png 素材"
  artifacts:
    - path: "apps/web/src/components/shell/ShellSidebar.vue"
      issue: "import defaultAvatar from '@/assets/v8/shell/default-avatar.png' — 素材错误"
    - path: "apps/web/src/assets/v8/shell/user-avatar.png"
      issue: "已复制正确素材"
  missing:
    - "复制 prd/v8.0/切图/切图 15@2x.png 到 apps/web/src/assets/v8/shell/user-avatar.png"
    - "更新 ShellSidebar.vue 导入路径指向 user-avatar.png"
  debug_session: ""
  resolution: "已修复 — 复制了正确素材并更新导入路径，测试通过"

- truth: "Sidebar 不显示退出登录按钮"
  status: resolved
  reason: "User reported: 退出按钮先删除，待后续设计"
  severity: major
  test: 10
  root_cause: "ShellSidebar.vue 包含退出登录按钮，用户要求移除 pending design"
  artifacts:
    - path: "apps/web/src/components/shell/ShellSidebar.vue"
      issue: "包含 SidebarFooter 中的退出登录按钮和 handleLogout 逻辑"
    - path: "apps/web/src/components/shell/AuthenticatedAppShell.spec.ts"
      issue: "包含两个 logout 测试用例"
  missing:
    - "从 ShellSidebar.vue 移除退出登录按钮和 logout 相关逻辑"
    - "将 AuthenticatedAppShell.spec.ts 中 logout 测试标记为 skip"
  debug_session: ""
  resolution: "已修复 — 移除了退出登录按钮和逻辑，相关测试已 skip，测试通过"
