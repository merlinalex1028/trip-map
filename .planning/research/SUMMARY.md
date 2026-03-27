# Project Research Summary

**Project:** 旅行世界地图
**Domain:** 个人旅行地图应用的全栈升级与行政区语义重构
**Researched:** 2026-03-27
**Confidence:** MEDIUM

## Executive Summary

`v3.0` 仍然是个人旅行地图产品，不是 GIS 平台。研究结论很一致：专家式做法不是把一切“后端化”，而是把系统切成清晰的两层。`web` 继续承担 `Leaflet` 地图交互、popup + drawer 主链路、即时选中反馈、边界高亮和几何缓存；`server` 接管 canonical place / boundary identity、旅行记录持久化、数据集版本元数据和未来的导入导出入口。产品语义必须明确收口为“中国市级 / 海外一级行政区”，不要再沿用泛化的 `city` 概念。

推荐默认路径是 `pnpm workspaces` 的 `apps/web + apps/server + packages/contracts`。前端保留现有 `Vue 3 + Vite + TypeScript`，地图切到 `Leaflet`；后端采用 `NestJS REST + OpenAPI + Drizzle + PostgreSQL`。几何数据不应作为 day 1 的数据库主存储，也不应默认改成“每次点击都走 API 查 polygon”；更稳的路径是：canonical 规则与 manifest 由服务端或构建脚本统一产出，GeoJSON / TopoJSON 边界作为版本化静态资产交付，必要时再迁到 `R2` / `S3` 这类对象存储。默认不引入 `PostGIS`、`Redis`、`BullMQ`，只有在空间查询、热点缓存或后台任务被证明真实存在时再补。

最大的风险集中在四个点：canonical ID 不稳定、中国/海外层级语义混淆、`GCJ-02` 与 `WGS84` 坐标体系错位，以及几何交付与数据许可处理失控。缓解策略也很明确：先定前后端职责与共享契约，再定 `placeId / boundaryId / datasetVersion / placeKind` 规则和 provenance 台账，然后做只读 geo API 与几何交付策略，之后再切 `Leaflet` 主链路、持久化写链路，最后做旧数据迁移、性能预算和 UX 回归。这种顺序比一次性大爆炸重构安全得多。

## Key Findings

### Recommended Stack

默认技术路线强调“最小但稳”的全栈升级，而不是引入完整地理平台。`Node.js 22 LTS` 作为统一运行时基线，顶层使用 `pnpm workspaces` 管理 `web/server/contracts`，避免让 `Nest CLI monorepo` 反客为主。前端继续复用现有 `Vue 3 + Vite` 能力，仅替换地图引擎为 `Leaflet`；后端用 `NestJS` 提供清晰模块边界和 `OpenAPI` 契约；数据层用 `PostgreSQL + Drizzle` 承接旅行记录、canonical area 元数据和数据版本。

数据库、对象存储、缓存、队列的建议也很清楚：`PostgreSQL 18` 是默认路径，`PostGIS` 只在未来需要服务端空间查询时再加；对象存储默认不引入，能靠版本化静态资产交付就先保持简单，只有当几何包体、部署或 CDN 管理失控时再选 `Cloudflare R2` 或 `AWS S3`；缓存默认不加，`Redis / Valkey` 只用于后续 manifest 热点、限流或 job 状态；队列默认不加，未来若真的做导入、导出、预处理流水线，再引入 `BullMQ + Redis` 即可。

**Core technologies:**
- `Node.js 22 LTS`：统一 `web` 与 `server` 运行时基线，直接满足 `Vite 8` 与 `Nest 11`。
- `pnpm workspaces`：最适合当前 `web + server + shared contracts` 的增量 monorepo 形态。
- `Vue 3 + Vite`：保留现有前端主应用，减少无谓框架迁移。
- `Leaflet`：承接行政区 GeoJSON 高亮、点击和 popup 锚定，不把 milestone 拉向更重的矢量平台。
- `NestJS + OpenAPI`：提供稳定 REST 边界，让 canonical 语义和 DTO 不再散落在前端。
- `PostgreSQL 18 + Drizzle ORM`：作为旅行记录和 canonical 元数据的默认存储组合，显式且足够轻。

