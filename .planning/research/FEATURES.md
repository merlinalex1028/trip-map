# Feature Research

**Domain:** 旅行地图 v3.0 全栈化与行政区地图重构
**Researched:** 2026-03-27
**Confidence:** MEDIUM-HIGH

## Scope Guardrails

- 只覆盖本 milestone 新增能力：`web/server` monorepo、选定职责后移到 API、中国市级 vs 海外一级行政区语义、`Leaflet` 渲染、地点面板内联点亮/取消点亮。
- 默认复用已交付的桌面主链路：城市/地点选中、popup + drawer 分工、本地交互节奏、可爱风视觉方向。
- 目标是做一次“边界清晰的全栈增量”，不是把产品扩成 GIS 平台、地图编辑器或完整云平台。

## Feature Landscape

### Table Stakes (Users Expect These)

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| `web` / `server` 可独立运行的 monorepo 拆分 | 既然 milestone 明确引入后端，用户和后续开发都默认前后端边界清楚，而不是继续把一切塞回前端 | MEDIUM | 最小可用形态应至少有两个 app 和一个共享契约层；共享内容优先放 `types/contracts/constants`，避免一开始就抽象共享业务逻辑 |
| 旅行记录与点亮状态迁移到 API 持久化 | 如果已经引入服务端，最基本的写路径就不应继续只依赖浏览器本地覆盖层 | MEDIUM | 第一批后移职责通常只包含 place CRUD、illuminate/unilluminate、读取已保存记录；不要在同一里程碑把所有地理识别都一起搬走 |
| 稳定的地点身份模型：`CN_CITY` vs `OVERSEAS_ADMIN1` | 这是新语义的核心；没有稳定 identity，前端高亮、后端存储、重复去重都会错位 | HIGH | 建议至少固化 `placeId`、`placeType`、`countryCode`、`displayName`、`boundaryId`；中国和海外必须显式区分层级，不能只靠名称猜测 |
| 中国市级 / 海外一级行政区的明确选择与展示 | 这是本 milestone 对用户最直观的新承诺；缺失后产品语义会重新变模糊 | HIGH | 地点面板、popup、持久化模型都应明确显示层级；中国命中到市级，海外命中到 admin1，不混成“城市/地区”泛称 |
| 明确的回退与消歧规则 | 行政区边界、同名地名和数据缺口在这类产品里是常态；没有回退规则，用户会直接失去信任 | HIGH | 中国需要处理同名市与上级行政区辅助信息；海外 admin1 缺失或不可靠时，应有受控 fallback，而不是默默创建错误地区 |
| 合规且可落地的边界数据链路 | 新语义成立的前提是边界数据来源本身可靠且可持续维护 | HIGH | 中国侧使用阿里云 `DataV.GeoAtlas`，海外侧使用 `Natural Earth admin-1`；需要在预处理阶段建立统一字段和稳定主键 |
| `Leaflet` 上的 GeoJSON 面域渲染与状态切换 | 新地图引擎至少要把“选中 / 已点亮 / 当前查看”这几个状态稳定渲染出来 | HIGH | 典型实现是 `GeoJSON` layer + feature 级样式更新；需要保证 popup 在高亮层之上，且关闭/切换后不残留旧高亮 |
| 中国与海外数据坐标/投影的一致性校验 | 混用两套行政区数据时，坐标体系不统一会直接造成选中错位和边界漂移 | HIGH | 这是实现型 table stake，不做会导致地图语义看起来“假”；阿里云文档显示 DataV 组件主要使用 `GCJ-02`，而 `Natural Earth` 是通用 `WGS84` 语义，需在落地前统一并验证 |
| 地点面板标题右侧的点亮 / 取消点亮动作 | 用户已经有“选中一个地点然后马上切换去过状态”的明确预期；把它埋进深层编辑会显得变慢 | MEDIUM | 这是本里程碑最直接的效率改进；按钮应幂等、文案明确，并在请求中显示 loading / disabled 状态 |
| 点亮动作与地图高亮的单次同步闭环 | 用户按下点亮后，应立即看到面板状态、地图边界和持久化结果保持一致 | MEDIUM | 一个常见且合理的增量做法是 optimistic UI + 失败回滚；至少要保证成功后 map/panel/popup 三处状态同源 |
| 保持现有 popup + drawer 分工不倒退 | 这次重构不应把已经跑通的主链路重新打散 | MEDIUM | popup 继续做摘要与快捷操作，drawer 继续做完整详情；内联点亮动作是增强，不是替换整个详情编辑模型 |

