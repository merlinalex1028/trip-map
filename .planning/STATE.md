---
gsd_state_version: 1.0
milestone: v5.0
milestone_name: 账号体系与云同步基础版
status: ready
stopped_at: Phase 23 completed
last_updated: "2026-04-12T14:27:26.391Z"
last_activity: 2026-04-12
progress:
  total_phases: 4
  completed_phases: 1
  total_plans: 9
  completed_plans: 9
  percent: 25
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-04-10)

**Core value:** 用户点击地图后，系统必须能以本地静态地理数据稳定判断真实地点，并把旅行点位可靠保存下来。
**Current focus:** Phase 24 — session-boundary-&-local-import

## Current Position

Milestone: v5.0 — 账号体系与云同步基础版
Phase: 24 (session-boundary-&-local-import) — READY
Plan: Not started
Status: Phase 23 complete — next phase ready for discuss/planning
Last activity: 2026-04-12

Progress: [██▌░░░░░░░] 25%

## Performance Metrics

**Velocity:**

- Total plans completed: 11
- Average duration: 9m
- Total execution time: 0.3 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 23 | 9 | - | - |

**Recent Trend:**

- Last 5 plans: 23-01 (12m), 23-02 (6m)
- Trend: Stable

| Phase 23 P02 | 6m | 2 tasks | 11 files |
| Phase 23 P06 | 5m | 2 tasks | 4 files |
| Phase 23 P07 | 17 | 2 tasks | 8 files |
| Phase 23 P03 | 12 min | 2 tasks | 6 files |
| Phase 23 P04 | 16m | 2 tasks | 7 files |
| Phase 23 P05 | 21m | 2 tasks | 6 files |

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

### Pending Todos

None yet.

### Blockers/Concerns

- Phase 24 需要在规划时尽早锁定首登本地导入与云端优先的交互文案。
- Phase 26 需要在规划时锁定首批海外 priority countries 与 canonical/boundary 兼容策略。

## Session Continuity

Last session: 2026-04-12T12:41:59.864Z
Stopped at: Completed 23-05-PLAN.md
Resume file: None

---
*Last updated: 2026-04-12 — Phase 23 completed*
