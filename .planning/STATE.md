---
gsd_state_version: 1.0
milestone: v5.0
milestone_name: 账号体系与云同步基础版
status: verifying
stopped_at: Completed 26-02-PLAN.md
last_updated: "2026-04-16T08:52:55.263Z"
last_activity: 2026-04-16
progress:
  total_phases: 4
  completed_phases: 4
  total_plans: 22
  completed_plans: 22
  percent: 100
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-04-10)

**Core value:** 用户点击地图后，系统必须能以本地静态地理数据稳定判断真实地点，并把旅行点位可靠保存下来。
**Current focus:** Phase 26 — overseas-coverage-foundation

## Current Position

Milestone: v5.0 — 账号体系与云同步基础版
Phase: 26 (overseas-coverage-foundation) — EXECUTING
Plan: 3 of 3
Status: Phase complete — ready for verification
Last activity: 2026-04-16

Progress: [██████████] 100%

## Performance Metrics

**Velocity:**

- Total plans completed: 15
- Average duration: 9m
- Total execution time: 0.3 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 23 | 11 | - | - |
| 24 | 4 | - | - |
| 25 | 3 | - | - |

**Recent Trend:**

- Last 5 plans: 24-03, 24-04, 25-01, 25-02, 25-03
- Trend: Stable

| Phase 24 P03 | - | - | - |
| Phase 24 P04 | - | - | - |
| Phase 25 P01 | - | - | - |
| Phase 25 P02 | - | - | - |
| Phase 25 P03 | - | - | - |
| Phase 25 P04 | 6m | 2 tasks | 5 files |
| Phase 26 P01 | 10m | 2 tasks | 6 files |
| Phase 26 P03 | 10m | 2 tasks | 5 files |
| Phase 26 P02 | 43m | 2 tasks | 8 files |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- v5.0 只做邮箱密码 + `sid` cookie 会话，不引入 OAuth 或 JWT refresh 体系。
- 账号化先锁定 ownership、session 边界和首登迁移，再处理多设备一致与海外覆盖扩展。
- 海外覆盖仅承诺优先国家/地区的 admin1 扩展，不做全球城市级统一覆盖。
- [Phase 23]: Legacy TravelRecord/SmokeRecord remain isolated; ownership begins in UserTravelRecord for Phase 23.
- [Phase 23]: Auth ownership migration used Prisma diff/db execute/migrate resolve because a prior RLS migration breaks shadow DB replay.
- [Phase 23]: Phase 23 auth sessions use AuthSession.id as the sid cookie value with HttpOnly SameSite=Lax current-device semantics.
- [Phase 23]: Register and login responses return only the AuthUser summary; passwordHash remains server-only.
- [Phase 23]: 将 sid -> current user 的恢复逻辑抽到 AuthService.restoreSession，供后续 guard/current-user 原语直接复用。
- [Phase 23]: SessionAuthGuard 只信任 request.cookies.sid，并统一把认证结果写入 request.authUser。
- [Phase 23]: AuthService 保留 bootstrap/restoreSession 语义，同时补 resolveAuthenticatedUserFromSession 供 guard 复用。
- [Phase 23]: server test 脚本通过轻量 wrapper 去掉 pnpm 追加的前导 --，保证 plan 里的单文件验证命令可执行。
- [Phase 23]: Records routes now require SessionAuthGuard and derive owner exclusively from CurrentUser/session.
- [Phase 23]: Records persistence now uses UserTravelRecord with (userId, placeId) compound-key upsert/delete; legacy TravelRecord stays isolated for backfill/reopen validation.
- [Phase 23]: 注册与登录成功后统一再走一次 fetchAuthBootstrap，用服务端 bootstrap 快照同时刷新 currentUser 与 records。
- [Phase 23]: 账号切换、logout 与 unauthorized 回收都先 resetTravelRecordsForSessionBoundary，再决定是否注入新 records。
- [Phase 23]: Auth shell 继续复用 auth-session store 作为唯一真源，App 只负责首次 restore bootstrap 与组合挂载。
- [Phase 23]: restoring 态只覆盖 data-region="map-shell"，保留顶栏与 LeafletMapStage 在 DOM 中持续存在。
- [Phase 23]: 顶栏 authenticated menu 严格收口为用户名、邮箱、退出登录，不引入设置页或设备管理占位。
- [Phase 25]: same-user refresh 继续保持轻刷新，但改走 applyAuthoritativeTravelRecords() 以避开 in-flight placeId 的竞态覆盖。
- [Phase 25]: 点亮成功路径改为按 placeId upsert authoritative record，避免 optimistic row 被并发 refresh 移除后无法写回。
- [Phase 25]: 取消点亮成功后再次按 placeId 过滤本地列表，确保 stale refresh 重叠后仍收敛为未点亮。
- [Phase 26]: 海外 authoritative 支持面现在只通过 build-time 8 国 catalog 生成，不新增前端第二真源。
- [Phase 26]: Tokyo、Gangwon、Dubai 与 unsupported overseas 坐标回归成为 Phase 26 resolve 基线。
- [Phase 26]: Australia 支持采用 ISO allowlist 加 gadm_level 守卫，排除 Lord Howe、Macquarie Island 与 AU-X.. 噪声条目。
- [Phase 26]: OUTSIDE_SUPPORTED_DATA 的海外 fallback 只通过 popup fallbackNotice + disabled CTA 解释，不再以全局 interactionNotice 为主路径。
- [Phase 26]: candidate-select 继续只在 ambiguous 出现；单一明确 overseas resolved 命中保持正常详情与点亮入口。
- [Phase 26]: bootstrap 与前端 store 继续直接回放持久化字段，不在 placeId 维度重新推导海外标题、副标题或类型标签。
- [Phase 26]: 海外 admin1 的 displayName/typeLabel/parentLabel/subtitle 统一由 manifest-backed catalog 提供，服务端 resolve、records 校验和 backfill 共用同一真源。

### Pending Todos

None yet.

### Blockers/Concerns

- Phase 26 需要在规划时锁定首批海外 priority countries 与 canonical/boundary 兼容策略。

## Session Continuity

Last session: 2026-04-16T08:52:54.924Z
Stopped at: Completed 26-02-PLAN.md
Resume file: None

---
*Last updated: 2026-04-15 — Phase 25 completed after sync semantics verification*
