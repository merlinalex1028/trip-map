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
- [ ] **Phase 3: 点位闭环与本地持久化** - 完成点位 CRUD、详情抽屉与本地数据合并保存
- [ ] **Phase 4: 可用性打磨与增强能力** - 完善异常处理、边界体验、可访问性与城市级扩展入口

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
**Plans**: 3/3 plans complete

Plans:
- [x] 02-01: 实现固定投影下的坐标采集与 `x/y <-> lng/lat` 转换
- [x] 02-02: 接入国家边界数据并完成国家级命中与异常提示
- [x] 02-03: 修复投影框错位并补齐东亚点击识别回归覆盖

### Phase 3: 点位闭环与本地持久化
**Goal**: 让用户可以基于识别结果完整创建、编辑、删除旅行点位，并在刷新后保留数据。
**Depends on**: Phase 2
**Requirements**: MAP-03, PNT-01, PNT-02, PNT-03, PNT-05, DRW-03, DAT-02, DAT-03
**Success Criteria** (what must be TRUE):
  1. 用户点击识别成功的位置后可以创建新的旅行点位
  2. 用户可以在详情面板中编辑名称、简介和点亮状态
  3. 用户可以删除自建点位，取消新建时不会留下空点位
  4. 用户刷新页面后仍能看到自己的点位与编辑结果
**Plans**: 3 plans

Plans:
- [ ] 03-01: 建立 `MapPoint` 状态管理与点位 CRUD 流程
- [ ] 03-02: 实现详情抽屉编辑表单与保存/删除/取消闭环
- [ ] 03-03: 完成 `seed + localStorage` 合并、版本与回退逻辑

### Phase 4: 可用性打磨与增强能力
**Goal**: 提升交互可靠性和可访问性，补齐边界与降级逻辑，并为城市级识别预留增强入口。
**Depends on**: Phase 3
**Requirements**: GEO-04, PNT-04, DRW-04, DAT-04, UX-01, UX-02, UX-03
**Success Criteria** (what must be TRUE):
  1. 选中点位与普通高亮点位有清晰区分
  2. 键盘焦点、关闭逻辑和长文本布局表现稳定
  3. 本地存储异常时应用能安全回退
  4. 城市级识别即使未命中，也不会影响国家级结果创建
**Plans**: 2 plans

Plans:
- [ ] 04-01: 完成可访问性、焦点态、边界点击和面板关闭行为打磨
- [ ] 04-02: 补齐异常降级、城市级回退与整体视觉反馈优化

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. 地图基础与应用骨架 | 3/3 | Complete | 2026-03-23 |
| 2. 国家级真实地点识别 | 3/3 | Complete | 2026-03-24 |
| 3. 点位闭环与本地持久化 | 0/3 | Not started | - |
| 4. 可用性打磨与增强能力 | 0/2 | Not started | - |
