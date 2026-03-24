# Milestones

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
