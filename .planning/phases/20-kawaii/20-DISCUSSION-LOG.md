# Phase 20: Kawaii 组件样式全面迁移 - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-09
**Phase:** 20-kawaii
**Areas discussed:** 迁移覆盖范围, 云朵卡片层级, 按钮/徽章甜度层级, 微交互覆盖范围与力度

---

## 迁移覆盖范围

| Option | Description | Selected |
|--------|-------------|----------|
| 1 | 只迁移当前主路径组件，包括 `App` 壳层、popup/card、按钮、notice 与地图中的主交互表面 | ✓ |
| 2 | 主路径组件 + 当前仓库里所有可见但未挂载的 UI 组件 | |
| 3 | 主路径优先，遗留组件只做最小兼容，不追求完整 kawaii 收口 | |

**User's choice:** 1
**Notes:** 用户明确要求先把当前真实运行中的主路径组件做完整，不把 `PosterTitleBlock.vue`、`BackendBaselinePanel.vue` 等未挂载组件扩进 Phase 20。

---

## 云朵卡片层级

| Option | Description | Selected |
|--------|-------------|----------|
| 1 | 云朵效果主要放在 `popup` 外壳 | |
| 2 | 外壳轻一点，主云朵感放在内层卡片 | ✓ |
| 3 | 外壳和内层都做，但分强弱 | |

**User's choice:** 2
**Notes:** 用户确认厚白边、柔光和 floating-cloud 的主视觉应落在内层内容卡，避免 `popup` 外壳与内容卡形成双重厚边框。

---

## 按钮 / 徽章甜度层级

| Option | Description | Selected |
|--------|-------------|----------|
| 1 | 全部统一成高甜彩色 pill | |
| 2 | 保留三档强弱层级：主 CTA、次 CTA、信息徽章 | ✓ |
| 3 | 整体都偏克制，只在点亮按钮上做强烈 kawaii | |

**User's choice:** 2
**Notes:** 用户希望整体都进入 pill 语言，但仍保留明确主次关系，避免所有按钮和徽章都抢同一层注意力。

---

## 微交互覆盖范围与力度

| Option | Description | Selected |
|--------|-------------|----------|
| 1 | 只给按钮做完整微交互，卡片和 marker 基本不动 | |
| 2 | 按钮 + 候选卡 + popup/card 都有轻柔微交互，地图命中元素保持克制 | ✓ |
| 3 | 所有可交互表面都更明显地 Q 弹，包括 marker | |

**User's choice:** 2
**Notes:** 用户接受主 UI 表面统一加入 hover / active 反馈，但要求地图命中元素继续以稳定性优先，避免强弹跳破坏地图体感和定位可靠性。

---

## Deferred Ideas

None.
