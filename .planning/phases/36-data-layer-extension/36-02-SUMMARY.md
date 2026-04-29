---
phase: 36-data-layer-extension
plan: 02
subsystem: api
tags: [nestjs, prisma, typescript, rest-api, validation]

# Dependency graph
requires:
  - phase: 36-data-layer-extension
    provides: "UserTravelRecord 模型扩展 notes/tags 字段, TravelRecord 接口扩展, UpdateTravelRecordRequest 接口"
provides:
  - "PATCH /records/:id 端点 — 更新 startDate/endDate/notes/tags，返回完整 TravelRecord"
  - "DELETE /records/record/:id 端点 — 按记录 ID 删除单条记录，返回 204"
  - "UpdateTravelRecordDto — class-validator 输入验证（日期格式、notes 长度、tags 数量/长度）"
  - "Repository 新增 findTravelRecordById/updateTravelRecord/deleteTravelRecordById 三个方法"
  - "Service 新增 updateTravelRecord/deleteTravelRecord + toContractTravelRecord 扩展"
affects:
  - "Phase 37 (前端 PATCH/DELETE 端点消费)"
  - "Phase 38 (前端编辑/删除 UI 依赖这些端点)"

# Tech tracking
tech-stack:
  added: []
  patterns: ["Prisma P2002 → ConflictException (409)", "Prisma P2025 → NotFoundException (404)", "标签清洗: trim → filter empty → dedup"]

key-files:
  created:
    - "apps/server/src/modules/records/dto/update-travel-record.dto.ts"
  modified:
    - "apps/server/src/modules/records/records.repository.ts"
    - "apps/server/src/modules/records/records.service.ts"
    - "apps/server/src/modules/records/records.controller.ts"
    - "apps/server/src/modules/auth/auth.service.ts"
    - "apps/server/src/modules/auth/auth.service.spec.ts"
    - "apps/server/test/auth-bootstrap.e2e-spec.ts"
    - "apps/web/src/stores/map-points.ts"
    - "apps/web/src/App.spec.ts"
    - "apps/web/src/components/LeafletMapStage.spec.ts"
    - "apps/web/src/services/timeline.spec.ts"
    - "apps/web/src/stores/auth-session.spec.ts"
    - "apps/web/src/stores/map-points.spec.ts"
    - "apps/web/src/views/StatisticsPageView.spec.ts"
    - "apps/web/src/views/TimelinePageView.spec.ts"

key-decisions:
  - "使用 Prisma P2002 错误码检测日期冲突，转为 ConflictException (409)"
  - "标签清洗逻辑: trim → 过滤空字符串 → 去重，保持原始顺序"
  - "PATCH 端点只有在 startDate/endDate 变更时才做日期范围校验"
  - "所有 repository 方法 where 条件包含 userId 做行级权限检查"

patterns-established:
  - "PATCH 语义: 只传字段就只更新那些字段，未传字段不变"
  - "标签清洗模式: trim + dedup + filter empty"
  - "Prisma 错误码映射: P2002→409, P2025→404"

requirements-completed: []

# Metrics
duration: 20min
completed: 2026-04-29
---

# Phase 36 Plan 02: PATCH/DELETE 端点 Summary

**PATCH /records/:id 和 DELETE /records/record/:id 后端端点完整实现，含输入验证、标签清洗、日期冲突检测**

## Performance

- **Duration:** ~20 min
- **Started:** 2026-04-28T10:10:00Z
- **Completed:** 2026-04-29T01:28:21Z
- **Tasks:** 6
- **Files modified:** 15

## Accomplishments
- PATCH /records/:id 端点支持更新 startDate/endDate/notes/tags，返回完整 TravelRecord（含 updatedAt）
- DELETE /records/record/:id 端点按记录 ID 删除单条记录，返回 204
- UpdateTravelRecordDto 实现完整输入验证：日期格式 YYYY-MM-DD、notes ≤ 1000 字符、tags ≤ 10 个/每个 ≤ 20 字符
- Repository 新增 3 个方法（findTravelRecordById/updateTravelRecord/deleteTravelRecordById），全部包含行级权限检查
- Service 层实现标签清洗（trim + 去重 + 过滤空字符串）和 Prisma 错误码映射（P2002→409, P2025→404）
- toContractTravelRecord 扩展映射 updatedAt/notes/tags 三个新字段
- auth.service.ts 的 toContractTravelRecord 同步更新
- 全量类型检查和构建通过，103 个测试全部通过

