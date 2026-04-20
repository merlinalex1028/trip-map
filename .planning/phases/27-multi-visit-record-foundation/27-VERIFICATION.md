---
phase: 27-multi-visit-record-foundation
verified: 2026-04-20T08:28:44Z
status: gaps_found
score: 10/11 must-haves verified
overrides_applied: 0
gaps:
  - truth: "已点亮地点的 popup 默认展示的“最近一次日期/范围”必须反映最近一次旅行，而不是最近一次录入"
    status: failed
    reason: "LeafletMapStage 目前按 record.createdAt 选择 latestTripLabel；用户如果后来补录更早的一次旅行，摘要会把旧旅行错误显示成“最近一次”。"
    artifacts:
      - path: "apps/web/src/components/LeafletMapStage.vue"
        issue: "activePointLatestTripLabel 在 472-483 行按 createdAt 排序，而不是按 endDate/startDate 选择最近一次旅行"
      - path: "apps/web/src/components/LeafletMapStage.spec.ts"
        issue: "现有“再记一次”用例只断言次数变化，没有断言 latestTripLabel 的正确性，无法兜住该回归"
    missing:
      - "把 latestTripLabel 的选择口径改为按旅行日期排序（优先 endDate，其次 startDate），未知日期再回退为“日期未知”"
      - "补一条回归测试：先保存较新的旅行，再补录较早的旅行，摘要仍应显示真正最近的一次旅行日期"
  - truth: "CreateTravelRecordRequest 的共享契约变更能直接约束到 CreateTravelRecordDto，避免日期字段在前后端间静默漂移"
    status: partial
    reason: "27-01 PLAN 的 key link 期望 CreateTravelRecordDto 直接 implements CreateTravelRecordRequest；当前 DTO 手写重复字段，运行时可用，但缺少直接的编译期绑定。"
    artifacts:
      - path: "apps/server/src/modules/records/dto/create-travel-record.dto.ts"
        issue: "DTO 未直接实现或以类型断言方式绑定 CreateTravelRecordRequest；startDate/endDate 仅靠手写字段保持同步"
    missing:
      - "恢复直接类型绑定，或新增显式的类型层断言/adapter，并在 VERIFICATION frontmatter 中记录 accepted override 说明为何保留当前方案"
---

# Phase 27: Multi-Visit Record Foundation 验证报告

**Phase Goal:** 用户可以为同一地点保存多次带旅行日期的记录，同时保持现有账号同步、bootstrap 恢复和地图点亮主链路稳定。
**Verified:** 2026-04-20T08:28:44Z
**Status:** gaps_found
**Re-verification:** 否，首次验证

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
| --- | --- | --- | --- |
| 1 | 共享 contracts 与构建产物都暴露 `startDate` / `endDate` nullable 日期字段 | ✓ VERIFIED | `packages/contracts/src/records.ts` 与 `packages/contracts/dist/records.d.ts` 都包含 `TravelRecord` / `CreateTravelRecordRequest` 的 `string \| null` 日期字段 |
| 2 | Prisma 数据模型允许同一 `(userId, placeId)` 多条记录，并在生成后的 Prisma Client 中可见日期字段 | ✓ VERIFIED | `apps/server/prisma/schema.prisma` 用 `@@index([userId, placeId])` 替代唯一约束；生成产物 `node_modules/.pnpm/.../.prisma/client/index.d.ts` 含 `startDate` / `endDate` |
| 3 | `POST /records` 接受日期字段，并在 `endDate < startDate` 时拒绝请求 | ✓ VERIFIED | `records.controller.ts` 对 `CreateTravelRecordDto` 开启 `forbidNonWhitelisted`; DTO 用 `@Matches(/^\\d{4}-\\d{2}-\\d{2}$/)`；`records.service.ts` 76-79 行抛出 `BadRequestException('endDate must be >= startDate')`；对应 server spec 通过 |
| 4 | 同一地点可以保存多次旅行记录，后一次不会覆盖前一次 | ✓ VERIFIED | `records.repository.ts` 69-72 行使用 `prisma.userTravelRecord.create` 而不是 `upsert`；`map-points.spec.ts` 764-795 验证同 placeId 两次 `illuminate` 后保留 2 条记录 |
| 5 | `/auth/bootstrap` 会返回日期字段，多次记录快照能被前端 restore/refresh 吃进去 | ✓ VERIFIED | `auth.service.ts` 35-51 行映射 `startDate/endDate`; `auth.controller.ts` 99-114 行暴露 `/auth/bootstrap`; `auth-session.ts` 114-148 与 210-255 行把 `bootstrap.records` 写入 `map-points`; auth service/e2e/auth-session spec 全部通过 |
| 6 | 前端 store 以 trip-level 保存真实记录，同时保持地图 marker 按 place-level 去重 | ✓ VERIFIED | `map-points.ts` 101-117 行 `displayPoints` 按 `placeId` 取最新 `createdAt`; 119-126 行 `tripsByPlaceId` 保留全部 trip；相关 spec 823-862 通过 |
| 7 | 旧本地记录迁移不会伪造旅行日期，而是显式落成未知日期 | ✓ VERIFIED | `legacy-point-storage.ts` 133-146 行固定输出 `startDate: null, endDate: null`; spec 32-70 明确断言不从 `createdAt` 伪造日期 |
| 8 | 未点亮地点必须先在 popup 内联表单中选择开始日期，日期 payload 会一路透传到 store/API | ✓ VERIFIED | `TripDateForm.vue` 24-41 行要求开始日期；`PointSummaryCard.vue` 214-220 行先展开表单；`MapContextPopup.vue` 114-125 行透传 payload；`LeafletMapStage.vue` 505-542 行传给 `mapPointsStore.illuminate` |
| 9 | 已点亮地点会显示次数摘要，并能在同一个 popup 内“再记一次去访” | ✓ VERIFIED | `PointSummaryCard.vue` 360-399 行渲染 `已去过 N 次`、`再记一次去访` 和内联 `TripDateForm`; `LeafletMapStage.spec.ts` 844-901 用例验证追加第二条记录后次数变为 2 |
| 10 | “最近一次日期/范围”摘要能正确反映最近一次旅行 | ✗ FAILED | `LeafletMapStage.vue` 472-483 行按 `createdAt` 排序，而不是按 `endDate/startDate`；这会把“后来补录的旧旅行”错误显示成“最近一次” |
| 11 | 地图点亮主链路仍按“该地点至少存在一条记录”表达，地点级取消点亮语义未回归 | ✓ VERIFIED | `map-points.ts` 514-516 行 `isPlaceIlluminated` 仍按 place-level 判定；462-511 行 `unilluminate` 按 `placeId` 全删；`map-points.spec.ts` 865-883 验证多条 visit 时仍按 place 级删除 |

