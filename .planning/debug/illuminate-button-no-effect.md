## ROOT CAUSE FOUND

**Root Cause:** `handleIlluminate` in `LeafletMapStage.vue` contains a silent guard that returns early when the active draft point is a fallback point (i.e., one built by `buildFallbackDraftPoint`). Because fallback points have `placeId: null`, `placeKind: null`, and `datasetVersion: null`, the guard `if (!point.placeId || !point.placeKind || !point.datasetVersion) return` fires immediately — no store call is made, no API request is sent, no state changes, and no error is surfaced to the user.

---

**Evidence Summary:**

- `buildFallbackDraftPoint` (LeafletMapStage.vue, lines 345–378) explicitly sets `placeId: null`, `placeKind: null`, and `datasetVersion: null`. This is the path taken when `resolveCanonicalPlace` returns `OUTSIDE_SUPPORTED_DATA` and `lookupCountryRegionByCoordinates` finds a geo result.

- `handleIlluminate` (LeafletMapStage.vue, lines 428–441) has the guard:
  ```js
  if (!point.placeId || !point.placeKind || !point.datasetVersion) return
  ```
  For any fallback draft point, all three conditions are falsy, so the function returns before reaching `mapPointsStore.illuminate(...)`.

- The button still renders and appears fully interactive because:
  - `showIlluminateButton = !isCandidateMode` — fallback drafts are in `detected-preview` mode, not `candidate-select`, so the button shows.
  - `isActivePointSaved` computes `false` (because `activePointPlaceId` is `null` when `placeId` is null), so the button label is "点亮".
  - `isActivePointPending` also computes `false` (same reason), so `:disabled="isPending"` is `false` — the button is not disabled and accepts clicks.

- The emit chain from button to store is otherwise complete and correctly wired:
  - `PointSummaryCard` emits `illuminate` on click via `handleIlluminateToggle` ✓
  - `MapContextPopup` forwards it: `@illuminate="emit('illuminate')"` ✓
  - `LeafletMapStage` listens: `@illuminate="handleIlluminate"` ✓
  - The store's `illuminate()` function makes the API call and handles optimistic update correctly ✓
  - The `isSaved` / `isPending` prop chain is correctly threaded through all three layers ✓

- The `@click.stop` on `MapContextPopup`'s root `<aside>` (line 88) is unrelated — it stops DOM event propagation to the Leaflet map but does not interfere with Vue component emits.

---

**Files Involved:**

- `apps/web/src/components/LeafletMapStage.vue` (lines 345–378 and 428–441): `buildFallbackDraftPoint` produces a point with null canonical fields; `handleIlluminate` silently returns when those fields are null, with no user feedback.

- `apps/web/src/components/map-popup/PointSummaryCard.vue` (lines 113–116, 163–173): `showIlluminateButton` and the disabled logic do not account for the nullability of `placeId` — the button renders and is enabled even when the underlying point cannot be illuminated.

---

**Suggested Fix Direction:**

Two complementary fixes are needed:

1. **In `handleIlluminate` (LeafletMapStage.vue):** Replace the silent `return` with a visible interaction notice (e.g., `setInteractionNotice({ tone: 'info', message: '该地点暂不支持点亮' })`) so the user gets feedback instead of silence.

2. **In `PointSummaryCard.vue` / its parent:** Pass a prop (e.g., `isIlluminatable`) that is `false` when `placeId` is null, and use it to either hide the button or render it as permanently disabled with a tooltip — rather than showing a fully interactive button that silently does nothing.
