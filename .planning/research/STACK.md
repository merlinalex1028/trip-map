# Technology Stack

**Project:** trip-map v4.0 — Tailwind CSS + Kawaii UI
**Researched:** 2026-04-08
**Scope:** Additions to `apps/web` only — backend and contracts untouched

---

## Decision: Tailwind v4 (not v3)

Use **Tailwind CSS v4** (`tailwindcss@4.2.2`) via the `@tailwindcss/vite` plugin.

**Why v4, not v3:**
- `@tailwindcss/vite@4.2.2` explicitly declares `peerDependencies: { vite: "^5.2.0 || ^6 || ^7 || ^8" }` — the project runs Vite 8, fully supported. Verified against npm registry (HIGH confidence).
- v4 drops `tailwind.config.js` entirely. All theme customisation lives in CSS via `@theme {}` blocks — a perfect fit because the design tokens are already in `tokens.css` as CSS custom properties. No JS config file to maintain.
- v4 uses the Oxide (Rust) engine. No separate `postcss.config.js` is needed; `@tailwindcss/vite` IS the PostCSS pipeline.
- v3 (`v3-lts: 3.4.19`) is in maintenance mode. Choosing it means migrating again later and forgoing native Vite 8 plugin support.
- The only reason to choose v3 would be compatibility with a third-party component library that requires it. This project uses no third-party component library, so that concern does not apply.

---

## Recommended Stack Additions

### Core — Tailwind CSS

| Package | Version | Role | Why |
|---------|---------|------|-----|
| `tailwindcss` | `^4.2.2` | Utility CSS engine | Latest stable, Oxide engine, CSS-first `@theme` config |
| `@tailwindcss/vite` | `^4.2.2` | Vite integration | Official plugin, peer-dep covers Vite `^8`, zero PostCSS config |

**Installation (devDependencies scoped to `apps/web`):**
```bash
pnpm --filter @trip-map/web add -D tailwindcss @tailwindcss/vite
```

**`apps/web/vite.config.ts` — add plugin before `vue()`:**
```typescript
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [tailwindcss(), vue()],
  // ... rest unchanged
})
```

**CSS entry — add one line at the very top of `global.css`:**
```css
@import "tailwindcss";
```

This single directive replaces the old three-directive pattern (`@tailwind base/components/utilities`). Tailwind v4 injects preflight, components, and utilities from the one import.

### Fonts — Fontsource Variable

| Package | Version | Font | Why |
|---------|---------|------|-----|
| `@fontsource-variable/nunito` | `^5.2.7` | Primary UI font | Self-hosted, no Google CDN, variable font = one `.woff2` covers weights 200–900 |
| `@fontsource-variable/quicksand` | `^5.2.10` | Display / heading accent | Rounder letterforms, ideal for kawaii headings, variable weight range |

**Why variable over static (`@fontsource/nunito`):**
Variable font packages ship one `.woff2` file covering the full weight range. The kawaii design uses weights 400–800 across body and display contexts. The variable package gives ~60% smaller total font payload with no extra per-weight imports.

**Why not `@fontsource/varela-round`:**
Varela Round has no variable font variant and only ships weight 400. It cannot serve headings at 700–800. Skip it; Nunito + Quicksand cover all needed weights.

**Installation (runtime dependencies — fonts are loaded at runtime):**
```bash
pnpm --filter @trip-map/web add @fontsource-variable/nunito @fontsource-variable/quicksand
```

**Import in `apps/web/src/main.ts`:**
```typescript
import '@fontsource-variable/nunito'
import '@fontsource-variable/quicksand'
```

---

## Tailwind v4 Theme Integration with Existing Tokens

The existing `tokens.css` defines ~50 CSS custom properties (`--color-accent`, `--radius-card`, `--shadow-surface`, etc.). In Tailwind v4 these are exposed as utility classes by declaring them inside a `@theme` block in `global.css`:

```css
@import "tailwindcss";

@theme {
  /* Colors — become bg-*, text-*, border-* utilities */
  --color-accent: #f48fb1;
  --color-accent-strong: #ff78ad;
  --color-accent-soft: #ffdcea;
  --color-secondary: #84c7d8;
  --color-secondary-soft: #dff5fb;
  --color-lilac: #dbc4ff;
  --color-lemon: #fff1a8;
  --color-mint: #d8f6e8;
  --color-ink-strong: #57425f;
  --color-ink-muted: #7f6a86;
  --color-ink-soft: #9a87a0;
  --color-page: #fff7fb;
  --color-surface: #fdf5ff;

  /* Border radius — become rounded-* utilities */
  --radius-surface: 24px;
  --radius-control: 18px;
  --radius-card: 28px;
  --radius-bubble: 32px;
  --radius-pill: 999px;

  /* Font families */
  --font-family-body: 'Nunito Variable', 'Noto Sans SC', sans-serif;
  --font-family-display: 'Quicksand Variable', 'Hiragino Maru Gothic ProN', sans-serif;
}
```

**v4 naming rule:** Tailwind v4 maps `@theme` variables to utilities by stripping the CSS category prefix:
- `--color-accent` → `bg-accent` / `text-accent` / `border-accent`
- `--radius-card` → `rounded-card`
- `--font-family-body` → `font-body`

