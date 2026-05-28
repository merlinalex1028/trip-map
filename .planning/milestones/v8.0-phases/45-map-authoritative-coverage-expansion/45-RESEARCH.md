# Phase 45: map-authoritative-coverage-expansion - Research

**Researched:** 2026-05-15  
**Domain:** Canonical place coverage, authoritative save eligibility, geometry metadata replay  
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

The following constraints are copied verbatim from `.planning/phases/45-map-authoritative-coverage-expansion/45-CONTEXT.md`. [VERIFIED: `.planning/phases/45-map-authoritative-coverage-expansion/45-CONTEXT.md`]

### Locked Decisions

### Runtime Breakpoint Audit
- **D-01:** Coverage discovery should be a breakpoint audit first, not a generic user-experience taxonomy. The phase should identify where the current runtime chain breaks: canonical resolve, frontend footprint guard, geometry manifest lookup, metadata catalog lookup, record API authoritative validation, or derived replay.
- **D-02:** The audit input source should be the real running product chain. Prioritize cases that the current `canonical resolve` service, map popup guard, and `POST /records` validation can actually produce or reject today. Do not build a theoretical full-dataset scanner as the main phase output.
- **D-03:** Developer visibility should come through focused tests, fixture matrices, and useful failure/log output. Do not add a dev-only coverage UI or product-facing diagnostic page in this phase.
- **D-04:** Breakpoints should be classified at a save-blocking reason level that planners can act on, such as `missing_boundary_id`, `missing_geometry_manifest`, `missing_metadata_catalog`, `record_authoritative_rejected`, and `frontend_guard_blocked`.

### Coverage Fix Priority
- **D-05:** Fix places with complete canonical identity but broken save/highlight/replay plumbing first. If the system already knows `placeId`, `boundaryId`, place kind, dataset version, metadata, and geometry reference, Phase 45 should make that place saveable before considering broader coverage.
- **D-06:** When multiple same-class gaps exist, prioritize samples that users are most likely to hit through the current map click and resolve flow and that can be reproduced in focused tests or UAT.
- **D-07:** Fallback regions from `OUTSIDE_SUPPORTED_DATA` plus frontend country/region lookup should remain explanatory only. Do not generate authoritative save payloads from fallback data in this phase.
- **D-08:** Gaps requiring a new geodata source, large-scale data generation, or long-running catalog governance should be deferred rather than absorbed into Phase 45.

### Unavailable Place Explanation
- **D-09:** User-facing unavailable-place copy should be warm and understandable, without exposing implementation field names like `boundaryId`, `metadata`, or manifest.
- **D-10:** Use a small set of friendly user-facing reason categories instead of either one generic sentence or one message per technical failure. Internally, still preserve exact technical reasons for tests and logs.
- **D-11:** Keep the disabled `留下足迹` CTA in place for recognized-but-unsaveable locations and explain the reason inline. Do not hide the action, and do not allow the user to enter the date dialog only to fail later.
- **D-12:** Maintain an explicit mapping from technical blocking reasons to the small user-facing reason categories. Tests should be able to assert both the precise internal reason and the stable product-facing category.

### Consistency Verification
- **D-13:** Verification should center on the matrix of Phase 45 newly fixed or newly classified coverage samples. Do not require an all-supported-places regression matrix.
- **D-14:** The matrix should prove the chain from `resolve` to save to replay to derived views: canonical resolve, `POST /records`, auth/bootstrap or records replay, and journal/memories-derived labels and grouping.
- **D-15:** Map highlight verification should use manifest/geometry lookup assertions plus focused frontend tests for boundary-load/highlight state. Full Playwright visual QA is not required for this phase.
- **D-16:** Test failures should expose canonical identity and the blocking reason, especially `placeId`, `boundaryId`, and the reason category. Avoid noisy full-field diffs unless a targeted mismatch assertion needs one.

### the agent's Discretion
Downstream agents may choose the exact helper/module boundaries, fixture naming, and test file placement, as long as the work stays centered on real runtime breakpoints and does not introduce a new data-source expansion project or developer UI.

### Deferred Ideas (OUT OF SCOPE)
- New geodata sources, broad data generation, or long-term catalog governance should become a separate future data coverage effort.
- Fallback country/region recognition should not be upgraded into saveable records in this phase.
- A dev-only coverage dashboard or in-app diagnostic panel is not part of Phase 45.
- Full Playwright visual QA for map highlight rendering remains outside this phase unless later QA work explicitly requires it.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| COV-01 | 开发者可以识别当前“server 已识别但前端不可留下足迹”的地点类别和原因。 | Use a focused runtime breakpoint matrix that drives `/places/resolve`, frontend saveability classification, manifest lookup, and `POST /records` outcomes for the same samples. [VERIFIED: `.planning/REQUIREMENTS.md`; VERIFIED: `apps/server/test/canonical-resolve.e2e-spec.ts`; VERIFIED: `apps/web/src/components/LeafletMapStage.spec.ts`] |
| COV-02 | 当前 canonical resolve 能返回完整 canonical identity 的地点应尽量拥有可保存所需的 boundaryId / geometry / metadata。 | The current `resolved` response already requires `CanonicalPlaceSummary + geometryRef`; service startup throws if a manifest entry lacks geometry or metadata, so Phase 45 should find plumbing mismatches rather than invent payloads. [VERIFIED: `packages/contracts/src/resolve.ts`; VERIFIED: `apps/server/src/modules/canonical-places/canonical-places.service.ts`; VERIFIED: `apps/server/src/modules/canonical-places/place-metadata-catalog.ts`] |
| COV-03 | 对仍不具备 authoritative 保存条件的地点，界面解释原因并避免展示可提交的“留下足迹”假入口。 | Phase 44 already renders disabled CTA + inline explanation for `isIlluminatable=false`; Phase 45 should replace the single boolean with precise technical reasons and stable friendly categories. [VERIFIED: `apps/web/src/components/map-popup/PointSummaryCard.vue`; VERIFIED: `.planning/phases/44-world-footprints-map-footprint-date-dialog/44-05-SUMMARY.md`] |
| COV-04 | 扩展后的可用地点在地图高亮、旅途手账、旅途回忆统计中的标题和归类保持一致。 | Map state uses persisted `TravelRecord` fields, journal derives from `buildTimelineEntries`, and memories fetch server stats from records; the sample matrix should assert identical `displayName`, `typeLabel`, `parentLabel`, and `subtitle` across these consumers. [VERIFIED: `apps/web/src/stores/map-points.ts`; VERIFIED: `apps/web/src/services/timeline.ts`; VERIFIED: `apps/server/src/modules/records/records.repository.ts`; VERIFIED: `apps/web/src/views/StatisticsPageView.spec.ts`] |
</phase_requirements>

## Summary

Phase 45 should be planned as a runtime breakpoint audit plus targeted plumbing fixes, not as a new geodata ingestion project. [VERIFIED: `.planning/phases/45-map-authoritative-coverage-expansion/45-CONTEXT.md`] The current canonical resolver returns `ResolvedCanonicalPlace`, which is `CanonicalPlaceSummary` plus `geometryRef`; the server constructs those places from `GEOMETRY_MANIFEST` and manifest-backed shard metadata. [VERIFIED: `packages/contracts/src/resolve.ts`; VERIFIED: `apps/server/src/modules/canonical-places/canonical-places.service.ts`; VERIFIED: `apps/server/src/modules/canonical-places/place-metadata-catalog.ts`]

