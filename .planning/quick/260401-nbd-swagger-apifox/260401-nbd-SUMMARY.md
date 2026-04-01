---
phase: 260401-nbd-swagger-apifox
plan: 01
type: summary
status: complete
commit: 24b77c0
---

## 完成内容

### 安装的依赖
- `@nestjs/swagger` — OpenAPI 文档生成
- `@fastify/static` — Fastify 适配器下 Swagger UI 静态资产渲染所必需

### 修改的文件
| 文件 | 变更 |
|------|------|
| `apps/server/src/main.ts` | 添加 `DocumentBuilder` + `SwaggerModule.setup('api-docs', ...)` |
| `apps/server/src/health/health.controller.ts` | `@ApiTags`, `@ApiOperation`, `@ApiOkResponse` |
| `apps/server/src/modules/canonical-places/canonical-places.controller.ts` | `@ApiTags`, `@ApiOperation`, `@ApiCreatedResponse` |
| `apps/server/src/modules/canonical-places/dto/resolve-canonical-place.dto.ts` | `@ApiProperty` on lat/lng |
| `apps/server/src/modules/canonical-places/dto/confirm-canonical-place.dto.ts` | `@ApiProperty` on candidatePlaceId |
| `apps/server/src/modules/records/records.controller.ts` | `@ApiTags`, `@ApiOperation`, `@ApiOkResponse`/`@ApiCreatedResponse`/`@ApiNoContentResponse` |
| `apps/server/src/modules/records/dto/create-travel-record.dto.ts` | `@ApiProperty` on all fields |
| `apps/server/src/modules/records/dto/create-smoke-record.dto.ts` | `@ApiProperty`/`@ApiPropertyOptional` on all fields, enum hints |

### 端点
- `GET /api-docs` → Swagger UI HTML
- `GET /api-docs-json` → OpenAPI 3.0 JSON（Apifox 导入地址）

## 验证结果
- `typecheck`：通过（0 errors）
- `test`：22/23 通过；1 失败（`records-smoke` PostgreSQL 字段缺失）为预存在问题，与本次变更无关

## 人工验证步骤
1. `pnpm dev:server`
2. 浏览器访问 http://localhost:4000/api-docs — Swagger UI，含 health / canonical-places / records 三组
3. 访问 http://localhost:4000/api-docs-json — 确认 `"openapi": "3.0.x"` 顶层字段
4. Apifox → 导入 → URL → `http://localhost:4000/api-docs-json`