This is automatic — no extra config. The `tokens.css` file can be kept as a separate import for raw CSS variable usage in scoped styles; the `@theme` block in `global.css` is additive.

---

## What NOT to Add

| Package | Reason to Avoid |
|---------|----------------|
| `autoprefixer` | Not needed — `@tailwindcss/vite` handles vendor prefixes internally via the Oxide engine |
| `postcss` / `postcss.config.js` | Not needed — the Vite plugin IS the PostCSS pipeline |
| `tailwind.config.js` / `tailwind.config.ts` | v4 uses CSS-first `@theme {}` blocks; JS config file is not used and will be ignored |
| `@tailwindcss/typography` | Not needed for kawaii redesign; no markdown prose rendering required |
| `@tailwindcss/forms` | Not needed; form elements are styled directly with utilities |
| `framer-motion` | Not needed — all kawaii animations (`scale-105`, `-translate-y-1`, `transition`) are pure Tailwind utilities + CSS transitions. No JS animation runtime needed for hover/active. |
| `@vueuse/motion` | Same reason as framer-motion — over-engineering for hover/active/transition effects |
| `animejs` | Same reason — CSS transitions at 300ms bouncy cover all kawaii animation requirements |
| `daisyUI` / `shadcn-vue` / `headlessui` | No component library needed. These impose their own token systems and fight with custom kawaii tokens. |
| `tailwindcss@3.x` alongside v4 | They conflict — never install both in the same package |

---

## Conflict Analysis

| Concern | Assessment |
|---------|-----------|
| Vite 8 + `@tailwindcss/vite@4.2.2` | NO CONFLICT — peer dep explicitly lists `^8` (verified npm registry) |
| Existing `tokens.css` CSS variables | NO CONFLICT — `@theme` tokens are additive; raw `var(--color-*)` usage in scoped styles continues to work |
| Leaflet CSS overrides | WATCH — Tailwind's preflight resets `display: block` on `img` and SVG. The existing `global.css` already has `.leaflet-container svg { max-width: none; max-height: none; }` and `svg:not(.leaflet-zoom-animated)` overrides. These must appear AFTER `@import "tailwindcss"` to take precedence over preflight. Keep them at the bottom of `global.css`. |
| `vue-tsc` / TypeScript | NO CONFLICT — Tailwind is pure CSS tooling with no TypeScript surface |
| Monorepo scope | NO CONFLICT — packages install into `apps/web/node_modules`; `apps/server` and `packages/contracts` are unaffected |
| pnpm workspace hoisting | LOW RISK — `apps/web/vite.config.ts` uses explicit `resolve.alias` for its deps. Install `tailwindcss` and `@tailwindcss/vite` as `apps/web` devDependencies, not hoisted to the root `package.json`. |
| `@import "tailwindcss"` + existing `@import "./tokens.css"` order | WATCH — import order in `global.css` matters. Tailwind's `@import "tailwindcss"` must come first, then tokens and any overrides. Tailwind v4's `@theme` block should be placed right after the `@import`. |

---

## Full Installation Summary

```bash
# Build tools — devDependencies in apps/web
pnpm --filter @trip-map/web add -D tailwindcss @tailwindcss/vite

# Font assets — dependencies in apps/web (loaded at runtime)
pnpm --filter @trip-map/web add @fontsource-variable/nunito @fontsource-variable/quicksand
```

**Total additions: 4 packages.** No PostCSS config, no tailwind.config file, no JS animation library.

---

## Confidence Assessment

| Claim | Confidence | Source |
|-------|-----------|--------|
| Tailwind v4.2.2 is current stable | HIGH | npm registry `dist-tags.latest` verified 2026-04-08 |
| `@tailwindcss/vite` peer dep covers Vite `^8` | HIGH | npm `peerDependencies` field verified 2026-04-08 |
| v4 CSS-first config — no JS config file | HIGH | Official Tailwind docs (tailwindcss.com/docs/installation/using-vite) |
| `@import "tailwindcss"` replaces three directives | HIGH | Official Tailwind docs |
| `@fontsource-variable/nunito` v5.2.7 available | HIGH | npm registry verified 2026-04-08 |
| `@fontsource-variable/quicksand` v5.2.10 available | HIGH | npm registry verified 2026-04-08 |
| Leaflet CSS ordering requirement with preflight | MEDIUM | Derived from Tailwind preflight behaviour + existing global.css overrides |
| v4 `@theme` variable-to-utility mapping rules | HIGH | Official Tailwind docs |

---

## Sources

- npm registry: `tailwindcss`, `@tailwindcss/vite`, `@fontsource-variable/nunito`, `@fontsource-variable/quicksand` — verified 2026-04-08
- Official Tailwind CSS v4 installation docs: https://tailwindcss.com/docs/installation/using-vite — fetched 2026-04-08
- Existing project files: `apps/web/package.json`, `apps/web/vite.config.ts`, `apps/web/src/styles/tokens.css`, `apps/web/src/styles/global.css`