The strongest current finding is that authoritative geometry and metadata are already internally consistent for the generated v3 manifest: a read-only audit found 856 unique manifest entries, split into 369 `CN` and 487 `OVERSEAS` entries, and both current shard files have canonical metadata on every feature. [VERIFIED: `node --input-type=module` manifest/shard audit run on 2026-05-15; VERIFIED: `packages/contracts/src/generated/geometry-manifest.generated.ts`; VERIFIED: `apps/web/public/geo/2026-04-21-geo-v3/cn/layer.json`; VERIFIED: `apps/web/public/geo/2026-04-21-geo-v3/overseas/layer.json`] Therefore the likely Phase 45 gaps are not "resolved server identity lacks metadata" in the current manifest, but mismatches between saveability predicates, fallback recognition, record API rejection, and replay/highlight validation. [VERIFIED: codebase grep; VERIFIED: `apps/web/src/components/LeafletMapStage.vue`; VERIFIED: `apps/server/src/modules/records/records.service.ts`]

The most planning-relevant implementation slice is a shared `coverageSampleMatrix` plus a frontend `FootprintAvailability` classifier. [VERIFIED: `.planning/phases/45-map-authoritative-coverage-expansion/45-CONTEXT.md`; VERIFIED: `apps/web/src/components/LeafletMapStage.vue`] Today, `isActivePointIlluminatable` checks `placeId`, `placeKind`, `datasetVersion`, and `boundaryId`, while `openFootprintDateDialog()` also requires `regionSystem`, `adminType`, `typeLabel`, and `parentLabel`; a malformed point can therefore render an enabled CTA and then no-op at dialog open. [VERIFIED: `apps/web/src/components/LeafletMapStage.vue`] Phase 45 should unify those checks into one reason-returning predicate and make `PointSummaryCard` assert both the precise technical reason and friendly unavailable category. [VERIFIED: `.planning/phases/45-map-authoritative-coverage-expansion/45-CONTEXT.md`; VERIFIED: `apps/web/src/components/map-popup/PointSummaryCard.vue`]

**Primary recommendation:** Create a Phase 45 coverage matrix that exercises real `/places/resolve` outputs, frontend availability reasons, manifest lookup, `POST /records`, auth/bootstrap replay, journal labels, and memories stats, then fix only the samples that have full authoritative identity but fail later in the chain. [VERIFIED: `.planning/phases/45-map-authoritative-coverage-expansion/45-CONTEXT.md`; VERIFIED: `apps/server/test/canonical-resolve.e2e-spec.ts`; VERIFIED: `apps/web/src/components/LeafletMapStage.spec.ts`; VERIFIED: `apps/server/test/auth-bootstrap.e2e-spec.ts`]

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|--------------|----------------|-----------|
| Canonical point resolution | API / Backend | Database / Storage via static files | `/places/resolve` owns point-in-geometry matching and returns only `resolved`, `ambiguous`, or `failed` contract branches. [VERIFIED: `apps/server/src/modules/canonical-places/canonical-places.controller.ts`; VERIFIED: `apps/server/src/modules/canonical-places/canonical-places.service.ts`; VERIFIED: `packages/contracts/src/resolve.ts`] |
| Geometry and metadata catalog integrity | API / Backend | CDN / Static assets | Server reads the generated manifest and web public GeoJSON shards from disk; missing feature or metadata throws during catalog construction. [VERIFIED: `apps/server/src/modules/canonical-places/canonical-places.service.ts`; VERIFIED: `apps/server/src/modules/canonical-places/place-metadata-catalog.ts`] |
| Saveability classification | Browser / Client | API / Backend | Frontend decides whether the `留下足迹` CTA is enabled; backend remains the authoritative final record gate. [VERIFIED: `apps/web/src/components/LeafletMapStage.vue`; VERIFIED: `apps/web/src/components/map-popup/PointSummaryCard.vue`; VERIFIED: `apps/server/src/modules/records/records.service.ts`] |
| Record creation and authoritative rejection | API / Backend | Database / Storage | `POST /records` validates DTO fields and rejects unsupported or forged overseas payloads before persistence. [VERIFIED: `apps/server/src/modules/records/records.controller.ts`; VERIFIED: `apps/server/src/modules/records/records.service.ts`; VERIFIED: `apps/server/test/records-travel.e2e-spec.ts`] |
| Map highlight loading | Browser / Client | CDN / Static assets | `LeafletMapStage.vue` uses `getGeometryManifestEntry()` and `loadGeometryShard()` to load highlighted boundary layers after resolve/save/bootstrap. [VERIFIED: `apps/web/src/components/LeafletMapStage.vue`; VERIFIED: `apps/web/src/services/geometry-manifest.ts`; VERIFIED: `apps/web/src/services/geometry-loader.ts`] |
| Journal label replay | Browser / Client | API / Backend | Journal entries are derived from persisted `TravelRecord` display fields, not recomputed from coordinates. [VERIFIED: `apps/web/src/services/timeline.ts`; VERIFIED: `apps/web/src/views/TimelinePageView.vue`] |
| Memories stats | API / Backend | Browser / Client | Server counts persisted records and countries; frontend refetches stats when travel record metadata changes. [VERIFIED: `apps/server/src/modules/records/records.repository.ts`; VERIFIED: `apps/web/src/views/StatisticsPageView.vue`; VERIFIED: `apps/web/src/stores/stats.ts`] |

## Project Constraints (from AGENTS.md)

- User-facing communication must remain Chinese unless the user explicitly asks otherwise. [VERIFIED: `AGENTS.md`]
- Before implementation, the agent should briefly explain planned operations. [VERIFIED: `AGENTS.md`]
- Code edits should be minimal and follow existing project structure and style. [VERIFIED: `AGENTS.md`]
- GSD workflow delegation is explicitly authorized when GSD workflow needs subagents or parallel agents. [VERIFIED: `AGENTS.md`]
- If subagents are used later, wait for their results before continuing. [VERIFIED: `AGENTS.md`]
- Completion notes should summarize changes, impact, and validation in Chinese. [VERIFIED: `AGENTS.md`]
- No project-local `.codex/skills` or `.agents/skills` directories exist in this repo, so no additional project skill rules apply. [VERIFIED: `find .codex`; VERIFIED: `find .agents`]

## Standard Stack

### Core

