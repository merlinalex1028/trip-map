# Phase 24: Session Boundary & Local Import - Research

**Researched:** 2026-04-14  
**Domain:** Vue 3 + Pinia session orchestration, legacy local snapshot import, Prisma-backed account records [VERIFIED: codebase grep][VERIFIED: package.json]  
**Confidence:** MEDIUM

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
### 匿名保存拦截
- **D-01:** 未登录用户在匿名状态下尝试“点亮 / 保存地点”时，直接打开统一的 `AuthDialog` 登录弹层，不走“只提示不拦截”的轻提醒方案。
- **D-02:** 打开登录弹层时必须保留当前地图上下文，包括当前识别结果、地图位置和用户正在看的地点，不允许把用户踢回空白初始态。

### 首登本地记录选择
- **D-03:** 只有在检测到“本地存在旧记录”时，登录成功后才出现一次明确选择弹层；如果没有本地记录，则不插入迁移决策步骤。
- **D-04:** 这个选择弹层只提供两条主路径：`导入本地记录到当前账号` 与 `以当前账号云端记录为准`，不做静默默认覆盖。

### 导入去重与结果反馈
- **D-05:** 本地记录导入账号时按 canonical `placeId` 自动去重合并，不做逐条冲突确认。
- **D-06:** 导入完成后必须给出轻量结果摘要，至少说明导入了多少条本地记录、合并了多少个重复地点，以及当前账号最终有多少个地点。

### 退出登录与切账号边界
- **D-07:** 退出登录时立即清掉上一账号的点亮记录与相关选中态，同时给出明确 notice，例如“已退出当前账号”。
- **D-08:** 切换到另一账号时同样走“明确 notice + 立即清边界”的语义，让用户清楚知道界面正在加载新账号对应的数据，而不是静默切换。

### Claude's Discretion
- 导入选择弹层的视觉布局、按钮文案细节与结果摘要的具体排版可由 planner / executor 自行决定，但不能削弱“用户主动选择”的语义。
- 匿名保存时登录弹层前后的过渡动画、notice 的展示时长与语气可由 the agent 决定，但必须保留地图上下文。
- 切账号时 notice 的精确文案与是否带用户名可由 the agent 决定，只要能明确表达当前边界已切换。

