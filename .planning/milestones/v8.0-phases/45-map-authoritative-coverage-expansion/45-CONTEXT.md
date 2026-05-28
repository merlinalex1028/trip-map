# Phase 45: 可用地点覆盖扩展 - Context

**Gathered:** 2026-05-15T11:57:26+08:00
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 45 identifies the real runtime gaps where the server can recognize a place but the app still cannot reliably leave a footprint, then fixes the saveable coverage gaps that already have enough authoritative canonical identity to support saving, highlighting, and replay. It should not become broad geodata governance, a new data-source ingestion project, or a UI diagnostic dashboard.

</domain>

<decisions>
## Implementation Decisions

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

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project and Scope
- `.planning/PROJECT.md` — v8.0 milestone scope, core product value, out-of-scope constraints, and accumulated project decisions.
- `.planning/REQUIREMENTS.md` — Phase 45 requirements `COV-01` through `COV-04`.
- `.planning/ROADMAP.md` — Phase 45 goal, success criteria, dependency on Phase 44, and milestone sequencing.
- `.planning/STATE.md` — Current project state, prior decisions, and the Phase 44 handoff into Phase 45.
- `.planning/phases/42-ui-primitives-yume-kawaii-theme-bridge/42-CONTEXT.md` — v8 UI foundation and asset rules that still constrain user-facing unavailable-place surfaces.
- `.planning/phases/43-landing/43-CONTEXT.md` — locked route/shell vocabulary and v8 terminology, including `留下足迹`.
- `.planning/phases/44-world-footprints-map-footprint-date-dialog/44-CONTEXT.md` — required predecessor context for the unified popup, disabled CTA behavior, snapshot-safe date dialog, and the rule that Phase 45 owns saveable coverage expansion.
- `.planning/phases/44-world-footprints-map-footprint-date-dialog/44-05-SUMMARY.md` — implementation handoff noting that Phase 45 can reuse `IlluminateResult` and snapshot-safe submit behavior.

### Current Runtime Chain
- `apps/server/src/modules/canonical-places/canonical-places.service.ts` — runtime canonical resolve path, geometry hit testing, ambiguous handling, and `OUTSIDE_SUPPORTED_DATA` failures.
- `apps/server/src/modules/canonical-places/place-metadata-catalog.ts` — authoritative metadata lookup by `placeId` and `boundaryId`, plus the manifest-backed metadata contract.
- `apps/server/src/modules/records/records.service.ts` — authoritative overseas record validation and user travel record creation gate.
- `packages/contracts/src/resolve.ts` — canonical resolve response contract and required resolved/candidate place shape.
- `packages/contracts/src/geometry.ts` — geometry reference contract used by both server and frontend.
- `packages/contracts/src/generated/geometry-manifest.generated.ts` — generated geometry manifest that determines which canonical `boundaryId` values can be looked up for map rendering.
- `apps/web/src/components/LeafletMapStage.vue` — current map click, resolve, dialog opening, snapshot submit, geometry shard load, and footprint save orchestration.
- `apps/web/src/components/map-popup/PointSummaryCard.vue` — disabled footprint CTA and unavailable-place explanation surface.
- `apps/web/src/stores/map-points.ts` — frontend record state, save result handling, summary surface state, and active boundary coverage state.
- `apps/web/src/services/geometry-manifest.ts` — frontend manifest lookup helper for `boundaryId`.
- `apps/web/src/services/city-boundaries.ts` — existing boundary coverage helpers and legacy renderable boundary mapping.

### Regression and Fixture Surfaces
- `apps/server/test/canonical-resolve.e2e-spec.ts` — current resolve coverage and unsupported-data assertions.
- `apps/server/test/records-travel.e2e-spec.ts` — record save validation, authoritative metadata rejection, and identity collision coverage.
- `apps/server/test/auth-bootstrap.e2e-spec.ts` — replay/bootstrap coverage for authoritative travel records.
- `apps/server/test/records-sync.e2e-spec.ts` — multi-session record replay and metadata consistency checks.
- `apps/server/test/phase28-overseas-cases.ts` — existing authoritative overseas fixture matrix and collision cases.
- `apps/web/src/components/map-popup/PointSummaryCard.spec.ts` — popup CTA availability, unsupported notice, and candidate/detail behavior.
- `apps/web/src/components/LeafletMapStage.spec.ts` — likely focused frontend integration point for save/highlight behavior if existing coverage is extended.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `CanonicalPlacesService`: already builds resolved places from `GEOMETRY_MANIFEST` plus metadata catalog and returns failed `OUTSIDE_SUPPORTED_DATA` responses when no supported geometry is hit. It is the main source for runtime breakpoint samples.
- `place-metadata-catalog.ts`: already throws when manifest entries lack matching geometry or metadata, and exposes by-place/by-boundary lookup helpers that can power authoritative test assertions.
- `RecordsService.assertAuthoritativeOverseasRecord`: already rejects forged or stale overseas payloads with concrete mismatch messages; Phase 45 should reuse this gate rather than weakening it.
- `LeafletMapStage.vue`: already refuses to open the date dialog unless the active point has full save payload fields and already loads geometry shards after save.
- `PointSummaryCard.vue`: already displays disabled `留下足迹` behavior and an inline unavailable reason for non-saveable points.
- `map-points.ts`: already computes `boundarySupportState` and centralizes `illuminate` save results; it can host or consume refined availability reason data.

### Established Patterns
- The authoritative source of saveability is the shared canonical identity plus manifest-backed metadata/geometry contract. Frontend fallback recognition is allowed for explanation, not for saving.
- Runtime coverage tests already use fixture matrices for Phase 28 overseas identities and collision cases. Phase 45 should extend that pattern for newly fixed/classified samples instead of inventing a separate audit mechanism.
- Vue code follows Composition API with Pinia stores and focused component tests; availability classification should be testable without a broad UI re-architecture.
- Phase 44 established the snapshot-safe dialog submit pattern and disabled unavailable CTA behavior; Phase 45 should refine availability reasons and coverage, not redesign the popup/date dialog flow.

### Integration Points
- Server resolve tests should expose which runtime samples resolve, fail, or become ambiguous, and why.
- Record API tests should assert that fixed samples can save and that still-unsupported samples fail with precise authoritative reasons.
- Bootstrap/replay/statistics/journal-derived tests should assert title and grouping consistency for newly fixed samples.
- Frontend popup/store tests should assert disabled CTA behavior, friendly reason category mapping, and manifest/highlight lookup behavior for the same sample matrix.

</code_context>

<specifics>
## Specific Ideas

- The phase should feel like repairing a broken authoritative pipeline for places the system already understands, not like trying to make every recognized country/region saveable.
- Developer-facing audit output should make failures actionable by naming canonical identity and blocking reason.
- User-facing unavailable copy should stay gentle and product-like: recognized places can still be unavailable because current map data is not stable enough to save a footprint.
- The disabled `留下足迹` CTA is important because it preserves the mental model that leaving footprints is possible for authoritative places while preventing a false submit path.

</specifics>

<deferred>
## Deferred Ideas

- New geodata sources, broad data generation, or long-term catalog governance should become a separate future data coverage effort.
- Fallback country/region recognition should not be upgraded into saveable records in this phase.
- A dev-only coverage dashboard or in-app diagnostic panel is not part of Phase 45.
- Full Playwright visual QA for map highlight rendering remains outside this phase unless later QA work explicitly requires it.

</deferred>

---

*Phase: 45-可用地点覆盖扩展*
*Context gathered: 2026-05-15T11:57:26+08:00*
