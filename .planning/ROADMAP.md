# Roadmap: 旅行世界地图

## Overview

这个项目的建设路径会从“地图主视图和投影契约”开始，先把世界地图、响应式布局和点位骨架搭起来；随后集中实现真实地点识别这条核心链路，再补齐点位 CRUD、详情抽屉和本地持久化；最后再做可用性、降级逻辑和城市级增强入口。这样可以尽早验证真实点位判断是否可信，同时避免把复杂度过早压到一个阶段里。

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: 地图基础与应用骨架** - 搭建前端项目、响应式地图主界面和点位展示骨架 (completed 2026-03-23)
- [x] **Phase 2: 国家级真实地点识别** - 打通点击坐标到国家/地区识别的核心链路 (completed 2026-03-24)
- [x] **Phase 3: 点位闭环与本地持久化** - 完成点位 CRUD、详情抽屉与本地数据合并保存 (completed 2026-03-24)
- [x] **Phase 4: 可用性打磨与增强能力** - 完善异常处理、边界体验、可访问性与城市级扩展入口 (completed 2026-03-24)
- [x] **Phase 5: 草稿取消闭环与点位重选修复** - 修复草稿残留问题，补齐点位重选与取消新建的运行时闭环 (completed 2026-03-24)
- [x] **Phase 6: 历史验证证据补齐与需求追踪回填** - 补齐 phase verification、validation 和 requirement traceability，推动 milestone 审计通过 (completed 2026-03-24)

## Phase Details

### Phase 1: 地图基础与应用骨架
**Goal**: 交付一个可运行的前端应用骨架，包含固定投影世界地图主视图、响应式抽屉布局和基础点位展示能力。
**Depends on**: Nothing (first phase)
**Requirements**: MAP-01, MAP-02, DRW-01, DRW-02, DAT-01
**Success Criteria** (what must be TRUE):
  1. 用户可以在桌面端和移动端看到世界地图主界面
  2. 用户可以看到预置点位在地图上的基础展示
  3. 用户可以在桌面端和移动端打开对应布局的详情抽屉容器
  4. 应用启动后可以读取并展示内置示例点位
**Plans**: 3/3 plans complete

Plans:
- [x] 01-01: 初始化 `Vue 3 + Vite + TypeScript` 项目并搭建应用壳层
- [x] 01-02: 接入固定投影世界地图底图与响应式布局
- [x] 01-03: 建立基础点位展示、选中态和详情抽屉容器

### Phase 2: 国家级真实地点识别
**Goal**: 实现从地图点击到真实地理坐标换算，再到国家/地区级离线地点识别的核心链路。
**Depends on**: Phase 1
**Requirements**: GEO-01, GEO-02, GEO-03
**Success Criteria** (what must be TRUE):
  1. 用户点击有效陆地区域后可以得到真实地理坐标
  2. 用户点击有效区域后系统可以返回国家或地区识别结果
  3. 用户点击海洋或无法识别区域时不会创建错误点位
  4. 国家边界命中在常见场景下表现稳定，边界结果可解释
**Plans**: 4/4 plans complete

Plans:
- [x] 02-01: 实现固定投影下的坐标采集与 `x/y <-> lng/lat` 转换
- [x] 02-02: 接入国家边界数据并完成国家级命中与异常提示
- [x] 02-03: 修复投影框错位并补齐东亚点击识别回归覆盖
- [x] 02-04: 修复全图点击偏移并补齐交互级对齐回归覆盖

### Phase 3: 点位闭环与本地持久化
**Goal**: 让用户可以基于识别结果完整创建、编辑、删除旅行点位，并在刷新后保留数据。
**Depends on**: Phase 2
**Requirements**: MAP-03, PNT-01, PNT-02, PNT-03, PNT-05, DRW-03, DAT-02, DAT-03
**Success Criteria** (what must be TRUE):
  1. 用户点击识别成功的位置后可以创建新的旅行点位
  2. 用户可以在详情面板中编辑名称、简介和点亮状态
  3. 用户可以删除自建点位，取消新建时不会留下空点位
  4. 用户刷新页面后仍能看到自己的点位与编辑结果