### Deferred Ideas (OUT OF SCOPE)
- 逐条冲突确认或高级 merge 策略 — 更适合未来的同步增强阶段，不在 Phase 24。
- 多设备最终一致、取消点亮同步语义与更细粒度同步状态提示 — 属于 Phase 25。
- 设备管理、退出所有设备、登录历史 — 超出当前会话边界与首次导入范围。
- 本地导入后的撤销 / 回滚体验 — 未来如有需要可单独成 phase 或 backlog。
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| AUTH-04 | 未登录用户仍可浏览地图，只在保存或同步旅行记录时被引导登录。 [VERIFIED: .planning/REQUIREMENTS.md] | 已验证 `AuthDialog`、`auth-session`、`LeafletMapStage`/`map-points` 现有分层允许在 save 动作前拦截而不清空地图上下文。 [VERIFIED: codebase grep][VERIFIED: .planning/phases/24-session-boundary-local-import/24-CONTEXT.md] |
| MIGR-01 | 本地已有旅行记录的用户首次登录时，可以选择将本地记录合并到账号。 [VERIFIED: .planning/REQUIREMENTS.md] | 已验证旧浏览器本地快照 key 与 schema；推荐把一次性导入决策挂在 `auth-session` 登录成功后的 bootstrap 后置步骤。 [VERIFIED: git history][VERIFIED: codebase grep] |
| MIGR-02 | 本地已有旅行记录的用户首次登录时，也可以选择以当前账号云端记录为准而不导入本地记录。 [VERIFIED: .planning/REQUIREMENTS.md] | 已验证 current-user bootstrap 已返回云端权威 snapshot；需要补“用户明确放弃本地导入”后的清理/一次性决议逻辑。 [VERIFIED: codebase grep][VERIFIED: .planning/phases/24-session-boundary-local-import/24-CONTEXT.md][ASSUMED] |
| MIGR-03 | 本地记录导入账号时，会按 canonical place 去重，避免同一地点重复出现。 [VERIFIED: .planning/REQUIREMENTS.md] | 已验证后端使用 `UserTravelRecord @@unique([userId, placeId])` 与 `upsert`，适合作为导入幂等基座。 [VERIFIED: codebase grep][CITED: https://www.prisma.io/docs/orm/prisma-client/special-fields-and-types/working-with-composite-ids-and-constraints] |
| MIGR-04 | 用户退出登录或切换账号后，界面会清空上一账号的记录并重新加载当前会话的数据。 [VERIFIED: .planning/REQUIREMENTS.md] | 已验证 `auth-session` 在 anonymous/authenticated snapshot 切换时统一调用 `resetTravelRecordsForSessionBoundary()`，可在此继续收口 notice 与切账号过渡。 [VERIFIED: codebase grep][VERIFIED: .planning/phases/23-auth-ownership-foundation/23-VERIFICATION.md] |
</phase_requirements>

## User Constraints

本阶段必须继续允许匿名浏览，只在保存/同步旅行记录时升级为登录流程；登录弹层打开前后不得丢失当前地图上下文。 [VERIFIED: .planning/phases/24-session-boundary-local-import/24-CONTEXT.md]

本阶段的迁移交互是一次性、显式、二选一流程，不允许静默默认覆盖，也不允许把逐条冲突处理、多设备最终一致、设备管理等后续能力混入。 [VERIFIED: .planning/phases/24-session-boundary-local-import/24-CONTEXT.md][VERIFIED: .planning/ROADMAP.md]

## Project Constraints (from CLAUDE.md)

- 与用户交流必须使用中文；代码、命令、配置键名保持原始语言。 [VERIFIED: CLAUDE.md]
- 代码改动要最小化，遵循现有 monorepo 结构与风格。 [VERIFIED: CLAUDE.md]
- 前端必须继续使用 Vue 3 Composition API + `<script setup lang="ts">` + Pinia。 [VERIFIED: CLAUDE.md]
- `packages/contracts/src/` 是共享契约真源；改 contracts 后需要 `pnpm --filter @trip-map/contracts build`。 [VERIFIED: CLAUDE.md]
- 测试框架统一是 Vitest；前端用 `happy-dom`，后端 e2e 用 `supertest`。 [VERIFIED: CLAUDE.md]
- 前端行为应保持 root/App 作为薄组合层，迁移/会话逻辑优先进 store/composable，不要塞进地图组件。 [VERIFIED: CLAUDE.md][VERIFIED: .planning/phases/24-session-boundary-local-import/24-CONTEXT.md]

## Summary

Phase 24 应被规划成“会话编排 + 遗留数据一次性决议”功能，而不是地图功能：当前代码已经把账号快照真源收在 `auth-session`，把地图 records 真源收在 `map-points`，而 `LeafletMapStage` 主要消费这些 store 提供的结果。 [VERIFIED: codebase grep][VERIFIED: .planning/phases/24-session-boundary-local-import/24-CONTEXT.md]

真正高风险点不是登录弹层本身，而是“首次登录后如何处理遗留数据”与“会话切换时 UI 是否串号”。 历史提交证明项目曾把点位保存在浏览器 `localStorage` 的 `trip-map:point-state:v2` key 下；同时，数据库里仍保留无 owner 的 legacy `TravelRecord` 表。 当前 phase 文案明显偏向“浏览器本地旧记录”，但 planner 需要把“是否也处理 legacy 数据库表”显式写成 open question，避免误把两个来源混为一类。 [VERIFIED: git history][VERIFIED: codebase grep][VERIFIED: .planning/phases/24-session-boundary-local-import/24-CONTEXT.md][VERIFIED: .planning/research/STACK.md]

从实现成本和结果摘要准确性看，最佳路线不是在前端对本地记录做 N 次 `POST /records` 再自己猜导入结果，而是新增一个受 `sid`/CurrentUser 保护的 import action：前端只负责检测 legacy snapshot、展示一次性选择弹层、保持地图上下文和显示结果 notice；服务端负责按 canonical `placeId` 去重、计算 `imported/merged/finalCount` 摘要并返回新 snapshot 或摘要 DTO。 [VERIFIED: codebase grep][CITED: https://www.prisma.io/docs/orm/prisma-client/special-fields-and-types/working-with-composite-ids-and-constraints][ASSUMED]

**Primary recommendation:** 用 `auth-session` 触发的一次性 import gate + 服务端 import summary endpoint 规划本阶段；把 `LeafletMapStage` 保持为纯消费层，把旧 `trip-map:point-state:v2` 作为只读 legacy 来源处理。 [VERIFIED: codebase grep][VERIFIED: git history][ASSUMED]

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Vue | `3.5.32`（仓库已用；npm latest 仍为 `3.5.32`，registry modified 2026-04-13） [VERIFIED: package.json][VERIFIED: npm registry] | App shell、modal、phase-level composition surface。 [VERIFIED: package.json] | 项目已固定 Vue 3 SFC；Phase 24 不需要框架迁移。 [VERIFIED: CLAUDE.md][VERIFIED: package.json] |
| Pinia | `3.0.4`（仓库已用；npm latest 仍为 `3.0.4`，registry modified 2025-11-05） [VERIFIED: package.json][VERIFIED: npm registry] | `auth-session` / `map-points` / `map-ui` store 编排。 [VERIFIED: codebase grep] | Pinia 官方文档明确支持 setup store、`storeToRefs()` 与独立 store 测试；这与当前仓库形态一致。 [CITED: https://pinia.vuejs.org/core-concepts/][CITED: https://pinia.vuejs.org/cookbook/testing.html][VERIFIED: codebase grep] |
| NestJS + Fastify | `11.1.18` + `5.8.4`（仓库已用） [VERIFIED: package.json] | 增加受会话保护的 import endpoint / summary DTO。 [VERIFIED: package.json][VERIFIED: codebase grep] | 当前 auth/records 路由、cookie runtime、ValidationPipe 都已在这套栈上闭环。 [VERIFIED: codebase grep][VERIFIED: .planning/phases/23-auth-ownership-foundation/23-VERIFICATION.md] |
| Prisma Client | `6.19.2`（仓库 pin；npm latest 为 `7.7.0`，modified 2026-04-13） [VERIFIED: package.json][VERIFIED: npm registry] | 账号 records 唯一键、导入去重、事务摘要。 [VERIFIED: package.json][VERIFIED: codebase grep] | 当前仓库已在 `UserTravelRecord @@unique([userId, placeId])` 上落地；Prisma 官方确认 compound unique 可直接用于 `upsert`。 [VERIFIED: codebase grep][CITED: https://www.prisma.io/docs/orm/prisma-client/special-fields-and-types/working-with-composite-ids-and-constraints] |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Vitest | `4.1.3`（仓库 pin；npm latest `4.1.4`，modified 2026-04-09） [VERIFIED: package.json][VERIFIED: npm registry] | web store/component 回归与 server e2e。 [VERIFIED: package.json] | Vue 官方仍推荐 Vite 项目优先用 Vitest；本仓库现有 web/server 命令都已基于它。 [CITED: https://vuejs.org/guide/scaling-up/testing.html][VERIFIED: codebase grep] |
| @vue/test-utils | `2.4.6`（仓库已用；npm latest 仍为 `2.4.6`） [VERIFIED: package.json][VERIFIED: npm registry] | App/AuthDialog/LeafletMapStage 组件挂载与黑盒断言。 [VERIFIED: codebase grep] | Vue 官方明确推荐应用组件测试使用 `@vue/test-utils`。 [CITED: https://vuejs.org/guide/scaling-up/testing.html] |
| Browser `localStorage` | Web platform，广泛可用，跨 browser session 保留同 origin 数据。 [CITED: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage] | 作为只读 legacy 导入源，而不是新的主真源。 [VERIFIED: git history] | 仅用于读取旧 key 与清理一次性决议；新的 records 真源仍应在 server。 [VERIFIED: git history][VERIFIED: codebase grep][ASSUMED] |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| 在 `LeafletMapStage` 里直接判断登录/导入。 [VERIFIED: codebase grep] | 把导入 gate 放在 `App.vue` + `auth-session`。 [VERIFIED: codebase grep] | 现有分层已经把 session 真源与 map 真源拆开；继续把决策塞进地图组件只会增加串号风险。 [VERIFIED: .planning/phases/24-session-boundary-local-import/24-CONTEXT.md][VERIFIED: codebase grep] |
| 前端循环调用现有 `POST /records`。 [VERIFIED: codebase grep] | 新增单个 import endpoint。 [ASSUMED] | 现有单条写接口难以准确返回 `imported/merged/finalCount`，而 phase 明确要求结果摘要。 [VERIFIED: .planning/phases/24-session-boundary-local-import/24-CONTEXT.md][VERIFIED: codebase grep][ASSUMED] |
| 现在就升级 Prisma 到 `7.7.0`。 [VERIFIED: npm registry] | 保持 `6.19.2`，只做 Phase 24 业务改动。 [VERIFIED: package.json] | 仓库 quick artifact 已记录 Prisma 7 需要 `prisma.config.ts`/datasource 迁移；这与本 phase 无关。 [VERIFIED: .planning/quick/260408-lu0-taze/260408-lu0-SUMMARY.md][VERIFIED: package.json][VERIFIED: npm registry] |

**Installation:** 当前 phase 规划不需要新增 npm 包。 [VERIFIED: codebase grep][ASSUMED]

**Version verification:**  
- `vue` latest: `3.5.32`，与仓库一致。 [VERIFIED: npm registry][VERIFIED: package.json]  
- `pinia` latest: `3.0.4`，与仓库一致。 [VERIFIED: npm registry][VERIFIED: package.json]  
- `vitest` latest: `4.1.4`，仓库为 `4.1.3`；本 phase 不需要为此做依赖升级。 [VERIFIED: npm registry][VERIFIED: package.json][ASSUMED]  
- `@prisma/client` latest: `7.7.0`，仓库为 `6.19.2`；保留当前 pin 更符合本 phase 范围。 [VERIFIED: npm registry][VERIFIED: package.json][VERIFIED: .planning/quick/260408-lu0-taze/260408-lu0-SUMMARY.md]  

## Architecture Patterns

### Recommended Project Structure

```text
apps/web/src/
├── stores/
│   ├── auth-session.ts          # 会话真源；登录成功后的 import gate 入口
│   ├── map-points.ts            # 当前会话 records 真源；边界 reset / replace
│   └── map-ui.ts                # notice / interaction feedback
├── components/
│   ├── auth/AuthDialog.vue      # 匿名保存拦截复用
│   └── auth/...Import*.vue      # 推荐新增的一次性选择/结果 surface
└── services/
    └── legacy-point-storage.ts  # 推荐新增：只读解析 trip-map:point-state:v2

apps/server/src/modules/
├── auth/                        # 继续负责 sid/bootstrap/current user
└── records/                     # 推荐新增 import endpoint / summary DTO
```

现有代码已经证明 `App.vue` 只做 restore/notice/组合挂载，`auth-session` 负责 snapshot 切换，`map-points` 负责 records 生命周期；Phase 24 应继续沿用这条边界。 [VERIFIED: codebase grep][VERIFIED: .planning/phases/24-session-boundary-local-import/24-CONTEXT.md]

### Pattern 1: Session-Orchestrated Import Gate

**What:** 登录成功后先拿 `/auth/bootstrap` 的当前账号快照，再检测是否存在 legacy local snapshot；若存在则在 app-level surface 打开一次性选择弹层。 [VERIFIED: codebase grep][VERIFIED: git history][ASSUMED]

**When to use:** `login()` / `register()` 成功后，以及未来“恢复到另一账号 sid”时需要重建当前账号边界时。 [VERIFIED: codebase grep][ASSUMED]

**Why:** `auth-session` 已经统一处理 `restoreSession/login/logout`，并在 snapshot 切换时调用 `resetTravelRecordsForSessionBoundary()`；把 import gate 继续收口在这里，最符合现有 Pinia 单一真源做法。 [VERIFIED: codebase grep][CITED: https://pinia.vuejs.org/core-concepts/]

**Example:**

```ts
// Source: current code pattern in apps/web/src/stores/auth-session.ts
function applyAuthenticatedSnapshot(response: Extract<AuthBootstrapResponse, { authenticated: true }>) {
  const mapPointsStore = useMapPointsStore()

  mapPointsStore.resetTravelRecordsForSessionBoundary()
  mapPointsStore.replaceTravelRecords(response.records)
  currentUser.value = response.user
  status.value = 'authenticated'
}
```

### Pattern 2: Read-Only Legacy Snapshot Reader

**What:** 从历史 `point-storage.ts` 提炼一个只读 parser，只负责识别 `trip-map:point-state:v2`、校验 `version/userPoints/seedOverrides/deletedSeedIds` 并导出可导入的 canonical points；不要恢复旧 seed/drawer 逻辑。 [VERIFIED: git history]

**When to use:** 仅在 authenticated bootstrap 之后、且当前账号尚未完成本次 session 的本地导入决议时。 [VERIFIED: .planning/phases/24-session-boundary-local-import/24-CONTEXT.md][ASSUMED]

**Example:**

```ts
// Source: historical code in apps/web/src/services/point-storage.ts @ 457b084^
export const POINT_STORAGE_KEY = 'trip-map:point-state:v2'

export interface PointStorageSnapshot {
  version: 2
  userPoints: PersistedMapPoint[]
  seedOverrides: SeedPointOverride[]
  deletedSeedIds: string[]
}
```

### Pattern 3: Server-Side Import Summary

**What:** import endpoint 先把 incoming local records 按 `placeId` 去重，再与当前用户现有 `UserTravelRecord.placeId` 做集合比较，返回 `importedCount`、`mergedDuplicateCount`、`finalCount`。 [VERIFIED: .planning/phases/24-session-boundary-local-import/24-CONTEXT.md][VERIFIED: codebase grep][ASSUMED]

**When to use:** 用户点击“导入本地记录到当前账号”时。 [VERIFIED: .planning/phases/24-session-boundary-local-import/24-CONTEXT.md]

**Why:** Prisma 官方确认 compound unique 可用于 `upsert`；当前仓库已有 `userId_placeId` 唯一键，服务端最适合计算结果摘要并保证幂等。 [VERIFIED: codebase grep][CITED: https://www.prisma.io/docs/orm/prisma-client/special-fields-and-types/working-with-composite-ids-and-constraints]

**Example:**

```ts
// Source: current code pattern in apps/server/src/modules/records/records.repository.ts
return this.prisma.userTravelRecord.upsert({
  where: {
    userId_placeId: {
      userId,
      placeId: input.placeId,
    },
  },
  update: { /* ... */ },
  create: { /* ... */ },
})
```

### Anti-Patterns to Avoid

- **把导入逻辑塞进 `LeafletMapStage.vue`：** 这会把 session 决策与地图渲染耦合，违背现有 `auth-session`/`map-points` 分工。 [VERIFIED: .planning/phases/24-session-boundary-local-import/24-CONTEXT.md][VERIFIED: codebase grep]
- **在前端偷偷决定“云端赢”或“本地赢”：** context 明确要求用户主动选择，不能静默默认覆盖。 [VERIFIED: .planning/phases/24-session-boundary-local-import/24-CONTEXT.md]
- **导入后不清理或不标记 legacy snapshot：** `localStorage` 会跨 browser session 持久存在，不处理就会反复弹迁移选择。 [CITED: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage][ASSUMED]
- **把历史 `.planning/research/STACK.md` 的 `TravelRecord.userId` 迁移方案当成当前实现现实：** 代码已经切到 `UserTravelRecord`，planner 应跟随现状而不是回到旧提案。 [VERIFIED: codebase grep][VERIFIED: .planning/research/STACK.md][VERIFIED: .planning/phases/23-auth-ownership-foundation/23-VERIFICATION.md]

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| 会话边界切换 | 在多个组件里 scattered watch `status/currentUser/travelRecords`。 [VERIFIED: codebase grep] | 继续通过 `auth-session` 统一切换 snapshot，再让 `map-points` 只提供 `replace/reset` helper。 [VERIFIED: codebase grep] | 现有 Phase 23 已证明这套边界能稳定处理 logout/unauthorized。 [VERIFIED: .planning/phases/23-auth-ownership-foundation/23-VERIFICATION.md] |
| 去重与结果摘要 | 前端循环发 N 次 `POST /records` 后本地猜“导入了多少/合并了多少”。 [VERIFIED: codebase grep] | 服务端 import action + Prisma `@@unique([userId, placeId])`/`upsert`。 [VERIFIED: codebase grep][CITED: https://www.prisma.io/docs/orm/prisma-client/special-fields-and-types/working-with-composite-ids-and-constraints] | phase 明确要求 canonical 去重与结果摘要；这些都更适合在服务端统一计算。 [VERIFIED: .planning/phases/24-session-boundary-local-import/24-CONTEXT.md][ASSUMED] |
| legacy 本地记录读取 | 在 modal 组件里直接 `JSON.parse(localStorage.getItem(...))`。 [ASSUMED] | 抽一个最小 `legacy-point-storage` reader，复用历史 key/schema 与 corrupt/incompatible 判定。 [VERIFIED: git history] | 历史 snapshot 不只含 `userPoints`，还含版本与 seed 相关字段；read-only parser 更安全。 [VERIFIED: git history] |
| 账号切换 notice | 让 map 组件自己猜“这是 logout 还是 switch-account”。 [ASSUMED] | 在 `auth-session` 明确区分 anonymous reset 与 authenticated rehydrate，并通过 `map-ui` 出 notice。 [VERIFIED: codebase grep][VERIFIED: .planning/phases/24-session-boundary-local-import/24-CONTEXT.md] |

**Key insight:** 本 phase 最值得复用的是“现有 session/records 边界”和“历史 local snapshot schema”，而不是恢复旧 localStorage 主链路。 [VERIFIED: codebase grep][VERIFIED: git history]

## Runtime State Inventory

| Category | Items Found | Action Required |
|----------|-------------|-----------------|
| Stored data | 1. 历史浏览器 key `trip-map:point-state:v2`，snapshot `version: 2`，含 `userPoints`、`seedOverrides`、`deletedSeedIds`。 [VERIFIED: git history] 2. 当前数据库仍有 legacy `TravelRecord` 表，且无 owner 字段；当前正式真源是 `UserTravelRecord`。 [VERIFIED: codebase grep] | 1. **Code edit + user-triggered data migration**：增加只读解析与导入/放弃逻辑。 [VERIFIED: git history][ASSUMED] 2. **Open question**：是否也要处理 legacy `TravelRecord`，当前 phase 文案未锁定。 [VERIFIED: .planning/research/STACK.md][VERIFIED: .planning/phases/24-session-boundary-local-import/24-CONTEXT.md][ASSUMED] |
| Live service config | 未发现本 phase 相关的外部 UI-only 配置系统或导入规则配置。 [VERIFIED: codebase grep] | None — 当前 repo 里未发现需要手动同步的 live service config。 [VERIFIED: codebase grep] |
| OS-registered state | 未发现与本 phase 直接相关的 launchd/systemd/pm2/task scheduler 注册项。 [VERIFIED: codebase grep] | None — planner 不需要为 OS 注册态安排额外迁移。 [VERIFIED: codebase grep] |
| Secrets/env vars | `apps/server/.env` 存在，server e2e 依赖 `DATABASE_URL`/`DIRECT_URL`/`SHADOW_DATABASE_URL`。 [VERIFIED: codebase grep][VERIFIED: local env probe] 未发现与 local import/session boundary 语义绑定的专用 env 名。 [VERIFIED: codebase grep] | **Code edit only**：若新增 import endpoint，无需新增 phase-specific env；但验证仍依赖现有 DB env。 [VERIFIED: codebase grep][ASSUMED] |
| Build artifacts | `packages/contracts` 是 import summary DTO 的潜在新增位置；其构建产物在 `dist/`。 [VERIFIED: CLAUDE.md][VERIFIED: package.json] 未发现名称或安装态迁移要求。 [VERIFIED: codebase grep] | **Code edit + rebuild**：若新增 contracts，需要 `pnpm --filter @trip-map/contracts build`。 [VERIFIED: CLAUDE.md] |

**Nothing found in category:** `Live service config` 与 `OS-registered state` 都没有发现需要迁移的现存项。 [VERIFIED: codebase grep]

## Common Pitfalls

### Pitfall 1: 把“匿名保存拦截”做成地图层状态分叉

**What goes wrong:** 点击点亮时地图组件同时负责登录弹层、point optimistic state 和 session notice，最后容易丢当前识别结果或清空选中态。 [VERIFIED: .planning/phases/24-session-boundary-local-import/24-CONTEXT.md][ASSUMED]

**Why it happens:** 需求看起来像 map interaction，但真正的边界是“当前会话能不能写 records”。 [VERIFIED: .planning/phases/24-session-boundary-local-import/24-CONTEXT.md]

**How to avoid:** 让 `LeafletMapStage` 只抛出“尝试保存”的公共动作，由 `auth-session`/`map-points` 决定是开 `AuthDialog` 还是继续写入。 [VERIFIED: codebase grep][ASSUMED]

**Warning signs:** 需要在 `LeafletMapStage.vue` 内部直接读 auth status、legacy storage、import choice 或 notice 文案。 [VERIFIED: codebase grep][ASSUMED]

### Pitfall 2: 导入决议没有“一次性”收口

**What goes wrong:** 用户每次刷新或重登都被再次问“要不要导入本地记录”。 [CITED: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage][ASSUMED]

**Why it happens:** legacy snapshot 仍留在同 origin 的 `localStorage`，而代码没有在“成功导入”或“明确云端优先”后清理/标记。 [CITED: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage][VERIFIED: git history][ASSUMED]

**How to avoid:** 只在成功完成导入或用户显式选择云端优先后清掉 legacy snapshot；失败时保留。 [ASSUMED]

**Warning signs:** import modal 打开条件只看“是否存在 local key”，不看“本账号/本 session 是否已决议”。 [ASSUMED]

### Pitfall 3: 结果摘要由前端推断，导致 imported/merged 计数失真

**What goes wrong:** 前端拿本地数组长度减去云端数组长度来猜结果，遇到 duplicate、已存在云端记录、写入失败时很容易错。 [ASSUMED]

**Why it happens:** 现有 `POST /records` 只返回单条 `TravelRecord`，没有 import summary 契约。 [VERIFIED: codebase grep]

**How to avoid:** 在 server import action 里先计算 incoming unique set、cloud existing set 和 toCreate set，再返回摘要。 [VERIFIED: codebase grep][ASSUMED]

**Warning signs:** 计划里没有新增 import DTO / endpoint，却要求“至少说明导入了多少、合并了多少、最终多少”。 [VERIFIED: .planning/phases/24-session-boundary-local-import/24-CONTEXT.md]

### Pitfall 4: 误判 server e2e 是“本地纯单元测试”

**What goes wrong:** planner 把 `auth-bootstrap.e2e` 当作随时可跑的本地校验，执行时才发现依赖外部 DB。 [VERIFIED: local command execution]

**Why it happens:** `apps/server/.env` 存在且测试直接连 Prisma 数据库；在当前沙箱内无法访问 `aws-1-ap-southeast-1.pooler.supabase.com:5432`。 [VERIFIED: local env probe][VERIFIED: local command execution]

**How to avoid:** 把 server e2e 标为“需要外部 DB”验证项，并在计划里注明沙箱 fallback。 [VERIFIED: local command execution]

**Warning signs:** 计划只写 `pnpm --filter @trip-map/server test -- ...`，没有说明 DB reachability 前提。 [VERIFIED: local command execution]

## Code Examples

Verified patterns from official sources and current code:

### Pinia: `storeToRefs()` 保持响应式解构

```ts
// Source: https://pinia.vuejs.org/core-concepts/
import { useCounterStore } from '@/stores/counter'
import { storeToRefs } from 'pinia'

const store = useCounterStore()
const { name, doubleCount } = storeToRefs(store)
const { increment } = store
```

Pinia 官方文档明确指出直接解构 store 会破坏响应式，而 `storeToRefs()` 会为响应式属性创建 refs。 [CITED: https://pinia.vuejs.org/core-concepts/]

### Store testing: 每个 spec 创建 fresh pinia

```ts
// Source: https://pinia.vuejs.org/cookbook/testing.html
import { setActivePinia, createPinia } from 'pinia'

beforeEach(() => {
  setActivePinia(createPinia())
})
```

这与仓库现有 `auth-session.spec.ts` / `map-points.spec.ts` 写法一致。 [CITED: https://pinia.vuejs.org/cookbook/testing.html][VERIFIED: codebase grep]

### Prisma: 用 compound unique 做 upsert

```ts
// Source: https://www.prisma.io/docs/orm/prisma-client/special-fields-and-types/working-with-composite-ids-and-constraints
await prisma.like.upsert({
  where: {
    likeId: {
      userId: 1,
      postId: 1,
    },
  },
  update: {},
  create: {
    userId: 1,
    postId: 1,
  },
})
```

仓库当前 `userTravelRecord.upsert({ where: { userId_placeId: { ... }}})` 已在同一模式上工作。 [CITED: https://www.prisma.io/docs/orm/prisma-client/special-fields-and-types/working-with-composite-ids-and-constraints][VERIFIED: codebase grep]

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `seed + localStorage` 作为旅行点位主链路。 [VERIFIED: git history][VERIFIED: .planning/milestones/v1.0-ROADMAP.md] | server authoritative records + `UserTravelRecord` + `auth/bootstrap` snapshot。 [VERIFIED: codebase grep][VERIFIED: .planning/phases/23-auth-ownership-foundation/23-VERIFICATION.md] | 前端 API cutover 在 2026-04-01 的 `feat(15-02)`；账号 bootstrap 闭环在 2026-04-12 至 2026-04-14 完成。 [VERIFIED: git history][VERIFIED: .planning/phases/23-auth-ownership-foundation/23-VERIFICATION.md] | Phase 24 不应恢复旧本地持久化主链路，只应读取 legacy 数据并迁移。 [VERIFIED: git history][ASSUMED] |
| 地图 ready 时自己请求 `/records`。 [VERIFIED: .planning/phases/23-auth-ownership-foundation/23-UAT.md] | `App.vue -> restoreSession() -> /auth/bootstrap`，且不再额外 `GET /records`。 [VERIFIED: codebase grep][VERIFIED: .planning/phases/23-auth-ownership-foundation/23-VERIFICATION.md] | 2026-04-14 gap closure `23-10` 后。 [VERIFIED: git history][VERIFIED: .planning/phases/23-auth-ownership-foundation/23-VERIFICATION.md] | Phase 24 的 import gate 应挂在 auth bootstrap 后，不应回退到 map startup fetch。 [VERIFIED: .planning/phases/24-session-boundary-local-import/24-CONTEXT.md][VERIFIED: codebase grep] |
| 全局 `TravelRecord.placeId @unique` 记录模型。 [VERIFIED: codebase grep][VERIFIED: .planning/research/STACK.md] | `UserTravelRecord @@unique([userId, placeId])` 作为正式 records 真源。 [VERIFIED: codebase grep][VERIFIED: .planning/phases/23-auth-ownership-foundation/23-VERIFICATION.md] | 2026-04-12 Phase 23。 [VERIFIED: git history][VERIFIED: .planning/phases/23-auth-ownership-foundation/23-VERIFICATION.md] | 导入去重应该复用每用户唯一键，而不是新造前端唯一规则。 [VERIFIED: codebase grep][CITED: https://www.prisma.io/docs/orm/prisma-client/special-fields-and-types/working-with-composite-ids-and-constraints] |

**Deprecated/outdated:**
- 历史 `point-storage.ts` / `trip-map:point-state:v2` 主链路已在 `feat(15-02)` 被移除，不应直接恢复为现行 records 真源。 [VERIFIED: git history]
- `.planning/research/STACK.md` 里的“给 `TravelRecord` 加 `userId` 并回填”是早期研究方案，不是当前代码现实。 planner 应优先跟随 `Phase 23` 验证结果和现有 schema。 [VERIFIED: .planning/research/STACK.md][VERIFIED: .planning/phases/23-auth-ownership-foundation/23-VERIFICATION.md][VERIFIED: codebase grep]

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Phase 24 的“本地旧记录”默认指历史浏览器 `localStorage` key `trip-map:point-state:v2`，而不是 legacy 数据库 `TravelRecord`。 [ASSUMED] | Summary / Runtime State Inventory | 若实际还要处理数据库旧表，planner 会漏掉后端 backfill / ownership 迁移任务。 |
| A2 | 重复 canonical `placeId` 的合并语义应是“当前账号云端记录保留，本地重复只计入 merged count”。 [ASSUMED] | Summary / Pattern 3 | 若产品期望本地覆盖云端元数据，则 import endpoint/summary 设计会不对。 |
| A3 | 用户显式选择“以当前账号云端记录为准”后，应清理 legacy local snapshot，避免反复提示。 [ASSUMED] | Common Pitfalls | 若产品希望稍后仍可再次导入，则需要不同的 resolved marker，而不是直接清 key。 |
| A4 | 为了准确返回结果摘要，本 phase 值得新增服务端 import endpoint，而不是只复用单条 `/records`。 [ASSUMED] | Primary recommendation / Don't Hand-Roll | 若团队坚持零后端改动，planner 需要额外设计前端计数和失败恢复机制。 |

## Open Questions

1. **本 phase 的导入源只包含浏览器 localStorage，还是也包含 legacy `TravelRecord` 表？**
   - What we know: 历史浏览器 key `trip-map:point-state:v2` 已被明确找到；legacy `TravelRecord` 表也仍存在。 [VERIFIED: git history][VERIFIED: codebase grep]
   - What's unclear: 用户口中的“本地旧记录”是否只指浏览器本地，还是也包含 pre-owner server rows。 [VERIFIED: .planning/phases/24-session-boundary-local-import/24-CONTEXT.md][ASSUMED]
   - Recommendation: planner 默认按 browser-local 规划，并把 legacy DB 表是否纳入 scope 作为 discuss/确认项。 [ASSUMED]

2. **重复地点的优先级是 cloud wins 还是 local wins？**
   - What we know: context 只锁了“按 canonical `placeId` 去重合并”，没有锁元数据覆盖优先级。 [VERIFIED: .planning/phases/24-session-boundary-local-import/24-CONTEXT.md]
   - What's unclear: 当同一 `placeId` 在云端和本地都存在时，`displayName/subtitle/typeLabel` 是否允许被本地旧值更新。 [ASSUMED]
   - Recommendation: planner 先按 “cloud wins, local counts as merged duplicate” 规划，除非用户明确要求覆盖。 [ASSUMED]

3. **选择“以当前账号云端记录为准”后，本地记录是否应保留一个可恢复入口？**
   - What we know: D-03/D-04 要求一次性明确选择；未要求撤销/回滚。 [VERIFIED: .planning/phases/24-session-boundary-local-import/24-CONTEXT.md]
   - What's unclear: 用户是否需要“今天先跳过，明天再导”的温和路径。 [ASSUMED]
   - Recommendation: 按 scope 先不做撤销入口；若保留数据，至少也要单独记录 `resolved` 状态避免重复弹窗。 [VERIFIED: .planning/phases/24-session-boundary-local-import/24-CONTEXT.md][ASSUMED]

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | web/server test、typecheck、build | ✓ [VERIFIED: local env probe] | `v22.22.1` [VERIFIED: local env probe] | — |
| pnpm | workspace scripts | ✓ [VERIFIED: local env probe] | `10.33.0` [VERIFIED: local env probe] | — |
| Git | 历史追溯、docs commit | ✓ [VERIFIED: local env probe] | `2.53.0` [VERIFIED: local env probe] | — |
| Docker | 若需要本地替代 DB | ✓ [VERIFIED: local env probe] | `28.5.2` [VERIFIED: local env probe] | 可作为本地 Postgres fallback。 [ASSUMED] |
| `apps/server/.env` | server e2e Prisma 连接 | ✓ [VERIFIED: local env probe] | present [VERIFIED: local env probe] | — |
| Remote PostgreSQL reachability | server e2e (`auth-bootstrap.e2e-spec.ts`) | ✗（当前沙箱不可达） [VERIFIED: local command execution] | `aws-1-ap-southeast-1.pooler.supabase.com:5432` unreachable in sandbox [VERIFIED: local command execution] | 沙箱外运行，或改接本地 Docker Postgres。 [VERIFIED: .planning/phases/23-auth-ownership-foundation/23-VERIFICATION.md][ASSUMED] |
| `psql` CLI | 可选 DB 探测/人工排障 | ✗ [VERIFIED: local env probe] | — | 不是 blocker；Prisma 测试不依赖它。 [VERIFIED: local env probe] |

**Missing dependencies with no fallback:**
- 无；当前 phase 规划本身不被缺失依赖阻断。 [VERIFIED: local env probe][ASSUMED]

**Missing dependencies with fallback:**
- server e2e 的数据库联通性在沙箱内不可用，但可在沙箱外复跑，或切换到本地 Docker Postgres。 [VERIFIED: local command execution][ASSUMED]

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Web: Vitest `4.1.3` + `happy-dom`; Server: Vitest `4.1.3` via `apps/server/scripts/vitest-run.mjs`. [VERIFIED: package.json][VERIFIED: codebase grep] |
| Config file | Web: `apps/web/vitest.config.ts`; Server: package script + `apps/server/scripts/vitest-run.mjs`. [VERIFIED: codebase grep] |
| Quick run command | Web: `pnpm --filter @trip-map/web test -- src/stores/auth-session.spec.ts src/stores/map-points.spec.ts src/App.spec.ts`。 [VERIFIED: local command execution] |
| Full suite command | `pnpm test` + `pnpm typecheck`。 [VERIFIED: package.json][VERIFIED: local command execution] |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| AUTH-04 | 匿名浏览时保留地图上下文，点击保存才开 `AuthDialog`。 [VERIFIED: .planning/REQUIREMENTS.md] | web component/store integration [CITED: https://vuejs.org/guide/scaling-up/testing.html] | `pnpm --filter @trip-map/web test -- src/components/LeafletMapStage.spec.ts src/components/auth/AuthDialog.spec.ts src/stores/auth-session.spec.ts` | ✅ existing files [VERIFIED: codebase grep] |
| MIGR-01 | 登录后检测到 legacy local snapshot 时出现“导入到账号”选择。 [VERIFIED: .planning/REQUIREMENTS.md] | web store/app integration [CITED: https://vuejs.org/guide/scaling-up/testing.html] | `pnpm --filter @trip-map/web test -- src/stores/auth-session.spec.ts src/App.spec.ts` | ✅ existing files, but cases missing [VERIFIED: codebase grep][ASSUMED] |
| MIGR-02 | 用户选择“以云端为准”后不导入本地记录，并收口一次性决议。 [VERIFIED: .planning/REQUIREMENTS.md] | web store/app integration [CITED: https://vuejs.org/guide/scaling-up/testing.html] | `pnpm --filter @trip-map/web test -- src/stores/auth-session.spec.ts src/App.spec.ts` | ✅ existing files, but cases missing [VERIFIED: codebase grep][ASSUMED] |
| MIGR-03 | import 时按 canonical `placeId` 去重并返回结果摘要。 [VERIFIED: .planning/REQUIREMENTS.md] | server e2e + repository/service unit [VERIFIED: codebase grep] | `pnpm --filter @trip-map/server test -- test/auth-bootstrap.e2e-spec.ts test/records-travel.e2e-spec.ts test/records-import.e2e-spec.ts` | ❌ `records-import.e2e-spec.ts` missing [VERIFIED: codebase grep][ASSUMED] |
| MIGR-04 | logout / switch-account 立即清边界并重载当前会话 snapshot。 [VERIFIED: .planning/REQUIREMENTS.md] | web store integration + server auth bootstrap smoke [VERIFIED: codebase grep] | `pnpm --filter @trip-map/web test -- src/stores/auth-session.spec.ts src/App.spec.ts` | ✅ existing files, but switch-account case missing [VERIFIED: codebase grep][ASSUMED] |

### Sampling Rate

- **Per task commit:** `pnpm --filter @trip-map/web test -- src/stores/auth-session.spec.ts src/stores/map-points.spec.ts src/App.spec.ts`。 [VERIFIED: local command execution]
- **Per wave merge:** `pnpm --filter @trip-map/web typecheck` + relevant web/server specs。 [VERIFIED: local command execution]
- **Phase gate:** `pnpm test` + `pnpm typecheck`; server e2e 若在沙箱内失败，需在可达 DB 环境复跑。 [VERIFIED: package.json][VERIFIED: local command execution]

### Wave 0 Gaps

- [ ] `apps/server/test/records-import.e2e-spec.ts` — 覆盖 MIGR-03 的去重摘要与幂等结果。 [VERIFIED: codebase grep][ASSUMED]
- [ ] `apps/web/src/stores/auth-session.spec.ts` — 增补“登录后检测 legacy snapshot -> 打开 import gate”与“cloud wins 后不再重复提示”。 [VERIFIED: codebase grep][ASSUMED]
- [ ] `apps/web/src/App.spec.ts` — 增补 import modal/summary notice 挂载合同。 [VERIFIED: codebase grep][ASSUMED]
- [ ] Browser/manual step — 当前仓库没有 Cypress/Playwright；而 Vue 官方指出 cookies、localStorage、真实 DOM 事件更适合 browser-based runner 或人工验证。 [CITED: https://vuejs.org/guide/scaling-up/testing.html][VERIFIED: package.json] |

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | yes [VERIFIED: codebase grep] | 邮箱密码登录 + `argon2` password hash。 [VERIFIED: package.json][VERIFIED: codebase grep] |
| V3 Session Management | yes [VERIFIED: codebase grep] | `sid` `HttpOnly` `SameSite=Lax` cookie + `AuthSession` 表。 [VERIFIED: codebase grep] |
| V4 Access Control | yes [VERIFIED: codebase grep] | `SessionAuthGuard` + `CurrentUser` + repository `userId` 过滤。 [VERIFIED: codebase grep][VERIFIED: .planning/phases/23-auth-ownership-foundation/23-VERIFICATION.md] |
| V5 Input Validation | yes [VERIFIED: codebase grep] | Nest `ValidationPipe` + DTO + class-validator。 [VERIFIED: codebase grep] |
| V6 Cryptography | yes [VERIFIED: codebase grep] | `argon2`；不要自建密码哈希。 [VERIFIED: package.json][VERIFIED: codebase grep] |

### Known Threat Patterns for this stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| 匿名用户绕过 UI 直接写 `/records`。 [VERIFIED: codebase grep] | Elevation of Privilege | 保持 `SessionAuthGuard` 作为服务端最终护栏；前端只负责更早给出 `AuthDialog`。 [VERIFIED: codebase grep][VERIFIED: .planning/phases/24-session-boundary-local-import/24-CONTEXT.md] |
| 退出登录或切账号后短暂显示上一账号 records。 [VERIFIED: .planning/phases/23-auth-ownership-foundation/23-VERIFICATION.md] | Information Disclosure | 先 `resetTravelRecordsForSessionBoundary()` 再决定是否注入新 snapshot。 [VERIFIED: codebase grep][VERIFIED: .planning/phases/23-auth-ownership-foundation/23-VERIFICATION.md] |
| 恶意或损坏的 legacy local snapshot 导致导入崩溃。 [VERIFIED: git history] | Tampering / DoS | 复用历史 `version/corrupt/incompatible` 校验，失败时只给 notice，不进入导入流程。 [VERIFIED: git history][ASSUMED] |
| 重复导入同一 canonical place 造成双写或错误计数。 [VERIFIED: .planning/phases/24-session-boundary-local-import/24-CONTEXT.md] | Tampering | 服务端按 `userId_placeId` 唯一键去重，并返回 authoritative summary。 [VERIFIED: codebase grep][CITED: https://www.prisma.io/docs/orm/prisma-client/special-fields-and-types/working-with-composite-ids-and-constraints][ASSUMED] |

## Sources

### Primary (HIGH confidence)

- Codebase grep + file reads:
  - `apps/web/src/stores/auth-session.ts` — 当前 session/bootstrap 边界。 [VERIFIED: codebase grep]
  - `apps/web/src/stores/map-points.ts` — 当前 records 真源与 reset/replace helper。 [VERIFIED: codebase grep]
  - `apps/web/src/App.vue` / `apps/web/src/components/auth/AuthDialog.vue` / `apps/web/src/components/auth/AuthTopbarControl.vue` — 顶层组合层与 auth surface。 [VERIFIED: codebase grep]
  - `apps/server/src/modules/records/records.repository.ts` / `apps/server/prisma/schema.prisma` — `userId_placeId` 唯一键与 upsert 基座。 [VERIFIED: codebase grep]
  - `apps/server/src/modules/auth/auth.service.ts` / `auth.controller.ts` — `sid` bootstrap 与 snapshot 返回。 [VERIFIED: codebase grep]
- Historical code:
  - `git show 457b084^:apps/web/src/services/point-storage.ts` — legacy key `trip-map:point-state:v2` 与 snapshot schema。 [VERIFIED: git history]
- Official docs:
  - Pinia core concepts: https://pinia.vuejs.org/core-concepts/ [CITED: https://pinia.vuejs.org/core-concepts/]
  - Pinia testing cookbook: https://pinia.vuejs.org/cookbook/testing.html [CITED: https://pinia.vuejs.org/cookbook/testing.html]
  - Vue testing guide: https://vuejs.org/guide/scaling-up/testing.html [CITED: https://vuejs.org/guide/scaling-up/testing.html]
  - Prisma compound unique / upsert: https://www.prisma.io/docs/orm/prisma-client/special-fields-and-types/working-with-composite-ids-and-constraints [CITED: https://www.prisma.io/docs/orm/prisma-client/special-fields-and-types/working-with-composite-ids-and-constraints]
  - MDN localStorage: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage [CITED: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage]
- Registry / local environment:
  - `npm view vue|pinia|vitest|@vue/test-utils|@prisma/client|@fastify/cookie version time.modified --json`。 [VERIFIED: npm registry]
  - `node --version`, `pnpm --version`, `git --version`, `docker --version`, `test -f apps/server/.env`。 [VERIFIED: local env probe]
  - `pnpm --filter @trip-map/web test -- ...`, `pnpm --filter @trip-map/web typecheck`, `pnpm --filter @trip-map/server test -- test/auth-bootstrap.e2e-spec.ts`, `pnpm --filter @trip-map/server typecheck`。 [VERIFIED: local command execution]

### Secondary (MEDIUM confidence)

- `.planning/phases/24-session-boundary-local-import/24-CONTEXT.md` — scope/UX 决议。 [VERIFIED: .planning/phases/24-session-boundary-local-import/24-CONTEXT.md]
- `.planning/phases/23-auth-ownership-foundation/23-VERIFICATION.md` / `23-UAT.md` — upstream auth/session truth。 [VERIFIED: .planning/phases/23-auth-ownership-foundation/23-VERIFICATION.md][VERIFIED: .planning/phases/23-auth-ownership-foundation/23-UAT.md]
- `.planning/research/STACK.md` — 早期 migration 备选方案，用于识别与当前实现的 drift。 [VERIFIED: .planning/research/STACK.md]

### Tertiary (LOW confidence)

- 无；所有核心技术结论均有代码、官方文档或本地命令支撑。 [VERIFIED: codebase grep]

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — 当前 repo 依赖、npm registry 最新版本与官方 Pinia/Vue/Prisma 文档都已核对。 [VERIFIED: package.json][VERIFIED: npm registry][CITED: https://pinia.vuejs.org/core-concepts/][CITED: https://vuejs.org/guide/scaling-up/testing.html][CITED: https://www.prisma.io/docs/orm/prisma-client/special-fields-and-types/working-with-composite-ids-and-constraints]
- Architecture: MEDIUM — `auth-session`/`map-points` 分层和 legacy local key 已验证，但“是否只导浏览器本地、不碰 legacy DB 表”仍需用户确认。 [VERIFIED: codebase grep][VERIFIED: git history][ASSUMED]
- Pitfalls: MEDIUM-HIGH — 会话边界、localStorage 一次性决议、server e2e DB reachability 都有现成证据；重复优先级与 cloud/local merge 细节仍有产品空间。 [VERIFIED: local command execution][VERIFIED: git history][ASSUMED]

**Research date:** 2026-04-14  
**Valid until:** 2026-05-14 for codebase facts; 2026-04-21 for npm latest / external docs currency. [VERIFIED: npm registry][ASSUMED]
