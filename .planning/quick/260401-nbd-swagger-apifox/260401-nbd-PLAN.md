---
phase: 260401-nbd-swagger-apifox
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/server/package.json
  - apps/server/src/main.ts
  - apps/server/src/modules/records/records.controller.ts
  - apps/server/src/modules/records/dto/create-travel-record.dto.ts
  - apps/server/src/modules/records/dto/create-smoke-record.dto.ts
  - apps/server/src/modules/canonical-places/canonical-places.controller.ts
  - apps/server/src/modules/canonical-places/dto/resolve-canonical-place.dto.ts
  - apps/server/src/modules/canonical-places/dto/confirm-canonical-place.dto.ts
  - apps/server/src/health/health.controller.ts
autonomous: true
requirements: [SWAGGER-01]
must_haves:
  truths:
    - "访问 /api-docs 返回 Swagger UI 页面"
    - "访问 /api-docs-json 返回 OpenAPI JSON，可被 Apifox 直接导入"
    - "所有现有路由（health、canonical-places、records）在文档中可见"
  artifacts:
    - path: "apps/server/src/main.ts"
      provides: "SwaggerModule 配置，挂载 /api-docs 与 /api-docs-json"
      contains: "SwaggerModule.setup"
  key_links:
    - from: "apps/server/src/main.ts"
      to: "/api-docs-json"
      via: "SwaggerModule.createDocument + setup"
      pattern: "SwaggerModule\\.setup"
---

<objective>
为 apps/server 安装并配置 @nestjs/swagger，生成 OpenAPI 3.0 文档，使 Apifox 可通过 URL 直接导入接口数据。

Purpose: 本地开发与接口联调时，Apifox 可通过 http://localhost:4000/api-docs-json 获取完整接口定义，无需手写。
Output: Swagger UI 页面（/api-docs）+ OpenAPI JSON 端点（/api-docs-json）
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md

<!-- 关键现有代码摘要 -->
<!-- apps/server/src/main.ts: 使用 NestFactory + FastifyAdapter，已有 ValidationPipe -->
<!-- NestJS 版本: 11.1.17，需安装对应 @nestjs/swagger -->
<!-- 项目为 ESModule ("type": "module") -->
</context>

<tasks>

<task type="auto">
  <name>Task 1: 安装 @nestjs/swagger 并在 main.ts 挂载 SwaggerModule</name>
  <files>apps/server/package.json, apps/server/src/main.ts</files>
  <action>
1. 在 apps/server 目录下安装依赖：
   ```
   pnpm --filter @trip-map/server add @nestjs/swagger
   ```
   注意：NestJS + Fastify 组合下不需要 swagger-ui-express；@nestjs/swagger 11.x 对 Fastify 的 UI 渲染通过内置静态资产处理，无需额外适配包。

2. 修改 `apps/server/src/main.ts`，在 `app.useGlobalPipes(...)` 之后、`return app` 之前，添加 SwaggerModule 配置：

   ```typescript
   import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

   // 在 createApp() 内，useGlobalPipes 之后：
   const swaggerConfig = new DocumentBuilder()
     .setTitle('Trip Map API')
     .setDescription('trip-map 后端接口文档')
     .setVersion('1.0')
     .build()

   const document = SwaggerModule.createDocument(app, swaggerConfig)
   SwaggerModule.setup('api-docs', app, document)
   ```

   这样会自动注册：
   - GET /api-docs       → Swagger UI
   - GET /api-docs-json  → OpenAPI JSON（Apifox 导入地址）

3. 保持 `createApp()` 函数签名不变，bootstrap() 与测试用的 app.inject() 路径均不受影响。
  </action>
  <verify>
    <automated>pnpm --filter @trip-map/server typecheck</automated>
  </verify>
  <done>typecheck 通过，@nestjs/swagger 出现在 apps/server/package.json dependencies 中，main.ts 包含 SwaggerModule.setup 调用</done>
</task>

<task type="auto" tdd="false">
  <name>Task 2: 为控制器与 DTO 添加 Swagger 装饰器</name>
  <files>
    apps/server/src/health/health.controller.ts,
    apps/server/src/modules/canonical-places/canonical-places.controller.ts,
    apps/server/src/modules/canonical-places/dto/resolve-canonical-place.dto.ts,
    apps/server/src/modules/canonical-places/dto/confirm-canonical-place.dto.ts,
    apps/server/src/modules/records/records.controller.ts,
    apps/server/src/modules/records/dto/create-travel-record.dto.ts,
    apps/server/src/modules/records/dto/create-smoke-record.dto.ts
  </files>
  <action>
