# Roadmap: 旅行世界地图

## Milestones

- ✅ **v1.0 MVP** — Phases 1-6，已于 2026-03-24 归档  
  Archive:
  [ROADMAP](/Users/huangjingping/i/trip-map/.planning/milestones/v1.0-ROADMAP.md)
  [REQUIREMENTS](/Users/huangjingping/i/trip-map/.planning/milestones/v1.0-REQUIREMENTS.md)
  [AUDIT](/Users/huangjingping/i/trip-map/.planning/milestones/v1.0-MILESTONE-AUDIT.md)
- 🚧 **v2.0 城市主视角与可爱风格重构** — Phases 7-10，当前 milestone

## Overview

v2.0 把主链路从“国家/地区级点位记录”升级为“城市优先选择 -> 真实城市边界高亮 -> popup 摘要交互 -> 统一可爱风格”。阶段划分只覆盖本 milestone 的 16 条 v2.0 需求，并严格限制在离线城市识别、边界表达、轻量交互和地图主舞台视觉重构范围内，不扩展到在线 API、地图引擎重写、同步分享或无关站点改版。

## Phases

- [x] **Phase 7: 城市选择与兼容基线** - 让城市成为稳定主选择结果，同时守住旧数据兼容与重复记录控制。
- [x] **Phase 8: 城市边界高亮语义** - 用真实城市边界承接选中与保存结果，建立一致的区域表达。 (completed 2026-03-26)
- [ ] **Phase 9: Popup 主舞台交互** - 将轻量 popup 变成地图上下文中的主入口，并保留完整详情接力。
- [ ] **Phase 10: 可爱风格与可读性收口** - 完成原创可爱风视觉统一，同时验证状态辨识和交互可靠性。

## Phase Details

### Phase 7: 城市选择与兼容基线
**Goal**: 用户可以以城市为主要目标完成选择、消歧、回退和复用，同时 v1 旧点位继续可用
**Depends on**: Phase 6
**Requirements**: DEST-01, DEST-02, DEST-03, DEST-04, DEST-05, DAT-05
**Success Criteria** (what must be TRUE):
  1. 用户点击地图后，在置信度足够时首先得到城市级结果，而不是默认停留在国家或地区级结果。
  2. 用户可以通过城市候选或搜索入口确认目标城市；遇到同名城市或边界歧义时，候选会带国家或上级区域信息帮助确认。
  3. 当系统无法可靠确认城市时，用户会看到明确提示，并仍可回退到国家或地区级结果继续记录。
  4. 用户再次选择已记录城市时，系统优先定位到现有记录；升级到 v2.0 后，现有 v1 本地点位仍可正常查看和编辑，不会被强制迁移成具体城市。
**Plans**: 5 plans
Plans:
- [x] 07-01-PLAN.md — 建立稳定 `cityId`、候选排序与旧快照兼容基线
- [x] 07-02-PLAN.md — 接入候选确认抽屉、回退 CTA 与统一复用流
- [x] 07-03-PLAN.md — 扩充离线城市索引并把搜索升级为可用的离线检索
- [x] 07-04-PLAN.md — 用 coverage-audited 的离线城市目录替换 43 城样例库
- [x] 07-05-PLAN.md — 让 lookup、search 与候选抽屉全部消费扩展目录并补齐 UAT 级回归
**UI hint**: yes

### Phase 8: 城市边界高亮语义
**Goal**: 用户选中的城市和已保存城市记录都以真实边界一致呈现，并在状态切换中保持稳定
**Depends on**: Phase 7
**Requirements**: BND-01, BND-02, BND-03, DAT-06
**Success Criteria** (what must be TRUE):
  1. 用户选中城市后，地图以真实城市边界整体高亮该城市，而不是只显示单个点状 marker 作为主表达。
  2. 用户在 popup、详情面板和保存结果中看到的城市身份，与地图上被高亮的城市边界保持一致。
  3. 用户在 hover、选中、关闭 popup、切换城市或返回已有点位时，城市边界高亮状态切换稳定，不会残留错误面域。
  4. 用户保存 v2.0 城市记录并在后续重新打开时，系统能恢复同一城市身份与对应边界高亮语义。
**Plans**: 4 plans
Plans:
- [x] 08-01-PLAN.md — 建立离线边界数据契约与 `boundaryId` 持久化骨架
- [x] 08-02-PLAN.md — 接入 store 派生边界状态与地图真实边界 overlay
- [x] 08-03-PLAN.md — 补齐 reopen / switch / close / fallback / multi-area 回归
- [x] 08-04-PLAN.md — 扩大当前主链路边界覆盖并补 unsupported 城市语义护栏
**UI hint**: yes

### Phase 9: Popup 主舞台交互
**Goal**: 用户可以在地图上下文中通过轻量 popup 完成高频操作，再按需进入完整详情或编辑
**Depends on**: Phase 8
**Requirements**: POP-01, POP-02, POP-03
**Success Criteria** (what must be TRUE):
  1. 用户选中城市或已有点位后，可以看到锚定在地图上下文中的悬浮 popup 摘要卡。
  2. 用户可以在 popup 中完成高频快捷操作，并通过显式入口进入完整详情或编辑视图。
  3. 用户在移动端使用时，popup 会自动避开视口边缘，必要时回退为安全的底部 peek 或等效轻量展示。
**Plans**: 3 plans
Plans:
- [x] 09-01-PLAN.md — 拆分 summary/deep surface 契约并抽共享摘要卡
- [ ] 09-02-PLAN.md — 接入桌面 anchored popup 与地图内锚点定位
- [ ] 09-03-PLAN.md — 补移动端 peek 回退、布局迁移与边界稳定性回归
**UI hint**: yes

### Phase 10: 可爱风格与可读性收口
**Goal**: 地图、边界、marker、popup 和详情表面形成统一原创可爱风格，同时不牺牲可读性和交互可靠性
**Depends on**: Phase 9
**Requirements**: VIS-01, VIS-02, VIS-03
**Success Criteria** (what must be TRUE):
  1. 用户在地图、城市边界、marker、popup、详情面板和主要按钮中看到统一的原创二次元美少女可爱风格。
  2. 用户在桌面端和移动端都能清晰区分未记录、已记录、当前选中和低置信度回退等关键状态，不会因新风格降低可读性。
  3. 用户进行地图点击、marker 点击和 popup 操作时，装饰图层和反馈动效不会遮挡命中区域或破坏交互。
**Plans**: TBD
**UI hint**: yes

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 7. 城市选择与兼容基线 | v2.0 | 5/5 | Complete | 2026-03-25 |
| 8. 城市边界高亮语义 | v2.0 | 4/4 | Complete | 2026-03-26 |
| 9. Popup 主舞台交互 | v2.0 | 1/3 | In Progress | - |
| 10. 可爱风格与可读性收口 | v2.0 | 0/TBD | Not started | - |
