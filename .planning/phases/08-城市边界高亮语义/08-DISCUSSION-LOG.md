# Phase 8: 城市边界高亮语义 - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-25
**Phase:** 08-城市边界高亮语义
**Areas discussed:** 边界主表达、已保存与当前选中的层级、切换与关闭时的归位规则、边界身份的持久化口径、多面域城市如何高亮

---

## 边界主表达

| Option | Description | Selected |
|--------|-------------|----------|
| A | 以“半透明面填充 + 明确描边”作为主表达，小 marker 只在当前选中时作为辅助定位，不再承担主视觉 | ✓ |
| B | 只显示边界，不再显示 marker | |
| C | 边界和 marker 同等强调，一起常驻 | |

**User's choice:** A
**Notes:** 用户确认边界应成为主表达，marker 仅作为当前选中态的辅助定位。

---

## 已保存 / 当前选中 / 草稿 / 回退层级

| Option | Description | Selected |
|--------|-------------|----------|
| A | 已保存城市常驻弱高亮；当前选中城市强化为更亮的填充和描边；未保存草稿只有在确认到具体城市后才显示城市边界；回退到国家/地区时不显示城市边界 | ✓ |
| B | 只有当前选中城市显示边界，已保存城市平时不亮 | |
| C | 已保存和当前选中都很明显，草稿和回退也尽量给边界提示 | |

**User's choice:** A
**Notes:** 用户选择把“已保存常驻层”和“当前选中强化层”分开，同时明确回退到国家/地区时不点亮城市边界。

---

## 切换 / hover / 关闭时的归位规则

| Option | Description | Selected |
|--------|-------------|----------|
| A | 不做 hover 边界预览；边界只跟随“当前选中城市”与“已保存城市常驻层”；切换城市时旧选中边界直接退回已保存态或消失，允许很轻的淡出，但不能残留 | ✓ |
| B | hover 到候选或 marker 时也出现临时边界预览 | |
| C | 关闭面板后保留最后一次选中的强高亮，直到用户点别处 | |

**User's choice:** A
**Notes:** 用户优先选择状态稳定，不引入 hover 预览和关闭后的记忆高亮。

---

## 边界身份持久化口径

| Option | Description | Selected |
|--------|-------------|----------|
| A | 保存城市记录时同时持久化 `cityId + boundaryId (+ boundary dataset version)`；恢复时优先按 `boundaryId` 找边界，找不到再回退到 `cityId`；`v1` 旧点位没有这些字段就不亮城市边界 | ✓ |
| B | 只保存 `cityId`，每次重新用 `cityId` 找最新边界 | |
| C | 只保存 `boundaryId`，把边界当成唯一身份 | |

**User's choice:** A
**Notes:** 用户确认 `cityId` 继续作为城市身份主键，`boundaryId` 负责边界恢复锚点，旧点位不误亮。

---

## 多面域城市边界

| Option | Description | Selected |
|--------|-------------|----------|
| A | 同一 `boundaryId` 下的所有面域一起高亮 | ✓ |
| B | 只亮主城区那一块 | |
| C | 先只亮点击最近的一块，后面再补 | |

**User's choice:** A
**Notes:** 用户明确要求多面域城市整体一起亮，保证真实边界整体语义。

---

## Summary

- 边界高亮成为城市主表达，marker 仅保留为当前选中辅助定位
- 已保存城市采用常驻弱高亮，当前选中城市进一步强化
- 不做 hover 边界预览，不保留关闭后的记忆强高亮
- 持久化采用 `cityId + boundaryId (+ dataset version)` 的恢复口径
- 多面域城市按同一 `boundaryId` 下所有面域整体高亮

