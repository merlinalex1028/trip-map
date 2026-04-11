# Phase 23: Auth & Ownership Foundation - Context

**Gathered:** 2026-04-11
**Status:** Ready for planning

<domain>
## Phase Boundary

本阶段只交付邮箱密码账号、可恢复的服务端会话，以及“旅行记录按当前账号隔离并以账号为唯一真源”的基础闭环。匿名浏览引导、首登本地记录导入、切账号后的迁移说明、多设备最终一致强化和海外覆盖扩展不属于本阶段。

</domain>

<decisions>
## Implementation Decisions

### 账号入口
- **D-01:** 账号入口放在顶栏右侧，使用 `账号 chip + 下拉菜单`，不新增独立账号页或常驻侧栏。
- **D-02:** 顶栏 chip 主展示内容为用户自定义用户名，不显示邮箱前缀作为主身份标识。
- **D-03:** 下拉菜单内容保持最小闭环：显示用户名、邮箱和退出入口，不加入“账号设置”“其他设备”或更多占位能力。

### 注册与登录表单
- **D-04:** 未登录时从顶栏入口打开同一个认证弹层，内部使用 `注册 / 登录` 两个 tab 切换，而不是拆成独立页面或分步邮箱判定流。
- **D-05:** 注册表单字段固定为 `用户名 + 邮箱 + 密码`，注册完成后即可立刻显示正式用户名身份。
- **D-06:** 登录表单只做 `邮箱 + 密码 + 提交`，不加入“记住我”或“忘记密码”占位。
- **D-07:** 注册或登录成功后，认证弹层自动关闭，并立即更新顶栏账号态与当前地图记录视图。

### 会话恢复体验
- **D-08:** 应用启动时先进入轻量会话恢复态；恢复完成前，不直接把地图记录区当作“空数据”渲染给用户。
- **D-09:** 恢复态保留现有 app shell 与顶栏，只在地图主舞台添加柔和的 loading 蒙层，不切到全页独立 loading 页面。
- **D-10:** 如果会话恢复失败或已失效，结束恢复态后回到未登录视角，并给出明确提示，允许用户继续浏览地图。

### 多设备会话策略
- **D-11:** 同一账号允许在多设备或多浏览器中同时保持登录，不采用“新登录挤掉旧登录”的单会话策略。
- **D-12:** 本阶段只支持“退出当前设备/当前浏览器会话”，不提供其他设备会话查看、提醒或“退出所有设备”能力。

### 已锁定的上游约束
- **D-13:** 鉴权只做邮箱密码，不引入 OAuth。
- **D-14:** 会话采用 `sid` cookie + 服务端 session 表，不使用 JWT refresh 架构。
- **D-15:** canonical 地点识别链路继续公开；本阶段只把记录读写切换到账号上下文，不把地图识别能力和登录态耦合。

### the agent's Discretion
- 用户名最大长度、超长时的截断样式与校验文案可由 planner / executor 自行决定，但必须服务于顶栏 chip 的稳定展示。
- 恢复态蒙层的具体视觉实现、动画节奏和 loading 文案可由 the agent 决定，但不能变成独立启动页。
- 认证错误态、字段级校验提示、成功提示的具体 copy 可由 the agent 决定，只要不引入新能力。

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase scope and milestone rules
- `.planning/ROADMAP.md` § Phase 23 — 本阶段目标、依赖、成功标准与边界。
- `.planning/REQUIREMENTS.md` § Authentication / Sync & Ownership — AUTH-01/02/03/05 与 SYNC-01/02 的正式需求口径。
- `.planning/PROJECT.md` § Current Milestone: v5.0 账号体系与云同步基础版 — 当前里程碑目标与 out-of-scope 约束。
- `.planning/STATE.md` § Accumulated Context — 已锁定的“邮箱密码 + sid cookie + ownership 先行”决策。

