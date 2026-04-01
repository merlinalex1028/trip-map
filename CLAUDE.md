# CLAUDE.md

本文档为 Claude Code 在本项目中工作时提供指导。

## 规范

- **始终使用中文回复**
- 代码、命令、配置键名、接口字段名保持原始语言，必要时配以中文说明。

## 执行约定

- 在开始实现前，先简要说明将要执行的操作。
- 修改代码时优先保持改动最小，遵循现有项目结构与风格。
- 如果使用子代理处理事务，必须等待子代理返回结果后再继续，不要因等待时间过长而直接介入接管。
- 完成后用中文简要说明变更内容、影响范围与验证结果。

## 项目概览

trip-map 是一个旅行地图应用，采用 pnpm monorepo + Turborepo 管理。

### Monorepo 结构

```
apps/
  web/          — @trip-map/web    (Vue 3 + Vite 8 前端)
  server/       — @trip-map/server (NestJS + Fastify + Prisma 后端)
packages/
  contracts/    — @trip-map/contracts (共享类型契约)
```

### 技术栈

| 层 | 技术 |
|---|------|
| 前端 | Vue 3 (Composition API + `<script setup>`)、Pinia、Vite 8、vue-tsc |
| 后端 | NestJS 11、Fastify 5、Prisma 6、tsx (开发) |
| 共享 | TypeScript 5.9、ESModule (`"type": "module"`) |
| 测试 | Vitest（全包使用 `vitest run`） |
| 包管理 | pnpm 10 |
| 构建编排 | Turborepo（`turbo run build/test/typecheck`） |

### 常用命令

```bash
pnpm dev              # 同时启动 web + server
pnpm dev:web          # 仅启动前端
pnpm dev:server       # 仅启动后端
pnpm build            # 全量构建
pnpm test             # 全量测试
pnpm typecheck        # 全量类型检查

# 单包操作
pnpm --filter @trip-map/web test
pnpm --filter @trip-map/server test
pnpm --filter @trip-map/contracts build

# 几何数据管线
pnpm --filter @trip-map/web geo:verify-sources   # 校验数据源 checksum
pnpm --filter @trip-map/web geo:build            # 生成几何资产
pnpm --filter @trip-map/web geo:build:check      # dry-run 验证
```

## 编码规范

### TypeScript

- 严格模式（`strict: true`），目标 ES2020，模块解析 Bundler。
- 优先使用不可变模式——创建新对象而非修改已有对象。
- 函数体 < 50 行，文件 < 800 行。

### Vue (前端)

- 始终使用 Composition API + `<script setup lang="ts">`，不使用 Options API。
- 状态管理使用 Pinia。
- 构建前须通过 `vue-tsc --noEmit` 类型检查。

### NestJS (后端)

- 使用 Fastify 适配器（`@nestjs/platform-fastify`）。
- ORM 使用 Prisma，schema 位于 `apps/server/prisma/schema.prisma`。
- 验证使用 `class-validator` + `class-transformer`。

### contracts (共享包)

- 前后端共享的类型定义统一放在 `packages/contracts/src/`。
- 修改 contracts 后需 `pnpm --filter @trip-map/contracts build`，上游包才能消费新类型。
- 导出入口为 `src/index.ts`，新增模块需在此 re-export。

## 测试

- 测试框架统一使用 Vitest，运行命令为 `vitest run`（非 watch 模式）。
- 修改代码后应运行对应包的测试确保不破坏现有功能。
- 前端测试环境使用 `happy-dom`。
- 后端 e2e 测试使用 `supertest`。

## Git 约定

- Commit message 格式：`<type>(<scope>): <description>`
- type: feat, fix, refactor, docs, test, chore, perf, ci
- scope 通常为包名或阶段编号，如 `web`、`server`、`contracts`、`13-01`