**Infrastructure defaults and alternatives:**
- `Database`：默认 `PostgreSQL 18`；延后选项是 `PostGIS`；`SQLite / Turso` 只适合超轻原型。
- `Object storage`：默认无；需要外置版本化几何和 CDN 时优先考虑 `R2`，AWS 环境再选 `S3`；`MinIO` 仅适合本地或自托管开发。
- `Cache`：默认无；读压、速率限制或 job 状态成为问题后再加 `Redis / Valkey`。
- `Queue`：默认无；确有后台导入导出和数据预处理需求后再加 `BullMQ + Redis`。

### Expected Features

功能研究对范围控制非常明确：首发必须做的是“清晰语义 + 稳定全栈边界 + 面域点亮主链路”，不是把产品扩成全球地理平台。所有 P1 功能都围绕三件事展开：定义稳定的地点身份、用 `Leaflet` 正确表达行政区边界、把记录持久化从本地迁到 API。

**Must have (table stakes):**
- `web` / `server` monorepo 与最小共享契约层跑通，前后端职责明确。
- 旅行记录 CRUD 与点亮 / 取消点亮迁移到 API，不再长期依赖 `localStorage`。
- 稳定的地点身份模型：至少固化 `placeId`、`placeType/placeKind`、`boundaryId`、`countryCode`、`displayName`、`datasetVersion`。
- 中国市级 / 海外一级行政区语义在 UI、API、存储里都显式可见。
- 中国 `GeoAtlas` 与海外 `Natural Earth admin1` 经统一预处理后能驱动选择与高亮。
- `Leaflet` GeoJSON 面域渲染稳定表达选中态、已点亮态和当前查看态。
- 地点面板标题右侧提供点亮 / 取消点亮动作，并与地图高亮同步。

**Should have (competitive):**
- 共享契约包驱动前后端协作，减少 `placeKind`、`boundaryId` 和错误码漂移。
- API 只接管稳定职责，保留前端即时交互与 optimistic UI，不做“全量后端化”。
- 面板中显式展示地理语义标签，如“中国·市级”或“海外·一级行政区”。
- 几何按需加载、预简化或分片，避免 `Leaflet` 因大面数据拖慢交互。
- 面板内联点亮后即时驱动真实边界反馈，不需要跳进深层编辑。

**Defer (v3.1+ / v4+):**
- 账号体系、跨设备同步、多人隔离。
- 海外城市级、POI 级或更细粒度覆盖。
- 服务端主导的完整地理识别平台、批量治理后台和复杂导出流水线。
- 向量瓦片、3D、复杂地图底图平台和 GIS 编辑能力。

### Architecture Approach

架构研究给出的核心模式是 `server-owned geo semantics + boundary geometry by reference + repository seam`。也就是：服务端拥有 canonical area 语义、数据集版本和 trip records；前端只保留地图交互、临时 UI 状态与边界缓存；旅行记录里只存 `areaId/placeId` 等引用，不把 polygon 塞进 DB 或响应式 store；几何通过 `areaId` 或 `geometryRef` 独立请求和缓存。这样既能保留现有 popup + drawer 主链路，又能逐步把旧 `localStorage` 路径迁到 API。

**Major components:**
1. `apps/web`：`LeafletMapStage`、selection store、trip-records store、boundary cache，负责地图交互与 UI 表达。
2. `packages/contracts`：共享 `placeId/areaId` 规则、DTO、枚举、错误码和 `datasetVersion` 常量。
3. `apps/server`：`geo-resolve`、`admin-areas`、`trip-records` 三个核心模块，分别负责命中、摘要/几何、记录写读。
4. `dataset registry / manifest pipeline`：统一承接中国与海外边界预处理产物、provenance 和 geometry delivery 策略。

**Boundary split:**
- 保留在前端 / 静态层：`Leaflet` 渲染、viewport、popup/drawer 状态、局部 optimistic UI、boundary cache、版本化静态几何包的消费。
- 迁移到 API：canonical place resolution、`placeId/boundaryId` 规则、trip records 持久化、数据集版本 manifest、未来导入导出入口。
- 不建议 day 1 迁移到 API：所有原始 GeoJSON 本体、每次点击都走服务端 polygon 查询、服务端空间计算平台化。

### Critical Pitfalls