| Library | Project Version | Registry Latest | Purpose | Why Standard |
|---------|-----------------|-----------------|---------|--------------|
| Vue | `3.5.32` locked; npm latest `3.5.34`, modified 2026-05-15 | `3.5.34` | Web component implementation. | The app is Vue SFC-based and Phase 45 touches `LeafletMapStage.vue`, popup components, and views. [VERIFIED: `apps/web/package.json`; VERIFIED: `pnpm-lock.yaml`; VERIFIED: npm registry] |
| Pinia | `3.0.4` locked; npm latest `3.0.4`, modified 2025-11-05 | `3.0.4` | Map/auth/stats stores. | Existing save lifecycle, selected point state, and derived journal entries are in Pinia stores. [VERIFIED: `apps/web/package.json`; VERIFIED: npm registry; VERIFIED: `apps/web/src/stores/map-points.ts`] |
| Leaflet | `1.9.4` locked; npm latest `1.9.4`, modified 2025-08-16 | `1.9.4` | Map click and marker layer. | Phase 45 preserves Phase 44 Leaflet map flow and verifies boundary highlight loading. [VERIFIED: `apps/web/package.json`; VERIFIED: npm registry; VERIFIED: `apps/web/src/components/LeafletMapStage.vue`] |
| NestJS | `11.1.18` locked; npm latest `@nestjs/common/@nestjs/core 11.1.21`, modified 2026-05-14 | `11.1.21` | Server API modules. | Canonical resolve and records APIs are Nest controllers/services. [VERIFIED: `apps/server/package.json`; VERIFIED: `pnpm-lock.yaml`; VERIFIED: npm registry; VERIFIED: `apps/server/src/modules/canonical-places/canonical-places.controller.ts`] |
| Prisma Client | `6.19.3` locked; npm latest `@prisma/client 7.8.0`, modified 2026-05-11 | `7.8.0` | Record persistence. | Records repository uses Prisma `userTravelRecord` queries and stats aggregation. [VERIFIED: `apps/server/package.json`; VERIFIED: `pnpm-lock.yaml`; VERIFIED: npm registry; VERIFIED: `apps/server/src/modules/records/records.repository.ts`] |
| Vitest | `4.1.4` locked; npm latest `4.1.6`, modified 2026-05-11 | `4.1.6` | Unit/component/e2e test runner. | Existing Phase 45-relevant specs are Vitest suites for server and web. [VERIFIED: `apps/web/vitest.config.ts`; VERIFIED: `apps/server/vitest.config.ts`; VERIFIED: npm registry] |

### Supporting

| Library | Project Version | Purpose | When to Use |
|---------|-----------------|---------|-------------|
| Vite | `8.0.8` locked; npm latest `8.0.13`, modified 2026-05-14 | Web build/test runtime. | Keep existing scripts; do not upgrade as part of Phase 45. [VERIFIED: `apps/web/package.json`; VERIFIED: `pnpm-lock.yaml`; VERIFIED: npm registry] |
| Vue Test Utils | `2.4.6` locked; npm latest `2.4.10`, modified 2026-04-30 | Vue component tests. | Use for `PointSummaryCard`, `LeafletMapStage`, route views, and any new availability helper tests. [VERIFIED: `apps/web/package.json`; VERIFIED: npm registry] |
| TypeScript | `5.9.3` locked; npm latest `6.0.3`, modified 2026-04-16 | Static typing. | Keep project version because monorepo lockfile is stable and Phase 45 is not a dependency upgrade. [VERIFIED: `package.json`; VERIFIED: `pnpm-lock.yaml`; VERIFIED: npm registry] |
| vue-tsc | `3.2.6` locked; npm latest `3.2.9`, modified 2026-05-13 | Vue typecheck. | Run through `pnpm --filter @trip-map/web build` after implementation waves. [VERIFIED: `apps/web/package.json`; VERIFIED: npm registry] |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Shared fixture matrix | Broad full-dataset scanner | The user locked Phase 45 to real runtime breakpoints, not theoretical dataset governance. [VERIFIED: `.planning/phases/45-map-authoritative-coverage-expansion/45-CONTEXT.md`] |
| Frontend reason-returning classifier | Current boolean-only `isActivePointIlluminatable` | Boolean checks cannot expose `missing_boundary_id`, `missing_metadata_catalog`, or `frontend_guard_blocked` to focused tests. [VERIFIED: `apps/web/src/components/LeafletMapStage.vue`; VERIFIED: `.planning/phases/45-map-authoritative-coverage-expansion/45-CONTEXT.md`] |
| Existing record API guard | Client-generated authoritative payloads from fallback region lookup | Fallback regions are explicitly explanatory only and must not become save payloads. [VERIFIED: `.planning/phases/45-map-authoritative-coverage-expansion/45-CONTEXT.md`; VERIFIED: `apps/web/src/components/LeafletMapStage.vue`] |

**Installation:**

```bash
# No dependency installation is recommended for Phase 45.
# Use the existing monorepo stack and focused tests.
```

**Version verification:** `npm view` was run for Vue, Pinia, Leaflet, NestJS, Prisma Client, Vitest, Vite, Vue Test Utils, TypeScript, and vue-tsc on 2026-05-15; `@prisma/client`, `prisma`, and `vite` required a network retry, and the final values above were verified from npm registry output. [VERIFIED: npm registry]

## Architecture Patterns

### System Architecture Diagram

```text
Developer coverage matrix
  |
  v
Sample coordinate / candidate
  |
  v
POST /places/resolve or /places/confirm
  |
  +--> failed OUTSIDE_SUPPORTED_DATA
  |       |
  |       v
  |    frontend geo fallback only -> disabled CTA + friendly reason
  |
  +--> ambiguous candidates
  |       |
  |       v
  |    candidate confirm -> resolved candidate or candidate_mismatch
  |
  +--> resolved CanonicalPlaceSummary + geometryRef
          |
          v
    frontend availability classifier
          |
          +--> saveable -> open Phase 44 snapshot date dialog
          |                 |
          |                 v
          |          POST /records -> persist -> bootstrap/replay
          |                 |
          |                 v
          |          map highlight + journal + memories assertions
          |
          +--> blocked -> disabled CTA + friendly reason + exact technical reason
```

This flow matches the actual runtime entry points and preserves the Phase 44 popup/dialog chain. [VERIFIED: `apps/server/src/modules/canonical-places/canonical-places.controller.ts`; VERIFIED: `apps/web/src/components/LeafletMapStage.vue`; VERIFIED: `.planning/phases/44-world-footprints-map-footprint-date-dialog/44-05-SUMMARY.md`]

### Recommended Project Structure

```text
apps/server/test/
├── phase45-coverage-cases.ts              # shared resolved/blocked sample matrix
├── canonical-resolve.e2e-spec.ts          # extend resolve identity + breakpoint assertions
├── records-travel.e2e-spec.ts             # extend record guard/save assertions when DB is available
└── auth-bootstrap.e2e-spec.ts             # replay labels for fixed samples

apps/web/src/services/
├── footprint-availability.ts              # reason-returning saveability classifier
├── footprint-availability.spec.ts         # focused classifier tests
└── geometry-manifest.spec.ts              # extend sample manifest coverage checks

apps/web/src/components/
├── LeafletMapStage.vue                    # consume classifier and keep snapshot submit
├── LeafletMapStage.spec.ts                # sample matrix click/save/highlight assertions
└── map-popup/
    ├── PointSummaryCard.vue               # render friendly category + disabled CTA
    └── PointSummaryCard.spec.ts           # reason/category UI assertions
```

The structure keeps the audit in tests/fixtures and avoids adding a developer UI dashboard. [VERIFIED: `.planning/phases/45-map-authoritative-coverage-expansion/45-CONTEXT.md`; VERIFIED: existing test paths]

### Pattern 1: Reason-Returning Availability Classifier

**What:** Replace one-off boolean checks with a pure function that returns `saveable: true` or a stable technical reason plus a friendly category. [VERIFIED: `apps/web/src/components/LeafletMapStage.vue`; VERIFIED: `.planning/phases/45-map-authoritative-coverage-expansion/45-CONTEXT.md`]

**When to use:** Use it anywhere the frontend decides whether to enable `留下足迹`, open the dialog, or show unavailable copy. [VERIFIED: `apps/web/src/components/LeafletMapStage.vue`; VERIFIED: `apps/web/src/components/map-popup/PointSummaryCard.vue`]

**Example:**

