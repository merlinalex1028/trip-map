---
phase: 42
slug: ui-primitives-yume-kawaii-theme-bridge
status: ready
nyquist_compliant: true
wave_0_complete: false
created: 2026-05-11
---

# Phase 42 - Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest `4.1.4` with Vue Test Utils `2.4.6` and `happy-dom` `20.9.0` |
| **Config file** | `apps/web/vitest.config.ts` |
| **Quick run command** | `npm --prefix apps/web run test -- src/views/UiShowcaseView.spec.ts` |
| **Full suite command** | `npm --prefix apps/web run test` |
| **Estimated runtime** | ~45 seconds for focused specs, ~120 seconds for full web tests/build depending on dependency install state |

---

## Sampling Rate

- **After every task commit:** Run the focused spec for the touched surface plus `npm --prefix apps/web run typecheck` when aliases, generated components, or route imports change.
- **After every plan wave:** Run `npm --prefix apps/web run test` and `npm --prefix apps/web run build`.
- **Before `$gsd-verify-work`:** `npm --prefix apps/web run test` and `npm --prefix apps/web run build` must both pass.
- **Max feedback latency:** 120 seconds for automated local feedback after dependencies are installed.

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 42-01-01 | 01 | 1 | DS-01 | T-42-04 | Alias setup must not hide unresolved imports or bypass typecheck. | typecheck/build smoke | `npm --prefix apps/web run typecheck` | present in `apps/web/package.json` | pending |
| 42-01-02 | 01 | 1 | DS-02 | T-42-03 | Dev-only `/__ui` showcase must redirect to `/` when `import.meta.env.DEV` is false. | component/route smoke | `npm --prefix apps/web run test -- src/views/UiShowcaseView.spec.ts` | missing - Wave 0 | pending |
| 42-02-01 | 02 | 1 | DS-05 | T-42-05 | Primitive defaults must consume Yume Kawaii tokens instead of neutral shadcn defaults. | component + CSS contract smoke | `npm --prefix apps/web run test -- src/components/showcase/UiPrimitiveShowcase.spec.ts` | missing - Wave 0 | pending |
| 42-03-01 | 03 | 2 | DS-03 | T-42-02 | Chart demos must avoid raw user HTML in tooltip content and expose stable loading/empty/error states. | component smoke | `npm --prefix apps/web run test -- src/components/common/BaseChart.spec.ts` | missing - Wave 0 | pending |
| 42-04-01 | 04 | 2 | DS-04 | T-42-01 | Icons must render from a local semantic whitelist, not runtime remote Iconify fetches or raw page ids. | unit/component smoke | `npm --prefix apps/web run test -- src/components/common/KawaiiIcon.spec.ts` | missing - Wave 0 | pending |
| 42-05-01 | all | 3 | DS-01, DS-02, DS-03, DS-04, DS-05 | all | Full phase must pass tests/build with no production `/__ui` route exposure. | phase gate | `npm --prefix apps/web run test` and `npm --prefix apps/web run build` | present scripts | pending |

*Status values: pending, green, red, flaky.*

---

## Wave 0 Requirements

- [ ] `apps/web/src/views/UiShowcaseView.spec.ts` - covers DS-01/DS-02 route import resolution and primitive rendering.
- [ ] `apps/web/src/components/common/KawaiiIcon.spec.ts` - covers DS-04 semantic icon rendering from local data and no raw runtime icon ids in page code.
- [ ] `apps/web/src/components/common/BaseChart.spec.ts` - covers DS-03 chart wrapper sizing plus loading, empty, error, and demo option states.
- [ ] `apps/web/src/components/showcase/UiPrimitiveShowcase.spec.ts` - covers DS-05 themed primitive state matrix and token-backed classes.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Visual softness, glass depth, and Yume Kawaii feel across the `/__ui` showcase | DS-05 | Automated CSS checks can verify token usage, but final visual composition needs screenshot review. | Run the dev server, open `/__ui`, capture desktop and mobile screenshots, and confirm the UI-SPEC palette, blur, elevation, focus rings, and spacing are visible without neutral shadcn defaults dominating. |

---

## Threat References

| Ref | Threat | Blocking Severity | Required Control |
|-----|--------|-------------------|------------------|
| T-42-01 | Raw SVG/Iconify data injection or runtime network icon dependency | high | `KawaiiIcon` accepts typed semantic names only and registers local icon data before render. |
| T-42-02 | ECharts tooltip HTML later receiving unescaped user content | medium | Phase 42 demo options avoid raw user HTML and document formatter constraints for future data phases. |
| T-42-03 | Development showcase exposed in production | high | `/__ui` is guarded by `import.meta.env.DEV` and redirects production access to `/`. |
| T-42-04 | Dependency or generated-source supply-chain drift | medium | Dependencies are pinned in plan actions and generated shadcn files are reviewed before phase sign-off. |
| T-42-05 | Overlay focus escape or inaccessible primitive states | medium | Dialog, popover, dropdown, sidebar, calendar, and tabs use shadcn-vue/Reka primitives with keyboard smoke coverage. |

---

## Validation Sign-Off

- [x] All tasks have automated verification or Wave 0 dependencies.
- [x] Sampling continuity: no 3 consecutive tasks without automated verification.
- [x] Wave 0 covers all missing references.
- [x] No watch-mode flags.
- [x] Feedback latency target is below 120 seconds after dependencies are installed.
- [x] `nyquist_compliant: true` set in frontmatter.

**Approval:** approved 2026-05-11 for planning; execution must update task statuses as specs are created.
