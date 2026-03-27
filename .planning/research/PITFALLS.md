# Pitfalls Research

**Domain:** 已有前端优先旅行地图应用的 v3.0 增量改造（monorepo 全栈化、TypeScript backend、Leaflet、国内市级 / 海外 admin1 语义）
**Researched:** 2026-03-27
**Confidence:** MEDIUM

## Recommended Risk-Reduction Phases

这些 phase 名称不是现成 roadmap，而是给后续 roadmap 拆 phase 时的建议归属桶。

| Phase | Focus | Why this phase should absorb risk |
|-------|-------|-----------------------------------|
| Phase 1 | Monorepo 骨架、前后端职责边界、渐进迁移策略 | 先决定什么迁到 API、什么继续留前端，否则后面会出现双写双算和反复回滚 |
| Phase 2 | Canonical place model、ID 策略、旧数据迁移 | 中国市级和海外 admin1 不是同一层级，必须先把实体模型和历史数据契约定稳 |
| Phase 3 | 数据合规、许可证、地理数据 ingestion pipeline | GeoAtlas、Natural Earth、底图与导出数据的许可边界不同，必须单独固化流程 |
| Phase 4 | Leaflet 渲染骨架、坐标系适配、几何性能 | 引擎切换和几何体量会直接影响点击、边界高亮和主线程性能 |
| Phase 5 | API 契约硬化、验证、版本化与缓存 | 前端开始依赖 API 后，如果没有 DTO 校验、版本化和回退方案，旧存档和旧前端会静默坏掉 |
| Phase 6 | UX 一致性、灰度发布与回归验收 | 需要保证 popup / drawer / 高亮 / 点亮动作在新旧链路下保持一致，不让升级把已有体验打散 |

## Project-Specific Signals Already Visible

- 当前项目历史上已经出现过“点击位置与真实地图地理框不一致”的投影/框架漂移问题，见 `.planning/debug/02-projection-frame-mismatch.md`。
- 当前项目历史上也出现过“测试全绿但真实城市没有边界高亮”的边界覆盖盲区，见 `.planning/debug/08-boundary-highlight-missing.md`。
- 这意味着 v3.0 的风险不是抽象的“可能会有地图 bug”，而是已有仓库已经证明：投影、边界 coverage、测试口径三者一旦脱节，就会在真实交互里出问题。

## Critical Pitfalls

### Pitfall 1: 后端引入后前后端仍在“双写双算”，没有单一语义真源

**What goes wrong:**
前端继续自己做地点识别、边界命中、点亮计算，后端又新增一套 API 结果；结果就是“看到的行政区”“保存下来的行政区”“重开后点亮的行政区”来自不同计算路径。用户最先感知到的是：同一次点击，popup 标题、保存记录和高亮边界对不上。

**Why it happens:**
已有应用是前端优先架构，最容易采取的增量方式是“先把部分数据搬到 server，再保留前端旧逻辑兜底”。这在短期看起来安全，但如果不明确哪些判断以后只能由 server 给出、哪些仍由 web 本地完成，就会形成 shadow source of truth。

**How to avoid:**
- 在 Phase 1 明确 `who decides what`：
  - `server` 负责 canonical place resolution、ID 归一、版本元数据、合规数据分发。
  - `web` 负责交互临时态、视口状态、局部 optimistic UI。
- 统一一个 `ResolvedPlace` / `CanonicalPlace` 契约，至少包含 `placeId`、`placeKind`、`sourceDataset`、`datasetVersion`、`confidence`、`displayName`、`highlightGeometryRef`。
- 任何“保存”“重开”“点亮”“详情标题”都必须消费同一份 canonical 结果，而不是各自重算。
- 在迁移期允许双读，但不要长期双算；双读只作为比对与回滚，不作为常态业务逻辑。

**Warning signs:**
- 同一点位在首创、刷新、重开后显示不同名字或不同边界。
- API 返回的 `placeId` 没被前端持久化，前端刷新后又重新按坐标本地猜一次。
- 测试里同时存在“前端 geo-lookup 结果”和“API resolve 结果”，但没有一致性断言。

**Phase to address:**
Phase 1

---

### Pitfall 2: 用“大爆炸切换”把本地状态一次性改成 API 驱动

