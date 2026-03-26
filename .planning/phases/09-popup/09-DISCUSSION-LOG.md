# Phase 9: Popup 主舞台交互 - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-26
**Phase:** 9-Popup 主舞台交互
**Areas discussed:** Popup 出现时机与详情接力, Popup 允许的快捷操作, 桌面锚点与移动端回退, Popup 摘要信息密度

---

## Popup 出现时机与详情接力

| Option | Description | Selected |
|--------|-------------|----------|
| 候选确认仍用现有 drawer，确认后进入 popup，完整详情再进入 drawer | 改动最稳，保留当前轻确认流，再把结果摘要迁到 popup | |
| 候选确认也改成 popup，所有轻交互都塞进 popup | 让地图主舞台成为统一入口，但 popup 需要承接候选搜索、回退提示和歧义确认 | ✓ |
| 只给已保存点位做 popup，新识别草稿仍走 drawer | 改动最小，但用户会面对两套主入口 | |

**User's choice:** 候选确认也改成 popup，所有轻交互都尽量留在地图主舞台。
**Notes:** drawer 继续存在，但转为完整详情或编辑的显式接力面；popup 不再只是结果摘要，而要覆盖候选确认和回退入口。

---

## Popup 允许的快捷操作

| Option | Description | Selected |
|--------|-------------|----------|
| 只放最保守操作 | 只保留确认、保存、查看详情、关闭，删除和隐藏继续留在 drawer | |
| 放高频但低风险操作 | 保存、点亮切换和编辑入口进入 popup，删除和隐藏留在 drawer | |
| 尽量全放进 popup | 连删除和隐藏这类破坏性动作也可直接在 popup 执行，drawer 更偏完整内容与深层编辑 | ✓ |

**User's choice:** 尽量全放进 popup。
**Notes:** popup 被定位为地图主舞台里的轻操作中枢，而不是只读摘要卡；后续实现仍需补误触与确认防护。

---

## 桌面锚点与移动端回退

| Option | Description | Selected |
|--------|-------------|----------|
| 统一锚定点击点或 marker | 桌面和移动都尽量贴当前点击或 marker，主舞台感最强，但移动端风险高 | |
| 桌面端地图内锚定，移动端自动回退底部 peek | 桌面端跟随地图对象，移动端优先安全和可点性 | ✓ |
| 统一做固定位置浮层 | 桌面固定角落，移动固定底部，实现简单但锚定感较弱 | |

**User's choice:** 桌面端地图内锚定，移动端自动回退到底部 `peek`。
**Notes:** 这是对 `POP-03` 的直接落地选择；碰撞检测和回退阈值留给后续实现细化。

---

## Popup 摘要信息密度

| Option | Description | Selected |
|--------|-------------|----------|
| 极简卡片 | 只显示名称、地区和少量主按钮，最轻但承载力不足 | |
| 中等密度摘要卡 | 展示身份信息、状态提示、简短摘要和一排快捷操作，兼顾信息量与舞台感 | ✓ |
| 高密度轻面板 | 坐标、回退说明、边界支持提示、简介和操作都塞进 popup，接近压缩版 drawer | |

**User's choice:** 中等密度摘要卡。
**Notes:** popup 需要能承接候选确认和高频操作，但不应重新长成小抽屉；深层内容继续交给 drawer。

---

## Summary

- popup 将成为候选确认、草稿摘要和已保存点位摘要的统一地图主入口。
- popup 允许直接承接接近完整的高频操作集合，包括破坏性动作。
- 桌面端保持地图内锚定，移动端必要时回退到底部 `peek`。
- 信息密度保持中等，不做极简气泡，也不做压缩版 drawer。