### Differentiators (Competitive Advantage)

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| 共享契约包驱动的前后端协作 | 比“前端手写一套类型、后端再写一套”更稳，后续 roadmap 扩展成本低很多 | MEDIUM | 可以是共享 DTO / schema / enum，不必一步到位做完整代码生成；重点是消除 `placeType`、`boundaryId` 这类关键字段漂移 |
| API 只接管“稳定职责”，交互识别仍保留在最合适的一侧 | 这是比“全部后端化”更成熟的增量策略，能在不重写核心交互的情况下完成全栈化 | HIGH | 一个好切法通常是：server 负责持久化、规范地点身份、返回已保存状态；web 继续承担 Leaflet 交互、面域预览、临时选中状态 |
| 面板中显式展示地理语义标签 | 用户能立刻看懂当前命中的是“中国市级”还是“海外一级行政区”，降低误解成本 | LOW | 例如地点名旁补充 `中国·市级` / `海外·一级行政区` 标签；属于低成本高收益的表达型增强 |
| 按需加载或预简化 GeoJSON | 能在保持真实边界高亮的同时，避免 `Leaflet` 因大面数据而拖慢桌面交互 | HIGH | 不是 launch blocker，但会显著改善体验；适合放在主链路打通后作为增强项 |
| 面板内联点亮后即时反馈到地图，不必打开深层编辑 | 对“浏览地图时快速标记去过”这个高频动作非常友好 | MEDIUM | 和已有 popup + drawer 分工天然契合，属于真正贴合当前产品形态的增量，而不是额外开一条新流程 |
| 边界优先的高亮表达而不是回退成 marker-only | 能保持项目最有辨识度的“真实区域被点亮”的产品语义 | MEDIUM | 这会让 v3.0 即便切到新地图引擎，也仍然像同一个产品，而不是重新变成通用打点地图 |

### Anti-Features (Commonly Requested, Often Problematic)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| 一次性把所有地理识别、边界查询、静态数据读取都搬到后端 | 听起来“更全栈”“更统一” | 会把 milestone 从边界清晰的增量，推成高风险平台重构；同时失去当前离线/本地识别的稳定基线 | 先只把记录持久化、地点 identity、已保存状态这些稳定职责放到 API，识别链路按需逐步迁移 |
| 海外也直接承诺城市级甚至 POI 级精度 | 看起来更强、更完整 | 会瞬间引入全球多层级地名、别名、边界和精度问题，完全超出本里程碑边界 | 明确收口为“中国市级 / 海外一级行政区”，把更细粒度海外覆盖放到后续研究 |
| 在本 milestone 同时做账号、登录、多人同步 | “既然后端都有了，顺便把用户系统做了” | 会把所有数据模型、权限模型和 UI 入口都扩大，直接稀释本 milestone 的主题 | 先做单用户 API 化；等 server 边界稳定后，再决定是否进入账号体系 |
| 把 popup 改成完整编辑器 | 少一次跳转，看起来更快 | 会打破当前 popup 摘要 / drawer 深编辑的清晰分工，造成两套详情入口长期并存 | popup 保持摘要与快捷动作，完整编辑继续交给 drawer |
| 引入向量瓦片、3D、复杂地图底图平台 | “既然换 Leaflet，不如顺便把地图体系全升级” | 这会把注意力从行政区语义和点亮主链路拉走，投入和调试面都急剧扩大 | 先用 `Leaflet + GeoJSON` 把行政区语义跑稳，再评估是否需要更重的地图基础设施 |
| 提供手工修边界、改 polygon、上传自定义 GeoJSON | 能覆盖数据缺口，看起来更灵活 | 产品会快速滑向专业 GIS 工具，交互、校验和数据治理都失控 | 对异常命中先做消歧、fallback 和数据预处理，不把人工地图编辑纳入本 milestone |
| 把所有边界数据都改成必须走 API 实时下发 | 容易让“后端化”看起来更彻底 | 如果数据本身是稳定静态资产，强制 API 化会增加无谓的部署、缓存和性能复杂度 | 优先区分“静态边界资产”和“动态用户数据”；静态数据可先保留构建产物或受控静态分发 |