**What goes wrong:**
现有 `localStorage + 静态数据 + 前端 store` 的稳定链路被一次性替换成 `API + DB + 新 store`，短期内看似架构更“正规”，但一旦 server 解析、缓存、超时、数据迁移任一环出问题，整个产品主链路都会一起坏掉，且很难定位是前端 bug、API bug 还是数据 bug。

**Why it happens:**
团队往往低估了“已有前端产品”改成“全栈产品”的 cutover 风险，尤其是当新增 backend 被视为“只是把原逻辑挪过去”。实际上，职责迁移本身就是一次架构迁移，需要 parallel change / strangler 式过渡，而不是一次性翻板。

**How to avoid:**
- 采用渐进式迁移：
  - 先保留现有本地读取链路。
  - 新增 API 只接管明确的一段职责，例如 canonical place resolution 或 server 持久化。
  - 对关键链路加 diff logging，比对旧结果和新结果是否一致。
- 所有迁移步骤都要能 feature flag 开关和回滚。
- 先做读路径，再做写路径；先做 shadow compare，再切主链路。
- 旧存档迁移必须可重试、可幂等，不能靠“一次性脚本跑过就算完”。

**Warning signs:**
- 需求或实现文档里出现“切到后端后前端旧逻辑全部删除”。
- 首个 phase 就要求 server 同时接管 resolve、保存、查询、几何分发和状态聚合。
- 没有灰度开关，只有“切换环境变量”这种粗暴切换。

**Phase to address:**
Phase 1

---

### Pitfall 3: 把中国市级和海外 admin1 当成同一种“城市”实体

**What goes wrong:**
中国境内按市级记录，海外按一级行政区记录，但产品和数据模型仍然用单一 `city` 概念表达。结果会出现严重语义错乱：国内“杭州”与海外“California”被放在同一个字段里；排序、搜索、摘要、点亮文案和统计都开始混淆“城市”和“州/省”。

**Why it happens:**
前端现有语义是 city-first，团队很容易为了复用 UI 和 store，把新增海外 `admin1` 也硬塞进 `city` 字段或 `cityId` 命名体系里。短期省事，长期会污染所有下游接口与文案。

**How to avoid:**
- 在 Phase 2 改成显式层级模型，不再把所有实体叫 `city`：
  - `placeKind: cn_city | overseas_admin1 | fallback_country`
  - `displayLevel: city | admin1 | country`
- 文案、统计、筛选、详情摘要都读 `placeKind`，不要默认“名字 + 国家 = 城市”。
- API 和数据库字段命名用 `placeId` / `placeKind` / `adminLevel`，不要继续扩展 `cityId`。
- UX 上明确显示层级，例如“中国: 市”“海外: 州/省/一级行政区”。

**Warning signs:**
- 设计稿、API DTO、数据库列仍在新增 `cityId`、`cityName`。
- 同一个列表里直接展示“Tokyo / California / Bavaria”，但没有层级标签。
- 海外 admin1 被错误复用成“城市搜索”或“到访城市数”统计。

**Phase to address:**
Phase 2

---

### Pitfall 4: 没有稳定 canonical ID，只靠名称或临时外部编码做主键

**What goes wrong:**
中国侧一个地方可能有中文名、拼音名、别名、区划调整名；海外 admin1 也存在名称变体、简写、语言差异、Natural Earth 编码不完整或后续更新变化。如果系统用 `name`、`name_en` 或某个临时拼接字符串做主键，历史点亮、收藏、重开、迁移会不断漂移。

**Why it happens:**
显示名最容易拿到，也最方便调试，所以增量改造时最容易偷懒把它当 key。另一种常见误区是直接把不同数据源的外部 ID 当成业务主键，但没有保留 `datasetVersion` 和自有 canonical ID。

**How to avoid:**
- 在 Phase 2 设计自有 canonical ID 策略：
  - 中国侧保留官方/供应商区划编码作为 source ID，同时生成自有稳定 `placeId`。
  - 海外侧也生成自有稳定 `placeId`，不要把显示名当 key。
- 每条旅行记录至少持久化：
  - `placeId`
  - `placeKind`
  - `sourceDataset`
  - `sourceFeatureId`
  - `datasetVersion`
  - 原始点击坐标 `lat/lng`
- 当数据版本更新导致映射变化时，优先保留旧 `placeId` 和旧显示结果，必要时通过后台 migration table 显式迁移，而不是静默重算。

**Warning signs:**
- 保存记录里只有 `name`、`countryCode`、`lat/lng`，没有 `datasetVersion`。
- 新旧数据导入后，同一地点刷新一次就显示成另一个行政区。
- 开发阶段用 `${country}-${name}` 或 `${province}-${city}` 直接拼 key。