**Score:** 10/11 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
| --- | --- | --- | --- |
| `packages/contracts/src/records.ts` | 共享读写契约含日期字段 | ✓ VERIFIED | `TravelRecord` / `CreateTravelRecordRequest` 都声明 `startDate` 与 `endDate` |
| `packages/contracts/dist/records.d.ts` | 构建后的类型声明已同步新字段 | ✓ VERIFIED | `pnpm --filter @trip-map/contracts build` 成功，声明文件中字段存在 |
| `apps/server/prisma/schema.prisma` | `UserTravelRecord` 允许多次记录并含 nullable 日期 | ✓ VERIFIED | `startDate String?` / `endDate String?` 存在，且为 `@@index([userId, placeId])` |
| `node_modules/.pnpm/@prisma+client@6.19.3_prisma@6.19.3_typescript@5.9.3__typescript@5.9.3/node_modules/.prisma/client/index.d.ts` | 生成后的 Prisma Client 含新字段 | ✓ VERIFIED | `rg -n "startDate|endDate"` 命中 `UserTravelRecord` 相关类型定义 |
| `apps/server/src/modules/records/dto/create-travel-record.dto.ts` | DTO 日期校验与白名单 | ✓ VERIFIED | `@IsOptional()` + `@Matches(...)` 就位，且 controller 开启 `forbidNonWhitelisted` |
| `apps/server/src/modules/records/records.repository.ts` | trip-level create / import 去重 / place-level delete | ✓ VERIFIED | `create`、三元组 key、`deleteMany({ where: { userId, placeId }})` 都在位 |
| `apps/server/src/modules/auth/auth.service.ts` | bootstrap 返回 contract 记录含日期 | ✓ VERIFIED | `toContractTravelRecord` 映射 `startDate/endDate`，`bootstrap()` 返回 `records.map(...)` |
| `apps/web/src/stores/map-points.ts` | 多条 trip 真源、marker 去重、place-level 删除 | ✓ VERIFIED | `tripsByPlaceId`、`applyAuthoritativeTravelRecords`、`displayPoints`、`unilluminate` 都已重构 |
| `apps/web/src/services/legacy-point-storage.ts` | legacy 迁移输出未知日期 | ✓ VERIFIED | `normalizeLegacyTravelRecord()` 固定输出 `null/null` |
| `apps/web/src/components/map-popup/TripDateForm.vue` | 内联日期表单与区间校验 | ✓ VERIFIED | 开始日期必填、结束日期可选、错误文案正确、空结束日期归一为 `null` |
| `apps/web/src/components/map-popup/PointSummaryCard.vue` | popup 内联表单、次数摘要、追加 CTA | ✓ VERIFIED | UI 状态切换与 emit 链路完整 |
| `apps/web/src/components/LeafletMapStage.vue` | 负责 latest summary 计算与 payload 透传 | ⚠️ PARTIAL | payload 透传正确，但 `activePointLatestTripLabel` 的“最近一次”选择逻辑按 `createdAt` 而不是旅行日期 |