## Task Commits

Each task was committed atomically:

1. **Task 1: 创建 UpdateTravelRecordDto** - `13ccd18` (feat)
2. **Task 2: 扩展 Repository** - `7313690` (feat)
3. **Task 3: 扩展 Service** - `48a4279` (feat)
4. **Task 4: 扩展 Controller** - `d6b2c73` (feat)
5. **Task 5: Schema Push** - (database operation, no commit)
6. **Task 6: 验证** - (typecheck + build verification)

**Deviation fixes:**
- `ffc9a47` (fix): update TravelRecord mocks and source code with updatedAt/notes/tags fields
- `27a9c31` (fix): add updatedAt/notes/tags to auth-bootstrap test assertion

## Files Created/Modified
- `apps/server/src/modules/records/dto/update-travel-record.dto.ts` - NEW: PATCH 请求体验证 DTO
- `apps/server/src/modules/records/records.repository.ts` - 新增 3 个数据访问方法
- `apps/server/src/modules/records/records.service.ts` - 新增 updateTravelRecord/deleteTravelRecord + toContractTravelRecord 扩展
- `apps/server/src/modules/records/records.controller.ts` - 新增 PATCH /records/:id 和 DELETE /records/record/:id 端点
- `apps/server/src/modules/auth/auth.service.ts` - toContractTravelRecord 同步更新
- `apps/server/src/modules/auth/auth.service.spec.ts` - 测试 mock 补充 notes/tags
- `apps/server/test/auth-bootstrap.e2e-spec.ts` - 测试断言补充 updatedAt/notes/tags
- `apps/web/src/stores/map-points.ts` - 源码中乐观记录创建补充 updatedAt/notes/tags
- 7 个 web 测试文件 - makeRecord 工厂函数补充 updatedAt/notes/tags

## Decisions Made
- 使用 Prisma P2002 错误码检测日期冲突，转为 ConflictException (409)，message 包含冲突提示
- 标签清洗逻辑: trim → 过滤空字符串 → 去重，保持去重后原始顺序（不排序）
- PATCH 端点只有在 startDate 或 endDate 被传入时才做日期范围校验（PATCH 语义：只改备注/标签不触发日期校验）
- 所有 repository 方法 where 条件包含 `{ id, userId }` 做行级权限检查，防止越权访问

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] auth.service.ts 的 toContractTravelRecord 缺少新字段**
- **Found during:** Task 6 (全量类型检查)
- **Issue:** auth.service.ts 有自己的 toContractTravelRecord 函数，未包含 updatedAt/notes/tags
- **Fix:** 补充三个新字段映射
- **Files modified:** apps/server/src/modules/auth/auth.service.ts
- **Verification:** typecheck 通过
- **Committed in:** ffc9a47

**2. [Rule 1 - Bug] web 端 TravelRecord mock 对象缺少新字段**
- **Found during:** Task 6 (全量类型检查)
- **Issue:** 8 个 web 测试文件和 1 个源文件中的 TravelRecord 对象缺少 updatedAt/notes/tags
- **Fix:** 补充所有 mock 对象和源码中的字段
- **Files modified:** 8 个 web 文件
- **Verification:** typecheck 通过
- **Committed in:** ffc9a47

**3. [Rule 1 - Bug] auth-bootstrap e2e 测试断言缺少新字段**
- **Found during:** Task 6 (全量测试)
- **Issue:** auth-bootstrap.e2e-spec.ts 的 toEqual 断言不包含 updatedAt/notes/tags
- **Fix:** 补充断言中的字段
- **Files modified:** apps/server/test/auth-bootstrap.e2e-spec.ts
- **Verification:** 测试通过
- **Committed in:** 27a9c31

---

**Total deviations:** 3 auto-fixed (3 bugs — missing fields in mapping/mocks/assertions)
**Impact on plan:** All auto-fixes necessary for type correctness. No scope creep.

## Issues Encountered
- 子代理权限问题（Bash/Write 被拒绝），切换为内联顺序执行
- 测试过程中出现瞬态数据库连接问题（Supabase 500 错误），重试后通过

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- PATCH/DELETE 端点已就绪，Phase 37 前端可直接消费
- UpdateTravelRecordRequest 类型已由 Plan 01 提供，前端可直接使用
- 所有端点需要 SessionAuthGuard 认证，前端需确保 session 有效

---
*Phase: 36-data-layer-extension*
*Completed: 2026-04-29*
