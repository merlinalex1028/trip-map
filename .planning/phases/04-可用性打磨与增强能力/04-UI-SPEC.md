---
phase: 04
slug: 可用性打磨与增强能力
status: approved
shadcn_initialized: false
preset: not applicable
created: 2026-03-24
reviewed_at: 2026-03-24T07:21:23Z
---

# Phase 04 — UI Design Contract

> Visual and interaction contract for frontend phases. Generated for Phase 4 usability hardening and city-enhancement entry.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | none |
| Preset | not applicable |
| Component library | none |
| Icon library | none |
| Font | `'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif` |

---

## Visual Hierarchy

| Surface | Focal Point | Contract |
|---------|-------------|----------|
| 地图主视图 | 当前选中点位或新建草稿点位 | 地图仍是第一视觉锚点，抽屉只承接详情，不抢地图主舞台 |
| 点位层级 | `selected` > `draft` > `saved` / `seed` > dimmed background markers | 选中点位靠外圈描边 + 更强发光；草稿点位更暖、更活并带轻微脉冲；其余点位在选中某点后略微退后 |
| 抽屉面板 | 标题区 + 主要操作区 | 打开后先建立“进入面板”语义，长文本不得挤掉标题与底部操作 |

Icon-only actions are not allowed without a text label or equivalent accessible name.

---

## Spacing Scale

Declared values (must be multiples of 4):

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Icon gaps, inline padding, compact labels |
| sm | 8px | Button internals, field gaps, small control spacing |
| md | 16px | Default component spacing, drawer inset, field padding |
| lg | 24px | Card/drawer padding, marker-label separation |
| xl | 32px | Section gaps, poster shell vertical rhythm |
| 2xl | 48px | Page padding, major layout gutters |
| 3xl | 64px | Large screen breathing room and title-to-stage separation |

Exceptions: none

Touch-target exception is implemented with component sizing, not a new spacing token: minimum interactive height/width remains `44px`.

---

## Typography

| Role | Size | Weight | Line Height |
|------|------|--------|-------------|
| Body | 16px | 400 | 1.5 |
| Label | 14px | 600 | 1.4 |
| Heading | 24px | 600 | 1.2 |
| Display | 40px | 600 | 1.1 |

Rules:
- Do not introduce a fifth font size in this phase.
- Do not introduce a third font weight in this phase.
- 回退说明、坐标、状态说明统一使用 `Label` 层级，不新造“caption”尺寸。

---

## Color

| Role | Value | Usage |
|------|-------|-------|
| Dominant (60%) | `#f2e6c9` | Page background, large paper-like surfaces, map atmosphere |
| Secondary (30%) | `#c8b28a` | Drawer surfaces, framed panels, layered cards |
| Accent (10%) | `#c8643b` | Current selected marker ring, draft marker emphasis, primary CTA text/border, focus ring, city-enhancement status chips |
| Destructive | `#8d3e2f` | Delete / hide actions, destructive confirmations only |

Accent reserved for: selected marker halo, draft marker pulse, primary action emphasis, keyboard focus ring, explicit fallback/status chips, and no other elements.

Color behavior contract:
- `saved` / `seed` markers stay in the warm neutral family; do not recolor every marker to accent.
- `selected` gets accent ring + stronger glow.
- `draft` gets accent-forward warm highlight plus motion.
- Non-selected markers may dim slightly when another point is active, but they must remain visible.

---

## Copywriting Contract

| Element | Copy |
|---------|------|
| Primary CTA | 保存旅行地点 |
| Empty state heading | 还没有旅行落点 |
| Empty state body | 点击地图上的有效陆地区域，先创建第一枚旅行地点。 |
| Error state | 当前位置暂时无法稳定识别，请点击更靠近目标区域的位置，或稍后再试。 |
| Destructive confirmation | 删除地点: 确定删除这个地点吗？；隐藏预置地点: 确定隐藏这个预置地点吗？；关闭未保存编辑: 你有未保存的更改，确定关闭吗？ |

Additional state copy:
- 海洋 / 无效陆地：`请点击有效陆地区域`
- 边界不确定：`请点击更靠近目标区域的位置`
- 城市级回退：`未识别到更精确城市，已回退到国家/地区`
- 存档损坏：`检测到本地存档异常，请清空本地存档后继续使用。`
- 存档恢复操作：`清空本地存档`

Copy rules:
- Do not use generic CTA labels such as `Submit`, `OK`, `Click Here`, or bare `Save`.
- 状态说明优先“问题 + 下一步”，避免纯报错语气。
- 城市级“可能位置”只允许轻提示，不允许 warning 级文案。

---

## Interaction Contract

### Marker Interaction
- 键盘聚焦点位时，视觉表现接近悬停态，但必须额外出现清晰 focus ring。
- 点位键盘触发统一为 `Enter`；不要求 `Space` 触发主流程。
- 标签默认只在悬停、聚焦或选中时出现，不做全量常驻。
- `aria-label` 必须包含名称、国家/地区、坐标；草稿点位额外说明“未保存地点”。

### Drawer Interaction
- 打开抽屉时，焦点先落在抽屉标题或抽屉容器本身。
- 抽屉开启后启用焦点限制，`Tab` 不应跑出抽屉。
- `Esc` 在无脏改动时直接关闭；存在未保存更改时触发确认。
- 关闭按钮必须是明确、可聚焦、可见的操作，不得弱化成装饰性文字。

### Long Text + Mobile
- 长简介只允许内容区内部滚动；标题、位置说明和底部操作保持稳定。
- 移动端查看态和编辑态高度整体稳定，不通过大幅高度跳变区分模式。
- 移动端编辑态操作区固定底部；软键盘弹出时优先保证输入框可见。

### City Enhancement
- 城市级增强为静默尝试，不新增独立入口按钮。
- 高置信城市结果：标题显示城市，副标题显示国家/地区，并附可信度说明。
- “可能位置”提示紧贴城市结果本身，保持轻提示样式。
- 城市级未命中但国家/地区有效时，必须显示回退说明，但不得阻断保存。

---

## Accessibility Contract

| Area | Requirement |
|------|-------------|
| Keyboard focus | Every marker, close button, CTA, destructive action, and form field must have visible focus styling using the accent focus ring |
| Screen reader status | Do not announce transient “recognizing” state; do announce city fallback to country/region and unsaved-draft semantics |
| Focus order | Drawer title/container → body content → primary action → secondary/destructive actions |
| Label fallback | Icon-only affordances must include visible text or equivalent accessible name |

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| none | none | not applicable |

---

## Checker Sign-Off

- [x] Dimension 1 Copywriting: PASS
- [x] Dimension 2 Visuals: PASS
- [x] Dimension 3 Color: PASS
- [x] Dimension 4 Typography: PASS
- [x] Dimension 5 Spacing: PASS
- [x] Dimension 6 Registry Safety: PASS

**Approval:** approved 2026-03-24
