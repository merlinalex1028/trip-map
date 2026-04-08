# Phase 19: tailwind-token - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-08
**Phase:** 19-tailwind-token
**Areas discussed:** Token 词表, 字体层级, 本阶段迁移边界, Leaflet 对齐力度

---

## Token 词表

| Option | Description | Selected |
|--------|-------------|----------|
| A | 只暴露基础色族 `sakura / mint / lavender / cream`，现有语义变量先继续留在普通 CSS variable 层 | ✓ |
| B | 同时建立基础色族 + 一层语义 token（如 selected / saved / fallback / surface）并让 Tailwind 也能直接消费 | |
| C | 直接以语义 token 为主，颜色名只保留最少别名 | |

**User's choice:** A
**Notes:** 用户接受先完成基础色族打通，把语义桥接推迟到 Phase 20，优先保证 Phase 19 的基础设施可用性和迁移稳定性。

---

## 字体层级

| Option | Description | Selected |
|--------|-------------|----------|
| A | 全站默认都切到 `Nunito Variable`，标题也先统一用它 | ✓ |
| B | 正文默认 `Nunito Variable`，标题/徽章继续保留现有 display 字体链，只把默认 sans 切成 Nunito | |
| C | 先只把 Tailwind `font-sans` 配成 Nunito，但暂时不改现有全局字体入口，等 Phase 20 一起收口 | |

**User's choice:** A
**Notes:** 用户希望 Phase 19 就让全站出现明确的圆润字体变化，而不是只在局部或工具类层面预埋 Nunito。

---

## 本阶段迁移边界

| Option | Description | Selected |
|--------|-------------|----------|
| A | 只做基础设施：Tailwind v4、`style.css`、字体导入、Leaflet 安全兼容，不主动迁任何现有组件 | |
| B | 在 A 基础上，顺手把 `App.vue` 外壳层做成“最小 Tailwind 样板”，给 Phase 20 当迁移模板 | ✓ |
| C | 再多走一步，把 `App.vue` + 一个 popup/card 组件一起迁一部分 | |

**User's choice:** B
**Notes:** 用户接受 Phase 19 在不越界的前提下先迁 `App.vue` 壳层，既验证 Tailwind token/字体/背景链路，也给 Phase 20 留下明确样板。

---

## Leaflet 对齐力度

| Option | Description | Selected |
|--------|-------------|----------|
| A | Phase 19 只保证 Leaflet 在 preflight 后完全不坏，视觉上尽量保持现在这样 | ✓ |
| B | 在 A 基础上，允许很轻的字体/颜色继承对齐，但不改控件结构和尺寸 | |
| C | 直接把 Leaflet 控件也纳入本阶段的 kawaii 视觉收口 | |

**User's choice:** A
**Notes:** 用户明确把 Leaflet 放在“稳定性优先”的护栏内，本阶段不追求控件 kawaii 化，先确保 preflight 兼容和现有地图体验不退化。

---

## the agent's Discretion

- 基础色族的具体 shade 数量与色阶命名。
- `style.css` 与现有 `tokens.css` / `global.css` 的合并或过渡组织方式。
- `App.vue` 最小 Tailwind 样板的具体迁移粒度，只要不触及更深组件范围。

## Deferred Ideas

None.