**Phase to address:**
Phase 2

---

### Pitfall 5: 忽略 GeoAtlas / 高德 `GCJ-02` 与 Leaflet / GeoJSON 体系的坐标差异

**What goes wrong:**
如果把中国侧 DataV.GeoAtlas / 高德系数据直接当作普通 WGS84 GeoJSON 喂给 Leaflet，视觉上会出现边界偏移、点击命中错位、点亮边界与底图不重合。用户看到的是“点在杭州，高亮跑到旁边”“国内边界明显歪，但海外正常”。

**Why it happens:**
Leaflet 默认围绕 Web Mercator / GeoJSON 常规经纬度工作，而 DataV 体系明确存在 `GCJ-02` 约束。已有项目过去就出现过点击框架与可视地图不一致的问题；这次如果再把坐标系转换和几何预处理放到上线后补救，风险会更高。

**How to avoid:**
- 在 Phase 4 单独建立“坐标基准适配层”，不要把坐标转换散落在组件里。
- 明确区分：
  - 原始 source CRS / offset system
  - 渲染 CRS
  - 命中检测坐标
  - 持久化坐标
- 中国数据入库前统一做一次可追踪的转换或适配，并保留转换来源元数据。
- 建立中外样本点回归集：至少覆盖北京、上海、杭州、香港，以及海外若干 admin1，验证边界、点击、popup 锚点、点亮结果一致。

**Warning signs:**
- 中国区域边界偏移，而海外 admin1 基本正常。
- 同一个点在 server resolve 正确，但 Leaflet 高亮几何不在同位置。
- 坐标转换逻辑散落在前端组件、API controller、脚本各处。

**Phase to address:**
Phase 4

---

### Pitfall 6: 误把 GeoAtlas、Natural Earth、底图和导出 GeoJSON 视为同一许可等级

**What goes wrong:**
项目在数据使用、导出、再分发、截图、部署时混用不同许可等级的数据，却没有记录来源、适用范围和再发布边界。最典型的错误是把 DataV.GeoAtlas 当成和 Natural Earth 一样“可自由再分发”的公共数据，或认为“拿来做个人产品原型”就天然等于“后续可直接线上公开使用”。

**Why it happens:**
地图产品的“能下载到 GeoJSON”很容易让人误判为“能随便商用/再分发”。但官方资料显示：
- DataV.GeoAtlas 只提供中国区域数据，且页面明确写了“仅供学习交流，不保证数据真实性和完整性，版权归相关地图服务商所有”。
- Natural Earth 则是公共领域数据，但其 admin1 数据仍有准确性、更新滞后与 worldview 取舍问题。
如果这些边界不被单独治理，后面一旦要上线、换存储、做导出或对外开放接口，就会踩法律和合规坑。

**How to avoid:**
- 在 Phase 3 建立数据 provenance 清单：
  - 来源 URL
  - 许可说明
  - 允许用途
  - 是否允许再分发
  - 是否需要 attribution
  - 适用地域
- 不要把原始供应商数据直接暴露成公开下载接口。
- 明确区分“内部处理后的业务结果”与“原始边界数据文件”。
- 如果准备公开部署或未来商用，单独做一次法务/合规核验；不要把“研究阶段可用”直接推断成“生产可用”。
- Leaflet 底图、瓦片、attribution 也纳入同一张清单，不要只记边界数据。

**Warning signs:**
- 项目里没有一份可追踪的数据来源与许可台账。
- 代码直接把第三方原始 GeoJSON 文件作为静态公共资源暴露。
- 团队口头上说“这个数据网上都能下，应该没问题”，但没有对应官方说明留档。

**Phase to address:**
Phase 3

---

### Pitfall 7: 忽略 Natural Earth `admin1` 的 worldview、精度和更新滞后限制

**What goes wrong:**
海外 admin1 使用 Natural Earth 后，团队默认它就是“随时准确且和中国侧语义完全兼容”的真值。结果会在边界争议地区、名称更新、统计码缺失、细粒度行政区缺口上出问题，最终表现为“某些国家层级不一致”“个别地区名字和用户认知不同”“更新后历史点亮漂移”。