### Key Link Verification

| From | To | Via | Status | Details |
| --- | --- | --- | --- | --- |
| `packages/contracts/src/records.ts` | `packages/contracts/dist/records.d.ts` | contracts build | ✓ WIRED | `pnpm --filter @trip-map/contracts build` 成功，dist 与 source 字段一致 |
| `apps/server/prisma/schema.prisma` | generated Prisma Client | `prisma generate` 产物 | ✓ WIRED | 生成后的 `.prisma/client/index.d.ts` 含 `UserTravelRecord.startDate/endDate` |
| `apps/server/src/modules/records/records.controller.ts` | `apps/server/src/modules/records/records.service.ts` | `@Body(CreateTravelRecordDto)` -> `createTravel(user.id, body)` | ✓ WIRED | controller 73-77 行把 DTO 直接交给 service |
| `apps/server/src/modules/records/records.service.ts` | `apps/server/src/modules/records/records.repository.ts` | `recordsRepository.createTravelRecord/importTravelRecords` | ✓ WIRED | service 80 行和 86 行都调用 repository |
| `apps/server/src/modules/auth/auth.service.ts` | `apps/web/src/stores/auth-session.ts` | `/auth/bootstrap` -> `replaceTravelRecords` / `applyAuthoritativeTravelRecords` | ✓ WIRED | server 返回 `records`; web 在 restore/refresh 路径消费同一 payload |
| `apps/web/src/components/map-popup/TripDateForm.vue` | `apps/web/src/components/LeafletMapStage.vue` | `PointSummaryCard` + `MapContextPopup` 事件透传 | ✓ WIRED | `TripDateForm` emit `submit`; `PointSummaryCard` emit `illuminate(payload)`; `MapContextPopup` 原样透传；`LeafletMapStage` 接收 payload |
| `apps/web/src/stores/map-points.ts` | `apps/web/src/services/api/records.ts` | `illuminate()` 调用 `createTravelRecord({... startDate, endDate })` | ✓ WIRED | `map-points.ts` 399-413 行把日期字段传给 records API |
| `packages/contracts/src/records.ts` | `apps/server/src/modules/records/dto/create-travel-record.dto.ts` | `CreateTravelRecordRequest` -> `CreateTravelRecordDto` 直接类型绑定 | ⚠️ PARTIAL | 27-01 PLAN 期待 DTO 直接 implements shared contract；当前仅手写重复字段，无直接编译期链接 |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
| --- | --- | --- | --- | --- |
| `apps/server/src/modules/auth/auth.service.ts` | `records` | `AuthRepository.findUserTravelRecordsByUserId()` -> `prisma.userTravelRecord.findMany()` | Yes | ✓ FLOWING |
| `apps/web/src/stores/auth-session.ts` | `response.records` / `bootstrap.records` | `fetchAuthBootstrap()` | Yes | ✓ FLOWING |
| `apps/web/src/stores/map-points.ts` | `travelRecords` | `createTravelRecord()` 成功返回 + `/auth/bootstrap` 快照 + import 快照 | Yes | ✓ FLOWING |
| `apps/web/src/components/LeafletMapStage.vue` | `activePointLatestTripLabel` | `mapPointsStore.tripsByPlaceId.get(pid)` | Yes, but selector is wrong | ⚠️ FLOWING BUT WRONG_SELECTOR |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
| --- | --- | --- | --- |
| contracts 构建产物可生成 | `pnpm --filter @trip-map/contracts build` | 退出码 0 | ✓ PASS |
| server 相关类型与主链路测试可通过 | `pnpm --filter @trip-map/server typecheck` + `pnpm --filter @trip-map/server test --run src/modules/records/records.service.spec.ts src/modules/records/records.repository.spec.ts src/modules/auth/auth.service.spec.ts test/auth-bootstrap.e2e-spec.ts test/health.e2e-spec.ts` | `typecheck` 退出码 0；5 个 test files / 20 个测试通过 | ✓ PASS |
| web 相关类型与主链路测试可通过 | `pnpm --filter @trip-map/web typecheck` + `pnpm --filter @trip-map/web test --run src/components/map-popup/TripDateForm.spec.ts src/components/map-popup/PointSummaryCard.spec.ts src/components/LeafletMapStage.spec.ts src/stores/map-points.spec.ts src/stores/auth-session.spec.ts src/services/legacy-point-storage.spec.ts` | `typecheck` 退出码 0；6 个 test files / 109 个测试通过 | ✓ PASS |
| 当前机器的 app-level health spot-check | `pnpm --dir apps/server exec tsx -e "import { createApp } from './src/main.ts'; ... app.inject('/health') ..."` | `{"status":"ok","service":"server","contractsVersion":"phase11-v1","database":"down"}` | ✓ PASS |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
| --- | --- | --- | --- | --- |
| TRIP-01 | 27-01 ~ 27-04 | 用户点亮地点时可以选择这次旅行发生的日期 | ✓ SATISFIED | `TripDateForm.vue` + spec 强制开始日期，`LeafletMapStage.vue` 把 `{startDate,endDate}` 透传给 store/API，server DTO/service 校验通过 |
| TRIP-02 | 27-01 ~ 27-04 | 用户可以为同一地点保存多次旅行记录，而不是被覆盖成单次去访 | ✓ SATISFIED | Prisma 去唯一化、repository 用 `create`、store 保留同 placeId 多条记录、popup “再记一次去访”流程通过 |
| TRIP-03 | 27-01 ~ 27-04 | 已保存的旅行日期与同地点多次去访记录在刷新、重开应用和跨设备后仍能稳定恢复 | ✓ SATISFIED | `/auth/bootstrap` 返回日期字段；`auth-session.ts` restore/refresh 路径消费 `records`; legacy import 输出 `null/null`；当前机器因 `/health` 为 `database: down`，浏览器实机持久化证据仍有限 |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
| --- | --- | --- | --- | --- |
| `apps/web/src/components/LeafletMapStage.vue` | 480 | “最近一次”按 `createdAt` 排序而不是按旅行日期排序 | 🛑 Blocker | 会把补录的旧旅行误显示为最近一次旅行，直接违背 27-04 的 D-05 摘要语义 |
| `apps/web/src/components/LeafletMapStage.spec.ts` | 317 | 测试用例没有任何断言 | ℹ️ Info | `calls addFeatures with CN layer...` 当前即使目标行为回归也会继续通过，削弱回归保护 |
| `apps/web/src/components/LeafletMapStage.spec.ts` | 719 | 测试用例没有任何断言 | ℹ️ Info | `does not fetch /records again...` 目前只是 mount + flush，不能证明宣称的行为 |
| `apps/server/src/modules/records/records.service.ts` | 84 | `importTravel()` 未复用 `endDate >= startDate` 校验 | ⚠️ Warning | 当前 legacy import 走的是 `null/null`，不影响主链路，但批量导入若带非法日期区间会绕过单条创建校验 |
| `apps/server/src/modules/records/records.repository.ts` | 116 | `createMany({ skipDuplicates: true })` 但 schema 没有对应唯一约束 | ⚠️ Warning | 当前三元组去重主要靠应用层预查询；并发重复导入时数据库层没有唯一键兜底 |

