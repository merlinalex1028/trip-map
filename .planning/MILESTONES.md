# Milestones

## v6.0 旅行统计、时间轴与海外覆盖增强版 (Shipped: 2026-04-28)

**Phases completed:** 9 phases, 30 plans, 65 tasks
**Known deferred items at close:** 29 (13 debug sessions, 14 quick tasks, 2 UAT gaps — see STATE.md Deferred Items)

**Key accomplishments:**

- TravelRecord 契约新增 nullable 日期字段，UserTravelRecord 去唯一化并已推送到 Supabase 开发库
- records 与 auth 后端链路已支持多次旅行记录、nullable 日期字段和 bootstrap 日期恢复，前端可直接消费 trip-level 日期契约
- map-points store 已升级为 trip-level 多条记录模型，legacy 迁移统一输出未知日期，并为后续日期 UI 准备好 `tripsByPlaceId` 与日期入参契约
- popup 内联日期表单、多次去访摘要与“再记一次”交互已经接到 map stage/store 契约上，用户在同一地点可追加多条旅行记录
- LeafletMapStage 的“最近一次”摘要已从 `createdAt` 切换为 `endDate ?? startDate` 选取，并有回归测试兜住补录旧旅行的错误排序
- 后端 gap closure 已补齐 DTO 直接契约绑定、批量导入日期区间复用校验，以及 UserTravelRecord 的四元组数据库唯一约束兜底
- Regionalized 21-country overseas support authoring, emitted a v3 geometry dataset with canonical English admin labels, and generated coverage summary constants for downstream consumers
- Manifest-backed overseas backfill now overwrites persisted labels, and a shared 13-country server regression matrix locks Phase 28 resolve/create/import/bootstrap/sync metadata.
- Generated-summary-backed unsupported notice helper with Phase 28 overseas fixtures and persisted-metadata consumer regressions on v3 geometry refs
- Phase 28 geometry shards now keep canonical authoritative `datasetVersion`, while server/contracts regressions and historical fixtures are realigned around that split
- Persisted userTravelRecord metadata is now backfilled authoritatively, with legacy overseas replay locked by bootstrap and same-user sync migration e2e
- sourceFeatureId 驱动的 overseas admin1 唯一 identity、fail-fast canonical lookup 守卫，以及 Washington/DC 与 Buenos Aires 冲突回归面
- Race-safe metadata backfill now survives zero-count row loss, emits skipped-row audit trails, and keeps bootstrap/same-user sync replay pinned to canonical overseas metadata under combo execution
- Hash 路由驱动的独立地图页/时间轴页壳层，以及用户名菜单中的时间轴导航入口。
- Pure timeline entry normalization from raw travel records with earliest-first sorting, unknown-date last ordering, and per-place visit sequencing
- 独立时间轴路由页与逐条旅行卡片 UI，覆盖 restoring、anonymous、empty、populated 四种状态
- 回归测试锁定用户名菜单时间轴入口、独立时间轴页面状态，以及 App 根壳在 `/` 与 `/timeline` 间的切换语义。
- TravelStatsResponse 共享合约、受保护的 GET /records/stats 端点，以及区分总旅行次数与唯一地点数的 Prisma 聚合查询
- Pinia 驱动的统计前端数据层、可复用 Kawaii StatCard 组件，以及基于 `/records/stats` 的五状态 StatisticsPageView
- 将 StatisticsPageView 接入路由，并在账号菜单中提供与时间轴一致的“查看统计”入口
- 旅行统计 contract 现已输出已去过国家/地区数与支持覆盖总数，后端按 parentLabel 国家桶去重聚合并补齐多地点/多次旅行回归测试。
- 统计页现已展示总旅行次数、已去过地点数和已去过国家/地区数三项指标，并补上支持覆盖说明与前端去重场景回归测试。
- Metadata-only authoritative travel-record refreshes now invalidate statistics without changing the statistics page UI.
- 1. [Rule 1 - Bug] Plan-specified replacement text contained literal `human_needed` string
- Phase 27 和 Phase 29 的 VALIDATION.md 已从 draft 状态升级为完整 Nyquist 合规：frontmatter approved、Per-Task Verification Map 全部 ✅ green、Wave 0 与 Sign-Off 全部勾选
- 将 Phase 30 和 Phase 32 的 VALIDATION.md 从 draft 状态升级至与 Phase 28 一致的完整 Nyquist 合规状态，关闭 v6.0 milestone audit 中识别的验证技术债务。
- 将 records.service.spec.ts 中的硬编码 21（totalSupportedCountries）替换为权威常量 TOTAL_SUPPORTED_TRAVEL_COUNTRIES

---

## v5.0 账号体系与云同步基础版 (Shipped: 2026-04-17)

**Phases completed:** 4 phases, 22 plans, 26 tasks

**Key accomplishments:**

