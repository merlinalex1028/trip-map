---
phase: 48-visual-qa-accessibility
verified: 2026-05-27T13:32:53Z
status: gaps_found
score: 4/6 must-haves verified
overrides_applied: 0
gaps:
  - truth: "No unresolved high-severity auth, date-dialog, accessibility, visual, reduced-motion, or regression blocker remains."
    status: failed
    reason: "48-REVIEW.md reports critical/blocker findings that are still observable in the current source: the QA seed uses a committed password, auth forms retain submitted passwords after success/close, and date shortcuts are based on a stale component-created today value."
    artifacts:
      - path: "apps/server/scripts/seed-visual-qa.mjs"
        issue: "Lines 1-2 hardcode `VisualQa2026!`; lines 198-209 reset `passwordHash` on upsert without an environment guard."
      - path: "apps/web/src/components/auth/AuthDialog.vue"
        issue: "Reactive login/register password fields are not cleared after successful submit or close."
      - path: "apps/web/src/components/map-popup/FootprintDateDialog.vue"
        issue: "Lines 59-62 compute `todayValue` once; shortcut handlers reuse it after midnight."
    missing:
      - "Gate the seed password behind environment input and refuse production-like seeding, or add an accepted override."
      - "Clear auth credential state on close and successful login/register."
      - "Recompute date shortcuts on dialog open/click."
  - truth: "Dialog, Calendar, navigation, chart/status regions, and login entry support focus management and readable accessibility semantics."
    status: failed
    reason: "Focused tests pass, but current code still contains review-confirmed accessibility defects: initial closed auth modal can steal focus, BaseChart wraps alert/status states in `role=\"img\"`, and FootprintDateDialog nests a second dialog role inside DialogContent."
    artifacts:
      - path: "apps/web/src/components/auth/AuthDialog.vue"
        issue: "Watcher uses `{ immediate: true }` and calls focus restore on the initial closed state."
      - path: "apps/web/src/components/common/BaseChart.vue"
        issue: "Outer `role=\"img\"` is always present even while rendering `role=\"alert\"` or `role=\"status\"` children."
      - path: "apps/web/src/components/map-popup/FootprintDateDialog.vue"
        issue: "Inner `[data-region=\"footprint-date-dialog\"]` has `role=\"dialog\"` under DialogContent."
    missing:
      - "Restore focus only on a true open-to-closed transition."
      - "Apply chart `role=\"img\"` only to the rendered-chart state, not loading/empty/error states."
      - "Remove the nested dialog role and let the UI DialogContent own dialog semantics."
  - truth: "Phase 48 release regression gate proves existing auth, records, timeline, statistics, and contracts tests are not broken."
    status: partial
    reason: "Web and contracts are green, and a Task 1 server run passed, but the latest documented plan-level server gate exited 1 with DB `P1001`; this is separated as environment risk, but the final server gate is not cleanly reproducible from the evidence."
    artifacts:
      - path: ".planning/phases/48-visual-qa-accessibility/evidence/regression-results.md"
        issue: "Records `pnpm --filter @trip-map/server test` final plan-level rerun exit status 1 due DB reachability."
    missing:
      - "Rerun `pnpm --filter @trip-map/server test` with reachable DB and record exit 0, or add a formal accepted override for the environment-only failure."
  - truth: "Modified phase files have no unresolved debt markers that block auditable completion."
    status: failed
    reason: "Debt-marker gate treats unreferenced TODO/FIXME/XXX in modified phase files as blockers; the skipped logout tests are marked TODO without an issue/PR/DEF reference."
    artifacts:
      - path: "apps/web/src/components/shell/AuthenticatedAppShell.spec.ts"
        issue: "Line 148: `TODO: re-enable logout test when design finalizes the logout placement (43-UAT.md test 10)`."
    missing:
      - "Replace the TODO with a formal tracked reference, remove it, or implement/re-enable the logout path tests."
human_verification: []
---

# Phase 48: Visual QA、Accessibility 与回归验证 Verification Report