**Why it happens:**
Natural Earth 的优势是开放、覆盖广、上手快，但官方自己也承认 admin1 数据存在更新和同步问题，且其 worldview 默认是 `de facto`。如果产品不提前定义“哪些国家/地区以何种视角呈现”“哪些区域暂不做精确承诺”，就会把数据源的不确定性直接暴露给用户。

**How to avoid:**
- 在 Phase 3 建立 explicit coverage policy：
  - 哪些国家/地区支持 admin1 精确点亮
  - 哪些区域只做 fallback
  - 哪些争议区域采用什么呈现口径
- 不要把 Natural Earth 的外部编码和命名直接视作业务真相。
- 对高风险区域加白名单验收，而不是默认“全球都一样可用”。
- 在 UI 上对低置信或特殊口径区域做显式提示，而不是静默错误展示。

**Warning signs:**
- PRD 或 roadmap 里写了“海外全部一级行政区统一准确支持”，但没有 coverage white list。
- 某些国家 admin1 边界明显简化或与用户预期不符，却没有 fallback 机制。
- 团队讨论 disputed areas 时只说“先按数据源默认来”，没有产品口径记录。

**Phase to address:**
Phase 3

---

### Pitfall 8: 通过 API 或前端响应式状态传输完整 GeoJSON，导致 Leaflet 首版性能失控

**What goes wrong:**
后端直接返回整块 GeoJSON，前端把复杂 multipolygon 放进响应式 store 或组件 props；Leaflet 首版虽然“能显示”，但一旦边界稍多、切换稍快、缩放稍频繁，主线程就开始卡，popup 跟手性和点击命中一起下降。

**Why it happens:**
从前端优先应用迁到全栈后，最自然的实现是“API 把需要的 geometry 都发给前端”。这在小样本时能跑通，但对地图产品来说，几何体积和路径复杂度远比普通列表页敏感。Leaflet 默认矢量渲染为 SVG，也更容易在大量复杂路径时吃掉主线程。

**How to avoid:**
- 在 Phase 4 先做几何资产策略，再接 UI：
  - 服务端只返回 `geometryRef` / shard key / bbox / style state，默认不返回完整 geometry。
  - 几何做离线简化、切片、分国家/区域分包。
  - store 只存 ID、状态、加载态，不存整块 geometry。
- 评估 SVG 与 Canvas 渲染策略，按场景选择，不要默认一种跑到底。
- 为 “首次加载”“切换高亮”“重开记录”“批量已点亮区域” 建性能基线。

**Warning signs:**
- 单个 API 响应里塞入数 MB 级 GeoJSON。
- Pinia/Vue store 里直接存 `FeatureCollection` 或大量坐标数组。
- 桌面还能用，移动端一开边界高亮就明显掉帧或延迟数百毫秒以上。

**Phase to address:**
Phase 4

---

### Pitfall 9: API 契约未版本化、未校验、未做兼容，旧前端与旧存档会静默坏掉

**What goes wrong:**
后端不断演进 DTO 和响应字段，前端也不断跟着改，但系统没有明确 API versioning、schema validation、兼容期和错误降级策略。结果是：本地旧存档还能打开，但点亮按钮报错；旧前端还能连上新 API，但收到不完整字段后直接渲染错误状态。

**Why it happens:**
项目从单体前端进入全栈后，接口会自然被团队当成“内部代码细节”，而不是长期契约。可一旦 web 和 server 分仓或独立部署，接口兼容性就变成真实问题。

**How to avoid:**
- 在 Phase 5 引入 API versioning 和 DTO validation。
- 对关键响应使用 schema contract tests，覆盖：
  - resolve place
  - save / reopen visit
  - highlight geometry ref
  - migration response
- 前端对未知 `placeKind`、未知 `datasetVersion`、缺失 `geometryRef` 要 fail-closed，而不是渲染半截状态。
- 所有历史记录迁移结果都要可观测：成功数、失败数、需人工回退数。

**Warning signs:**
- controller 直接返回 ORM entity 或临时对象字面量。
- API 改字段名时没有版本号、没有兼容窗口、没有 e2e 契约测试。
- 旧存档回放主要靠人工点点看，没有自动化回归样本。

**Phase to address:**
Phase 5

---

### Pitfall 10: Leaflet 迁移只追求“能显示地图”，却打散了既有 UX 一致性

**What goes wrong:**
地图引擎切到 Leaflet 后，虽然地图、边界、popup 都能渲染，但 v2 已经稳定的 anchored popup、deep drawer、点亮动作、状态可辨识和关闭语义被重新打散。用户感受到的是“看起来升级了，实际更难用”：点击反馈更慢，popup 与 drawer 不再接力，边界高亮与动作按钮时机不一致。

