# Phase 31: Statistics Sync Refresh Hardening - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in `31-CONTEXT.md` — this log preserves the alternatives considered.

**Date:** 2026-04-27
**Phase:** 31-statistics-sync-refresh-hardening
**Areas discussed:** recommended defaults, refresh trigger scope, refresh visibility, test scope

---

## Area Selection

| Option | Description | Selected |
|--------|-------------|----------|
| Recommended: lock all | Adopt the minimum implementation defaults covering refresh trigger breadth, invisible refresh behavior, and regression scope. | Yes |
| Refresh trigger scope | Discuss whether to watch only `parentLabel`, all authoritative display metadata, or add a broader store-level invalidation mechanism. | |
| Refresh visibility | Discuss whether metadata-only refresh should stay invisible or show loading feedback in some cases. | |
| Test scope | Discuss whether coverage should stay primarily in `StatisticsPageView.spec.ts` or also add store/auth-session tests. | |

**User's choice:** `1` — recommended defaults.
**Notes:** The selected path locks the narrowest phase-compatible decisions from `31-RESEARCH.md` and `31-UI-SPEC.md`.

---

## Refresh Trigger Scope

| Option | Description | Selected |
|--------|-------------|----------|
| Stats-relevant metadata revision | Extend the existing statistics-page watched revision to include `parentLabel` and other authoritative metadata such as `displayName`, `typeLabel`, and `subtitle`. | Yes |
| Parent label only | Watch only `parentLabel` beyond identity fields, because server country counts directly depend on it. | |
| Store-level invalidation | Trigger stats refresh from auth/session or map-points store changes globally. | |

**User's choice:** Covered by recommended defaults.
**Notes:** Keep refresh orchestration route-local in `StatisticsPageView.vue`; do not add a global event bus or unconditional stats fetching inside `auth-session.ts`.

---

## Refresh Visibility

| Option | Description | Selected |
|--------|-------------|----------|
| Invisible background refresh | Preserve existing UI; metadata-only refresh causes no new loading treatment unless the page is already loading/restoring. | Yes |
| Existing loading state reuse with more visible feedback | Show existing loading treatment during some metadata-only refreshes. | |
| New sync indicator | Add a banner, toast, spinner, or status copy for metadata refresh. | |

**User's choice:** Covered by recommended defaults.
**Notes:** This follows `31-UI-SPEC.md`: no new components, copy, colors, motion, focus movement, route changes, or visual states.

---

## Test Scope

| Option | Description | Selected |
|--------|-------------|----------|
| Route-level regressions first | Add primary coverage in `StatisticsPageView.spec.ts`, with optional auth-session coverage only if needed. | Yes |
| Component plus store-level assertions | Add route-level tests and always extend `auth-session.spec.ts` / store specs. | |
| Backend aggregation tests | Treat the phase as a backend stats aggregation change. | |

**User's choice:** Covered by recommended defaults.
**Notes:** Backend aggregation is already authoritative; Phase 31 tests should prove the frontend refresh trigger sees metadata-only authoritative updates, including in-flight coalescing.

---

## the agent's Discretion

- The exact helper or computed revision shape is left to planning and implementation.
- Planner may decide whether helper extraction improves readability or whether a local computed revision is enough.
- Planner may add `auth-session.spec.ts` coverage if component tests alone do not clearly prove same-user refresh behavior.

## Deferred Ideas

- Route deep-link / deployment refresh closure for `/timeline` and `/statistics` belongs to Phase 32.
- Human UAT closure belongs to Phase 32.
- New statistics metrics or completion percentage UI are out of scope for Phase 31.
