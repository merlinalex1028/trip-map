# Milestones

## v2.0 城市主视角与可爱风格重构 (Shipped: 2026-03-27)

**Phases completed:** 4 phases, 17 plans, 31 tasks

**Key accomplishments:**

- 城市选择链路已从国家/地区兜底模式升级为稳定 `cityId` 驱动的城市优先确认、搜索与复用流。
- 离线城市目录与候选排序能力已扩展到真实可用覆盖面，不再局限于最初的演示城市集合。
- 地图主表达已从单点 marker 升级为真实城市边界高亮，并通过 `boundaryId` 持久化保持 reopen / switch / fallback 语义稳定。
- `PointSummaryCard + MapContextPopup + PointPreviewDrawer` 形成了稳定的 summary/deep surface 分工，popup 成为桌面主舞台中的主入口。
- popup 长内容滚动问题已经收口到摘要卡中部内容区，头部身份信息和底部动作保持稳定可达。
- 地图舞台、marker、popup 和 deep drawer 已完成统一的原创可爱风视觉收口，同时保留四态辨识、命中安全和 reduced-motion 护栏。
- `POP-03` 已通过正式 desktop-only 范围对齐闭环，v2.0 里程碑审计最终收敛为 `passed`。

---

## v1.0 MVP (Shipped: 2026-03-24)

**Phases completed:** 6 phases, 17 plans, 20 tasks

**Key accomplishments:**

- Poster 风格的 Vue 应用骨架、全局设计 token 与可运行测试基线已经落地。
- 海报式世界地图舞台、预置示例点位与本地预览点位加载链路已经接入首页。
- 点击点位即可打开响应式地点预览抽屉，Phase 1 的地图预览交互已经闭环。
- 地图点位层级与预览抽屉现在具备稳定的键盘语义、关闭行为和长文本承载能力
- 国家级识别主链路现在可带保守城市增强信息，并在旧快照、错误版本和城市未命中时保持可解释且可恢复
- 城市增强命中区已从几乎不可点中调整为符合整张世界地图手动点击尺度，并补上对应回归保护
- Pinia 点位状态机现在会在重选 seed/saved 点位时同步清空旧 draft，并由交互回归锁住“草稿新建 -> 重选已有点位 -> 关闭抽屉”的完整闭环
- Phase 1-2 现在拥有可被里程碑审计直接消费的 validation、verification 与 requirement traceability 证据链
- Phase 3-4 的 CRUD、持久化、可访问性、城市增强与恢复路径，现在都具备可审计的 verification / validation / traceability 证据
- v1 requirements 的 traceability 已回到真实 phase ownership，里程碑审计也从 `gaps_found` 收口为 `passed`

---