## Feature Dependencies

```text
Monorepo apps split
  -> shared contracts/types
  -> stable API boundary

shared contracts/types
  -> place identity model
  -> records API
  -> illuminate/unilluminate mutation

boundary data ingestion + normalization
  -> China city / overseas admin1 semantics
  -> stable boundaryId
  -> Leaflet GeoJSON rendering

place identity model
  -> dedupe / reopen existing place
  -> panel semantic labels
  -> persisted illuminated state

Leaflet GeoJSON rendering
  -> selected / illuminated / current-view styles
  -> inline illuminate visual feedback
  -> popup / drawer continuity

records API + mutation flow
  -> optimistic illuminate toggle
  -> refresh after save
  -> cross-surface state consistency

full server-side geospatialization
  -> conflicts with scoped milestone increment

overseas city-level promise
  -> conflicts with approved "China city / overseas admin1" scope
```

### Dependency Notes

- **Monorepo split requires shared contracts/types:** 不先收口关键字段，后续前后端会很快在 `placeType`、`boundaryId`、点亮状态上产生漂移。
- **Boundary ingestion requires normalization before Leaflet rendering:** 中国与海外数据源即使都叫 GeoJSON，字段、层级和坐标约束也不天然一致，必须先做数据统一。
- **Place identity model requires semantic clarity:** 只有 identity 足够稳定，已保存地点复用、去重、高亮和 API 持久化才会可靠。
- **Leaflet rendering enhances inline illuminate toggle:** 面板按钮之所以有价值，是因为它能立即驱动真实行政区边界的视觉反馈，而不是只改一条文本状态。
- **Full server-side geospatialization conflicts with this milestone:** 这会把工作从“后移选定职责”升级为“重做整个识别平台”，不适合与当前目标绑定交付。
- **Overseas city-level conflicts with current scope:** 一旦海外也承诺城市级，数据质量、命名消歧和交互复杂度都会跳级增长。

## MVP Definition

### Launch With (v3.0)

- [ ] `web` / `server` 两个 app 的 monorepo 结构跑通，并有最小共享契约层
- [ ] 旅行记录读取、创建、更新、删除，以及点亮 / 取消点亮动作走 API
- [ ] 明确的地点 identity 模型，能表达中国市级与海外一级行政区
- [ ] 中国 `GeoAtlas` 与海外 `Natural Earth admin-1` 数据经过预处理后可稳定驱动选择与高亮
- [ ] `Leaflet` 上完成 GeoJSON 行政区渲染，并稳定表达选中态与已点亮态
- [ ] 地点面板内提供名称右侧的点亮 / 取消点亮按钮，且与地图高亮同步
- [ ] 现有 popup + drawer 分工保留，不因地图引擎或 API 化而退化

### Add After Validation (v3.1)

- [ ] 边界数据按需加载、预简化或缓存优化，在不改语义的前提下提升性能
- [ ] 更顺滑的 optimistic update、错误重试和局部回滚体验
- [ ] API 返回更丰富的地点展示元数据，减少前端本地拼装逻辑
- [ ] 常用地点 / 最近操作地点的小范围快捷入口

### Future Consideration (v4+)

