# Deferred Items

## 2026-04-12

- `pnpm --filter @trip-map/server test -- test/auth-bootstrap.e2e-spec.ts` 会误触发整个 `@trip-map/server` 测试集，而不是只运行目标 spec。
- 在数据库连通环境下，该命令会被既有 `apps/server/test/health.e2e-spec.ts` 阻塞：测试断言 `database: 'down'`，实际健康检查返回 `database: 'up'`。
- 该问题与 23-06 bootstrap 实现无关，已用 `pnpm --filter @trip-map/server exec vitest run test/auth-bootstrap.e2e-spec.ts` 完成本 plan 的精确验证，后续可单独修正 package test 过滤或 health 断言。