- 邮箱密码账号、`sid` 会话恢复和 current-user ownership 真源已经闭环，用户现在可以稳定注册、登录、退出并恢复到同一账号。
- 首次登录本地记录导入、cloud-wins 和 logout / switch-account / unauthorized 会话边界清理已经闭环。
- same-user 多设备同步、foreground refresh、点亮/取消点亮重叠竞态与 success / warning / unauthorized 提示语义已经收口。
- 8 国 overseas admin1 authoritative support catalog、persisted metadata replay 与 unsupported popup feedback 已落地。
- v5.0 milestone audit 已通过，17/17 requirements satisfied，web runtime 旧 `/records` restore helper 也已清理。

---

## v4.0 Kawaii UI 重构 & Tailwind 集成 (Shipped: 2026-04-10)

**Phases completed:** 4 phases, 11 plans, 19 tasks

**Key accomplishments:**

- `apps/web` 已完成 Tailwind v4、Vite 插件顺序、单一 CSS 入口与 Nunito Variable 字体基线的正式落地。
- App shell、MapContextPopup 与 PointSummaryCard 已完成 Kawaii/Tailwind 主路径样式迁移，并把 hover / active / spacing 合同锁进可执行 spec。
- Phase 19 与 Phase 20 都已补齐 formal verification，旧的 verification-source 缺口不再阻塞里程碑审计。
- v4.0 的 canonical milestone audit 已原位翻转为 `passed`，12/12 requirements、2/2 verification-bearing phases 全部通过。
- roadmap、requirements、project state 已与 v4.0 收口状态同步，当前仓库已准备进入下一个 milestone 规划。

---

## v3.0 全栈化与行政区地图重构 (Shipped: 2026-04-03)

**Phases completed:** 8 phases, 39 plans, 45 tasks

**Key accomplishments:**

- pnpm workspace + turbo 根编排层配合 @trip-map/contracts 薄契约包，锁定了 Phase 11 后续共享的 canonical place 与 smoke record 字段真源。
- 独立的 `@trip-map/web` workspace 壳层配合显式 `legacy-entry` 过渡桥，让 web 启动、构建和类型检查入口正式收口到 `apps/web`。
- NestJS server scaffold with Fastify adapter, shared-contract health response, and validated `/records/smoke` boundary before persistence
- apps/web 现在通过统一 API adapter 和 dev proxy 暴露 backend baseline panel，可直接读取 server health 并触发 shared-contract smoke record 写链路
- apps/web 现在直接持有 Vue app shell、地图主舞台和 popup/drawer 顶层交互组件，并通过显式 bridge 继续接住 legacy supporting runtime
- apps/server 现已通过 Prisma 接入真实的 Supabase-hosted PostgreSQL，并完成了 records smoke 路由的数据库落库验证。
- apps/web 现已拥有 package-local 的 browser services、seed/preview 数据、GeoJSON 资产与 web-only 类型定义，并保持后续 rewiring 独立推进
- apps/web 现已拥有 package-local 的 non-UI regression suite 与 composable mount helper，且定向 Vitest 命令会只执行请求的 package-local specs
- apps/web 现已拥有 package-local 的 Pinia store 与 popup anchoring composable，且主 app shell / 顶层交互组件已改为直接消费这些本地 runtime 模块
- apps/web 现已直接挂载 package-local App.vue，并在包内拥有 UI regression、global styles 与 world-map 资源，不再通过 legacy-entry 维持主启动链路
- Canonical place taxonomy、resolve discriminated union 与 Phase 12 fixtures 已在 `@trip-map/contracts` 固定下来，明确区分中国正式行政类型与海外一级行政区语义。
- Nest authoritative canonical resolve/confirm endpoints with fixture-backed candidate ranking and e2e-locked resolved, ambiguous, and failed semantics
- apps/web 现在以 server canonical resolve/confirm 为点击真源，并把 placeId、boundaryId、placeKind、datasetVersion 与原始点击坐标贯穿到 store 和 v2 本地快照
- Canonical popup/drawer regressions now lock Beijing, Hong Kong, and California to the same title, type label, subtitle, and recommended-candidate semantics
- Canonical boundaryId 现在会先解析到当前 web 可渲染 geometry，并且 Beijing 的 reopened highlight 与 California 的 unsupported 提示都被组件回归锁定
- One-liner:
- DataV CN (GCJ-02) and Natural Earth admin-1 5.1.1 (WGS84) vendored as verified source snapshots with a geometry-source-catalog.json checksum registry, plus three geo build scripts (normalize-datav-cn, normalize-natural-earth, build-geometry-manifest) forming a complete --dry-run-capable pipeline.
- One-liner:
- 1. [Rule 3 - Blocking] contracts package dist not built
- Leaflet 1.9 installed with three composables isolating all map API: useLeafletMap (L.map lifecycle + Bing/CartoDB tile), useGeoJsonLayers (CN + OVERSEAS independent GeoJSON layers with three-state styling), useLeafletPopupAnchor (@floating-ui VirtualElement bridge via latLngToContainerPoint)
- LeafletMapStage.vue built as full Leaflet map component replacing WorldMapStage, wiring all three Plan 01 composables with complete click->resolve->popup->drawer->highlight main flow and dual-path GeoJSON shard loading
- Rewrote map-points store to use server API, removed Drawer component, eliminated localStorage/seed-based storage — with optimistic illuminate/unilluminate driving immediate map highlight sync via useGeoJsonLayers.
- Illuminate/un-illuminate button added to popup title row with teal state color, wired through MapContextPopup → LeafletMapStage → map-points store actions, with 9 TDD unit tests covering all states.
- PostgreSQL reachability, Prisma migration status, and records e2e gate recorded as ready for Phase 16 server work
- SmokeRecord and TravelRecord now persist canonical metadata end-to-end with a safe additive Prisma migration, authoritative placeId backfill, and DB-verified reopen round-trip coverage
- Saved canonical popup labels now survive reopen, fallback points show an explicit unsupported illuminate affordance, and successful illuminate actions eagerly load the matching GeoJSON shard
- California 现在通过 server-owned bbox authoritative 命中，shared fixtures 与 Phase 12 UAT 文案同步到同一组 canonical IDs、datasetVersion 和 admin1 标签。
- Phase 17 was decomposed into a staged closure workflow: parallel human UAT first, then Phase 16 verification backfill, then Phase 15 formal verification and requirement/audit sync.
- Phase 15 finally received a formal verification report, and API-01/API-02 were promoted from partial to satisfied across requirements and milestone audit.
- Phase 16’s formal verification report was upgraded from `human_needed` to `passed`, with all three human-gated requirements moved to satisfied.
- Phase 14’s three pending Leaflet human Nyquist checks were recorded as passed and folded back into the formal verification report.
- Phase 16’s three human-verify checks were all recorded as passed, turning `16-HUMAN-UAT.md` into a consumable closure source for formal verification.
- /health endpoint now performs real database connectivity check via Prisma $queryRaw, replacing the hardcoded `database: 'down'` with actual probe results.
- Phase 14 VALIDATION.md upgraded from draft to approved with nyquist_compliant: true, replacing all TBD entries with concrete Leaflet task references
- Upgraded 15-VALIDATION.md from draft to approved with nyquist_compliant: true, correcting Wave 0 file references to match actual Phase 15 test artifacts.
- Decision: Optimize now (not defer)

