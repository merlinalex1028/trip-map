---
phase: 36-data-layer-extension
reviewed: 2026-04-29T00:00:00Z
depth: standard
files_reviewed: 17
files_reviewed_list:
  - apps/server/prisma/schema.prisma
  - packages/contracts/src/records.ts
  - apps/server/src/modules/records/dto/update-travel-record.dto.ts
  - apps/server/src/modules/records/records.repository.ts
  - apps/server/src/modules/records/records.service.ts
  - apps/server/src/modules/records/records.controller.ts
  - apps/server/src/modules/auth/auth.service.ts
  - apps/server/src/modules/auth/auth.service.spec.ts
  - apps/server/test/auth-bootstrap.e2e-spec.ts
  - apps/web/src/stores/map-points.ts
  - apps/web/src/App.spec.ts
  - apps/web/src/components/LeafletMapStage.spec.ts
  - apps/web/src/services/timeline.spec.ts
  - apps/web/src/stores/auth-session.spec.ts
  - apps/web/src/stores/map-points.spec.ts
  - apps/web/src/views/StatisticsPageView.spec.ts
  - apps/web/src/views/TimelinePageView.spec.ts
findings:
  critical: 1
  warning: 2
  info: 3
  total: 6
status: issues_found
---

# Phase 36: Code Review Report

**Reviewed:** 2026-04-29
**Depth:** standard
**Files Reviewed:** 17
**Status:** issues_found

## Summary

Phase 36 extends the data layer with PATCH/DELETE API endpoints for travel records and adds `notes`/`tags` fields to the Prisma schema and contracts. Overall the implementation is well-structured with good row-level security (userId in all where clauses), proper Prisma error mapping, and comprehensive tag cleaning logic. Two functional issues were found: a null-handling inconsistency in `toContractTravelRecord` and a date validation logic bug that rejects valid null-date PATCH operations.

## Critical Issues

### CR-01: `toContractTravelRecord` null-handling inconsistency between services

**File:** `apps/server/src/modules/records/records.service.ts:51-52`
**Issue:** The `toContractTravelRecord` function in `records.service.ts` uses bare type assertions for `typeLabel` and `parentLabel`, while the identical function in `auth.service.ts` correctly uses `?? ''` fallback. The Prisma schema defines both as `String?` (nullable), so records with `null` typeLabel/parentLabel will pass `null` through to the contract where `string` is expected, causing potential runtime errors in consumers.

```typescript
// records.service.ts (current — BUG)
typeLabel: record.typeLabel as ContractTravelRecord['typeLabel'],
parentLabel: record.parentLabel as ContractTravelRecord['parentLabel'],

// auth.service.ts (correct — reference)
typeLabel: record.typeLabel ?? '',
parentLabel: record.parentLabel ?? '',
```

**Fix:**
```typescript
// records.service.ts — align with auth.service.ts
typeLabel: record.typeLabel ?? '',
parentLabel: record.parentLabel ?? '',
```

## Warnings

### WR-01: Date validation uses stale existing dates when user clears a date to `null`

**File:** `apps/server/src/modules/records/records.service.ts:114-116`
**Issue:** When PATCH sends `{ startDate: null, endDate: "2025-09-01" }` to clear startDate and set a new endDate, the `??` operator falls through from `null` to the existing startDate. The validation then checks the old date against the new endDate, incorrectly rejecting a valid operation.

Scenario: record has `startDate="2025-10-01"`, user sends `{ startDate: null, endDate: "2025-09-01" }`. The effective dates become `startDate="2025-10-01"` (old value) and `endDate="2025-09-01"`, which fails the `endDate >= startDate` check. But the user's intent (clear startDate, set endDate) is valid since after the update startDate would be `null`.

```typescript
// current (BUG) — null ?? existing = existing, ignores user's intent to clear
const effectiveStart = input.startDate ?? existing.startDate
const effectiveEnd = input.endDate ?? existing.endDate
```

**Fix:**
```typescript
// Use undefined check to distinguish "not sent" from "explicitly set to null"
const effectiveStart = input.startDate !== undefined ? input.startDate : existing.startDate
const effectiveEnd = input.endDate !== undefined ? input.endDate : existing.endDate
```

### WR-02: Duplicate `toContractTravelRecord` function across two services

**File:** `apps/server/src/modules/auth/auth.service.ts:35-55` and `apps/server/src/modules/records/records.service.ts:42-62`
**Issue:** The same mapping function is implemented independently in both `auth.service.ts` and `records.service.ts`. The inconsistency in CR-01 is a direct consequence of this duplication. Any future schema change requires synchronized updates to both locations.

**Fix:** Extract `toContractTravelRecord` into a shared utility (e.g., `apps/server/src/modules/records/travel-record.mapper.ts`) and import it from both services.

## Info

### IN-01: No dedicated unit/e2e tests for PATCH and DELETE record endpoints

**File:** N/A (missing tests)
**Issue:** The review shows updated existing tests (auth.service.spec.ts, auth-bootstrap.e2e-spec.ts, web test files) to include the new `notes`/`tags`/`updatedAt` fields, but there are no new tests specifically for:
- `PATCH /records/:id` with valid partial updates
- `PATCH /records/:id` with date conflict (P2002 → 409)
- `PATCH /records/:id` with non-existent record (P2025 → 404)
- `PATCH /records/:id` tag cleaning (trim + dedup + filter)
- `PATCH /records/:id` date range validation
- `DELETE /records/record/:id` success and not-found cases

**Fix:** Add unit tests for `RecordsService.updateTravelRecord` and `RecordsService.deleteTravelRecord`, plus e2e tests for the controller endpoints.

### IN-02: Missing `@ApiOkResponse` type on PATCH endpoint

**File:** `apps/server/src/modules/records/records.controller.ts:95`
**Issue:** The `@ApiOkResponse()` decorator on the PATCH endpoint doesn't specify the response type, unlike other typed endpoints. This affects Swagger documentation accuracy.

**Fix:**
```typescript
@ApiOkResponse({ type: UpdateTravelRecordDto }) // or a Swagger response type
```

### IN-03: Prisma schema `updatedAt` field is auto-managed but present in contract response

**File:** `apps/server/prisma/schema.prisma:85`
**Issue:** The `updatedAt DateTime @updatedAt` field is auto-managed by Prisma (updated on every write). This is correctly reflected in the contract's `TravelRecord.updatedAt` and mapped via `.toISOString()` in both services. Just noting that PATCH operations will automatically bump `updatedAt` even when only `notes` or `tags` change, which is correct behavior.

---

_Reviewed: 2026-04-29_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
