---
status: draft
phase: 27
name: Multi-Visit Record Foundation
last_updated: 2026-04-17
---

# UI Specification: Multi-Visit Record Foundation

This document defines the visual and interaction contract for Phase 27, focused on upgrading travel records to support multiple visits per location with specific dates.

## 1. Design System & Tokens

**Source:** Detected from `apps/web/src/styles/tokens.css`

### 1.1 Spacing
- **Base Scale:** 8-point scale (multiples of 4)
- **Small Gaps:** 4px (`--space-xs`), 8px (`--space-sm`)
- **Standard Layout:** 16px (`--space-md`)
- **Card Padding:** 24px (`--space-lg`)
- **Large Sections:** 32px (`--space-xl`)

### 1.2 Typography
- **Headings/Display:** `--font-heading-size` (24px), weight 700, line-height 1.2
- **Body/Label:** `--font-body-size` (16px) or `--font-label-size` (14px), weight 400, line-height 1.5
- **Fonts:** `Nunito Variable`, `Noto Sans SC` (Sans-serif)

### 1.3 Color Palette (60/30/10 Split)
- **Dominant (60%):** `--color-surface` (#fdf5ff) - Popup background & main cards.
- **Secondary (30%):** `--color-secondary` (#84c7d8) - "Visited" badges, informational labels.
- **Accent (10%):** `--color-accent` (#f48fb1) - Primary CTA ("Add visit"), date highlights.
- **Destructive:** `--color-destructive` (#c86464) - "Unlight" action.
- **Ink:** `--color-ink-strong` (#57425f) - Primary text.

## 2. Component Inventory

### 2.1 Map Popup / Mobile Drawer (`PointSummaryCard`)
- **Header:** Location Name + `已去过 {N} 次` badge (if N > 0).
- **Summary Area:** Shows `最近一次: {DateRange}` if N > 0.
- **Action Button:** `记一次新旅行` (Primary CTA) or `再记一次去访` (if already visited).
- **Expandable Form:** Inline date picker form when CTA is clicked.

### 2.2 Travel Date Form (New)
- **Inputs:**
    - **开始日期 (Start Date):** Mandatory. Native date picker styled with `--radius-control` and `--color-surface-soft`.
    - **结束日期 (可选) (End Date):** Optional. Same styling as Start Date.
- **Validation:** "结束日期不能早于开始日期".
- **CTA:** `保存去访` (Success button).

### 2.3 Visit Summary Badge
- **Style:** `--radius-pill`, background `--color-secondary-soft`, border `--color-secondary`.
- **Text:** `第 N 次去访` (Nth visit).

## 3. Interaction Patterns

### 3.1 Adding a Visit
1. **Trigger:** Click a point on the map.
2. **State A (Identified, not visited):** Shows "Illuminate" button. Clicking it expands the date form immediately.
3. **State B (Already visited):** Shows summary (`已去过 {N} 次`, `最近一次: {DateRange}`) + `再记一次去访` button.
4. **Action:** Click `再记一次去访` -> Inline form expands below the summary.
5. **Confirmation:** User picks dates -> Click `保存去访` -> Success toast -> Popup updates to show new summary.

### 3.2 Date Selection Logic
- Single day visit: Start Date filled, End Date empty.
- Multi-day visit: Both Start and End Date filled.
- Date Unknown (Migration): Only shows "Date Unknown" text, no editing for now (out of scope).

### 3.3 Responsive Behavior
- **Desktop (> 768px):** Uses the standard Leaflet `MapContextPopup` (floating anchor).
- **Mobile (<= 768px):** Uses a **Bottom Drawer** (Sheet) that slides up from the bottom, providing a larger touch target for date selection.
- **Transition:** Seamless hand-off between point selection and drawer/popup display.

## 4. Copywriting Contract

| Scenario | Text / Label | Tone |
|----------|--------------|------|
| Primary CTA (New) | 记一次新旅行 | Welcoming, Action-oriented |
| Primary CTA (Repeat) | 再记一次去访 | Encouraging, Lightweight |
| Date Input Label | 开始日期 | Neutral |
| Date Input Label | 结束日期 (可选) | Neutral |
| Save Button | 保存去访 | Confident |
| Visit Summary | 已去过 {N} 次 | Informational |
| Latest Visit | 最近一次: {DateRange} | Informational |
| Error Message | 结束日期不能早于开始日期 | Helpful |
| Empty (N=0) | 尚未记录过去访日期 | Neutral |

## 5. Visual Theme: Kawaii / Anime Style
- **Corners:** Large radii (`--radius-surface`: 24px) for the popup/drawer.
- **Gradients:** Subtle gradients on buttons (`--gradient-accent`, `--gradient-saved`).
- **Shadows:** Soft, deep shadows for floating popups (`--shadow-float`).
- **Animations:** 140ms (`--motion-quick`) for hover states, 180ms (`--motion-emphasis`) for form expansion.

## 6. Safety Gate (shadcn Registry)
- **Registry:** None (Custom Vue components).
- **Third-party Blocks:** None.
- **Vetting Status:** Not applicable.

## 7. Accessibility Contract

### 7.1 Aria Labels
- **Visit History Badge:** `aria-label="去访历史：共 {N} 次"`
- **Start Date Input:** `aria-label="选择旅行开始日期"`
- **End Date Input:** `aria-label="选择旅行结束日期（可选）"`
- **Save Button:** `aria-label="保存此次旅行记录"`

### 7.2 Keyboard & Focus
- **Form Expansion:** When the date form expands, focus should move to the "开始日期" input.
- **Submission:** Pressing "Enter" in date fields should trigger the "保存去访" action if valid.
- **Escape:** "Esc" should collapse the form or close the popup/drawer.

---
*Updated by GSD UI Researcher: 2026-04-17*
*Verified against CONTEXT.md and REQUIREMENTS.md*