**Why it happens:**
引擎迁移往往把团队注意力吸到渲染本身，忽略了旧产品已经形成的交互契约。Leaflet 还有自己的一套 pane、popup、event bubbling、attribution 规则，如果只是“把旧组件套到新地图上”，很容易出现 overlay 层级、事件冒泡和 legal UI 被破坏。

**How to avoid:**
- 在 Phase 6 做“交互语义对齐”，而不是只做视觉对齐：
  - popup 何时出现、何时关闭、何时转 drawer
  - 点亮 / 取消点亮按钮在何处是单一真入口
  - 选中态、已点亮态、低置信 fallback 态的视觉与文案统一
- 单独验证 Leaflet pane / popup / marker / polygon 事件协调。
- 不要去掉 attribution control 或把其遮住。
- 把“升级前后的同一用户任务”做并排回归：点击 -> 选择 -> 点亮 -> 重开 -> 取消点亮。

**Warning signs:**
- popup 和 drawer 同时可见，或相互覆盖。
- 点击 polygon 触发了两次选择，或空白地图点击把已有 popup 意外关掉。
- 旧版有的低置信度提示、已记录态提示，在新版里消失了。

**Phase to address:**
Phase 6

## Technical Debt Patterns

短期看似省事，但会在 v3.0 后半程形成高额返工成本。

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| 继续沿用 `cityId` / `cityName` 命名承载所有行政区实体 | 复用现有前端代码快 | 把海外 admin1 也永久污染成“城市”，后续 API、文案、统计都难纠正 | 仅限 Phase 0 草图，进入实现后不可接受 |
| 直接把第三方原始 GeoJSON 当静态资源暴露给 web | 接入最快 | 许可风险、包体膨胀、无法做版本治理与最小分发 | 研究性本地实验可接受，正式 roadmap 不可接受 |
| 让 API 返回完整 geometry 以减少前端拼装逻辑 | 首版容易跑通 | 网络负担、前端卡顿、缓存和版本难控制 | 仅限极小样本 spike，不可进入主分支长期保留 |
| 用显示名或 `${country}-${name}` 拼接 key | 调试方便 | 一旦更名/别名/多语言切换，历史点亮和迁移都漂移 | 永远不应该接受 |
| 一次性停掉前端旧链路，强制全量切后端 | 架构表面更“干净” | 出问题时没有回退面，排障成本极高 | 永远不应该接受 |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| 阿里云 DataV.GeoAtlas | 把下载到的中国边界数据视为通用公共 GeoJSON，忽视来源、用途和坐标体系 | 建 provenance 台账，确认适用范围、许可边界、坐标体系，并在 ingestion 阶段做可追踪转换/适配 |
| Natural Earth admin1 | 直接把名称或外部编码当业务主键，并默认全球都同等可靠 | 生成自有 canonical `placeId`，保留 `datasetVersion`，对特殊区域设 coverage policy |
| Leaflet | 只迁移“显示层”，忽略 pane、popup、polygon 事件与 attribution | 先定义交互语义和图层规则，再接渲染；回归覆盖 popup、polygon、空白区三类点击 |
| NestJS / TypeScript API | controller 直接返回临时对象或 ORM entity，缺少 DTO 和版本 | 用 DTO、validation、versioning、contract tests 固化接口边界 |
| 旧本地存档 | 只做一次性迁移脚本，不保留回退和重试 | 采用可幂等迁移、迁移日志、失败样本回放和 feature flag 切换 |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| 完整 GeoJSON 经 API 下发到前端 | 首次打开地图慢，切换高亮卡，移动端掉帧 | 返回 `geometryRef`，几何离线简化/分片，前端按需加载 | 一旦开始支持多块复杂 multipolygon 或批量已点亮区域就会明显变差 |
| 把 geometry 放进响应式 store | 每次状态变化都触发不必要 diff / render | store 只存 ID、样式态、加载态，geometry 放非响应式缓存 | 当一个页面同时存在多个高亮区或频繁 hover/selection 时 |
| 统一用 SVG 渲染所有复杂边界 | 路径节点过多导致主线程忙 | 评估 `preferCanvas`、按层分渲染策略、限制同屏复杂路径数量 | 当行政区简化不足或同屏数上来时 |
| 每次点击都重新 resolve + 重新取 geometry | 点击反馈延迟，popup 晚出现 | 对 place resolution、geometry manifest、已解析记录做分层缓存 | 当网络不是本机、或 server 加入数据库访问后 |
| 没有性能预算，只凭“本机能跑”判断 | 开发机顺滑，真实设备卡 | 设首屏、首次点亮、重开记录的预算和回归阈值 | 一到真实手机或线上环境就暴露 |

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| 信任前端直接提交的 `placeId` / `placeKind` / `geometryRef` | 用户可伪造行政区归属，导致脏数据或越权引用 | server 端根据允许的 source dataset 与 canonical 表校验，不信任客户端传来的派生字段 |
| 记录和日志里直接保留高精度原始点击坐标且无限期存储 | 旅行轨迹具有敏感性，泄露后可推断用户行程 | 只存业务所需精度，限制日志保留，区分审计日志与业务数据 |
| 公开暴露原始第三方边界文件下载接口 | 许可风险与资源滥用风险 | 对外只提供业务结果或受控几何引用，不开放原始源文件目录 |
| 允许任意 GeoJSON 直通解析/渲染链路 | 可能造成资源消耗异常或解析漏洞面扩大 | ingestion 只接收受控来源和离线预处理产物，不允许用户任意上传进入主链路 |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| 国内记录展示为城市，海外记录展示为州/省，但界面都叫“城市” | 用户误解自己到底点亮了什么层级 | UI 显式标注 `市` / `州` / `省` / `一级行政区`，并让筛选和详情跟随 `placeKind` |
| API 介入后点击反馈变成“转圈等待”，没有本地即时态 | 地图主舞台失去直接性，用户怀疑点没点上 | 保留本地即时选中态和 skeleton，再异步确认 canonical place |
| popup、drawer、边界高亮各自定义选中态 | 用户看到多个“当前对象” | 统一一个 selection source，表现层只读取，不各自维护实体 |
| 低置信或 fallback 路径被藏起来 | 用户以为系统识别精确，实际保存了降级结果 | 显式展示 `fallback` / `approximate` 状态，并给用户确认权 |
| Leaflet 迁移后把 attribution 挤到不可见 | 合规问题，同时用户也无法判断数据来源 | 把 attribution 作为正式 UI 一部分设计，而不是最后塞角落 |

