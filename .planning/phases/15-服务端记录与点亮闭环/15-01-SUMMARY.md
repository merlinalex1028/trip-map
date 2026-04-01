---
plan: 15-01
phase: 15-服务端记录与点亮闭环
status: complete
completed: 2026-04-01
requirements: API-01, API-02
---

# Plan 15-01 Summary: Server TravelRecord CRUD API + Contracts

## What Was Built

NestJS TravelRecord CRUD API (`GET /records`, `POST /records`, `DELETE /records/:placeId`) backed by Prisma PostgreSQL, with shared TypeScript contracts in `@trip-map/contracts`.

## Key Files Created/Modified

### Created
- `packages/contracts/src/records.ts` — Added `TravelRecord` and `CreateTravelRecordRequest` interfaces (PlaceKind-typed)
- `apps/server/prisma/migrations/20260401024900_add_travel_record/migration.sql` — Creates `TravelRecord` table with `placeId @unique`
- `apps/server/src/modules/records/dto/create-travel-record.dto.ts` — `CreateTravelRecordDto` with class-validator
- `apps/server/test/records-travel.e2e-spec.ts` — 8 e2e tests, all passing

### Modified
- `apps/server/prisma/schema.prisma` — Added `TravelRecord` model (placeId @unique, no updatedAt)
- `apps/server/src/modules/records/records.repository.ts` — Added `findAllTravelRecords`, `createTravelRecord`, `deleteTravelRecordByPlaceId`
- `apps/server/src/modules/records/records.service.ts` — Added `findAllTravel`, `createTravel` (409 on P2002), `deleteTravel` (404 on missing)
- `apps/server/src/modules/records/records.controller.ts` — Added `GET /records`, `POST /records` (201), `DELETE /records/:placeId` (204)

## Decisions Made

- `SmokeRecord` model and endpoints preserved untouched for backward compatibility
- `TravelRecord` has no `updatedAt` — records are create-or-delete only (D-07)
- Duplicate `placeId` returns 409 via Prisma P2002 error code detection
- Test file placed in `test/` directory (matching vitest config `include: ['test/**/*.e2e-spec.ts']`)

## Verification Results

- `pnpm --filter @trip-map/contracts build` ✓
- Migration applied, Prisma client regenerated ✓
- `pnpm --filter @trip-map/server test` — 8/8 new TravelRecord tests pass ✓
- `pnpm typecheck` — all 3 packages pass ✓

## Self-Check: PASSED

All must_haves satisfied:
- ✓ GET /records returns TravelRecord[] from DB
- ✓ POST /records creates with canonical placeId, returns 201
- ✓ POST /records duplicate placeId → 409
- ✓ POST /records missing fields → 400
- ✓ DELETE /records/:placeId removes record, returns 204
- ✓ DELETE /records/:placeId unknown placeId → 404
