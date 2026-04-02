status: ready

# Phase 16 Plan 16-00 DB Preflight

Executed at: `2026-04-02T08:05:16Z`

## Prisma Env Gate

- `apps/server/prisma.config.ts` requires `DATABASE_URL` and `DIRECT_URL`, and normalizes `SHADOW_DATABASE_URL` before Prisma CLI execution.
- `apps/server/package.json` exposes `prisma:generate`, `prisma:migrate:deploy`, `prisma:validate`, and `test`.

## Command Results

### 1. `pnpm --filter @trip-map/server exec prisma validate --schema prisma/schema.prisma`

- Exit code: `0`
- Output:

```text
Loaded Prisma config from prisma.config.ts.

Prisma config detected, skipping environment variable loading.
Prisma schema loaded from prisma/schema.prisma
The schema at prisma/schema.prisma is valid 🚀
```

### 2. `pnpm --filter @trip-map/server exec prisma migrate status --schema prisma/schema.prisma`

- Final exit code: `0`
- Output:

```text
Loaded Prisma config from prisma.config.ts.

Prisma config detected, skipping environment variable loading.
Prisma schema loaded from prisma/schema.prisma
Datasource "db": PostgreSQL database "postgres", schema "public" at "aws-1-ap-southeast-1.pooler.supabase.com:5432"

2 migrations found in prisma/migrations

Database schema is up to date!
```

- Note: the first sandboxed attempt returned `P1001: Can't reach database server at aws-1-ap-southeast-1.pooler.supabase.com:5432`, but the same command succeeded when rerun outside the sandbox. This plan therefore treats the sandbox restriction as non-blocking and records the actual DB preflight result from the successful rerun.

### 3. `pnpm --filter @trip-map/server exec vitest run test/records-contract.e2e-spec.ts`

- Exit code: `0`
- Output:

```text
 RUN  v3.2.4 /Users/huangjingping/i/trip-map/apps/server

[Nest] 69477  - 04/02/2026, 4:05:49 PM     LOG [NestFactory] Starting Nest application...
[Nest] 69477  - 04/02/2026, 4:05:49 PM     LOG [InstanceLoader] AppModule dependencies initialized +5ms
[Nest] 69477  - 04/02/2026, 4:05:49 PM     LOG [InstanceLoader] PrismaModule dependencies initialized +0ms
[Nest] 69477  - 04/02/2026, 4:05:49 PM     LOG [InstanceLoader] ConfigHostModule dependencies initialized +0ms
[Nest] 69477  - 04/02/2026, 4:05:49 PM     LOG [InstanceLoader] HealthModule dependencies initialized +0ms
[Nest] 69477  - 04/02/2026, 4:05:49 PM     LOG [InstanceLoader] CanonicalPlacesModule dependencies initialized +0ms
[Nest] 69477  - 04/02/2026, 4:05:49 PM     LOG [InstanceLoader] ConfigModule dependencies initialized +0ms
[Nest] 69477  - 04/02/2026, 4:05:49 PM     LOG [InstanceLoader] RecordsModule dependencies initialized +0ms
[Nest] 69477  - 04/02/2026, 4:05:49 PM     LOG [RoutesResolver] HealthController {/health}: +32ms
[Nest] 69477  - 04/02/2026, 4:05:49 PM     LOG [RouterExplorer] Mapped {/health, GET} route +1ms
[Nest] 69477  - 04/02/2026, 4:05:49 PM     LOG [RoutesResolver] CanonicalPlacesController {/places}: +0ms
[Nest] 69477  - 04/02/2026, 4:05:49 PM     LOG [RouterExplorer] Mapped {/places/resolve, POST} route +0ms
[Nest] 69477  - 04/02/2026, 4:05:49 PM     LOG [RouterExplorer] Mapped {/places/confirm, POST} route +0ms
[Nest] 69477  - 04/02/2026, 4:05:49 PM     LOG [RoutesResolver] RecordsController {/records}: +0ms
[Nest] 69477  - 04/02/2026, 4:05:49 PM     LOG [RouterExplorer] Mapped {/records/smoke, POST} route +0ms
[Nest] 69477  - 04/02/2026, 4:05:49 PM     LOG [RouterExplorer] Mapped {/records, GET} route +0ms
[Nest] 69477  - 04/02/2026, 4:05:49 PM     LOG [RouterExplorer] Mapped {/records, POST} route +0ms
[Nest] 69477  - 04/02/2026, 4:05:49 PM     LOG [RouterExplorer] Mapped {/records/:placeId, DELETE} route +1ms
[Nest] 69477  - 04/02/2026, 4:05:49 PM     LOG [NestApplication] Nest application successfully started +0ms
 ✓ test/records-contract.e2e-spec.ts (2 tests) 3244ms
   ✓ POST /records/smoke > accepts the shared canonical place fields  1485ms

 Test Files  1 passed (1)
      Tests  2 passed (2)
   Start at  16:05:48
   Duration  4.06s (transform 77ms, setup 0ms, collect 544ms, tests 3.24s, environment 0ms, prepare 57ms)
```

## Conclusion

Phase 16 server-side migration and DB-backed e2e are executable now.

- `prisma validate`: passed
- `prisma migrate status`: passed and confirmed the configured PostgreSQL schema is up to date
- `records-contract.e2e-spec.ts`: passed against the real server stack

Gate result: Phase `16-01` and `16-03` may proceed without waiting on a DB reachability fix.