```ts
// Source fields verified in apps/web/src/types/map-point.ts and LeafletMapStage.vue.
export type FootprintBlockingReason =
  | 'missing_canonical_identity'
  | 'missing_boundary_id'
  | 'missing_geometry_manifest'
  | 'missing_metadata_fields'
  | 'fallback_explanatory_only'

export type FootprintReasonCategory =
  | 'map_data_unavailable'
  | 'place_not_precise_enough'
  | 'temporarily_unavailable'

export interface FootprintAvailabilityBlocked {
  saveable: false
  reason: FootprintBlockingReason
  category: FootprintReasonCategory
}

export type FootprintAvailability =
  | { saveable: true }
  | FootprintAvailabilityBlocked
```

The exact file name is discretionary, but the planner should require one shared predicate rather than duplicated checks in `LeafletMapStage.vue` and `PointSummaryCard.vue`. [VERIFIED: `.planning/phases/45-map-authoritative-coverage-expansion/45-CONTEXT.md`; VERIFIED: `apps/web/src/components/LeafletMapStage.vue`]

### Pattern 2: Matrix Samples Drive All Layers

**What:** Define Phase 45 samples once and reuse them across resolve, record, frontend, replay, and derived-view assertions. [VERIFIED: `apps/server/test/phase28-overseas-cases.ts`; VERIFIED: `.planning/phases/45-map-authoritative-coverage-expansion/45-CONTEXT.md`]

**When to use:** Use for fixed samples like resolved California/Tokyo/Guangzhou and classified blocked samples like unsupported fallback British Columbia or unsupported Mexico/Jalisco. [VERIFIED: `apps/server/test/canonical-resolve.e2e-spec.ts`; VERIFIED: `apps/web/src/components/LeafletMapStage.spec.ts`; VERIFIED: `apps/server/test/records-travel.e2e-spec.ts`]

**Example:**

```ts
// Source pattern: apps/server/test/phase28-overseas-cases.ts
export interface Phase45CoverageCase {
  id: string
  click: { lat: number; lng: number }
  expectedResolve: 'resolved' | 'ambiguous' | 'failed'
  expectedPlaceId?: string
  expectedBoundaryId?: string
  expectedBlockingReason?: string
  expectedUserCategory?: string
}
```

### Pattern 3: Preserve Fallback as Explanation Only

**What:** `OUTSIDE_SUPPORTED_DATA` can fall back to `lookupCountryRegionByCoordinates()` for readable context, but fallback drafts set `placeId`, `placeKind`, `datasetVersion`, `boundaryId`, and metadata fields to `null`. [VERIFIED: `apps/web/src/components/LeafletMapStage.vue`]

**When to use:** Any unsupported region that the client can label but the server cannot resolve authoritatively. [VERIFIED: `apps/web/src/components/LeafletMapStage.spec.ts`; VERIFIED: `.planning/phases/45-map-authoritative-coverage-expansion/45-CONTEXT.md`]

**Example:**

```ts
// Source: apps/web/src/components/LeafletMapStage.vue
// Fallback points should remain unsaveable.
{
  placeId: null,
  placeKind: null,
  datasetVersion: null,
  boundaryId: null,
  fallbackNotice: buildUnsupportedOverseasNotice(regionName),
}
```

### Pattern 4: Replay Uses Persisted Canonical Text

**What:** Journal and map reopen should display persisted record text fields, not recompute labels from current coordinate or UI fallback data. [VERIFIED: `apps/web/src/stores/map-points.ts`; VERIFIED: `apps/web/src/services/timeline.ts`; VERIFIED: `apps/server/test/auth-bootstrap.e2e-spec.ts`]

**When to use:** COV-04 validation for newly fixed samples. [VERIFIED: `.planning/REQUIREMENTS.md`; VERIFIED: `.planning/phases/45-map-authoritative-coverage-expansion/45-CONTEXT.md`]

**Example:**

```ts
// Source: apps/web/src/services/timeline.ts
return {
  displayName: record.displayName,
  parentLabel: record.parentLabel,
  subtitle: record.subtitle,
  typeLabel: record.typeLabel,
}
```

### Anti-Patterns to Avoid

- **Generating save payloads from fallback region lookup:** This violates D-07 and can create records that cannot be highlighted or authoritatively replayed. [VERIFIED: `.planning/phases/45-map-authoritative-coverage-expansion/45-CONTEXT.md`; VERIFIED: `apps/web/src/components/LeafletMapStage.vue`]
- **Adding a dev-only coverage UI:** D-03 excludes diagnostic pages; tests and matrix failure output are the required developer visibility. [VERIFIED: `.planning/phases/45-map-authoritative-coverage-expansion/45-CONTEXT.md`]
- **Leaving saveability checks split between CTA and dialog open:** Current code has a split predicate; planner should eliminate the risk of enabled CTA no-op. [VERIFIED: `apps/web/src/components/LeafletMapStage.vue`]
- **Broad all-place regression matrix:** D-13 says verification centers on newly fixed or newly classified samples, not every supported place. [VERIFIED: `.planning/phases/45-map-authoritative-coverage-expansion/45-CONTEXT.md`]

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Developer coverage visibility | In-app diagnostic dashboard | Focused fixture matrix + test output | User explicitly rejected a dev-only coverage UI. [VERIFIED: `.planning/phases/45-map-authoritative-coverage-expansion/45-CONTEXT.md`] |
| Save payload construction | Payloads synthesized from country/region fallback | Existing `ResolvedCanonicalPlace` fields from `/places/resolve` | Fallback has no authoritative `placeId`, `boundaryId`, or metadata. [VERIFIED: `packages/contracts/src/resolve.ts`; VERIFIED: `apps/web/src/components/LeafletMapStage.vue`] |
| Metadata validation | Ad hoc string equality in frontend | Server catalog helpers and record API guard | Backend already has `getCanonicalPlaceSummaryById` and `getCanonicalPlaceSummaryByBoundaryId`. [VERIFIED: `apps/server/src/modules/canonical-places/place-metadata-catalog.ts`; VERIFIED: `apps/server/src/modules/records/records.service.ts`] |
| Geometry lookup | Manual shard path guessing | `getGeometryManifestEntry()` and `loadGeometryShard()` | Manifest is the shared source for `boundaryId -> assetKey/layer`. [VERIFIED: `apps/web/src/services/geometry-manifest.ts`; VERIFIED: `apps/web/src/services/geometry-loader.ts`] |
| Replay labels | Recompute titles from coordinates or fallback lookup | Persisted `TravelRecord` text fields | Existing journal/bootstrap tests assert persisted metadata replay. [VERIFIED: `apps/web/src/services/timeline.ts`; VERIFIED: `apps/server/test/auth-bootstrap.e2e-spec.ts`] |

**Key insight:** The expensive problem is not deciding if a place sounds recognizable; the real contract is whether one canonical identity can pass resolve, manifest, record, replay, highlight, and derived-view checks without inventing missing fields. [VERIFIED: `.planning/phases/45-map-authoritative-coverage-expansion/45-CONTEXT.md`; VERIFIED: codebase grep]

## Current Runtime Inventory