### Auth architecture guidance
- `.planning/research/SUMMARY.md` — 推荐用 `sid` HttpOnly cookie、`/auth/bootstrap` 与账号真源 records 的整体路线。
- `.planning/research/ARCHITECTURE.md` — Phase 23 推荐的模块边界、`User` / `AuthSession` / records ownership 模型与 bootstrap 入口。
- `.planning/research/STACK.md` — 推荐依赖、session 模型、auth endpoints 与 contracts 设计基线。
- `.planning/research/PITFALLS.md` — ownership 唯一键、跨账号串读、store 串号与会话失效处理的主要风险。

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `apps/web/src/App.vue`：现有顶栏 shell 已有稳定右侧空间，适合承接账号 chip、下拉菜单与认证弹层入口。
- `apps/web/src/stores/map-ui.ts`：已有 `interactionNotice` 机制，可复用来承接“会话已失效，请重新登录”这类提示。
- `apps/web/src/services/api/client.ts`：现有同域 `/api` URL 构造已适合扩展成带 `credentials: 'include'` 的统一 API wrapper。
- `apps/web/src/services/api/records.ts`：当前 records 调用集中，适合作为“当前用户记录”语义切换点。
- `apps/web/src/stores/map-points.ts`：已封装地图记录 bootstrap、乐观点亮和取消点亮，是后续与 auth-session store 对接的核心位置。
- `apps/server/src/modules/records/*`：现有 Nest controller/service/repository 分层清晰，可直接作为受保护 records API 的改造基础。
- `apps/server/prisma/schema.prisma`：当前 `TravelRecord` 仍是全局唯一 `placeId` 模型，是 ownership 改造的关键落点。
- `packages/contracts/src/records.ts`：共享 contracts 已存在，适合新增 auth/bootstrap DTO 并同步 records 语义。

### Established Patterns
- 后端遵循 `module -> controller -> service -> repository -> prisma` 的 NestJS 分层模式。
- 前端使用 Vue 3 + Pinia store 驱动状态，启动流程已依赖 store bootstrap，而不是组件内散落请求。
- Web 当前默认走同域 `/api` 访问 server，cookie session 与现有部署路径天然兼容。
- 现有地图主舞台保持 Leaflet + popup + 顶栏 notice 的单页面 shell，不适合插入重型独立认证页。

### Integration Points
- `apps/server/src/main.ts`：需要接入 cookie 解析与相关安全配置，是服务端会话落地入口。
- `apps/server/src/app.module.ts`：需要引入新的 auth module / session guard。
- `apps/server/prisma/schema.prisma`：需要新增用户、会话与按账号归属的记录模型或约束。
- `packages/contracts/src/*`：需要补 auth、bootstrap 与“当前用户 records”相关 contracts。
- `apps/web/src/App.vue`：需要承接顶栏账号态、认证弹层入口与恢复态容器。
- `apps/web/src/stores/map-points.ts`：需要从“应用首次直接拉 records”改为“依赖 auth bootstrap 结果重建当前会话记录”。
- `apps/web/src/services/api/records.ts`：需要与统一 authenticated API wrapper 对接，并正确处理 401 / session 失效。

</code_context>

<specifics>
## Specific Ideas

- 顶栏账号 chip 应突出“用户名”而不是邮箱，让登录后的身份感更像产品内昵称。
- 账号相关 UI 保持轻量，不新增整页账号中心；整个体验应继续围绕地图主舞台展开。
- 会话恢复时不要让用户看到“地图先空一下再回来”的错觉，恢复感知应是柔和且不打断的。

</specifics>

<deferred>
## Deferred Ideas

- 忘记密码 / 找回密码流程 — 不在 Phase 23，后续再单独评估。
- 其他设备会话查看、设备列表、退出所有设备 — 超出当前最小 auth foundation 范围。
- OAuth / 第三方登录 — 已明确为 v5.0 out of scope。
- 首登本地记录导入、云端优先选择、切账号后的数据迁移解释 — 属于 Phase 24。

</deferred>

---

*Phase: 23-auth-ownership-foundation*
*Context gathered: 2026-04-11*