1. **前后端双写双算，没有单一语义真源** — 必须从第一阶段就规定 `server` 负责 canonical 结果，`web` 只做交互临时态；迁移期允许双读比对，不允许长期双算。
2. **把中国市级和海外 admin1 继续混成 `city`** — API、DB、UI 全部改用 `placeId / placeKind / adminLevel`，并显式展示层级标签。
3. **没有稳定 canonical ID，只靠名称或临时外部编码** — 为中国和海外都生成自有稳定 `placeId`，同时保留 `sourceDataset/sourceFeatureId/datasetVersion`，不要用显示名做主键。
4. **忽略 `GCJ-02` 与 `WGS84` 差异** — 单独建立坐标适配层和中外样本点回归集，验证点击、边界和 popup 锚点一致性。
5. **把几何和数据许可问题留到上线前** — 尽早建立 provenance 台账、coverage policy 和 geometry delivery 策略，避免直接公开暴露原始第三方边界文件。

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Monorepo Skeleton And Ownership
**Rationale:** 先决定哪些职责迁到 API、哪些继续留在前端，否则后面会出现双写双算和无止境回滚。  
**Delivers:** `apps/web`、`apps/server`、`packages/contracts` 骨架；共享 DTO；repository seam；feature flag / 渐进迁移入口。  
**Addresses:** monorepo 拆分、共享契约层、前后端职责边界。  
**Avoids:** 大爆炸切换、本地与 API 双真源、UI 和服务端同时重写。

### Phase 2: Canonical Area Model, Provenance And Semantics
**Rationale:** 这是本 milestone 的最高风险依赖；不先把 ID 和层级语义定稳，任何保存和高亮都不可信。  
**Delivers:** `placeId / boundaryId / placeKind / datasetVersion` 规则，中国市级与海外 admin1 统一摘要结构，数据来源与许可台账，coverage / fallback policy。  
**Addresses:** 稳定地点身份、中国/海外语义、明确回退与消歧规则。  
**Avoids:** 名称当主键、`city` 语义污染、数据版本升级后历史记录漂移。

### Phase 3: Read-Only Geo APIs And Geometry Delivery
**Rationale:** 在切写链路之前，先用只读接口验证“点击 -> resolve -> 摘要 -> 高亮”是否成立最稳。  
**Delivers:** `resolve`、`area summary`、`geometryRef/boundary`、`dataset manifest` 接口；版本化静态几何包；必要时的对象存储挂载方案。  
**Uses:** `NestJS`、`OpenAPI`、dataset registry、静态资产或 `R2/S3`。  
**Implements:** server-owned geo semantics 与 boundary geometry by reference。  
**Avoids:** 把大块 GeoJSON 直接塞进数据库、每次点击都查 polygon、许可边界不清。

### Phase 4: Leaflet Map Migration And Selection Unification
**Rationale:** 只读 geo 能力跑通后，再切地图引擎，能把问题隔离在交互层而不是数据层。  
**Delivers:** `LeafletMapStage`、selection source、boundary cache、popup / drawer 连续性、选中态与已点亮态统一样式。  
**Addresses:** `Leaflet` GeoJSON 渲染、地图点击反馈、面域高亮表达、popup + drawer 保持不退化。  
**Avoids:** 坐标偏移、pane / popup 事件冲突、多个“当前对象”并存。

### Phase 5: Trip Records Persistence And Illuminate Flow
**Rationale:** 当 canonical area 与地图主链路稳定后，再切写链路，能把问题集中在记录模型和 API 契约。  
**Delivers:** `PostgreSQL + Drizzle` trip record 表、点亮 / 取消点亮 API、HTTP repository、optimistic UI 与失败回滚。  
**Uses:** `NestJS REST + OpenAPI + PostgreSQL`。  
**Implements:** server-backed `trip-records` 模块和前端 repository cutover。  
**Avoids:** 旧 `localStorage` 路径长期成为主真源、点亮状态与边界高亮不同步。

### Phase 6: Legacy Migration, Performance And Compatibility Hardening
**Rationale:** 旧数据迁移、性能预算和灰度发布必须晚于主链路稳定，否则很难判断故障来源。  
**Delivers:** 旧 `localStorage` 一次性迁移、失败样本回放、contract tests、API versioning、性能预算、UX parity 回归。  
**Addresses:** 旧数据兼容、Geometry 性能、回归验收、灰度发布。  
**Avoids:** 测试全绿但真实高亮失效、旧存档静默坏掉、线上包体和交互性能崩盘。

