## ROOT CAUSE FOUND

**Root Cause:** The `SmokeRecord` Prisma model is missing the five `CanonicalPlaceSummary` extension fields (`regionSystem`, `adminType`, `typeLabel`, `parentLabel`, `subtitle`). The repository only persists the six base fields it knows about, so when the test fetches `storedRows[0]` directly from the database via Prisma, those five fields are absent. `expect(storedRows[0]).toMatchObject(smokeRequest)` therefore fails because `smokeRequest` includes all ten fields of `PHASE11_SMOKE_RECORD_REQUEST`.

**Evidence Summary:**
- `PHASE11_SMOKE_RECORD_REQUEST` (fixtures.ts line 8–19) is typed as `SmokeRecordCreateRequest`, which extends `CanonicalPlaceSummary`. It carries ten fields including `regionSystem`, `adminType`, `typeLabel`, `parentLabel`, and `subtitle`.
- The test assertion on line 89 is `expect(storedRows[0]).toMatchObject(smokeRequest)` — it expects the database row to contain all ten fields.
- `schema.prisma` `SmokeRecord` model (lines 11–21) only defines: `id`, `placeId`, `boundaryId`, `placeKind`, `datasetVersion`, `displayName`, `note`, `createdAt`, `updatedAt`. The five `CanonicalPlaceSummary` extension fields are absent.
- `records.repository.ts` `createSmokeRecord()` (lines 15–26) only writes the six fields the schema knows about; `regionSystem`, `adminType`, `typeLabel`, `parentLabel`, and `subtitle` are silently dropped at persistence time.
- `records.service.ts` `createSmoke()` (lines 29–48) does reconstruct those five fields from `input` for the HTTP response, so the first assertion `expect(response.json()).toMatchObject(smokeRequest)` on line 80 passes — only the DB-row assertion fails.

**Files Involved:**
- `apps/server/prisma/schema.prisma`: `SmokeRecord` model is missing `regionSystem`, `adminType`, `typeLabel`, `parentLabel`, `subtitle` columns.
- `apps/server/src/modules/records/records.repository.ts`: `createSmokeRecord()` does not write the five missing fields (can only be fixed after schema is updated).
- `packages/contracts/src/records.ts` + `place.ts`: `SmokeRecordCreateRequest` extends `CanonicalPlaceSummary`, so the contract expects all ten fields to round-trip through persistence.

**Suggested Fix Direction:** Add the five missing columns (`regionSystem`, `adminType`, `typeLabel`, `parentLabel`, `subtitle`) to the `SmokeRecord` model in `schema.prisma`, run `prisma migrate dev` to apply the migration, then update `createSmokeRecord()` in the repository to persist those fields alongside the existing six.
