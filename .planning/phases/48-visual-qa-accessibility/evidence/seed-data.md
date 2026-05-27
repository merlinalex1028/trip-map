# Phase 48 Desktop QA Seed Data

## Scope

This evidence file is desktop-only. It documents the fixed QA account used for Phase 48 desktop screenshots of `/`, `/map`, `/journal`, `/memories`, and the opened `留下足迹` date dialog.

## Commands

Dry run, no database required:

```bash
pnpm --filter @trip-map/server exec node scripts/seed-visual-qa.mjs --dry-run
```

Seed the local database:

```bash
pnpm --filter @trip-map/server exec node scripts/seed-visual-qa.mjs
```

## Account

| Field | Value |
|-------|-------|
| Email | `visual-qa@example.test` |
| Password | `VisualQa2026!` |
| Username | `视觉 QA 长用户名用于验证侧栏文本不会溢出` |

## Fixture Records

The seed procedure upserts exactly one QA user, deletes existing `UserTravelRecord` rows for that user only, then creates dated records for:

| Place ID | Date Range | Notes |
|----------|------------|-------|
| `cn-beijing` | `2025-01-18` to `2025-01-22` | Long Chinese note and tags for sidebar/journal text checks |
| `us-california` | `2025-04-09` to `2025-04-16` | Overseas marker and country distribution coverage |
| `jp-tokyo` | `2025-08-03` to `2025-08-07` | Monthly/yearly trend coverage |
| `de-saxony` | `2026-02-12` to `2026-02-15` | Cross-year memories coverage |

## Screenshot Rule

Per Phase 48 D-09, screenshots must use `visual-qa@example.test` through the normal login flow, or an equivalent fixed QA account recorded in this file before capture. Evidence must not rely on ad hoc manual clicking or unrecorded local records.

## DB Availability Notes

- Dry-run status: available and expected to run without `DATABASE_URL`.
- Real seed status: completed locally on 2026-05-27 with `visual-qa@example.test`; the seed command deleted 0 existing target-account records and created 4 records.