为所有公开路由和 DTO 添加最小化 Swagger 注解，使 Apifox 导入后能看到参数与响应结构。

**控制器装饰器规则：**
- 每个 controller 类加 `@ApiTags('模块名')`（如 `'health'`、`'canonical-places'`、`'records'`）
- 每个路由方法加 `@ApiOperation({ summary: '...' })`
- 返回 2xx 成功的方法加 `@ApiOkResponse()` 或 `@ApiCreatedResponse()`
- 接收 body 的方法（已有 @Body() DTO）无需额外标注，@nestjs/swagger 会自动从 DTO 推断

**DTO 装饰器规则：**
- 每个 DTO 字段加 `@ApiProperty()` 或 `@ApiPropertyOptional()`（可选字段）
- 已有 `@IsString()`、`@IsNumber()` 等 class-validator 装饰器的字段，@nestjs/swagger 会自动推断类型，但仍需显式 `@ApiProperty()` 才会出现在文档中
- 保持现有 class-validator 装饰器不变，仅追加 @ApiProperty

**具体文件操作：**

`health.controller.ts`：
- 类加 `@ApiTags('health')`
- GET /health 方法加 `@ApiOperation({ summary: '健康检查' })` + `@ApiOkResponse({ description: 'OK' })`

`canonical-places.controller.ts`：
- 类加 `@ApiTags('canonical-places')`
- POST /places/resolve 加 `@ApiOperation({ summary: '解析候选地点' })` + `@ApiCreatedResponse()`
- POST /places/confirm 加 `@ApiOperation({ summary: '确认地点' })` + `@ApiCreatedResponse()`

`resolve-canonical-place.dto.ts` 与 `confirm-canonical-place.dto.ts`：
- 每个字段加 `@ApiProperty()` 或 `@ApiPropertyOptional()`

`records.controller.ts`：
- 类加 `@ApiTags('records')`
- 各路由方法加对应 `@ApiOperation` + `@ApiOkResponse`/`@ApiCreatedResponse`

`create-travel-record.dto.ts` 与 `create-smoke-record.dto.ts`：
- 每个字段加 `@ApiProperty()` 或 `@ApiPropertyOptional()`
  </action>
  <verify>
    <automated>pnpm --filter @trip-map/server typecheck && pnpm --filter @trip-map/server test</automated>
  </verify>
  <done>typecheck 与测试全部通过；启动 dev server 后访问 http://localhost:4000/api-docs-json 可见包含 health、canonical-places、records 三个 tag 的 OpenAPI JSON</done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <what-built>
    安装了 @nestjs/swagger，配置了 SwaggerModule（/api-docs UI + /api-docs-json JSON），并为所有控制器与 DTO 添加了 Swagger 装饰器。
  </what-built>
  <how-to-verify>
    1. 运行 `pnpm dev:server`，等待 "Nest application successfully started" 日志
    2. 浏览器访问 http://localhost:4000/api-docs — 应显示 Swagger UI，包含 health、canonical-places、records 三个分组
    3. 访问 http://localhost:4000/api-docs-json — 应返回 JSON，确认顶层有 `"openapi": "3.0.x"` 字段
    4. 在 Apifox 中：新建项目 → 导入数据 → OpenAPI/Swagger → URL 方式 → 填入 http://localhost:4000/api-docs-json → 确认接口列表导入成功
  </how-to-verify>
  <resume-signal>输入 "approved" 确认导入成功，或描述遇到的问题</resume-signal>
</task>

</tasks>

<verification>
- pnpm --filter @trip-map/server typecheck 通过
- pnpm --filter @trip-map/server test 通过（现有 e2e 测试不受影响）
- /api-docs-json 返回合法 OpenAPI 3.0 JSON
- Apifox 可通过 URL 成功导入接口
</verification>

<success_criteria>
- @nestjs/swagger 已安装并出现在 package.json dependencies
- GET /api-docs 返回 Swagger UI HTML
- GET /api-docs-json 返回包含所有路由的 OpenAPI JSON
- 现有测试全部通过，无 typecheck 错误
- Apifox 导入后可见 health、canonical-places、records 三组接口及其参数定义
</success_criteria>

<output>
完成后创建 `.planning/quick/260401-nbd-swagger-apifox/260401-nbd-SUMMARY.md`
</output>