| Surface | Current Behavior | Planning Implication |
|---------|------------------|----------------------|
| `CanonicalResolveResponse` | `resolved` includes `click` and `place: ResolvedCanonicalPlace`; `failed` includes `reason` and `message` without `place`. [VERIFIED: `packages/contracts/src/resolve.ts`] | Tests should not expect save fields on failed responses. [VERIFIED: `packages/contracts/src/resolve.ts`] |
| Canonical service load | For every manifest entry, server loads shard, finds feature, then looks up metadata by `boundaryId`; missing feature or metadata throws. [VERIFIED: `apps/server/src/modules/canonical-places/canonical-places.service.ts`] | A resolved place from current catalog should already have metadata and geometryRef. [VERIFIED: `apps/server/src/modules/canonical-places/canonical-places.service.ts`] |
| Metadata catalog | Builds `byPlaceId` and `byBoundaryId` from shard feature properties; duplicate IDs with differing summaries throw. [VERIFIED: `apps/server/src/modules/canonical-places/place-metadata-catalog.ts`] | Coverage audit can use catalog lookups as authoritative evidence. [VERIFIED: `apps/server/src/modules/canonical-places/place-metadata-catalog.ts`] |
| Manifest v3 | 856 unique entries: 369 CN and 487 OVERSEAS; asset keys are `cn/layer.json` and `overseas/layer.json`. [VERIFIED: read-only Node audit 2026-05-15] | Matrix should sample categories, not scan all entries as phase output. [VERIFIED: `.planning/phases/45-map-authoritative-coverage-expansion/45-CONTEXT.md`] |
| Shard metadata | `cn/layer.json` has 369 canonical features and `overseas/layer.json` has 487 canonical features; the audit found no missing required metadata in either file. [VERIFIED: read-only Node audit 2026-05-15] | If a current resolved sample cannot save, likely inspect frontend guard or record API, not the shard metadata first. [VERIFIED: `apps/web/src/components/LeafletMapStage.vue`; VERIFIED: `apps/server/src/modules/records/records.service.ts`] |
| Frontend saveability | `isActivePointIlluminatable` requires `placeId`, `placeKind`, `datasetVersion`, and `boundaryId`. [VERIFIED: `apps/web/src/components/LeafletMapStage.vue`] | Add precise reasons for each missing field. [VERIFIED: `.planning/phases/45-map-authoritative-coverage-expansion/45-CONTEXT.md`] |
| Dialog open guard | `openFootprintDateDialog()` also requires `regionSystem`, `adminType`, `typeLabel`, and `parentLabel`. [VERIFIED: `apps/web/src/components/LeafletMapStage.vue`] | Unify guard with CTA state to prevent enabled no-op. [VERIFIED: `apps/web/src/components/LeafletMapStage.vue`] |
| Record API guard | Overseas payloads are checked against authoritative catalog; non-overseas payloads return early after DTO validation. [VERIFIED: `apps/server/src/modules/records/records.service.ts`] | Do not weaken overseas guard; if CN catalog validation is desired, scope it as a separate hardening choice unless a Phase 45 sample requires it. [VERIFIED: `apps/server/src/modules/records/records.service.ts`; VERIFIED: `.planning/phases/45-map-authoritative-coverage-expansion/45-CONTEXT.md`] |
| Highlight loading | `loadShardIfNeeded(boundaryId, layer)` returns early if manifest entry missing; save success loads shard if entry exists. [VERIFIED: `apps/web/src/components/LeafletMapStage.vue`] | Add matrix assertions for manifest entry and shard load call. [VERIFIED: `.planning/phases/45-map-authoritative-coverage-expansion/45-CONTEXT.md`] |
| Journal replay | `buildTimelineEntries()` copies persisted `displayName`, `parentLabel`, `subtitle`, and `typeLabel`. [VERIFIED: `apps/web/src/services/timeline.ts`] | COV-04 should assert journal labels from saved samples. [VERIFIED: `.planning/REQUIREMENTS.md`] |
| Memories stats | Server counts `totalTrips`, distinct `placeId`, and distinct country labels derived from `parentLabel`. [VERIFIED: `apps/server/src/modules/records/records.repository.ts`] | COV-04 should assert stats update after sample save/replay. [VERIFIED: `apps/web/src/views/StatisticsPageView.spec.ts`] |

## Common Pitfalls

### Pitfall 1: Treating Fallback Recognition as Authoritative
**What goes wrong:** A country/region fallback name is used to create a save payload. [VERIFIED: `.planning/debug/illuminate-button-no-effect.md`; VERIFIED: `apps/web/src/components/LeafletMapStage.vue`]  
**Why it happens:** `OUTSIDE_SUPPORTED_DATA` can still produce a readable frontend fallback draft. [VERIFIED: `apps/web/src/components/LeafletMapStage.vue`]  
**How to avoid:** Keep fallback fields null and classify as `fallback_explanatory_only`. [VERIFIED: `.planning/phases/45-map-authoritative-coverage-expansion/45-CONTEXT.md`]  
**Warning signs:** `createTravelRecord` receives a payload whose source was `lookupCountryRegionByCoordinates()` rather than `/places/resolve`. [VERIFIED: `apps/web/src/components/LeafletMapStage.vue`; VERIFIED: `apps/web/src/services/geo-lookup.ts`]

### Pitfall 2: Split CTA and Dialog Guards
**What goes wrong:** The CTA looks enabled but `openFootprintDateDialog()` returns early because extra metadata fields are missing. [VERIFIED: `apps/web/src/components/LeafletMapStage.vue`]  
**Why it happens:** `isActivePointIlluminatable` and dialog-open guard use different required field sets. [VERIFIED: `apps/web/src/components/LeafletMapStage.vue`]  
**How to avoid:** Use one `getFootprintAvailability(point)` result for CTA disabled state, inline reason, and dialog opening. [VERIFIED: `.planning/phases/45-map-authoritative-coverage-expansion/45-CONTEXT.md`]  
**Warning signs:** Tests can trigger `leaveFootprint` but `FootprintDateDialog` remains closed without a reason. [VERIFIED: `apps/web/src/components/LeafletMapStage.spec.ts`]

### Pitfall 3: Confusing Manifest Coverage with Legacy Boundary Coverage
**What goes wrong:** A place is marked boundary-missing because older `city-boundaries.geo.json` lacks it even though `GEOMETRY_MANIFEST` has it. [VERIFIED: `apps/web/src/services/city-boundaries.ts`]  
**Why it happens:** The project has both legacy curated city boundaries and current generated geometry manifest. [VERIFIED: `apps/web/src/services/city-boundaries.ts`; VERIFIED: `packages/contracts/src/generated/geometry-manifest.generated.ts`]  
**How to avoid:** Check `getGeometryManifestEntry(boundaryId)` first, as current `hasBoundaryCoverageForBoundaryId()` already does. [VERIFIED: `apps/web/src/services/city-boundaries.ts`]  
**Warning signs:** `boundarySupportState === 'missing'` for a `boundaryId` that exists in `GEOMETRY_MANIFEST`. [VERIFIED: `apps/web/src/stores/map-points.ts`; VERIFIED: `apps/web/src/services/geometry-manifest.ts`]

### Pitfall 4: Weakening Authoritative Record Rejection
**What goes wrong:** Planner fixes coverage by allowing stale or forged overseas payloads. [VERIFIED: `apps/server/test/records-travel.e2e-spec.ts`]  
**Why it happens:** `POST /records` is the first hard rejection point after frontend save. [VERIFIED: `apps/server/src/modules/records/records.service.ts`]  
**How to avoid:** Add samples that prove unsupported overseas and forged metadata remain rejected. [VERIFIED: `apps/server/test/records-travel.e2e-spec.ts`]  
**Warning signs:** `records-travel.e2e-spec.ts` no longer expects messages like `outside the current authoritative overseas support catalog` or metadata mismatch. [VERIFIED: `apps/server/test/records-travel.e2e-spec.ts`]

