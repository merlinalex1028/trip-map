# Technology Stack

**Project:** trip-map v5.0 account system, cloud sync, overseas coverage
**Researched:** 2026-04-10
**Scope:** Only stack additions/changes needed beyond the validated v4.0 baseline

## Recommendation

Keep the existing monorepo, Vue 3 + Leaflet frontend, and NestJS + Fastify + Prisma + PostgreSQL backend.

For v5.0, add a small first-party auth layer on top of the current server instead of introducing an external auth SaaS or a full JWT refresh architecture:

- Use an **opaque `sid` cookie** backed by a Prisma-managed `UserSession` table.
- Use **`argon2`** for password hashing.
- Keep travel record APIs REST-shaped, but make them **user-scoped**.
- Keep the current geometry manifest/sharding pipeline, but **replace or supplement the overseas source input** with **geoBoundaries `gbOpen` ADM1** for selected countries.

This is the smallest change set that supports login, multi-device sync, and broader overseas coverage without splitting the source of truth.

## Keep As-Is

| Area | Keep | Why |
|------|------|-----|
| Frontend app shell | Vue 3 + Pinia + Leaflet + Tailwind v4 | No auth/sync requirement forces a frontend framework change. |
| Backend runtime | NestJS 11 + Fastify 5 | Existing API/service/module structure already fits auth guards and cookie handling. |
| Persistence | Prisma 6 + PostgreSQL | User/session/record ownership fits relational modeling cleanly. |
| Shared contracts | `packages/contracts` | Auth/session DTOs can be added next to existing records contracts. |
| Geometry delivery | Static manifest + sharded GeoJSON | Already proven; overseas expansion should plug into this pipeline instead of adding a new map stack. |

## Additions for v5.0

### Auth and Session

| Package / Service | Version | Use | Why |
|-------------------|---------|-----|-----|
| `@fastify/cookie` | `^11.0.2` | Parse/sign auth cookie in Nest Fastify app | Nest official Fastify cookie integration is direct and low-friction. |
| `argon2` | `^0.44.0` | Password hashing | Nest official hashing guidance explicitly recommends `argon2` or `bcrypt`; `argon2` is the stronger default choice here. |
| `@fastify/cors` | `^11.2.0` | Credentialed cross-origin requests if web/api are split by origin | Only needed when browser requests are not same-origin/proxied. |

**Recommended session model**

- Cookie name: `sid`
- Cookie contents: random opaque session token, not JWT
- Cookie flags: `HttpOnly`, `SameSite=Lax`, `Secure` in production, explicit `Max-Age`
- Server lookup: hash token before storing in `UserSession`
- Request auth: Nest guard loads session -> user -> attaches current user context

**Why opaque DB-backed sessions, not JWT for v5.0**

- The current web app is a browser SPA talking to one Nest API. It does not need third-party API clients or mobile token distribution yet.
- The current frontend fetch layer is simple; adding cookies is a smaller blast radius than adding access-token storage, refresh flows, expiry handling, and 401 replay logic.
- Database-backed sessions make future “logout this device / revoke sessions” work straightforward.

### Data Model Changes

| Model | Change | Why |
|------|--------|-----|
| `User` | New model: `id`, `email`, `passwordHash`, timestamps | First-party account identity. |
| `UserSession` | New model: `id`, `userId`, `sessionTokenHash`, `expiresAt`, `revokedAt`, `lastSeenAt`, optional device metadata | Stable browser session storage. |
| `TravelRecord` | Add `userId` relation; replace `@unique placeId` with `@@unique([userId, placeId])` | Records must be unique per user, not globally unique. |
| `SmokeRecord` | Leave unchanged in v5.0 | It is an infra/test artifact, not end-user synced data. |

**Recommended Prisma shape**

```prisma
model User {
  id           String         @id @default(cuid())
  email        String         @unique
  passwordHash String
  createdAt    DateTime       @default(now())
  updatedAt    DateTime       @updatedAt
  sessions     UserSession[]
  travelRecords TravelRecord[]
}

model UserSession {
  id               String    @id @default(cuid())
  userId           String
  sessionTokenHash String    @unique
  expiresAt        DateTime
  revokedAt        DateTime?
  lastSeenAt       DateTime?
  user             User      @relation(fields: [userId], references: [id])

  @@index([userId, expiresAt])
}

model TravelRecord {
  id             String   @id @default(cuid())
  userId         String
  placeId        String
  boundaryId     String
  placeKind      String
  datasetVersion String
  displayName    String
  regionSystem   String?
  adminType      String?
  typeLabel      String?
  parentLabel    String?
  subtitle       String
  createdAt      DateTime @default(now())
  user           User     @relation(fields: [userId], references: [id])

  @@unique([userId, placeId])
  @@index([userId, createdAt])
}
```

## Migration Blast Radius

| Area | Impact | Notes |
|------|--------|-------|
| Prisma schema + SQL migration | High | `TravelRecord.placeId @unique` must be removed and replaced with per-user uniqueness. |
| Records repository/service/controller | High | All record queries and deletes must resolve by current user. |
| Shared contracts | Medium | Add auth DTOs/session shape; existing record payload shape can mostly stay stable. |
| Web API client/store | Medium | All record/auth requests must send `credentials: 'include'`; bootstrap becomes “fetch session, then records”. |
| Existing data migration | High | Legacy global records need an owner assignment strategy before `userId` becomes non-null. |
| Leaflet/map rendering | Low | UI rendering logic stays mostly intact once user-scoped records load. |

**Recommended migration sequence**

1. Add `User` and `UserSession`.
2. Add nullable `TravelRecord.userId`.
3. Backfill legacy rows with a chosen owner strategy.
4. Drop global `placeId` uniqueness, add `@@unique([userId, placeId])`.
5. Make `TravelRecord.userId` required.

