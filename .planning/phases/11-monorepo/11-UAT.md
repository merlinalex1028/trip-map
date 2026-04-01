---
status: complete
phase: 11-monorepo
source: [11-01-SUMMARY.md, 11-02-SUMMARY.md, 11-03-SUMMARY.md, 11-04-SUMMARY.md, 11-05-SUMMARY.md, 11-06-SUMMARY.md, 11-07-SUMMARY.md, 11-08-SUMMARY.md, 11-09-SUMMARY.md, 11-10-SUMMARY.md]
started: 2026-04-01T07:10:00.000Z
updated: 2026-04-01T07:20:00.000Z
---

## Tests

### 1. Cold Start Smoke Test
expected: Kill any running server/service. Start both web and server from scratch (`pnpm dev`). Server boots without errors, any seed/migration completes, and a basic API call (GET /health or the map loading) returns live data.
result: pass

### 2. Server Health Endpoint
expected: Calling `GET http://localhost:4000/health` (or via `/api/health` proxy) returns a JSON response with `status: "ok"` and a `version` field. No 404 or 500.
result: pass

### 3. Web App Loads After Monorepo Migration
expected: Opening `http://localhost:5173` shows the world map correctly. The poster title block and map are visible. No blank screen, no JS console errors about missing modules or failed imports.
result: pass

### 4. Map Click & Popup Flow
expected: Clicking anywhere on the world map triggers the geo recognition flow (loading indicator), and either opens a popup with a place name or shows a notice. Clicking a recognized city (e.g. Beijing) opens the popup with the city name shown.
result: pass

### 5. Full Monorepo Test Suite
expected: Running `pnpm test` from the repo root completes successfully. All test suites in `@trip-map/web`, `@trip-map/server`, and `@trip-map/contracts` pass. No failures due to import path issues from the monorepo migration.
result: pass

### 6. Monorepo Build
expected: Running `pnpm build` from the repo root completes without errors. Both `apps/web` and `apps/server` build successfully. No TypeScript errors or missing module errors.
result: pass

## Summary

total: 6
passed: 6
issues: 0
pending: 0
skipped: 0

## Gaps

[none]