### Pitfall 5: Over-Testing Every Supported Entry
**What goes wrong:** Phase 45 turns into a long-running full geodata audit. [VERIFIED: `.planning/phases/45-map-authoritative-coverage-expansion/45-CONTEXT.md`]  
**Why it happens:** The current manifest has 856 entries, and full pairwise end-to-end coverage would be disproportionate for this phase. [VERIFIED: read-only Node audit 2026-05-15]  
**How to avoid:** Use representative samples by breakpoint category and newly fixed/classified sample. [VERIFIED: `.planning/phases/45-map-authoritative-coverage-expansion/45-CONTEXT.md`]  
**Warning signs:** Plan tasks mention generating new sources or scanning all features as the main deliverable. [VERIFIED: `.planning/phases/45-map-authoritative-coverage-expansion/45-CONTEXT.md`]

## Code Examples

Verified patterns from existing sources and recommended Phase 45 extensions:

### Manifest-Backed Resolve Identity Assertion

```ts
// Source: apps/server/test/canonical-resolve.e2e-spec.ts
expect(response.json()).toMatchObject({
  status: 'resolved',
  place: {
    placeId: 'us-california',
    boundaryId: 'ne-admin1-us-california',
    datasetVersion: 'canonical-authoritative-2026-04-21',
    geometryRef: {
      assetKey: 'overseas/layer.json',
      geometryDatasetVersion: '2026-04-21-geo-v3',
    },
  },
})
```

This verifies resolve identity before the planner tries to fix frontend or record behavior. [VERIFIED: `apps/server/test/canonical-resolve.e2e-spec.ts`]

### Frontend Disabled Fallback Assertion

```ts
// Source: apps/web/src/components/LeafletMapStage.spec.ts
expect(mapPointsStore.draftPoint).toEqual(expect.objectContaining({
  name: 'British Columbia',
  placeId: null,
  boundaryId: null,
}))
expect(wrapper.get('[data-footprint-cta="true"]').attributes('disabled')).toBeDefined()
```

This is the current pattern for recognized-but-unsaveable fallback. [VERIFIED: `apps/web/src/components/LeafletMapStage.spec.ts`]

### Record API Authoritative Rejection Assertion

```ts
// Source: apps/server/test/records-travel.e2e-spec.ts
expect(response.statusCode).toBe(400)
expect(response.json()).toMatchObject({
  message: 'Overseas travel record is outside the current authoritative overseas support catalog.',
})
```

This is the guard Phase 45 must not bypass for unsupported overseas payloads. [VERIFIED: `apps/server/test/records-travel.e2e-spec.ts`]

### Proposed Availability Result Consumption

```ts
// Source fields: apps/web/src/types/map-point.ts and apps/web/src/components/LeafletMapStage.vue
const availability = getFootprintAvailability(point)

<PointSummaryCard
  :is-illuminatable="availability.saveable"
  :footprint-unavailable-reason="availability.saveable ? null : availability.category"
/>
```

The exact prop name is discretionary, but the same result should drive disabled state and copy. [VERIFIED: `.planning/phases/45-map-authoritative-coverage-expansion/45-CONTEXT.md`; VERIFIED: `apps/web/src/components/map-popup/PointSummaryCard.vue`]

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Exact coordinate fixtures for canonical resolve | Geometry hit testing against current manifest-backed shards, with fixtures retained for explicit ambiguous/failed cases | Implemented before Phase 45; current e2e covers non-representative Beijing/Tianjin/California clicks | Phase 45 should sample real geometry hits, not only fixture coordinates. [VERIFIED: `apps/server/src/modules/canonical-places/canonical-places.service.ts`; VERIFIED: `apps/server/test/canonical-resolve.e2e-spec.ts`] |
| Legacy fallback points could show an action that silently no-oped | Phase 44 introduced disabled unavailable CTA and inline explanation | Phase 44 completed 2026-05-13 | Phase 45 should refine the single generic reason into precise technical reasons and friendly categories. [VERIFIED: `.planning/phases/44-world-footprints-map-footprint-date-dialog/44-05-SUMMARY.md`; VERIFIED: `apps/web/src/components/map-popup/PointSummaryCard.vue`] |
| Popup inline date form | Snapshot-safe standalone `FootprintDateDialog` submit | Phase 44 completed 2026-05-13 | Phase 45 must preserve snapshot-safe save and avoid reintroducing active-point reads during submit. [VERIFIED: `.planning/phases/44-world-footprints-map-footprint-date-dialog/44-05-SUMMARY.md`; VERIFIED: `apps/web/src/components/LeafletMapStage.vue`] |
| Legacy overseas labels such as `一级行政区` in records | Authoritative catalog-backed persisted metadata with backfill tests | Existing Phase 28/record metadata tests | COV-04 should assert new samples replay persisted canonical labels. [VERIFIED: `apps/server/test/auth-bootstrap.e2e-spec.ts`; VERIFIED: `apps/server/test/phase28-overseas-cases.ts`] |

**Deprecated/outdated:**
- `ne-admin1-us-ca` as a current save/highlight boundary ID is legacy/no-renderable in `CANONICAL_BOUNDARY_ID_TO_RENDERABLE_ID`; current canonical California uses `ne-admin1-us-california`. [VERIFIED: `apps/web/src/services/city-boundaries.ts`; VERIFIED: `apps/server/test/canonical-resolve.e2e-spec.ts`]
- Frontend save payloads based on country/region fallback are out of scope and should remain unavailable. [VERIFIED: `.planning/phases/45-map-authoritative-coverage-expansion/45-CONTEXT.md`; VERIFIED: `apps/web/src/components/LeafletMapStage.vue`]

## Assumptions Log

All claims in this research were verified against local code, local planning documents, npm registry output, focused test execution, or the official OWASP ASVS page. No `[ASSUMED]` claims are used. [VERIFIED: local research session 2026-05-15]

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| — | No assumed claims. | — | — |

## Open Questions (RESOLVED)

1. **Should Phase 45 harden CN record validation to use the same metadata catalog as overseas?**  
   - What we know: `assertAuthoritativeOverseasRecord()` returns early for non-overseas payloads, so current CN payloads are DTO-validated but not catalog-verified at the same level. [VERIFIED: `apps/server/src/modules/records/records.service.ts`]  
   - What's unclear: The Phase 45 context prioritizes coverage expansion, not broader record API security hardening. [VERIFIED: `.planning/phases/45-map-authoritative-coverage-expansion/45-CONTEXT.md`]  
   - Recommendation: Do not make CN hardening a Phase 45 prerequisite unless the coverage matrix finds a resolved CN sample that can be saved with mismatched identity. [VERIFIED: `.planning/phases/45-map-authoritative-coverage-expansion/45-CONTEXT.md`]
   - RESOLVED: Phase 45 will not harden CN record validation as a standalone task. The plans keep existing record validation intact and only escalate CN catalog hardening if the Phase 45 runtime matrix proves a concrete CN mismatch that blocks or corrupts save/highlight/replay behavior. [VERIFIED: `.planning/phases/45-map-authoritative-coverage-expansion/45-01-PLAN.md`; VERIFIED: `.planning/phases/45-map-authoritative-coverage-expansion/45-04-PLAN.md`]

