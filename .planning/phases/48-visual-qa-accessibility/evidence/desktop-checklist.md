# Phase 48 Desktop Screenshot Checklist

Scope: desktop only. Evidence was captured from `http://localhost:5173` at `1440x1180` using the seeded account `visual-qa@example.test` through the normal auth modal.

| Screenshot | Route / state | Core visuals present | Overlap | Truncation | Unreadable text | Long-text risk | Keyboard / focus observation | Reduced-motion observation | Status | Repair owner |
|---|---|---|---|---|---|---|---|---|---|---|
| `desktop-landing.png` | `landing` unauthenticated entry | Full landing artwork, brand, hero copy, register/login actions, treasure panel | none observed | none observed | none observed | no long dynamic text in this state | Login trigger opened the auth modal during capture; auth entry accepted keyboard-fillable email/password fields | Capture run emulated `prefers-reduced-motion: reduce`; route remained operable | pass | none |
| `desktop-map.png` | `/map` authenticated, clicked map result | Leaflet surface, map controls, sidebar, recognition popup, and visible star marker | none observed | sidebar username truncates intentionally with ellipsis | none observed | long seeded username is contained in sidebar profile | Popup close and `留下足迹` CTA are visible; CTA opened date dialog in the capture flow | Capture run emulated `prefers-reduced-motion: reduce`; map and popup remained operable | pass | none |
| `desktop-footprint-dialog.png` | `footprint dialog` opened from `/map` `留下足迹` CTA | Modal overlay, place summary, calendar, quick date buttons, cancel/submit buttons, close control | none observed | none observed | none observed | place name fits; long username is behind inert overlay | Dialog focus path was exercised by opening from CTA; close, cancel, calendar, and submit controls are visible | Capture run emulated `prefers-reduced-motion: reduce`; dialog remained operable | pass | none |
| `desktop-journal.png` | `/journal` authenticated populated journal | Sidebar, journal heading, timeline rail, populated travel cards, thumbnails, note/tag text | none observed | sidebar username truncates intentionally with ellipsis | none observed | long seeded note wraps inside the first card without covering actions | Sidebar navigation to journal worked; visible card action buttons are not covered | Capture run emulated `prefers-reduced-motion: reduce`; route remained operable | pass | none |
| `desktop-memories.png` | `/memories` authenticated populated dashboard | Overview cards, monthly trend chart, country/region distribution chart, yearly trend chart, memories-profile radar chart, ranking | none observed | sidebar username truncates intentionally with ellipsis | none observed | country label `United States` wraps inside legend without overflow | Sidebar navigation to memories worked; filter control and chart/ranking regions are visible | Capture run emulated `prefers-reduced-motion: reduce`; dashboard remained operable | pass | none |

## Rendering Notes

- Leaflet map surface is visible in `desktop-map.png`.
- Star marker is visible in `desktop-map.png` next to the map popup.
- All four ECharts panels are visible in `desktop-memories.png`: monthly trend, country/region distribution, yearly trend, and memories-profile radar.
- No `repair-needed` rows were found in this desktop core-state pass.

## Accessibility Repair Notes

| Owner | Surface | Result | Verification |
|---|---|---|---|
| `48-02-auth-shell-a11y` | Auth entry keyboard/focus/status | pass: login/register tabs expose tablist/tab selection and controls; opening the dialog focuses the selected mode's first field; closing restores focus to `[data-auth-trigger]`; submit failure remains in the dialog and is exposed through `role="alert"` with dialog `aria-describedby`. | `pnpm --filter @trip-map/web test -- src/components/auth/AuthDialog.spec.ts` |
| `48-02-auth-shell-a11y` | Authenticated sidebar navigation/current-route/long username | pass: sidebar active destinations are limited to `map`, `journal`, and `memories` with labels `世界足迹`, `旅途手账`, `旅途回忆`; active links expose `aria-current="page"`; the fixed QA username `视觉 QA 长用户名用于验证侧栏文本不会溢出` is rendered in a `max-w-full truncate` container inside the 280px sidebar. | `pnpm --filter @trip-map/web test -- src/components/shell/AuthenticatedAppShell.spec.ts`; `grep -n "aria-current" apps/web/src/components/shell/ShellSidebar.vue apps/web/src/components/shell/AuthenticatedAppShell.spec.ts` |
