# Milestones

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
