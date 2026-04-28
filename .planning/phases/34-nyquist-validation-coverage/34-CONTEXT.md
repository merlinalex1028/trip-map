# Phase 34: Nyquist Validation Coverage - Context

**Gathered:** 2026-04-28
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 34 closes the Nyquist validation tech debt identified in the v6.0 milestone audit. Four VALIDATION.md files (Phase 27, 29, 30, 32) currently have `nyquist_compliant: false` and `wave_0_complete: false` — this phase upgrades them to `nyquist_compliant: true` and `wave_0_complete: true`, following Phase 28's established template.

This phase is pure tech debt closure — it does not modify any runtime code, add new features, or change existing validation strategies. Each VALIDATION.md already has partial content (Per-Task Verification Map with some rows, body sections); the work is to fill remaining gaps, add Manual-Only Verifications, complete the Validation Sign-Off checklist, and flip the frontmatter flags.

**In scope:**
- Phase 27 VALIDATION.md: upgrade from nyquist_compliant=false to true, wave_0_complete=false to true
- Phase 29 VALIDATION.md: upgrade from nyquist_compliant=false to true, wave_0_complete=false to true
- Phase 30 VALIDATION.md: upgrade from nyquist_compliant=false to true, wave_0_complete=false to true
- Phase 32 VALIDATION.md: upgrade from nyquist_compliant=false to true, wave_0_complete=false to true

**Out of scope:**
- Phase 28 and 31 VALIDATION.md — already compliant
- Any runtime code changes
- Any new feature work or scope expansion
- Phase 35 Test Fixture Alignment (separate phase)

</domain>

<decisions>
## Implementation Decisions

### Execution Order
- **D-01:** All 4 VALIDATION.md files are updated in parallel. The phases are independent — each VALIDATION.md covers its own phase's plans and tasks, with no cross-phase ordering dependency.

### Completeness Standard
- **D-02:** Full Nyquist compliance matching Phase 28's standard. Each VALIDATION.md must include:
  - Per-Task Verification Map with all rows filled (threat ref, secure behavior, test type, automated command)
  - Wave 0 Requirements checked
  - Manual-Only Verifications listed where applicable
  - Validation Sign-Off checklist complete
  - Frontmatter: `nyquist_compliant: true`, `wave_0_complete: true`, `status: approved`

### Claude's Discretion
- Per-Task Verification Map entries follow each phase's existing SUMMARY.md evidence. Where SUMMARY exists for a plan, the verification row records the actual test commands and results. Where gaps exist, appropriate manual-only verification rows are added.
- The exact format follows Phase 28's VALIDATION.md as the canonical reference — Samplings Rate, Per-Task Verification Map, Manual-Only Verifications, and Validation Sign-Off sections.
- Existing content in each VALIDATION.md is preserved and supplemented, not replaced.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase Scope & Audit Baseline
- `.planning/ROADMAP.md` — Phase 34 goal, success criteria, and gap-closure boundary
- `.planning/milestones/v6.0-MILESTONE-AUDIT.md` — Nyquist Validation Coverage section with per-phase action items
- `.planning/REQUIREMENTS.md` — No new requirements; tech debt closure only

### Canonical Template (Target State)
- `.planning/phases/28-overseas-coverage-expansion/28-VALIDATION.md` — The authoritative example of `nyquist_compliant: true` with complete Per-Task Verification Map, Manual-Only Verifications, and Validation Sign-Off

### Target Files (to be upgraded)
- `.planning/phases/27-multi-visit-record-foundation/27-VALIDATION.md` — Current state: draft, nyquist_compliant=false
- `.planning/phases/29-timeline-page-and-account-entry/29-VALIDATION.md` — Current state: draft, nyquist_compliant=false
- `.planning/phases/30-travel-statistics-and-completion-overview/30-VALIDATION.md` — Current state: draft, nyquist_compliant=false
- `.planning/phases/32-route-deep-link-and-acceptance-closure/32-VALIDATION.md` — Current state: draft, nyquist_compliant=false

### Evidence Sources (SUMMARY files per phase)
- `.planning/phases/27-multi-visit-record-foundation/27-01-SUMMARY.md` through `27-06-SUMMARY.md`
- `.planning/phases/29-timeline-page-and-account-entry/29-01-SUMMARY.md` through `29-04-SUMMARY.md`
- `.planning/phases/30-travel-statistics-and-completion-overview/30-01-SUMMARY.md` through `30-05-SUMMARY.md`
- `.planning/phases/32-route-deep-link-and-acceptance-closure/32-01-SUMMARY.md` through `32-03-SUMMARY.md`

### Validation Files for Reference (already compliant)
- `.planning/phases/28-overseas-coverage-expansion/28-VALIDATION.md`
- `.planning/phases/31-statistics-sync-refresh-hardening/31-VALIDATION.md`

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `28-VALIDATION.md` — Full Nyquist-compliant template with complete Per-Task Verification Map, Manual-Only Verifications, and Validation Sign-Off sections
- `31-VALIDATION.md` — Second example of nyquist_compliant=true for reference
- All 4 target VALIDATION.md files already exist with partial Per-Task Verification Map content

### Established Patterns
- Nyquist VALIDATION.md follows a consistent structure: Test Infrastructure → Sampling Rate → Per-Task Verification Map → Wave 0 Requirements → Manual-Only Verifications → Validation Sign-Off
- Frontmatter tracks: `phase`, `slug`, `status` (draft/approved), `nyquist_compliant`, `wave_0_complete`, `created`

### Integration Points
- Each VALIDATION.md is self-contained — no cross-file dependencies for content
- Verification evidence draws from each phase's existing SUMMARY.md files
- Manual-only verifications reference the same HUMAN-UAT.md files already present in each phase directory

</code_context>

<specifics>
## Specific Ideas

- Follow Phase 28's Per-Task Verification Map structure exactly: Plan → Wave → Requirement → Threat Ref → Secure Behavior → Test Type → Automated Command → File Exists → Status
- Use the actual test commands from each phase's SUMMARY.md as the automated command entries where available
- For phases without existing automated tests for specific tasks, add Manual-Only Verification rows

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 34-nyquist-validation-coverage*
*Context gathered: 2026-04-28*