## "Looks Done But Isn't" Checklist

- [ ] **Canonical place model:** 不只验证“能保存”，还要验证每条记录都带 `placeId`、`placeKind`、`sourceDataset`、`datasetVersion`。
- [ ] **旧数据迁移:** 不只验证新建记录，还要验证旧 `localStorage`、旧 seed 数据、旧 reopened 流程不会静默漂移。
- [ ] **China / overseas 双轨语义:** 不只验证名称显示，还要验证文案、筛选、统计、点亮动作都按 `placeKind` 工作。
- [ ] **坐标适配:** 不只验证“地图显示出来”，还要验证中国边界、点击命中和 popup 锚点在真实设备上对齐。
- [ ] **许可证与 attribution:** 不只验证功能通了，还要验证来源台账、页面 attribution、原始文件暴露策略已落地。
- [ ] **API 契约:** 不只验证最新 web + 最新 server，还要验证旧客户端/旧存档遇到新响应时的 fail-closed 行为。
- [ ] **性能:** 不只验证单个行政区高亮，还要验证批量已点亮区域、重开记录、缩放切换下的帧率和响应时间。
- [ ] **UX parity:** 不只验证 Leaflet 地图本身，还要验证 anchored popup、deep drawer、点亮/取消点亮动作与 v2 一致。

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| 前后端双写双算导致结果不一致 | HIGH | 暂时收缩为单一真源；保留另一侧仅做观测；对历史错误记录用 migration table 修复 |
| 坐标系适配错误导致中国边界整体偏移 | HIGH | 回滚到上一版 geometry pipeline；冻结新数据导入；用样本点集重新验证转换链路后再放开 |
| 名称当主键导致历史点亮漂移 | HIGH | 新增 canonical ID 对照表；保留旧显示名作为 alias；分批迁移历史记录并记录无法自动修复样本 |
| 许可/来源管理缺失 | HIGH | 立即停止对外暴露原始数据；补齐 provenance 台账；必要时替换或下线相关数据分发 |
| API 改动导致旧前端/旧存档静默失败 | MEDIUM-HIGH | 回滚 API 版本或加兼容层；补 schema contract tests；前端对未知字段改为 fail-closed |
| Leaflet 首版性能不达标 | MEDIUM | 先缩小同屏 geometry 数、关闭非关键高亮，再补简化、切片、缓存和渲染策略优化 |
| UX 一致性被打散 | MEDIUM | 以“同一用户任务流”做回归；恢复单一 selection source；把 popup/drawer 入口重新收口 |

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| 后端引入后前后端双写双算 | Phase 1 | 同一次点击从 resolve 到保存到重开都使用同一 `placeId`，且前后端 diff 日志可归零 |
| 大爆炸切换本地状态到 API | Phase 1 | 存在 feature flag、双读比对、可回滚发布方案，并有灰度验证记录 |
| 把中国市级和海外 admin1 当同一种城市 | Phase 2 | DTO、DB、UI 中均出现 `placeKind` / `adminLevel`，不再扩展 `cityId` 语义 |
| 没有稳定 canonical ID | Phase 2 | 历史记录持久化包含 `placeId + datasetVersion`，数据更新后样本回放不漂移 |
| 忽略 GCJ-02 与 Leaflet 差异 | Phase 4 | 中国样本点点击、高亮、popup 锚点三项对齐测试通过 |
| 误判数据许可等级 | Phase 3 | 存在数据来源/许可台账，部署产物不直接暴露原始第三方边界文件 |
| 忽略 Natural Earth worldview / 精度限制 | Phase 3 | 明确 coverage white list、特殊区域口径、fallback 策略，并有对应验收样本 |
| 完整 GeoJSON 经 API / store 传输 | Phase 4 | API 默认返回 `geometryRef`，性能基线在目标设备上达标 |
| API 未版本化未校验 | Phase 5 | DTO validation、versioning、contract tests 和旧存档回放样本全部通过 |
| Leaflet 迁移打散 UX 一致性 | Phase 6 | 关键任务流回归通过：点击 -> 选择 -> 点亮 -> 重开 -> 取消点亮 |