2. **Where should the shared Phase 45 matrix live?**  
   - What we know: Server already has `apps/server/test/phase28-overseas-cases.ts`, while web tests import fixtures from `@trip-map/contracts`. [VERIFIED: `apps/server/test/phase28-overseas-cases.ts`; VERIFIED: `apps/web/src/components/LeafletMapStage.spec.ts`]  
   - What's unclear: A matrix used by both apps may belong in `packages/contracts/src/fixtures.ts` or duplicated in app-specific tests. [VERIFIED: codebase grep]  
   - Recommendation: Start with app-local test matrices unless a sample must be shared across package boundaries, then promote only stable contract fixtures to `packages/contracts`. [VERIFIED: existing fixture layout]
   - RESOLVED: Phase 45 starts with app-local matrices. Server coverage lives in `apps/server/test/phase45-coverage-cases.ts`; web availability coverage lives in `apps/web/src/services/footprint-availability.spec.ts` and related component specs. No `packages/contracts` fixture promotion is planned unless execution discovers a cross-package duplication that cannot be tested cleanly in app-local specs. [VERIFIED: `.planning/phases/45-map-authoritative-coverage-expansion/45-01-PLAN.md`; VERIFIED: `.planning/phases/45-map-authoritative-coverage-expansion/45-02-PLAN.md`; VERIFIED: `.planning/phases/45-map-authoritative-coverage-expansion/45-PATTERNS.md`]

3. **Can records e2e be relied on in the current environment?**  
   - What we know: `canonical-resolve.e2e-spec.ts` passed 25 tests locally, but `records-travel.e2e-spec.ts` failed in `beforeAll` with Prisma `Response from the Engine was empty` and hook timeout. [VERIFIED: command run 2026-05-15]  
   - What's unclear: Whether the failure is transient database connectivity, Prisma engine state, or environment-specific. [VERIFIED: command run 2026-05-15]  
   - Recommendation: Planner should include server records e2e as a required phase gate but keep a fast non-DB unit path for early feedback. [VERIFIED: `apps/server/src/modules/records/records.service.spec.ts`; VERIFIED: failed focused e2e run]
   - RESOLVED: DB-backed records/auth-bootstrap e2e remains part of the Phase 45 gate, but execution must report Prisma/database environment failures separately from behavior failures. Fast non-DB feedback remains available through canonical resolve, frontend availability, popup, LeafletMapStage, timeline, and StatisticsPageView focused specs so implementation is not blocked on every task by a transient database engine issue. [VERIFIED: `.planning/phases/45-map-authoritative-coverage-expansion/45-VALIDATION.md`; VERIFIED: `.planning/phases/45-map-authoritative-coverage-expansion/45-04-PLAN.md`]

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|-------------|-----------|---------|----------|
| Node.js | All build/test scripts | Yes | `v22.22.1` | None needed. [VERIFIED: `node --version`] |
| npm | Registry version verification | Yes | `10.9.4` | None needed. [VERIFIED: `npm --version`] |
| pnpm | Project scripts | Yes, after non-sandbox/Corepack retry | `10.33.0` | Use approved/escalated pnpm invocation if sandbox Corepack fetch fails. [VERIFIED: `pnpm --version`; VERIFIED: `package.json`] |
| Vitest | Focused tests | Yes via project deps | `4.1.4` locked | None needed. [VERIFIED: `pnpm-lock.yaml`; VERIFIED: focused test runs] |
| PostgreSQL client CLIs | DB readiness probing | No | `pg_isready` and `psql` not found | Use existing Prisma-backed e2e commands; document DB failures explicitly. [VERIFIED: `command -v pg_isready`; VERIFIED: `command -v psql`] |
| Server `.env` | Prisma-backed e2e | Present | `apps/server/.env` exists | If DB e2e fails, run non-DB resolve/unit tests and mark records gate blocked. [VERIFIED: `ls apps/server/.env`; VERIFIED: failed `records-travel.e2e-spec.ts` run] |

**Missing dependencies with no fallback:**
- None for research and non-DB focused tests. [VERIFIED: command runs 2026-05-15]

**Missing dependencies with fallback:**
- PostgreSQL client CLIs are missing, but application e2e can still use Prisma and `.env`; the fallback is to run e2e directly and capture failures. [VERIFIED: `command -v pg_isready`; VERIFIED: `pnpm --filter @trip-map/server test -- test/records-travel.e2e-spec.ts`]

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest `4.1.4` for web and server tests. [VERIFIED: `pnpm-lock.yaml`; VERIFIED: `apps/web/vitest.config.ts`; VERIFIED: `apps/server/vitest.config.ts`] |
| Config file | `apps/web/vitest.config.ts`, `apps/server/vitest.config.ts`. [VERIFIED: file reads] |
| Quick run command | `pnpm --filter @trip-map/web test -- src/services/geometry-manifest.spec.ts src/components/map-popup/PointSummaryCard.spec.ts` [VERIFIED: command passed 29 tests on 2026-05-15] |
| Resolve run command | `pnpm --filter @trip-map/server test -- test/canonical-resolve.e2e-spec.ts` [VERIFIED: command passed 25 tests on 2026-05-15] |
| Records gate command | `pnpm --filter @trip-map/server test -- test/records-travel.e2e-spec.ts` [VERIFIED: command failed in current environment on 2026-05-15 with Prisma engine empty response] |
| Full suite command | `pnpm --filter @trip-map/web test && pnpm --filter @trip-map/web build && pnpm --filter @trip-map/server test` [VERIFIED: package scripts] |

### Phase Requirements -> Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|--------------|
| COV-01 | Runtime breakpoint categories and counts are visible to developers. | unit/e2e fixture matrix | `pnpm --filter @trip-map/server test -- test/canonical-resolve.e2e-spec.ts` plus new `phase45-coverage-cases` assertions | Partial; create Wave 0 matrix. [VERIFIED: existing server tests] |
| COV-02 | Resolved complete identity samples can save or report exact later breakpoint. | e2e + component | `pnpm --filter @trip-map/server test -- test/canonical-resolve.e2e-spec.ts`; `pnpm --filter @trip-map/web test -- src/components/LeafletMapStage.spec.ts` | Partial; extend sample matrix. [VERIFIED: existing test files] |
| COV-03 | Still-unsaveable recognized places show disabled CTA and friendly reason. | component | `pnpm --filter @trip-map/web test -- src/components/map-popup/PointSummaryCard.spec.ts src/components/LeafletMapStage.spec.ts` | Yes; refine reason/category assertions. [VERIFIED: existing test files] |
| COV-04 | Fixed samples use consistent titles/grouping in highlight, journal, memories. | integration/e2e | `pnpm --filter @trip-map/web test -- src/services/timeline.spec.ts src/views/StatisticsPageView.spec.ts`; DB-backed replay through `auth-bootstrap.e2e-spec.ts` when available | Partial; add Phase 45 cases. [VERIFIED: existing test files] |

### Sampling Rate

- **Per task commit:** Run the web quick command above and any new `footprint-availability.spec.ts`. [VERIFIED: focused command passed 2026-05-15]
- **Per wave merge:** Run server resolve e2e plus web `LeafletMapStage`, `PointSummaryCard`, `geometry-manifest`, `timeline`, and `StatisticsPageView` focused specs. [VERIFIED: existing test files]
- **Phase gate:** Run full web test/build, server canonical resolve e2e, and DB-backed records/auth-bootstrap suites when the database environment is healthy. [VERIFIED: package scripts; VERIFIED: focused server resolve passed; VERIFIED: records e2e current failure]

