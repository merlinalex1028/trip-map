# Project Research Summary

**Project:** 旅行世界地图
**Domain:** local-first 旅行地图向账号化、云同步、海外 admin1 扩展升级
**Milestone:** v5.0
**Researched:** 2026-04-10
**Confidence:** HIGH

## Executive Summary

v5.0 的本质不是补一个登录页，而是把现有单机旅行地图升级成“可登录、可跨设备同步、可在更多海外地区稳定点亮”的账号化产品。基于现有代码和研究，最佳路径不是换框架或引入外部平台，而是在既有 `Vue 3 + Leaflet + NestJS + Prisma + PostgreSQL` 基线之上，加一层服务端会话鉴权、每用户记录归属和更稳的海外数据管线。

推荐做法是保留公开的地点解析链路，只把“记录保存与读取”切到账号上下文：浏览地图仍可匿名，用户在保存或同步时再升级登录；服务端通过 `sid` HttpOnly cookie + session 表识别用户；前端通过单一 bootstrap 请求恢复 `user + records`；海外覆盖继续走 canonical dataset + geometry manifest + shard 资产扩展，不把地理问题塞进 auth/records 业务模型。

最大风险不在 UI，而在三件事：旧本地数据首次登录迁移、切账号后的前端状态串号、以及海外 place/boundary ID 演进后历史记录失去可重开性。路线图应先锁定 ownership 和 session 边界，再处理首登导入与多端一致，最后再扩大海外覆盖。

## Key Findings

### Recommended Stack

继续沿用现有 monorepo 和主栈，不引入 Auth SaaS、JWT 刷新体系、WebSocket 同步或新地图引擎。v5.0 只补最小但足够的账号化能力。

**Core technologies:**
- `Vue 3 + Pinia + Leaflet + Tailwind v4`：保留现有前端与地图渲染基线，改动面最小。
- `NestJS 11 + Fastify 5`：适合加 auth module、guard、cookie 插件和 bootstrap 接口。
- `Prisma 6 + PostgreSQL`：适合建 `User`、`AuthSession`、每用户记录唯一约束与 RLS 护栏。
- `@fastify/cookie`：承载 `sid` HttpOnly cookie，会话模式比前端 token 更贴合当前浏览器场景。
- `argon2`：密码哈希默认选型。
- `geoBoundaries gbOpen ADM1`：作为海外扩展主数据源，继续喂给现有 geometry manifest/shard 管线。

**Critical stack decisions:**
- 鉴权采用 opaque `sid` cookie + 服务端 session 表，不采用 JWT refresh 架构。
- 客户端统一 `credentials: 'include'`，不在 `localStorage` 保存 auth token。
- 综合 `ARCHITECTURE.md` 与 `PITFALLS.md`，推荐新增 `UserTravelRecord` 作为 v5 主表，并把旧 `TravelRecord` 作为 legacy 隔离；这比原地回填 owner 更安全。

### Expected Features

v5.0 的 table stakes 是“账号身份 + 记录归属 + 首登迁移 + 多端一致 + 海外可解释覆盖”闭环，不是单独上线登录表单。

**Must have (table stakes):**
- 注册、登录、退出、刷新后会话保持。
- 未登录仍可浏览地图，在保存/同步时再引导登录升级。
- 旅行记录与账号绑定，登录后自动拉取当前账号的云端记录。
- 老用户首次登录时可明确处理本地旧记录：合并到账号或以云端为准。
- 点亮/取消点亮在多设备间保持最终一致。
- 海外高频国家的 admin1 覆盖扩展，并对未覆盖地区明确提示“不支持”。
- 明确同步边界：同步的是旅行记录，不是持续定位或轨迹采集。

**Should have (competitive):**
- 当前账号标识与最近同步时间，帮助用户判断是否看到最新数据。
- 国家内完成度或轻量统计，增强账号价值感。

**Defer (v2+):**
- Apple/Google 第三方登录。
- 实时多端协同、后台位置追踪、旅行轨迹自动采集。
- 全球城市级统一覆盖、家庭共享地图、好友协作、社交分享。

### Architecture Approach

架构上应把 auth、records、canonical/geometry 三条边界分清：`/places/resolve` 与 `/places/confirm` 继续公开；`/auth/bootstrap` 成为唯一的登录恢复入口；`/records` 全部切成“当前用户记录”；海外覆盖继续通过 canonical dataset 与 geometry manifest 扩展，不与账号模型耦合。

**Major components:**
1. `auth` module + session guard：注册、登录、退出、恢复会话，并把 cookie 解析成当前用户上下文。
2. `bootstrap` endpoint + `auth-session` store：一次返回 `user + records`，前端据此初始化登录态和地图记录。
3. `UserTravelRecord` repository/service：按 `(userId, placeId)` 做读写、删除、去重与幂等。
4. canonical places + geometry pipeline：维护稳定 `placeId`、可演进 `boundaryId`，并扩展海外 ADM1 数据资产。

### Critical Pitfalls