**Phase Goal:** Visual QA、Accessibility 与回归验证 - 对 v8.0 所有新页面和关键交互做桌面截图、可访问性、动效降级和现有功能回归验证。  
**Verified:** 2026-05-27T13:32:53Z  
**Status:** gaps_found  
**Re-verification:** No - a previous `48-VERIFICATION.md` existed, but it had no YAML frontmatter or structured `gaps:` section, so this is an initial goal-backward verification.

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|---|---|---|
| 1 | Seeded QA evidence harness exists and is reproducible before screenshot claims. | VERIFIED | `seed-visual-qa.mjs` contains the fixed QA account and four records; `seed-data.md` documents commands; spot-check `pnpm --filter @trip-map/server exec node scripts/seed-visual-qa.mjs --dry-run` exited 0 and validated 4 records. |
| 2 | Landing, map, footprint dialog, journal, and memories desktop screenshots show no obvious overlap, truncation, or unreadable text in the recorded matrix. | VERIFIED | All five PNGs exist at 1440x1180; `desktop-checklist.md` has one `pass` row per state and no `repair-needed` row. |
| 3 | Leaflet map, star marker, and all four ECharts panels are non-empty in local evidence. | VERIFIED | `desktop-checklist.md` lines name visible Leaflet surface, star marker, monthly trend, country/region distribution, yearly trend, and memories-profile radar; screenshots exist. |
| 4 | Dialog, Calendar, navigation, chart/status regions, and login entry support keyboard/focus/ARIA semantics. | FAILED | Focused specs pass, but current code still matches review findings: `AuthDialog.vue` immediate closed-state focus restore, `BaseChart.vue` unconditional `role="img"` around status/alert children, and nested dialog role in `FootprintDateDialog.vue`. |
| 5 | `prefers-reduced-motion` lowers decorative motion without blocking core operation. | VERIFIED | `desktop-checklist.md` records reduced-motion pass; source guards exist in `LandingHero.vue`, `TimelinePageView.vue`, `TimelineVisitCard.vue`, and `StatisticsPageView.vue`; focused tests passed in recorded evidence. |
| 6 | Release regression gate and review closeout prove no residual blocker remains. | FAILED | Web/contracts are green and focused spot-checks passed, but latest documented server gate exited 1 due DB `P1001`; `48-REVIEW.md` blocker findings remain in source; `AuthenticatedAppShell.spec.ts` has an untracked TODO debt marker. |

**Score:** 4/6 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|---|---|---|---|
| `apps/server/scripts/seed-visual-qa.mjs` | Repeatable visual QA account and records seeding | PARTIAL | Dry-run works and fixtures are substantive; security blocker remains because password is committed and reset on every run. |
| `evidence/seed-data.md` | Seed account and environment notes | VERIFIED | Documents dry-run, real seed command, credentials, fixture records, and DB availability. |
| `evidence/desktop-checklist.md` | Desktop QA checklist and repair queue | VERIFIED | Five desktop screenshot rows are final `pass`; accessibility, visual, and reduced-motion repair notes are present. |
| `evidence/desktop-*.png` | Five desktop screenshot proofs | VERIFIED | `file` reports all five screenshots as 1440x1180 PNG images. |
| `AuthDialog.vue`, `ShellSidebar.vue`, `LeafletMapStage.vue`, `FootprintDateDialog.vue`, `BaseChart.vue` | Accessibility repairs | PARTIAL | Substantive and wired, but review-confirmed defects remain in auth focus/credential handling, date shortcut freshness, nested dialog semantics, and chart status semantics. |
| `evidence/regression-results.md` | Release gate command outcomes | PARTIAL | Web/contracts pass; server Task 1 pass is recorded; latest server rerun exit 1 is documented as DB environment. |
| `evidence/repair-summary.md` | Repair and residual risk summary | VERIFIED | Required sections exist and map repairs to source paths; residual DB risk is recorded. |

### Key Link Verification

| From | To | Via | Status | Details |
|---|---|---|---|---|
| `seed-visual-qa.mjs` | `seed-data.md` | Fixed account and fixtures documented | WIRED | `visual-qa@example.test` and all fixture place IDs appear in source/evidence. |
| `desktop-checklist.md` | `desktop-*.png` | One checklist row per screenshot | WIRED | Manual check confirms each screenshot filename appears in a checklist `pass` row; gsd regex matcher missed backticked markdown names. |
| `AuthDialog.vue` | `AuthDialog.spec.ts` | Dialog keyboard/focus/error assertions | WIRED | Spec asserts `[data-auth-dialog]`, `role="dialog"`, `aria-modal`, tablist semantics, focus restoration, and `role="alert"`. |
| `LeafletMapStage.vue` | `FootprintDateDialog.vue` | Open/cancel/save props and events | WIRED | `FootprintDateDialog` is imported and rendered; specs assert save/cancel focus restoration. |
| `MemoriesChartGrid.vue` | `BaseChart.vue` | Four BaseChart panels | WIRED | Source and spec retain `monthly-trend`, `country-distribution`, `yearly-trend`, and `memories-profile`. |
| `regression-results.md` | `vitest-run.mjs` | DB environment classification | WIRED | Regression evidence names `P1001` and affected DB-backed specs separately from product logic. |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|---|---|---|---|---|
| `seed-visual-qa.mjs` | `RECORD_FIXTURES` | Static QA fixture array written through Prisma `userTravelRecord.createMany` | Yes for QA fixture data | FLOWING |
| `MemoriesChartGrid.vue` | Chart panel props/options | `StatisticsPageView.vue` server-authoritative stats flow from earlier phases; Phase 48 preserved selectors and labels | Evidence says populated data renders | FLOWING |
| `LeafletMapStage.vue` | Footprint dialog place snapshot | Map popup state passed to `FootprintDateDialog` | Yes, but date shortcut default can go stale after midnight | PARTIAL |
| `BaseChart.vue` | `loading`, `empty`, `error`, `option` | Parent chart props | Real state rendered, but ARIA role layering is flawed | PARTIAL |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|---|---|---|---|
| Seed dry-run validates fixtures without DB | `pnpm --filter @trip-map/server exec node scripts/seed-visual-qa.mjs --dry-run` | Exit 0; printed QA email, 4 records, and four place IDs | PASS |
| Focused a11y specs still pass | `pnpm --filter @trip-map/web test -- src/components/auth/AuthDialog.spec.ts src/components/map-popup/FootprintDateDialog.spec.ts src/components/common/BaseChart.spec.ts src/components/shell/AuthenticatedAppShell.spec.ts` | Exit 0; 4 files passed, 30 passed, 2 skipped | PASS_WITH_GAPS |
| Full server release gate | Not rerun | Existing evidence records latest plan-level exit 1 due DB `P1001` | FAILING_EVIDENCE |