### Wave 0 Gaps

- [ ] `apps/server/test/phase45-coverage-cases.ts` - shared matrix for fixed/classified samples. [VERIFIED: no existing file in phase 45 paths]
- [ ] `apps/web/src/services/footprint-availability.ts` - shared reason-returning frontend classifier. [VERIFIED: no existing file in `apps/web/src/services`]
- [ ] `apps/web/src/services/footprint-availability.spec.ts` - exact technical reason + friendly category assertions. [VERIFIED: no existing file in `apps/web/src/services`]
- [ ] Extend `apps/server/test/canonical-resolve.e2e-spec.ts` with Phase 45 matrix logging/assertions. [VERIFIED: existing file]
- [ ] Extend `apps/web/src/components/LeafletMapStage.spec.ts` for matrix-driven save/highlight behavior. [VERIFIED: existing file]
- [ ] Extend replay/derived-view tests only for newly fixed or newly classified samples. [VERIFIED: `.planning/phases/45-map-authoritative-coverage-expansion/45-CONTEXT.md`]

## Security Domain

OWASP ASVS is an application security verification standard for web applications and web services. [CITED: https://owasp.org/www-project-application-security-verification-standard/]

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|------------------|
| V2 Authentication | Yes, indirectly | Keep existing `sid` session guard for `/records`; Phase 45 must not create anonymous record writes. [VERIFIED: `apps/server/src/modules/auth/guards/session-auth.guard.ts`; VERIFIED: `apps/server/src/modules/records/records.controller.ts`; CITED: https://owasp.org/www-project-application-security-verification-standard/] |
| V3 Session Management | Yes, indirectly | Preserve auth bootstrap/session-boundary handling and frontend stale result behavior. [VERIFIED: `apps/web/src/stores/auth-session.ts`; VERIFIED: `apps/web/src/stores/map-points.ts`; CITED: https://owasp.org/www-project-application-security-verification-standard/] |
| V4 Access Control | Yes | Keep current-user records scoped by authenticated user ID and do not create bypass routes. [VERIFIED: `apps/server/src/modules/records/records.controller.ts`; VERIFIED: `apps/server/src/modules/records/records.repository.ts`; CITED: https://owasp.org/www-project-application-security-verification-standard/] |
| V5 Input Validation | Yes | Use DTO validation and server catalog checks for save payloads; do not trust client fallback identity. [VERIFIED: `apps/server/src/modules/records/dto/create-travel-record.dto.ts`; VERIFIED: `apps/server/src/modules/records/records.service.ts`; CITED: https://owasp.org/www-project-application-security-verification-standard/] |
| V6 Cryptography | No new cryptography | Phase 45 does not introduce password/session crypto changes; existing auth hashing remains outside this phase. [VERIFIED: `.planning/phases/45-map-authoritative-coverage-expansion/45-CONTEXT.md`; VERIFIED: codebase grep; CITED: https://owasp.org/www-project-application-security-verification-standard/] |

### Known Threat Patterns for This Stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Client forges `placeId`/`boundaryId` metadata | Tampering | Validate authoritative metadata server-side before persistence; existing overseas guard does this. [VERIFIED: `apps/server/src/modules/records/records.service.ts`; VERIFIED: `apps/server/test/records-travel.e2e-spec.ts`] |
| Anonymous user opens save flow | Elevation of Privilege | Keep `SessionAuthGuard` on records endpoints and frontend login modal branch before `createTravelRecord`. [VERIFIED: `apps/server/src/modules/records/records.controller.ts`; VERIFIED: `apps/web/src/components/LeafletMapStage.vue`] |
| Fallback region saved as canonical record | Tampering / Integrity | Keep fallback `placeId`/`boundaryId` null and disabled CTA; test no record call. [VERIFIED: `apps/web/src/components/LeafletMapStage.vue`; VERIFIED: `apps/web/src/components/LeafletMapStage.spec.ts`] |
| Metadata drift breaks stats grouping | Integrity | Assert persisted `parentLabel`, `typeLabel`, and `subtitle` replay and stats refresh. [VERIFIED: `apps/server/test/auth-bootstrap.e2e-spec.ts`; VERIFIED: `apps/web/src/views/StatisticsPageView.spec.ts`] |

## Sources

### Primary (HIGH confidence)

- `AGENTS.md` - repository language and execution constraints. [VERIFIED: file read]
- `.planning/phases/45-map-authoritative-coverage-expansion/45-CONTEXT.md` - locked Phase 45 scope and user decisions. [VERIFIED: file read]
- `.planning/REQUIREMENTS.md` - COV-01 through COV-04 requirement text. [VERIFIED: file read]
- `.planning/ROADMAP.md` and `.planning/STATE.md` - Phase 45 dependency on Phase 44 and current project state. [VERIFIED: file read]
- `.planning/phases/44-world-footprints-map-footprint-date-dialog/44-05-SUMMARY.md` - Phase 44 snapshot-safe submit and `IlluminateResult` handoff. [VERIFIED: file read]
- `packages/contracts/src/resolve.ts`, `place.ts`, `geometry.ts`, `records.ts` - canonical response and record contracts. [VERIFIED: file read]
- `apps/server/src/modules/canonical-places/canonical-places.service.ts` and `place-metadata-catalog.ts` - server resolve and metadata catalog implementation. [VERIFIED: file read]
- `apps/server/src/modules/records/records.service.ts` and `records.repository.ts` - record save validation and stats behavior. [VERIFIED: file read]
- `apps/web/src/components/LeafletMapStage.vue`, `PointSummaryCard.vue`, `map-points.ts`, `geometry-manifest.ts`, `timeline.ts`, `StatisticsPageView.vue` - frontend save/highlight/replay flow. [VERIFIED: file read]
- Focused verification runs: web quick specs passed 29 tests, canonical resolve e2e passed 25 tests, records-travel e2e failed due Prisma environment. [VERIFIED: command runs 2026-05-15]
- npm registry version lookups for core packages. [VERIFIED: npm registry]

### Secondary (MEDIUM confidence)

- OWASP ASVS official project page - security verification standard reference. [CITED: https://owasp.org/www-project-application-security-verification-standard/]

### Tertiary (LOW confidence)

- None. [VERIFIED: source review]

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - project package files, lockfile, and npm registry were checked. [VERIFIED: `package.json`; VERIFIED: `pnpm-lock.yaml`; VERIFIED: npm registry]
- Architecture: HIGH - based on current code paths and focused tests. [VERIFIED: file reads; VERIFIED: focused test runs]
- Pitfalls: HIGH - derived from locked Phase 45 decisions and current split guard/fallback implementation. [VERIFIED: `.planning/phases/45-map-authoritative-coverage-expansion/45-CONTEXT.md`; VERIFIED: `apps/web/src/components/LeafletMapStage.vue`]
- Environment: MEDIUM - Node/npm/pnpm were verified, but Prisma-backed records e2e failed in current environment. [VERIFIED: command runs 2026-05-15]

**Research date:** 2026-05-15  
**Valid until:** 2026-06-14 for codebase architecture; 2026-05-22 for npm latest-version claims. [VERIFIED: research date and registry lookup timing]
