# Phase 10: 可爱风格与可读性收口 - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-27
**Phase:** 10-可爱风格与可读性收口
**Areas discussed:** 风格母题与角色化程度、地图舞台改造力度、状态辨识主手段、装饰与动效预算

---

## 风格母题与角色化程度

| Option | Description | Selected |
|--------|-------------|----------|
| 轻旅行手账 + 少女感细节 | 推荐方向。用旅行手账气质承接地图产品，用少女感细节建立原创可爱风，不做强角色系统。 | ✓ |
| 软糖果 / 贴纸拼贴感 | 更活泼，但如果铺得太满，容易压住地图信息。 | |
| 明确陪伴角色感 | 更强二次元角色气质，但需要额外角色设定与视觉锚点，范围更大。 | |

**User's choice:** `1A`
**Notes:** 用户确认 Phase 10 的整体可爱风应偏“轻旅行手账 + 少女感细节”，不走强 IP 或强陪伴角色路线；补充整体颜色倾向为“暖粉、淡蓝”。

---

## 地图舞台改造力度

| Option | Description | Selected |
|--------|-------------|----------|
| 地图本体偏中性，只重做边框、边界、marker、popup、标题氛围 | 风险最低，性能和可读性最稳。 | |
| 地图底图也做中度可爱化 | 柔化海洋/陆地色彩、加入轻纹理与氛围处理，但不改变地图语义。 | ✓ |
| 地图本体强卡通化 | 风格最强，但更容易影响边界阅读、命中识别和整体稳定性。 | |

**User's choice:** `2B`
**Notes:** 用户确认地图底图可以做中度可爱化，但接受“底图本体只做柔和彩色和轻纹理，不做会干扰识别的大贴纸覆盖”；可爱风主压力仍应主要落在边框、边界、marker、popup、按钮和标题氛围上。

---

## 状态辨识主手段

| Option | Description | Selected |
|--------|-------------|----------|
| 颜色 + 轮廓/描边 + badge 文案，动效只做辅助 | 最稳，最容易满足 `VIS-02`。 | |
| 颜色为主，状态差异尽量柔和 | 更统一，但关键状态的区分风险更高。 | |
| 颜色之外再叠加强纹理/贴纸/图标语义 | 状态辨识更强，但需要控制噪音与一致性。 | ✓ |

**User's choice:** `3C`
**Notes:** 用户接受更强的状态视觉合同，不只靠配色区分；并确认状态主配色映射为：当前选中 = 暖粉主高亮，已记录 = 淡蓝/蓝绿次高亮，低置信回退 = 更浅更冷的蓝灰提示态，未记录 = 中性浅底。

---

## 装饰与动效预算

| Option | Description | Selected |
|--------|-------------|----------|
| 轻量点缀 | 只在局部提供可爱反馈，最稳。 | |
| 中等动效 | 允许更明显的呼吸、漂浮、闪烁，但仍以克制为主。 | |
| 明显装饰化 | 允许更强贴纸感、闪光感和进出场氛围，但必须继续避免遮挡命中区。 | ✓ |

**User's choice:** `4C`
**Notes:** 用户接受明显装饰化与更积极的动效预算，但明确同意这些装饰主要集中在边框、边界、marker、popup、按钮和标题氛围；地图底图本体不应承担大面积覆盖性装饰，以免干扰识别和交互。

---

## 后续范围确认

**Decision:** 用户在后续 planning gate 中明确确认：`Phase 10 不考虑移动端，按 desktop-only 规划。`

**Notes:** 该决定用于消解 `ROADMAP.md` / `REQUIREMENTS.md` 的旧移动端 wording 与 `STATE.md`、`10-UI-SPEC.md` 中最新 desktop-only 基线之间的冲突。自此，Phase 10 的正式执行范围按“desktop anchored popup + deep drawer only”收口，不重新引入 `MobilePeekSheet` 或移动端兼容壳层。