---

## v2.0 城市主视角与可爱风格重构 (Shipped: 2026-03-27)

**Phases completed:** 4 phases, 17 plans, 31 tasks

**Key accomplishments:**

- 城市选择链路已从国家/地区兜底模式升级为稳定 `cityId` 驱动的城市优先确认、搜索与复用流。
- 离线城市目录与候选排序能力已扩展到真实可用覆盖面，不再局限于最初的演示城市集合。
- 地图主表达已从单点 marker 升级为真实城市边界高亮，并通过 `boundaryId` 持久化保持 reopen / switch / fallback 语义稳定。
- `PointSummaryCard + MapContextPopup + PointPreviewDrawer` 形成了稳定的 summary/deep surface 分工，popup 成为桌面主舞台中的主入口。
- popup 长内容滚动问题已经收口到摘要卡中部内容区，头部身份信息和底部动作保持稳定可达。
- 地图舞台、marker、popup 和 deep drawer 已完成统一的原创可爱风视觉收口，同时保留四态辨识、命中安全和 reduced-motion 护栏。
- `POP-03` 已通过正式 desktop-only 范围对齐闭环，v2.0 里程碑审计最终收敛为 `passed`。

---

## v1.0 MVP (Shipped: 2026-03-24)

**Phases completed:** 6 phases, 17 plans, 20 tasks

**Key accomplishments:**

- Poster 风格的 Vue 应用骨架、全局设计 token 与可运行测试基线已经落地。
- 海报式世界地图舞台、预置示例点位与本地预览点位加载链路已经接入首页。
- 点击点位即可打开响应式地点预览抽屉，Phase 1 的地图预览交互已经闭环。
- 地图点位层级与预览抽屉现在具备稳定的键盘语义、关闭行为和长文本承载能力
- 国家级识别主链路现在可带保守城市增强信息，并在旧快照、错误版本和城市未命中时保持可解释且可恢复
- 城市增强命中区已从几乎不可点中调整为符合整张世界地图手动点击尺度，并补上对应回归保护
- Pinia 点位状态机现在会在重选 seed/saved 点位时同步清空旧 draft，并由交互回归锁住“草稿新建 -> 重选已有点位 -> 关闭抽屉”的完整闭环
- Phase 1-2 现在拥有可被里程碑审计直接消费的 validation、verification 与 requirement traceability 证据链
- Phase 3-4 的 CRUD、持久化、可访问性、城市增强与恢复路径，现在都具备可审计的 verification / validation / traceability 证据
- v1 requirements 的 traceability 已回到真实 phase ownership，里程碑审计也从 `gaps_found` 收口为 `passed`

---
