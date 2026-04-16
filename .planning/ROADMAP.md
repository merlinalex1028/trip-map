# Roadmap: 旅行世界地图

## Milestones

- ✅ **v1.0 MVP** — Phases 1-6，已于 2026-03-24 归档
- ✅ **v2.0 城市主视角与可爱风格重构** — Phases 7-10，已于 2026-03-27 归档
- ✅ **v3.0 全栈化与行政区地图重构** — Phases 11-18，已于 2026-04-03 归档（[详情](milestones/v3.0-ROADMAP.md)）
- ✅ **v4.0 Kawaii UI 重构 & Tailwind 集成** — Phases 19-22，已于 2026-04-10 归档（[详情](milestones/v4.0-ROADMAP.md)）
- 🚧 **v5.0 账号体系与云同步基础版** — Phases 23-26，规划中

## Overview

v5.0 让应用从本地单机旅行地图升级为“可登录、可跨设备同步、可在更多海外地区稳定点亮”的账号化产品。本 milestone 只交付邮箱密码账号、服务端会话、账号归属记录、首次本地记录迁移、基础多设备最终一致，以及一组优先海外 admin1 覆盖；不引入 OAuth、社交能力、实时同步或全球城市级覆盖。

## Phases

**Phase Numbering:**
- Integer phases (23, 24, 25, 26): Planned milestone work
- Decimal phases (23.1, 24.1): Urgent insertions if needed later

- [x] **Phase 23: Auth & Ownership Foundation** - 建立邮箱密码账号、会话恢复与按账号隔离的旅行记录真源（gap closure planned） (completed 2026-04-12)
- [x] **Phase 24: Session Boundary & Local Import** - 收口匿名浏览边界、首登本地导入选择与切账号状态重置 (completed 2026-04-15)
- [x] **Phase 25: Sync Semantics & Multi-Device Hardening** - 完成基础版跨设备最终一致、取消点亮同步与失败提示语义（gap closure replanned 2026-04-15） (completed 2026-04-15)
- [x] **Phase 26: Overseas Coverage Foundation** - 扩展优先海外 admin1 覆盖并补齐未支持地区的可解释反馈 (completed 2026-04-16)

## Phase Details

### Phase 23: Auth & Ownership Foundation
**Goal**: 用户可以拥有独立账号身份，且账号成为旅行记录的唯一归属真源
**Depends on**: Phase 22
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-05, SYNC-01, SYNC-02
**Success Criteria** (what must be TRUE):
  1. 用户可以使用邮箱和密码注册、登录、退出，并在刷新页面或重新打开应用后恢复到同一账号会话。
  2. 已登录用户可以在界面中明确看到当前账号身份，并能从稳定入口执行退出操作。
  3. 登录后用户只能看到当前账号自己的旅行记录，不会读到其他账号或匿名上下文的数据。
  4. 登录后新点亮的地点会绑定到当前账号，并在重新进入应用后仍可从云端重新加载出来。
**Plans**: 9 plans
Plans:
- [x] 23-01-PLAN.md — 建立 auth/contracts 与 ownership Prisma schema 基座
- [x] 23-02-PLAN.md — 实现邮箱密码注册登录退出与当前设备 session 核心 auth module
- [x] 23-06-PLAN.md — 补齐 bootstrap 恢复入口与 sid session 恢复逻辑
- [x] 23-07-PLAN.md — 补齐 current-user guard、decorator 与 auth module 导出
- [x] 23-03-PLAN.md — 将 `/records` 收口为 current-user ownership 真源
- [x] 23-04-PLAN.md — 建立 web auth-session store 与 authenticated records 生命周期
- [x] 23-05-PLAN.md — 接入顶栏账号入口、认证弹层、restoring 蒙层与 UI 验证
- [x] 23-08-PLAN.md — 修补后端注册原子性与 trim-first 用户名校验
- [x] 23-09-PLAN.md — 修补前端 auth submit 401 分流与弹层/records 边界稳定
**UI hint**: yes

