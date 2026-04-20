# 27-06 DB Probe

**Probed at:** 2026-04-20T09:59:27Z
**Database:** Supabase PostgreSQL pooler (host redacted)
**server_version_num:** 170006

## Decision

- 本 plan 对 UserTravelRecord 新增 `@@unique([userId, placeId, startDate, endDate])`，使用 Prisma 默认的 NULLS DISTINCT 语义。
- 当前 PostgreSQL 版本为 17.0.6，数据库能力上支持 `NULLS NOT DISTINCT`；但 Prisma 6.19 对该能力没有稳定的 schema API，本 plan 不引入 raw migration，继续保持默认 NULLS DISTINCT。
- 旧日期未知记录 `(userId, placeId, null, null)` 的并发重复风险仍主要由应用层预查询兜底；结合首登 legacy import 的使用形态，这个边界风险可接受。

## Impact on Plan

- Task 2-5 的 schema 与代码变更按默认 NULLS DISTINCT 策略执行。
- Task 3 的 `prisma db push` 不使用 `--force-reset`，仅推送四元组唯一约束与相关 Prisma Client 更新。