## Sources

### Project context

- `.planning/PROJECT.md`
- `.planning/debug/02-projection-frame-mismatch.md`
- `.planning/debug/08-boundary-highlight-missing.md`

### Official / primary references

- Aliyun DataV GeoAtlas widgets: https://help.aliyun.com/zh/datav/datav-7-0/user-guide/datav-geoatlas-widgets/
  - 用于确认 GeoAtlas 只覆盖中国区域，且页面明确写有“仅供学习交流”等使用边界。
- Aliyun DataV 地图数据格式说明: https://help.aliyun.com/zh/datav/datav-7-0/user-guide/map-data-format-1
  - 用于确认 DataV / 高德系数据存在 `GCJ-02` 坐标体系约束。
- Leaflet reference: https://leafletjs.com/reference
  - 用于确认 Leaflet 的 CRS、GeoJSON、pane、popup、attribution、`preferCanvas` 等行为。
- RFC 7946 GeoJSON: https://www.rfc-editor.org/rfc/rfc7946
  - 用于确认 GeoJSON 经度/纬度语义与坐标表达约束。
- Natural Earth Admin 1 – States, Provinces: https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-admin-1-states-provinces/
  - 用于确认 admin1 数据定位、更新现状和属性特征。
- Natural Earth Terms of Use: https://www.naturalearthdata.com/about/terms-of-use/
  - 用于确认 Natural Earth 为 public domain，但不代表所有地图数据源都同许可。
- NestJS validation: https://docs.nestjs.com/techniques/validation
- NestJS versioning: https://docs.nestjs.com/techniques/versioning
- Microsoft Azure Architecture – Backends for Frontends: https://learn.microsoft.com/en-us/azure/architecture/patterns/backends-for-frontends
- Martin Fowler – Strangler Fig Application: https://martinfowler.com/bliki/StranglerFigApplication.html

### Confidence notes

- **HIGH confidence:** 数据许可边界、GeoAtlas 中国范围、`GCJ-02` 约束、Leaflet 图层/渲染行为、Natural Earth public domain 与 admin1 定位。
- **MEDIUM confidence:** “应该把哪段逻辑迁到后端 / 哪段留在前端”以及 phase ownership，属于基于上述官方资料和当前仓库形态的工程推断。

---
*Pitfalls research for: 全栈化与行政区地图重构*
*Researched: 2026-03-27*
