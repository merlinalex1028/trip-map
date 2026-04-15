---
status: diagnosed
trigger: "诊断 Phase 25 的 UAT gap。只找根因，不要修复代码。"
created: 2026-04-15T05:56:46Z
updated: 2026-04-15T05:59:09Z
---

## Current Focus

hypothesis: A 窗口的 foreground refresh 与 in-flight illuminate 并发时，refresh 用 bootstrap 快照覆盖 optimistic record，导致 create 成功后也无法把记录写回本地状态
test: compare App foreground trigger, auth-session refresh replacement logic, and map-points illuminate success path; rule out session eviction
expecting: if hypothesis is true, code will show replaceTravelRecords() can clear pending/optimistic state before illuminate resolves, and illuminate success path will only replace existing rows instead of reinsert missing row
next_action: finalize diagnosis from code evidence without applying a fix

## Symptoms

expected: 使用同一账号打开两个窗口或两个设备。在 A 窗口点亮一个当前未点亮的地点后，切到 B 窗口并让页面重新获得焦点。B 窗口应该自动刷新并显示同一个地点已点亮，不需要手动整页刷新，也不应该出现“已切换到某账号”的提示。
actual: 用户报告“A窗口点亮失败”
errors: 无明确报错文本；UAT 报告仅记录 “A窗口点亮失败”
reproduction: 25-UAT Test 1
started: Phase 25 UAT

## Eliminated

- hypothesis: 第二个窗口/设备登录会把 A 窗口会话踢下线，导致 POST /records 因 401 失败
  evidence: auth.repository.ts 的 createSession() 只是新增 authSession；auth.service.ts 的 login()/register() 也没有删除旧 session 的逻辑
  timestamp: 2026-04-15T05:59:09Z

## Evidence

- timestamp: 2026-04-15T05:56:46Z
  checked: Phase 25 planning and verification docs
  found: Phase 25 intended to add same-user foreground refresh in auth-session/App and success/failure mutation notices in map-points, with verification claiming all automated checks passed.
  implication: blocker likely sits in an integration path not covered by existing automated checks or in a mismatch between tests and real runtime behavior.

- timestamp: 2026-04-15T05:59:09Z
  checked: apps/web/src/App.vue and apps/web/src/App.spec.ts
  found: App mounts global foreground sync triggers on window focus and document visibilitychange, and tests only verify that these events call refreshAuthenticatedSnapshot().
  implication: switching back to a window in the two-window UAT can start an async refresh immediately before the user clicks illuminate.

- timestamp: 2026-04-15T05:59:09Z
  checked: apps/web/src/stores/auth-session.ts and apps/web/src/stores/map-points.ts
  found: refreshAuthenticatedSnapshot() unconditionally calls mapPointsStore.replaceTravelRecords(bootstrap.records) for the same user; replaceTravelRecords() resets pendingPlaceIds and replaces the whole records array. illuminate() adds an optimistic record, but on success only runs travelRecords.value.map(...) and never reinserts the record if it was removed meanwhile.
  implication: a foreground refresh that resolves while illuminate is in flight can erase the optimistic record and its pending marker; when createTravelRecord() later succeeds, the success path updates nothing, so A window still shows the place as unlit even though the server accepted the write.

- timestamp: 2026-04-15T05:59:09Z
  checked: web test coverage for concurrent refresh + mutation
  found: auth-session.spec.ts covers same-user refresh in isolation, map-points.spec.ts covers illuminate in isolation, and there is no test exercising refreshAuthenticatedSnapshot overlapping an in-flight illuminate.
  implication: automated verification could pass while the real focus-switch workflow still drops A-window writes.

## Resolution

root_cause: Phase 25 introduced foreground refresh on focus/visibilitychange, but that refresh is not coordinated with in-flight point mutations. When A window regains focus, refreshAuthenticatedSnapshot() can replace the entire travel record snapshot with a stale bootstrap response while illuminate() is still awaiting POST /records. Because illuminate()'s success path only replaces an existing optimistic row instead of re-adding it, the optimistic record can be erased permanently from A's local state, making the click look like it failed even though the server write succeeded.
fix:
verification:
files_changed: []
