# Phase 26: Overseas Coverage Foundation - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-15T10:40:00Z
**Phase:** 26-overseas-coverage-foundation
**Areas discussed:** 首批覆盖范围, 未支持地区反馈, 海外命名与记录展示, 候选确认交互

---

## 首批覆盖范围

| Option | Description | Selected |
|--------|-------------|----------|
| 东亚 + 东南亚 + 少量远程热门国 | `JP / KR / TH / SG / MY / AE / AU / US`，范围适中，贴近真实出境游路径 | ✓ |
| 欧美主流目的地优先 | `US / CA / GB / FR / IT / ES / DE / AU`，覆盖经典西方旅行国家 | |
| 亚洲优先，先把近场体验做深 | `JP / KR / TH / SG / MY / AE / IN / TR`，更聚焦亚洲周边 | |
| 自定义名单 | 用户自行指定 5-10 个国家/地区 | |

**User's choice:** 东亚 + 东南亚 + 少量远程热门国  
**Notes:** 锁定首批国家/地区为 `JP / KR / TH / SG / MY / AE / AU / US`。

---

## 未支持地区反馈

| Option | Description | Selected |
|--------|-------------|----------|
| Popup 明确说明，不额外弹全局 notice | 反馈贴着当前地点，不让全局提示过吵 | ✓ |
| Popup 说明 + 全局 info notice | 更显眼，但连续点击时可能吵 | |
| 只弹全局 notice | 实现简单，但地点上下文较弱 | |
| 自定义方案 | 用户自行描述交互方案 | |

**User's choice:** Popup 明确说明，不额外弹全局 notice  
**Notes:** 未支持地区仍展示识别结果，但说明应内嵌在 popup 中，而不是走全局提示为主。

---

## 海外命名与记录展示

| Option | Description | Selected |
|--------|-------------|----------|
| 主英文 + 辅助中文类型说明 | `displayName` 用英文 canonical 名，`typeLabel` / `subtitle` 用稳定中文辅助 | ✓ |
| 尽量中文化 | 标题、副标题都优先中文翻译 | |
| 主本地官方名 / 英文名混合 | 各国家按源数据或本地名字混合展示 | |
| 自定义规则 | 用户自行定义命名规则 | |

**User's choice:** 主英文 + 辅助中文类型说明  
**Notes:** 目标是保证海外记录在保存、刷新、重开、跨设备后仍稳定一致。

---

## 候选确认交互

| Option | Description | Selected |
|--------|-------------|----------|
| 只有多候选/边界模糊时才进入确认 | 单一明确命中直接正常展示和点亮 | ✓ |
| 一律让用户确认后才能点亮 | 更保守，但交互更重 | |
| 单一明确命中直接可点亮，但点亮前仍轻确认一次 | 介于自动与保守之间 | |
| 自定义规则 | 用户自行定义确认触发规则 | |

**User's choice:** 只有多候选/边界模糊时才进入确认  
**Notes:** 继续沿用当前 canonical resolve 的最小侵入思路，只在 `ambiguous` 时要求确认。

---

## the agent's Discretion

- 首批国家/地区具体按国家切分还是按数据链路切分计划，由 planner 决定。
- popup 内 unsupported 文案的精确中文表述与视觉层级，由 the agent 决定。
- 海外英文名称的小幅规范化（缩写、连字符、source spelling）可由 researcher / planner 在不破坏一致性的前提下处理。

## Deferred Ideas

- 全球海外 admin1 全量覆盖
- 海外城市级统一覆盖
- 系统级中文/多语言翻译表
- 更复杂的 unsupported 区域帮助中心或同步状态面板