**Legacy data note**

Current `TravelRecord` rows are effectively global. v5.0 must choose one of these explicitly:

- Single-user migration: first created account claims all legacy records.
- Admin script migration: assign existing rows to a seeded owner.
- Breaking reset: wipe existing server records before enabling accounts.

Do not leave this implicit. It affects both SQL migration order and rollout safety.

## API Contract Implications

### New auth endpoints

| Endpoint | Request | Response | Notes |
|---------|---------|----------|-------|
| `POST /auth/register` | `email`, `password` | current user summary | Sets `sid` cookie. |
| `POST /auth/login` | `email`, `password` | current user summary | Sets/replaces `sid` cookie. |
| `POST /auth/logout` | none | `204` | Revokes current session and clears cookie. |
| `GET /auth/session` | none | current user summary or `401` | Used by web boot flow. |

### Existing record endpoints

| Endpoint | v4.0 behavior | v5.0 behavior |
|---------|---------------|---------------|
| `GET /records` | returns all records | returns current user records only; auth required |
| `POST /records` | global idempotency on `placeId` | per-user idempotency on `(userId, placeId)` |
| `DELETE /records/:placeId` | global delete by `placeId` | delete current user record by `placeId` |

**Contract guidance**

- Keep `CreateTravelRecordRequest` and `TravelRecord` payload shapes mostly unchanged.
- Do **not** send `userId` from the client; the server derives it from session context.
- Add a small auth contract file in `packages/contracts`, for example:
  - `AuthUser`
  - `RegisterRequest`
  - `LoginRequest`
  - `SessionResponse`

## Overseas Coverage Stack Change

### Keep the existing pipeline

Do not replace Leaflet, do not move geometry into a database, and do not add a live geocoding service just to expand overseas coverage.

Keep:

- `apps/web/scripts/geo/*`
- static source snapshots
- geometry manifest generation
- sharded GeoJSON publishing
- server-authoritative canonical place IDs

### Change the overseas source input

| Source | Recommendation | Why |
|--------|----------------|-----|
| Natural Earth admin-1 | Keep only as coarse fallback if already useful | Good public-domain baseline, but too coarse for “expanded practical overseas coverage” as the only source. |
| geoBoundaries `gbOpen` ADM1 | Add as the primary v5.0 overseas expansion source for selected countries | Official API exposes ADM0-ADM5, license metadata, download URLs, and `simplifiedGeometryGeoJSON`, which fits the current sharding pipeline. |

**Implementation direction**

- Add a new `normalize-geoboundaries.mjs` script parallel to `normalize-natural-earth.mjs`.
- Keep v5.0 limited to **ADM1 only**.
- Expand by **priority country list**, not “whole world at every admin level”.
- Persist source metadata into `geometry-source-catalog.json` just like existing DataV/Natural Earth inputs.

**Recommended boundary ID pattern**

- Continue deterministic IDs, e.g. `gb-adm1-us-california`
- Do not mix ad hoc IDs and source-derived IDs in the same country set

## What NOT to Add in v5.0

| Do not add | Why |
|-----------|-----|
| Auth SaaS (`Clerk`, `Auth0`, `Supabase Auth`) | Existing NestJS backend is already the product authority; adding a second identity plane increases coupling and migration cost for little gain in this milestone. |
| `Passport` / `@nestjs/passport` | Overkill for one local email/password flow plus cookie session. Custom auth service + guard is smaller and clearer. |
| Bearer JWT + refresh-token architecture | Adds token lifecycle complexity the current browser-only app does not need yet. |
| `localStorage` auth tokens | Worse security posture than `HttpOnly` cookies and unnecessary here. |
| WebSocket/Socket.IO/Pusher sync | Cross-device sync is satisfied by server persistence plus fetch-on-boot/refetch-after-mutation. |
| PostGIS | Current app already ships static geometry and does not need spatial SQL to deliver v5.0. |
| Global ADM2/ADM3 rollout | Too much data and taxonomy complexity for this milestone. Stay at overseas ADM1. |
| Live third-party geocoding APIs | Conflicts with the current authoritative offline/curated resolve chain and introduces uptime/rate-limit risk. |

## Installation

```bash
# server runtime deps
pnpm --filter @trip-map/server add @fastify/cookie argon2

# only if web and api are not same-origin/proxied
pnpm --filter @trip-map/server add @fastify/cors
```

## Sources

- NestJS Cookies docs: https://docs.nestjs.com/techniques/cookies
- NestJS Session docs: https://docs.nestjs.com/techniques/session
- NestJS Encryption and Hashing docs: https://docs.nestjs.com/security/encryption-and-hashing
- NestJS Authentication docs: https://docs.nestjs.com/security/authentication
- Prisma compound unique constraints: https://www.prisma.io/docs/orm/prisma-client/special-fields-and-types/working-with-composite-ids-and-constraints
- Prisma one-to-many relations: https://www.prisma.io/docs/orm/prisma-schema/data-model/relations/one-to-many-relations
- geoBoundaries API docs: https://www.geoboundaries.org/api.html
- npm registry, verified 2026-04-10:
  - `@fastify/cookie` `11.0.2`
  - `@fastify/cors` `11.2.0`
  - `argon2` `0.44.0`

## Confidence

| Area | Level | Notes |
|------|-------|-------|
| Auth/session stack | High | Official Nest Fastify cookie/session docs + current package versions. |
| Prisma migration shape | High | Directly matches Prisma relation and compound uniqueness guidance. |
| API contract impact | High | Derived from current repo code paths and existing records contract. |
| Overseas source recommendation | Medium | geoBoundaries API capabilities are verified; country-by-country quality still needs implementation-time validation. |