### Probe Execution

No phase-declared `probe-*.sh` scripts were found. Step 7c skipped.

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|---|---|---|---|---|
| QA-01 | 48-01, 48-04, 48-05 | 桌面和移动端截图验证核心页面/弹窗无明显重叠、截断或不可读文本。 | PARTIAL | Desktop evidence is verified. Requirement text includes mobile, but Phase 48 goal/plans/evidence are explicitly desktop-only; no mobile screenshot evidence exists. |
| QA-02 | 48-01, 48-03, 48-05 | 地图和图表本地非空渲染，Leaflet、星形标记、ECharts 可见。 | VERIFIED | Checklist and screenshots record Leaflet surface, star marker, and four ECharts panels. |
| QA-03 | 48-02, 48-03, 48-05 | Dialog、Calendar、导航和登录入口支持键盘、焦点管理、可读 aria。 | FAILED | Focused specs cover much of this, but code review accessibility/focus findings remain in source. |
| QA-04 | 48-01, 48-04, 48-05 | Reduced motion 下动效降级，核心操作不受影响。 | VERIFIED | Checklist and source greps confirm local reduced-motion guards on animated/hover surfaces. |
| QA-05 | 48-05 | 新增依赖不会破坏 auth、records、timeline、statistics 回归测试。 | PARTIAL | Web and contracts passed; server had an earlier pass but latest documented rerun exited 1 due DB reachability. Needs clean DB rerun or accepted environment override. |

No additional Phase 48 requirement IDs were found outside QA-01 through QA-05.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|---|---:|---|---|---|
| `apps/web/src/components/shell/AuthenticatedAppShell.spec.ts` | 148 | `TODO` without issue/PR/DEF reference | BLOCKER | Debt-marker gate blocks auditable completion; skipped logout tests remain untracked. |
| `apps/server/scripts/seed-visual-qa.mjs` | 1-2, 198-209 | Known password and forced reset | BLOCKER | Review CR-01 remains; unsafe if used against shared or production-like DB. |
| `apps/web/src/components/auth/AuthDialog.vue` | 24-33, 102-103 | Password state persists after close/success | BLOCKER | Review CR-02 remains; credential data can be repopulated in the global mounted modal. |
| `apps/web/src/components/map-popup/FootprintDateDialog.vue` | 59-62, 119-131 | Stale date default/shortcuts | BLOCKER | Review CR-03 remains; app left open across midnight can save wrong date. |
| `apps/web/src/components/common/BaseChart.vue` | 47-84 | `role="img"` wraps live/error states | WARNING | QA-03 accessibility semantics remain incomplete. |
| `apps/web/src/components/map-popup/FootprintDateDialog.vue` | 153-158 | Nested `role="dialog"` | WARNING | Screen-reader dialog navigation/naming can be confused. |
| `apps/web/src/components/LeafletMapStage.vue` | 940-950 | Click listener not cleaned up | WARNING | Remount/HMR can duplicate recognition requests; not directly a QA-01..QA-05 blocker but residual risk. |

### Human Verification Required

None. The current result is blocked by observable source/evidence gaps, not by missing manual-only checks.

### Gaps Summary

Phase 48 has strong desktop evidence: five screenshot files exist, the checklist is complete, map/chart evidence is present, reduced-motion guards are recorded, and focused frontend tests pass. However, the final phase goal is not fully achieved because the closing condition "no unresolved high-severity blocker remains" is false in the actual codebase. The advisory review's blocker findings are still present, one modified spec contains an untracked TODO debt marker, and the latest server regression gate is not a clean pass due DB reachability.

These gaps should be closed or formally overridden before Phase 48 is treated as passed.

---

_Verified: 2026-05-27T13:32:53Z_  
_Verifier: the agent (gsd-verifier)_