- [ ] 账号体系、跨设备同步、多人数据隔离
- [ ] 海外 finer-grained 覆盖，例如城市级扩展或更细行政层级
- [ ] 服务端主导的地理识别管线、批量导入、数据治理后台
- [ ] 分享、导出、统计、成就等围绕旅行记录的外围产品能力

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Monorepo 拆分与共享契约层 | HIGH | MEDIUM | P1 |
| 旅行记录与点亮状态 API 化 | HIGH | MEDIUM | P1 |
| 中国市级 / 海外 admin1 的 identity 模型 | HIGH | HIGH | P1 |
| 边界数据预处理与统一主键 | HIGH | HIGH | P1 |
| `Leaflet` GeoJSON 高亮与状态切换 | HIGH | HIGH | P1 |
| 地点面板内联点亮 / 取消点亮 | HIGH | MEDIUM | P1 |
| 按需加载 / 预简化 GeoJSON | MEDIUM | HIGH | P2 |
| 更强的 optimistic update 与重试体验 | MEDIUM | MEDIUM | P2 |
| API 返回展示增强元数据 | MEDIUM | MEDIUM | P2 |
| 账号与同步体系 | MEDIUM | HIGH | P3 |
| 海外城市级扩展 | MEDIUM | HIGH | P3 |

**Priority key:**
- P1: 本 milestone 必须交付
- P2: 主链路稳定后可追加
- P3: 明确延后，不应混入本 milestone

## Ecosystem Pattern Analysis

| Pattern | Ecosystem Signal | Our Approach |
|---------|------------------|--------------|
| Monorepo 的典型落地 | 业界主流 monorepo 文档普遍建议以 `apps + packages` 划分 app 与共享包，而不是在初期抽象出大量共享运行时逻辑 | 采用增量式 `web/server + shared contracts`，先解决边界和协作问题，不做大规模共享业务抽象 |
| REST API 的责任切分 | NestJS 当前官方文档仍强调 controller 处理请求入口、provider 封装业务职责，适合先承接稳定的持久化与领域逻辑 | 先把记录、点亮状态、地点 identity 等稳定职责放入 API，避免一口气迁移全部交互和识别逻辑 |
| GeoJSON 行政区交互 | Leaflet 官方示例直接以 `GeoJSON` layer、feature 级样式和交互回调来实现区域高亮与点击反馈 | 以行政区面域为主表达，不退回 marker-only；保留 popup / drawer 的既有交互节奏 |
| 中国 / 海外边界数据拼接 | 当前官方资料表明 `GeoAtlas` 更适合作为中国侧行政区边界来源，`Natural Earth admin-1` 是海外一级行政区的常见基础数据 | 按“中国市级 / 海外一级行政区”收口语义，在数据预处理阶段统一字段、ID 和坐标约束，不承诺全球城市级 |

## Sources

- 项目上下文（HIGH）: `.planning/PROJECT.md`
- Leaflet GeoJSON 教程（HIGH）: https://leafletjs.com/examples/geojson/
- Leaflet Choropleth 示例（HIGH）: https://leafletjs.com/examples/choropleth/
- Leaflet Reference（HIGH）: https://leafletjs.com/reference.html
- NestJS Controllers（HIGH）: https://docs.nestjs.com/controllers
- NestJS Providers（HIGH）: https://docs.nestjs.com/providers
- Turborepo Structuring a Repository（MEDIUM）: https://turborepo.com/docs/crafting-your-repository/structuring-a-repository
- Natural Earth Admin-1 States, Provinces（HIGH）: https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-admin-1-states-provinces/
- 阿里云 DataV.GeoAtlas 小部件文档（HIGH）: https://help.aliyun.com/zh/datav/datav-7-0/user-guide/datav-geoatlas-widgets/

## Confidence Notes

- **Monorepo / API 边界:** MEDIUM-HIGH。官方框架文档和当前项目边界都比较明确，但“哪些职责现在就后移”仍带有产品取舍成分。
- **中国市级 / 海外 admin1 语义:** HIGH。来自当前 milestone 目标与官方数据源边界，结论稳定。
- **Leaflet GeoJSON 交互:** HIGH。官方教程和参考文档对区域样式、交互和状态管理支持明确。
- **中国与海外坐标统一要求:** MEDIUM。数据源官方文档足以证明存在差异约束，但具体转换方案仍需要实施阶段验证。

---
*Feature research for: 旅行地图 v3.0 全栈化与行政区地图重构*
*Researched: 2026-03-27*