**Plans**: 3/3 plans complete

Plans:
- [x] 03-01: 建立 `MapPoint` 状态管理与点位 CRUD 流程
- [x] 03-02: 实现详情抽屉编辑表单与保存/删除/取消闭环
- [x] 03-03: 完成 `seed + localStorage` 合并、版本与回退逻辑

### Phase 4: 可用性打磨与增强能力
**Goal**: 提升交互可靠性和可访问性，补齐边界与降级逻辑，并为城市级识别预留增强入口。
**Depends on**: Phase 3
**Requirements**: GEO-04, PNT-04, DRW-04, DAT-04, UX-01, UX-02, UX-03
**Success Criteria** (what must be TRUE):
  1. 选中点位与普通高亮点位有清晰区分
  2. 键盘焦点、关闭逻辑和长文本布局表现稳定
  3. 本地存储异常时应用能安全回退
  4. 城市级识别即使未命中，也不会影响国家级结果创建
**Plans**: 3/3 plans complete

Plans:
- [x] 04-01: 完成可访问性、焦点态、边界点击和面板关闭行为打磨
- [x] 04-02: 补齐异常降级、城市级回退与整体视觉反馈优化
- [x] 04-03: 修复城市增强命中区过窄并补齐交互级回归覆盖

### Phase 5: 草稿取消闭环与点位重选修复
**Goal**: 修复草稿点位在切换到已有点位后的残留问题，重新打通点位重选、取消新建与抽屉关闭的完整闭环。
**Depends on**: Phase 4
**Requirements**: MAP-03, PNT-05
**Gap Closure**: Closes gaps from audit
**Success Criteria** (what must be TRUE):
  1. 用户创建草稿后切换到已有点位时，旧草稿不会在地图上残留
  2. 用户关闭抽屉或取消新建时，未保存草稿会被稳定清理
  3. 点位重选、草稿替换与抽屉关闭的自动化回归覆盖补齐
**Plans**: 1/1 plans complete

Plans:
- [x] 05-01: 修复草稿重选后的残留状态并补齐抽屉关闭回归覆盖

### Phase 6: 历史验证证据补齐与需求追踪回填
**Goal**: 补齐 v1.0 的 phase verification、validation 和 requirements traceability 证据，使 milestone 审计结果可从 gaps_found 收敛到 passed。
**Depends on**: Phase 5
**Requirements**: MAP-01, MAP-02, GEO-01, GEO-02, GEO-03, GEO-04, PNT-01, PNT-02, PNT-03, PNT-04, DRW-01, DRW-02, DRW-03, DRW-04, DAT-01, DAT-02, DAT-03, DAT-04, UX-01, UX-02, UX-03
**Gap Closure**: Closes gaps from audit
**Success Criteria** (what must be TRUE):
  1. Phase 1-4 都具备可审计的 `VERIFICATION.md` 或等效正式验证结论
  2. Phase 1-3 的 validation / Nyquist 状态补齐到可用于 milestone 审计
  3. `REQUIREMENTS.md` 的勾选状态和 traceability 与当前事实一致
  4. 重新运行 `$gsd-audit-milestone` 时，不再因为验证证据缺口而阻塞里程碑归档
**Plans**: 3/3 plans complete

Plans:
- [x] 06-01-PLAN.md — 补齐 Phase 1-2 的 verification 与 Nyquist 证据
- [x] 06-02-PLAN.md — 补齐 Phase 3-4 的 verification 与剩余 validation 证据
- [x] 06-03-PLAN.md — 回填 requirements traceability 并重写 milestone audit verdict

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. 地图基础与应用骨架 | 3/3 | Complete | 2026-03-23 |
| 2. 国家级真实地点识别 | 4/4 | Complete | 2026-03-24 |
| 3. 点位闭环与本地持久化 | 3/3 | Complete | 2026-03-24 |
| 4. 可用性打磨与增强能力 | 3/3 | Complete | 2026-03-24 |
| 5. 草稿取消闭环与点位重选修复 | 1/1 | Complete | 2026-03-24 |
| 6. 历史验证证据补齐与需求追踪回填 | 3/3 | Complete | 2026-03-24 |