### Phase Ordering Rationale

- 先定职责边界，再定 canonical area 规则，是为了防止前后端在最关键的 `placeId/placeKind` 上形成影子真源。
- 先做 read-only geo，再做 `Leaflet`，再做 trip records 写链路，可以把“数据正确性”“地图渲染”“持久化”三个风险分层隔离。
- 几何交付与对象存储放在 read-only 阶段就要决定默认策略，但不需要 day 1 引入额外基础设施；只有在包体和部署压力被验证后，才从静态资产升级到 `R2/S3`。

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 2:** 中国市级 / 海外 admin1 的 canonical ID、特殊区域 coverage、`placeKind` 命名与 fallback 口径需要专项确认。
- **Phase 3:** `GeoAtlas` 与 `Natural Earth` 的坐标适配、几何简化策略、静态资产与对象存储切换阈值需要实验数据支撑。
- **Phase 6:** 如果 milestone 末期准备公开部署，还需要单独补一次数据许可、attribution 和分发边界核验。

Phases with standard patterns (skip research-phase):
- **Phase 1:** `pnpm workspace + apps/web + apps/server + packages/contracts` 是成熟模式，主要是执行和约束问题。
- **Phase 5:** `NestJS REST + OpenAPI + PostgreSQL + Drizzle` 的 CRUD、DTO 校验和 repository 切换有明确范式。

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | MEDIUM | 默认栈和基础设施选型较稳，但 `PostGIS/Redis/Object Storage` 何时引入仍取决于实测规模。 |
| Features | MEDIUM-HIGH | milestone 范围和 P1/P2/P3 边界较清晰，研究文件之间结论高度一致。 |
| Architecture | HIGH | `server-owned semantics + geometry by reference + repository seam` 模式清楚，且与现有仓库形态匹配。 |
| Pitfalls | MEDIUM | 风险识别充分且来自项目真实历史，但数据许可和坐标转换仍需实施验证。 |

**Overall confidence:** MEDIUM

### Gaps to Address

- **Canonical ID spec for edge cases:** 直辖市、自治区、港澳、海外特殊行政区和 disputed areas 的规则还需在 Phase 2 明文化。
- **China data compliance for public deployment:** 当前研究足以支持默认方向，但若要公开部署或再分发，仍需补生产级许可核验。
- **Coordinate conversion proof:** `GCJ-02` 到渲染坐标的转换链路必须通过样本点和真实边界回归验证，不能只靠理论判断。
- **Geometry delivery threshold:** 静态资产何时升级为 `R2/S3`，需要以包体、首屏和首次高亮延迟的实测数据作为决策依据。

## Sources

### Primary (HIGH confidence)
- `.planning/PROJECT.md` — milestone 目标、约束、现有产品状态
- `.planning/research/STACK.md` — 默认栈、基础设施选型、前后端静态/API 边界
- `.planning/research/FEATURES.md` — table stakes、差异化能力、延后范围
- `.planning/research/ARCHITECTURE.md` — 组件边界、数据流、迁移缝与 build order
- `.planning/research/PITFALLS.md` — phase 风险、坐标/许可/ID/性能警戒线

### Secondary (MEDIUM confidence)
- https://docs.nestjs.com/openapi/introduction — API 契约与文档模式
- https://docs.nestjs.com/techniques/validation — DTO 校验与 fail-closed 策略
- https://pnpm.io/workspaces — monorepo 结构与 workspace 管理
- https://leafletjs.com/reference.html — GeoJSON、pane、popup、渲染能力
- https://www.postgresql.org/docs/current/ — 默认关系型数据库基线
- https://orm.drizzle.team/docs/overview — 轻量 ORM 路径

### Tertiary (Needs validation during planning)
- https://help.aliyun.com/zh/datav/datav-7-0/user-guide/datav-geoatlas-widgets — 中国边界来源范围与使用边界
- https://help.aliyun.com/zh/datav/datav-7-0/user-guide/map-data-format-1 — `GCJ-02` 相关约束
- https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-admin-1-states-provinces/ — 海外 admin1 数据覆盖与属性特征
- https://developers.cloudflare.com/r2/api/s3/api/ — 对象存储备选路径
- https://docs.bullmq.io/guide/introduction — 后台任务备选路径

---
*Research completed: 2026-03-27*
*Ready for roadmap: yes*