### Gaps Summary

核心链路已经基本打通：contracts、Prisma schema、后端 create/bootstrap、前端 store、popup 日期表单和“再记一次去访”流程都存在且经过针对性测试验证。`TRIP-01`、`TRIP-02`、`TRIP-03` 从代码与自动化证据看都已落地。

但本阶段仍不能判定为 `passed`，原因有两点。第一，27-04 的 D-05 摘要语义没有真正闭环，`LeafletMapStage.vue` 当前用 `createdAt` 而不是旅行日期来算“最近一次”，这会在补录旧旅行时给出错误的用户可见结果。第二，27-01 PLAN 明写的 `CreateTravelRecordRequest -> CreateTravelRecordDto` 直接类型绑定并未实际成立，当前只是手写重复字段；这不影响当下运行，但意味着一个 plan-level must-have 没有被真实满足。

本次没有再把 27-04 的 `human-verify` checkpoint 列为待办，因为用户已明确批准继续；不过环境限制必须如实记录：我在当前机器上用 app-inject 读取 `/health`，返回 `database: "down"`，而直接 `curl http://localhost:4000/health` 时没有正在监听的本地进程。也就是说，当前报告的通过证据主要来自代码检查、类型检查和 targeted tests，而不是一次完整、可重复的本机浏览器持久化回放。

**这看起来是有意偏离。** 如果团队决定继续保留当前 DTO 不直接绑定 shared contract 的做法，请在后续 VERIFICATION frontmatter 中显式加入 override，例如：

```yaml
overrides:
  - must_have: "CreateTravelRecordRequest 的共享契约变更能直接约束到 CreateTravelRecordDto"
    reason: "DTO 需要接受 undefined 并配合 ValidationPipe / repository 归一为 null，直接 implements shared contract 会引入错误的编译约束；改为手写字段并用独立测试保护"
    accepted_by: "{name}"
    accepted_at: "{ISO timestamp}"
```

---

_Verified: 2026-04-20T08:28:44Z_
_Verifier: Claude (gsd-verifier)_
