---
phase: 45
slug: map-authoritative-coverage-expansion
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-05-15
---

# Phase 45 - Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.4 for web and server tests |
| **Config file** | `apps/web/vitest.config.ts`, `apps/server/vitest.config.ts` |
| **Quick run command** | `pnpm --filter @trip-map/web test -- src/services/geometry-manifest.spec.ts src/components/map-popup/PointSummaryCard.spec.ts` |
| **Resolve run command** | `pnpm --filter @trip-map/server test -- test/canonical-resolve.e2e-spec.ts` |
| **Records gate command** | `pnpm --filter @trip-map/server test -- test/records-travel.e2e-spec.ts` |
| **Full suite command** | `pnpm --filter @trip-map/web test && pnpm --filter @trip-map/web build && pnpm --filter @trip-map/server test` |
| **Estimated runtime** | Focused web/server specs should remain under 180 seconds; DB-backed records suites may depend on local Prisma environment health |

---

## Sampling Rate

- **After every task commit:** Run the focused spec for the edited area, plus `pnpm --filter @trip-map/web test -- src/services/geometry-manifest.spec.ts src/components/map-popup/PointSummaryCard.spec.ts` when availability or popup behavior changes.
- **After every plan wave:** Run server resolve e2e plus focused web specs for `LeafletMapStage`, `PointSummaryCard`, `geometry-manifest`, `timeline`, and `StatisticsPageView`.
- **Before `$gsd-verify-work`:** Run the full web test/build gate, server canonical resolve e2e, and DB-backed records/auth-bootstrap suites when the database environment is healthy.
- **Max feedback latency:** 180 seconds for focused checks; record DB gate failures must report environment health separately from behavioral failures.

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 45-W0-01 | TBD | 0 | COV-01, COV-02 | T-45-01 / T-45-03 | Coverage samples expose exact runtime breakpoint reasons without accepting forged authoritative identity. | unit/e2e fixture | `pnpm --filter @trip-map/server test -- test/canonical-resolve.e2e-spec.ts` | Planned create `apps/server/test/phase45-coverage-cases.ts` | pending |
| 45-W0-02 | TBD | 0 | COV-03 | T-45-02 / T-45-04 | Fallback or incomplete canonical points keep `留下足迹` disabled and never submit a fake save payload. | unit/component | `pnpm --filter @trip-map/web test -- src/services/footprint-availability.spec.ts src/components/map-popup/PointSummaryCard.spec.ts` | Planned create `apps/web/src/services/footprint-availability.ts` and spec | pending |
| 45-W0-03 | TBD | 1 | COV-02, COV-03 | T-45-01 / T-45-02 | CTA state and date-dialog open guard use the same authoritative availability predicate. | component | `pnpm --filter @trip-map/web test -- src/components/LeafletMapStage.spec.ts` | Existing spec to extend | pending |
| 45-W0-04 | TBD | 2 | COV-04 | T-45-03 | Saved samples replay consistent `displayName`, `typeLabel`, `parentLabel`, and `subtitle` through map, journal, and memories. | integration/e2e | `pnpm --filter @trip-map/web test -- src/services/timeline.spec.ts src/views/StatisticsPageView.spec.ts` plus `pnpm --filter @trip-map/server test -- test/auth-bootstrap.e2e-spec.ts` when DB is healthy | Existing specs to extend | pending |
| 45-W0-05 | TBD | 3 | COV-01, COV-02, COV-03, COV-04 | T-45-01 / T-45-02 / T-45-03 / T-45-04 | Final phase gate proves resolved samples save/highlight/replay, while unsupported samples remain explanatory only. | full gate | `pnpm --filter @trip-map/web test && pnpm --filter @trip-map/web build && pnpm --filter @trip-map/server test` | Existing scripts | pending |

*Status values: pending, green, red, flaky.*

---

## Wave 0 Requirements

- [ ] `apps/server/test/phase45-coverage-cases.ts` - define fixed/classified samples with canonical identity, expected breakpoint, and expected friendly category.
- [ ] `apps/web/src/services/footprint-availability.ts` - shared reason-returning frontend classifier.
- [ ] `apps/web/src/services/footprint-availability.spec.ts` - exact technical reason plus friendly category assertions.
- [ ] Extend `apps/server/test/canonical-resolve.e2e-spec.ts` with Phase 45 matrix logging/assertions.
- [ ] Extend `apps/web/src/components/LeafletMapStage.spec.ts` for matrix-driven save/highlight behavior.
- [ ] Extend replay/derived-view tests only for newly fixed or newly classified samples.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Warm unavailable-place explanation remains understandable in the popup. | COV-03 | Component tests can assert text, but final tone and visual placement need a quick product pass. | Run the web app, click a recognized-but-unsaveable/fallback location, and confirm the disabled `留下足迹` CTA remains visible with friendly copy that does not expose `boundaryId`, `metadata`, or manifest jargon. |
| Boundary highlight behavior is visually sane for newly fixed samples. | COV-02, COV-04 | Automated manifest/shard assertions cover the data path; a browser pass catches obvious highlight layering regressions. | Save one newly fixed sample, reopen the map, and confirm the expected boundary highlights without duplicate or stale layers. |

---

## Validation Sign-Off

- [x] All planned implementation areas have automated verification or Wave 0 dependencies.
- [x] Sampling continuity: no 3 consecutive implementation tasks should proceed without automated verify.
- [x] Wave 0 covers all missing references from the research matrix.
- [x] No watch-mode flags.
- [x] Feedback latency target is below 180 seconds for focused checks.
- [x] `nyquist_compliant: true` set in frontmatter.
- [ ] DB-backed records/auth-bootstrap environment is healthy or explicitly reported as unavailable during execution.

**Approval:** pending