### Phase 24: Session Boundary & Local Import
**Goal**: 用户可以在不被强制登录的前提下浏览地图，并在首次登录时清楚处理本地旧记录与账号会话边界
**Depends on**: Phase 23
**Requirements**: AUTH-04, MIGR-01, MIGR-02, MIGR-03, MIGR-04
**Success Criteria** (what must be TRUE):
  1. 未登录用户仍可正常浏览地图，只在尝试保存或同步旅行记录时被明确引导去登录。
  2. 本地已有旅行记录的用户首次登录时，可以明确选择“导入本地记录到账号”或“以当前账号云端记录为准”。
  3. 选择导入本地记录时，系统会按 canonical place 去重，避免同一地点在账号中重复出现。
  4. 用户退出登录或切换账号后，界面会清空上一账号的点亮结果，并重新加载当前会话对应的数据。
**Plans**: 4 plans
Plans:
- [x] 24-01-PLAN.md — 建立受保护的 `/records/import` bulk import 与 authoritative summary
- [x] 24-02-PLAN.md — 建立 legacy local snapshot reader 与 auth-session 导入决策状态机
- [x] 24-03-PLAN.md — 接入首次登录导入决策对话框与匿名点亮登录升级
- [x] 24-04-PLAN.md — 补齐 logout / switch-account / unauthorized 的边界清理与提示
**UI hint**: yes

### Phase 25: Sync Semantics & Multi-Device Hardening
**Goal**: 用户在多设备上看到稳定一致的账号记录，并能明确理解同步成功、失败与重新登录边界
**Depends on**: Phase 24
**Requirements**: SYNC-03, SYNC-04, SYNC-05
**Success Criteria** (what must be TRUE):
  1. 已登录用户取消点亮某个地点后，云端对应记录会被移除或标记取消，后续拉取结果不再把该地点显示为已点亮。
  2. 同一账号在另一台设备登录后，可以看到与原设备一致的点亮结果，不需要人工重建记录。
  3. 点亮、取消点亮和记录拉取在成功、失败或需要重新登录时，界面都会给出明确且可区分的反馈。
**Plans**: 4 plans
Plans:
- [x] 25-01-PLAN.md — 服务端删除幂等语义与 multi-session bootstrap 一致性回归
- [x] 25-02-PLAN.md — same-user foreground refresh 与轻量 authoritative snapshot 替换
- [x] 25-03-PLAN.md — 点亮/取消点亮/refresh 的同步反馈分层与 notice 语义
- [x] 25-04-PLAN.md — 修补 foreground refresh 与点亮/取消点亮重叠时的竞态覆盖
**UI hint**: yes

### Phase 26: Overseas Coverage Foundation
**Goal**: 用户可以在一组优先海外国家/地区获得更实用且可解释的 admin1 点亮体验
**Depends on**: Phase 25
**Requirements**: OVRS-01, OVRS-02, OVRS-03
**Success Criteria** (what must be TRUE):
  1. 用户可以在首批优先海外国家/地区的一级行政区上稳定识别并点亮地点。
  2. 已保存的海外旅行记录在刷新、重开应用和跨设备后，仍能稳定显示一致的标题、类型标签和副标题。
  3. 点击暂未支持的海外区域时，界面会明确说明该地区暂不支持点亮，而不是静默失败或表现为无响应。
**Plans**: TBD
**UI hint**: yes

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 23. Auth & Ownership Foundation | 11/11 | Complete    | 2026-04-14 |
| 24. Session Boundary & Local Import | 4/4 | Complete    | 2026-04-15 |
| 25. Sync Semantics & Multi-Device Hardening | 4/4 | Complete   | 2026-04-15 |
| 26. Overseas Coverage Foundation | 3/3 | Complete   | 2026-04-16 |

---
*Last updated: 2026-04-15 — Phase 25 completed after sync semantics verification*
