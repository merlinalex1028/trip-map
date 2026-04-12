---
status: diagnosed
phase: 23-auth-ownership-foundation
source:
  - 23-02-SUMMARY.md
  - 23-03-SUMMARY.md
  - 23-04-SUMMARY.md
  - 23-05-SUMMARY.md
  - 23-08-SUMMARY.md
  - 23-09-SUMMARY.md
started: 2026-04-12T14:47:04Z
updated: 2026-04-12T15:20:01Z
---

## Current Test

[testing complete]

## Tests

### 1. Cold Start Smoke Test
expected: 结束当前运行中的前后端服务后，从干净状态重新启动应用。启动过程不应报错，主页能够正常打开，且基础接口/页面能返回真实可用内容，而不是空白页、启动失败或明显的运行时错误。
result: pass

### 2. 注册新账号
expected: 在匿名状态打开认证弹层，切换到“注册”，输入合法用户名、邮箱和密码后提交，弹层关闭，顶栏显示新账号用户名，应用进入已登录状态。
result: pass

### 3. 错误密码登录边界
expected: 使用错误密码提交登录时，认证弹层保持打开，界面显示登录失败提示，不会把这次失败误报为“会话已失效”，也不会自动关闭弹层。
result: issue
reported: "功能正常，单如图所示位置靠左了"
severity: cosmetic

### 4. 刷新后恢复同一账号会话
expected: 在已登录状态刷新页面或重新打开应用后，仍然恢复为同一账号，顶栏身份信息保持正确，不需要重新登录。
result: issue
reported: "是不用重新登录的，但是records接口500了，同时未登录情况下应该不用调用recoreds接口的吧"
severity: major

### 5. 当前设备退出登录
expected: 从顶栏身份菜单执行退出后，界面回到匿名状态，顶栏重新出现“登录 / 注册”入口，并有明确的退出反馈。
result: pass

### 6. 账号记录可持久恢复
expected: 已登录账号点亮一个地点后，刷新页面或重新进入应用，刚刚点亮的地点仍然存在于当前账号视图中，不会丢失。
result: issue
reported: "接口500，无法点亮"
severity: blocker

### 7. 不同账号记录隔离
expected: 使用第二个账号登录时，不会看到第一个账号已点亮的地点；切回原账号后，原账号自己的地点仍然存在。
result: issue
reported: "同上无法点亮"
severity: blocker

## Summary

total: 7
passed: 3
issues: 4
pending: 0
skipped: 0
blocked: 0

## Gaps

- truth: "使用错误密码提交登录时，认证弹层保持打开，界面显示登录失败提示，不会把这次失败误报为“会话已失效”，也不会自动关闭弹层。"
  status: failed
  reason: "User reported: 功能正常，单如图所示位置靠左了"
  severity: cosmetic
  test: 3
  root_cause: "AuthDialog 使用原生 `<dialog>` 叠在自定义 fixed flex 遮罩里，浏览器自带 dialog 定位语义会和当前布局竞争，导致错误提示出现后弹层视觉上偏向左侧。"
  artifacts:
    - path: "apps/web/src/components/auth/AuthDialog.vue"
      issue: "原生 dialog 与自定义居中容器混用，错误态下位置不稳定"
  missing:
    - "把弹层容器改成完全受应用样式控制的居中布局，或显式重置原生 dialog 默认定位语义"
    - "补一个覆盖错误提示显示时弹层布局稳定性的组件断言"

- truth: "在已登录状态刷新页面或重新打开应用后，仍然恢复为同一账号，顶栏身份信息保持正确，不需要重新登录。"
  status: failed
  reason: "User reported: 是不用重新登录的，但是records接口500了，同时未登录情况下应该不用调用recoreds接口的吧"
  severity: major
  test: 4
  root_cause: "Phase 23 后半段已经把账号恢复收口到 `auth-session.restoreSession()` 和 `/auth/bootstrap`，但 LeafletMapStage 仍在地图 ready 时直接触发 `mapPointsStore.bootstrapFromApi()` 去打 `/records`，导致匿名或刷新场景仍会出现多余的 records 请求，并把 records 路由错误暴露到会话恢复路径。"
  artifacts:
    - path: "apps/web/src/components/LeafletMapStage.vue"
      issue: "地图 ready 时无条件触发 bootstrapFromApi()"
    - path: "apps/web/src/stores/map-points.ts"
      issue: "bootstrapFromApi() 仍直接调用 fetchTravelRecords()，与 auth-session bootstrap 职责重叠"
    - path: "apps/web/src/components/LeafletMapStage.spec.ts"
      issue: "当前组件测试仍以 mock records API 为主，没有覆盖匿名/restore 场景下不应主动打 `/records` 的合同"
  missing:
    - "移除或鉴权保护 LeafletMapStage 的直接 `/records` bootstrap 路径"
    - "把 records 恢复统一收口到 auth-session 的 bootstrap 快照"
    - "补一条 app-shell 集成测试，断言匿名或 restore 过程中不会额外请求 `/records`"

- truth: "已登录账号点亮一个地点后，刷新页面或重新进入应用，刚刚点亮的地点仍然存在于当前账号视图中，不会丢失。"
  status: failed
  reason: "User reported: 接口500，无法点亮"
  severity: blocker
  test: 6
  root_cause: "真实浏览器链路里的 current-user `/records` 读写没有被 app-shell 级测试覆盖；当前只有 server e2e 和大量 mock web specs，导致 live runtime 中 `/records` GET/POST 返回 500 的集成故障直到 UAT 才暴露。"
  artifacts:
    - path: "apps/web/src/stores/map-points.ts"
      issue: "点亮流程直接依赖 createTravelRecord()，但非 401 错误只会静默回滚，没有暴露更具体的运行时信号"
    - path: "apps/web/src/components/LeafletMapStage.spec.ts"
      issue: "records 写入成功路径主要依赖 mock API，没有覆盖真实 auth-session + records 集成"
    - path: "apps/server/src/modules/records/records.controller.ts"
      issue: "live `/records` 路由在真实运行环境中返回 500，需要针对当前 current-user 路由链补复现与保护"
  missing:
    - "为 authenticated `/records` GET/POST 浏览器路径补一条不依赖 mock 的集成验证"
    - "定位并修复 live `/records` 路由 500 的具体触发点"
    - "在前端对非 401 的 records 写入失败给出明确错误反馈，避免静默回滚"

- truth: "使用第二个账号登录时，不会看到第一个账号已点亮的地点；切回原账号后，原账号自己的地点仍然存在。"
  status: failed
  reason: "User reported: 同上无法点亮"
  severity: blocker
  test: 7
  root_cause: "账号隔离验证依赖于第一个账号能够成功点亮地点；由于 live `/records` 写入链路当前已被 blocker 级 500 卡住，这条隔离验收无法在真实产品路径上成立。"
  artifacts:
    - path: "apps/web/src/stores/map-points.ts"
      issue: "点亮失败直接阻断了后续双账号隔离验证"
    - path: "apps/server/src/modules/records/records.controller.ts"
      issue: "live current-user records create path 未稳定，导致隔离真值无法建立"
  missing:
    - "先修复 authenticated 点亮 `/records` 500"
    - "补一条双账号 app-shell/UAT 对应的真实隔离验证路径"
