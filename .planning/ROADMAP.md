# Roadmap: 旅行世界地图

## Milestones

- ✅ **v1.0 MVP** — Phases 1-6，已于 2026-03-24 归档
- ✅ **v2.0 城市主视角与可爱风格重构** — Phases 7-10，已于 2026-03-27 归档
- ✅ **v3.0 全栈化与行政区地图重构** — Phases 11-18，已于 2026-04-03 归档（[详情](milestones/v3.0-ROADMAP.md)）
- ✅ **v4.0 Kawaii UI 重构 & Tailwind 集成** — Phases 19-22，已于 2026-04-10 归档（[详情](milestones/v4.0-ROADMAP.md)）
- ✅ **v5.0 账号体系与云同步基础版** — Phases 23-26，已于 2026-04-17 归档（[详情](milestones/v5.0-ROADMAP.md)）
- ✅ **v6.0 旅行统计、时间轴与海外覆盖增强版** — Phases 27-35，已于 2026-04-28 归档（[详情](milestones/v6.0-ROADMAP.md)）

---

## Current Milestone: v7.0 旅行记录编辑与删除

**Goal:** 让用户可以编辑已有旅行记录、添加元数据，并删除单条记录
**Granularity:** coarse
**Phase range:** 36-39

## Phases

- [ ] **Phase 36: 数据层扩展** — Prisma schema 扩展 notes/tags、contracts 更新、PATCH/DELETE 后端端点、日期冲突校验
- [ ] **Phase 37: 前端 Store 与 API 层** — updateRecord / deleteSingleRecord API 与 store 方法、乐观更新回滚、编辑/删除后时间轴重排序与统计刷新
- [ ] **Phase 38: 时间轴编辑/删除 UI** — 编辑表单、标签输入、日期冲突本地检查、确认弹窗、删除最后一条提示
- [ ] **Phase 39: Map Popup 集成与端到端闭环** — 地图 popup 编辑/删除入口、E2E 验证

## Phase Details

### Phase 36: 数据层扩展

**Goal:** Prisma schema + contracts + 后端 API 就绪，前端可消费 PATCH/DELETE 端点
**Depends on:** Nothing（v7.0 首个 phase）
**Requirements:** None（技术使能层）
**Success Criteria**（用户可观察行为）:
1. 用户可以通过 PATCH 端点修改已有旅行记录的开始/结束日期、备注和标签，响应返回完整更新后的记录
2. 用户可以通过 DELETE 端点删除单条旅行记录，同地点其他记录不受影响
3. 编辑日期时若与同地点其他记录日期冲突，系统返回 409 并附带冲突提示信息
4. 备注超过 1000 字符或标签超过 10 个/每个超过 20 字符时，系统返回验证错误

**Plans:** 2 plans

Plans:

**Wave 1** — Schema & Contracts（无依赖）
- [ ] 36-01-PLAN.md — Prisma schema 扩展 notes/tags + contracts 更新 TravelRecord 接口 + 新增 UpdateTravelRecordRequest

**Wave 2** *(blocked on Wave 1 completion)* — API 端点实现
- [ ] 36-02-PLAN.md — DTO + Repository + Service + Controller 实现 PATCH/DELETE 端点 + Schema Push + 验证

Cross-cutting constraints:
- 行级权限：所有 repository 方法 where 条件同时匹配 `id + userId`
- 标签清洗：trim + 去重 + 过滤空字符串（D-10/D-11）
- 日期冲突：P2002 → 409 ConflictException（D-06）

---

### Phase 37: 前端 Store 与 API 层

**Goal:** 前端 store 新增 updateRecord / deleteSingleRecord 方法，编辑/删除后时间轴自动重排序、统计自动刷新、网络失败乐观回滚
**Depends on:** Phase 36
**Requirements:** SYNC-01, SYNC-02, SYNC-03, SYNC-04
**Success Criteria**（用户可观察行为）:
1. 编辑旅行记录后，时间轴页面自动按新日期重新排序
2. 删除旅行记录后，时间轴页面自动移除对应卡片
3. 编辑或删除旅行记录后，统计页面自动刷新数据
4. 编辑或删除操作在网络失败时，前端乐观更新正确回滚到原始状态

**Plans:** TBD

---

### Phase 38: 时间轴编辑/删除 UI

**Goal:** 用户可在时间轴页面编辑日期/备注/标签并删除单条记录，含确认弹窗与删除最后一条提示
**Depends on:** Phase 37
**Requirements:** EDIT-01, EDIT-02, EDIT-03, EDIT-04, DEL-01, DEL-02, DEL-03
**Success Criteria**（用户可观察行为）:
1. 用户可在时间轴卡片上打开编辑表单，修改日期、添加/修改备注和标签
2. 编辑日期时若与同地点其他记录日期冲突，系统在前端本地提示用户
3. 用户点击删除按钮后，系统展示确认弹窗，需确认后才执行删除
4. 删除该地点最后一条记录时，系统提示将取消该地点的点亮状态

**Plans:** TBD

---

### Phase 39: Map Popup 集成与端到端闭环

**Goal:** 用户可在地图 popup 中编辑/删除旅行记录，完成全入口闭环
**Depends on:** Phase 38
**Requirements:** None（增量入口 + E2E 验证）
**Success Criteria**（用户可观察行为）:
1. 用户可在地图 popup 中对已有记录执行编辑和删除操作
2. 删除前展示确认弹窗，删除最后一条记录时提示将取消点亮
3. 从地图 popup 编辑后，时间轴和统计数据同步更新

**Plans:** TBD

---

## Coverage Map

| Requirement | Phase | Status |
|-------------|-------|--------|
| EDIT-01 修改旅行日期 | Phase 36（API）+ Phase 38（UI） | Pending |
| EDIT-02 添加/修改备注 | Phase 36（API）+ Phase 38（UI） | Pending |
| EDIT-03 添加/修改标签 | Phase 36（API）+ Phase 38（UI） | Pending |
| EDIT-04 日期冲突检查 | Phase 36（后端）+ Phase 38（前端） | Pending |
| DEL-01 删除单条记录 | Phase 36（API）+ Phase 38（UI） | Pending |
| DEL-02 删除确认弹窗 | Phase 38 | Pending |
| DEL-03 最后一条提示 | Phase 38 | Pending |
| SYNC-01 时间轴自动重排序 | Phase 37 | Pending |
| SYNC-02 时间轴自动移除 | Phase 37 | Pending |
| SYNC-03 统计自动刷新 | Phase 37 | Pending |
| SYNC-04 乐观更新回滚 | Phase 37 | Pending |

> 13/13 requirements mapped — 100% coverage ✓

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 36. 数据层扩展 | 0/2 | Not started | - |
| 37. 前端 Store 与 API 层 | 0/? | Not started | - |
| 38. 时间轴编辑/删除 UI | 0/? | Not started | - |
| 39. Map Popup 集成与端到端闭环 | 0/? | Not started | - |

---

*Created: 2026-04-28*