1. **仍把记录当全局 `placeId` 唯一**：会直接阻塞多用户；必须改成每用户命名空间。
2. **只做登录，不做 ownership filter / RLS / guard 三层护栏**：会导致串读串删；应用层和数据库层都要收口。
3. **登录/退出/切账号后前端不重置 store**：会出现串号或空白假象；bootstrap 生命周期必须绑定 session。
4. **忽略首登本地记录导入**：老用户会误以为数据丢失；必须单独设计一次性迁移流程和解释文案。
5. **点亮/取消点亮缺少稳定幂等语义**：多设备下容易闪烁和回滚；服务端应返回最终 canonical record，而不是让前端猜 `409`。
6. **海外扩容先改边界、后补 ID 兼容**：历史记录会失去可重开性；必须优先稳定 canonical ID，并预留 alias/backfill。

## Implications for Roadmap

基于研究，建议把 v5.0 切成 4 个 phase，而不是把 auth、sync、海外覆盖混在一个实现阶段。

### Phase 1: Auth & Ownership Foundation
**Rationale:** 没有稳定用户身份和记录归属，就不存在后续同步。
**Delivers:** `User`、`AuthSession`、`UserTravelRecord`、`sid` cookie、auth guard、受保护的 `/records`、`/auth/bootstrap`。
**Addresses:** 注册/登录/退出、账号即记录真源。
**Avoids:** 全局唯一 `placeId`、跨用户串读串删、只开登录不做 ownership 护栏。

### Phase 2: Session Boundary & Local Import
**Rationale:** v5 最大体验风险来自“老本地用户第一次登录后发生什么”。
**Delivers:** `auth-session` store、统一 API wrapper、登录/退出切账号重置、首登本地记录合并或云端优先流程、同步边界说明。
**Addresses:** 延迟登录升级、老用户迁移、同步边界可解释。
**Avoids:** 串号、空白假象、首次登录误判为数据丢失、强制登录墙。

### Phase 3: Sync Semantics & Multi-Device Hardening
**Rationale:** 先有 ownership 和 session，再谈多端一致才不会把错误放大。
**Delivers:** 记录 upsert/幂等删除、明确的 mutation 成功语义、401 与网络失败分流、必要的 pending/retry 状态。
**Addresses:** 跨设备一致点亮/取消点亮、失败可解释、最近同步时间。
**Avoids:** 409 冲突误判、弱网回滚闪烁、多设备同时操作不一致。

### Phase 4: Overseas Coverage Foundation
**Rationale:** 海外扩容应在每用户记录模型稳定后落地，否则会叠加 place/boundary 迁移风险。
**Delivers:** priority country list、`geoBoundaries gbOpen ADM1` 接入、canonical/geometry 扩容、未覆盖提示、历史记录 reopen 回归。
**Addresses:** 更实用的海外 admin1 覆盖、未覆盖可解释、标签与层级稳定。
**Avoids:** 全球范围失控、ADM2/ADM3 过度扩张、边界重命名导致历史记录失效。

### Phase Ordering Rationale

- Phase 1 必须先于所有 phase，因为 user identity 和 ownership 是同步的前提。
- Phase 2 必须单列，因为“首登迁移”和“切账号状态重置”是最高风险体验断层。
- Phase 3 只做基础版最终一致，不承诺实时协同，能显著控制范围。
- Phase 4 最后做，确保 place/boundary 兼容问题不会和 auth/sync 迁移同时爆发。

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 2:** 需要细化首登导入策略、合并规则、用户文案与回滚策略。
- **Phase 4:** 需要确认首批国家清单、geoBoundaries 质量、place/boundary alias 方案和回归夹具。

Phases with standard patterns (skip research-phase):
- **Phase 1:** NestJS + Fastify cookie session、Prisma 关系模型、guard 模式成熟。
- **Phase 3:** 若范围收敛到“服务端权威快照 + 幂等写入 + 明确错误态”，实现模式较标准。

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | 主要基于现有代码、NestJS/Prisma/MDN 官方资料，技术路径清晰。 |
| Features | MEDIUM-HIGH | 用户闭环明确，但首登迁移交互和统计类差异化仍需产品取舍。 |
| Architecture | HIGH | 与当前代码结构高度一致，组件边界和构建顺序清楚。 |
| Pitfalls | HIGH | 风险点已被当前代码状态与多份研究交叉验证。 |

**Overall confidence:** HIGH

### Gaps to Address

- **Legacy 数据处理策略**：需明确是完全隔离旧表、一次性导入，还是提供人工迁移脚本；不应隐式认领。
- **`UserTravelRecord` vs 原表改造**：研究存在分歧；本总结建议新表切换，roadmap 需尽早确认并保持一致。
- **海外首批覆盖范围**：需在规划时锁定 priority countries，避免“全球均匀扩张”。
- **RLS 实施深度**：若继续启用数据库 RLS，需确认 Prisma 连接角色是否会绕过 policy。

## Sources

### Primary (HIGH confidence)
- `.planning/research/STACK.md`
- `.planning/research/FEATURES.md`
- `.planning/research/ARCHITECTURE.md`
- `.planning/research/PITFALLS.md`
- `.planning/PROJECT.md`
- NestJS docs: cookies, session, authentication, encryption and hashing
- Prisma docs: one-to-many relations, compound unique constraints
- MDN docs: `Request.credentials`, `Set-Cookie`
- PostgreSQL docs: row security policies, `CREATE POLICY`
- geoBoundaries API docs

### Secondary (MEDIUM confidence)
- Apple HIG Sign in with Apple guidance
- Google Maps saved places behavior
- Polarsteps multi-device support guidance
- Visited product and feature pages

---
*Research completed: 2026-04-10*
*Ready for roadmap: yes*
