# Phase 32: Route Deep-Link & Acceptance Closure - Context

**Gathered:** 2026-04-27
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 32 closes the remaining deployment and acceptance gaps around the existing `/timeline` and `/statistics` pages. The scope is to make deep-link / refresh behavior auditable in the target deploy shape, lock the unauthenticated route-entry policy, complete the outstanding human UAT for Timeline / Statistics, and align roadmap / verification / HUMAN-UAT docs with the runtime routing contract.

This phase is a closure pass, not a feature expansion. Timeline remains a separate page, statistics remain server-authoritative, and the existing Kawaii page shells stay in place unless a minimal route-policy change is needed to enforce the agreed unauthenticated behavior.

</domain>

<decisions>
## Implementation Decisions

### 路由契约与部署回退
- **D-01:** `/timeline` 与 `/statistics` 的 canonical route 继续使用 clean URL；`#/timeline` 与 `#/statistics` 视为历史文档漂移，需要在本阶段清理，而不是恢复成产品契约。
- **D-02:** 保留当前 `createWebHistory()` 路由语义。Phase 32 需要通过与生产部署形态一致的 preview / staging 环境，验证这两个路径的 direct-open / refresh 均有 SPA rewrite / fallback，不返回 404。
- **D-03:** 如果实际托管平台的 rewrite / fallback 配置可以纳入仓库，则本阶段应一并落地对应配置文件；如果部署回退规则只能存在于外部平台配置中，则必须在文档中明确记录该外部契约与验收证据。

### 未登录访问策略
- **D-04:** 未登录用户 direct-open `/timeline` 或 `/statistics` 时，应重定向回 `/`，而不是停留在对应页面的 anonymous state。
- **D-05:** 本阶段要锁定的是“未登录路由访问 fail closed 到地图首页”的策略，不扩展为新的认证产品流，也不重做页面文案或视觉层级。

### 验收环境与文档对齐
- **D-06:** Phase 32 的部署验收以与生产路由行为一致的 preview / staging 环境为准；不要求把正式生产环境作为本阶段唯一通过门槛。
- **D-07:** `ROADMAP.md`、Phase 29/30 的 `HUMAN-UAT.md`、`VERIFICATION.md` 以及本阶段工件，必须全部与最终运行时路由写法和未登录访问策略一致；旧的 `#/timeline` / `#/statistics` 表述都应视为 drift 并清除。

### 人工 UAT 范围
- **D-08:** 人工 UAT 只覆盖主链路：已登录真实账号、真实旅行数据、桌面宽度与手机宽度下的 Timeline / Statistics 浏览与可读性。
- **D-09:** 人工 UAT 必须显式覆盖 `/timeline` 与 `/statistics` 的 direct-open 和 refresh 行为。
- **D-10:** anonymous state 与 empty state 不新增为本阶段的人肉验收范围；除非未登录重定向策略改动引出新的回归，否则沿用现有自动化覆盖即可。

### the agent's Discretion
- 路由层是使用 `beforeEach`、per-route guard、还是组件级最小重定向来实现未登录回首页，由规划与实现阶段决定，但必须保持行为一致且改动最小。
- 若发现现有 anonymous page shell 仍有测试价值，可以保留为实现兜底；若会造成契约漂移，也可以在不扩大范围的前提下收敛或移除。
- 具体采用哪种平台配置文件（若平台可仓库化）或如何记录外部平台 fallback runbook，由规划阶段依据实际部署目标决定。
- HUMAN-UAT / VERIFICATION / ROADMAP 的具体措辞、证据格式和状态回写顺序，由规划阶段决定，但必须维持 clean URL 契约和 preview/staging 验收边界。

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase Scope & Audit Closure
- `.planning/ROADMAP.md` — Phase 32 goal, gap-closure boundary, and success criteria for deploy deep-link / refresh plus doc alignment.
- `.planning/REQUIREMENTS.md` — `TRIP-04`, `TRIP-05`, `STAT-01`, `STAT-02` definitions and traceability that Phase 32 is closing.
- `.planning/PROJECT.md` — v6.0 current state and explicit statement that remaining work is deep-link / refresh plus human UAT closure.
- `.planning/STATE.md` — current project state showing Phase 32 is the active next step.
- `.planning/milestones/v6.0-MILESTONE-AUDIT.md` — audit evidence for the production deep-link / refresh gap and the remaining human-needed closure on Phase 29 / 30.

### Prior Phase Decisions & Outstanding Acceptance
- `.planning/phases/29-timeline-page-and-account-entry/29-CONTEXT.md` — timeline route, independent page, earliest-first travel-history decisions, and phase-specific UI constraints.
- `.planning/phases/29-timeline-page-and-account-entry/29-HUMAN-UAT.md` — pending timeline human-UAT cases and current route-writing drift.
- `.planning/phases/29-timeline-page-and-account-entry/29-VERIFICATION.md` — verified runtime behavior and remaining human checks for timeline.
- `.planning/phases/30-travel-statistics-and-completion-overview/30-CONTEXT.md` — statistics route boundary and server-authoritative stats decisions.
- `.planning/phases/30-travel-statistics-and-completion-overview/30-HUMAN-UAT.md` — pending statistics browser/deploy acceptance items.
- `.planning/phases/30-travel-statistics-and-completion-overview/30-VERIFICATION.md` — verified statistics closure state plus deploy fallback warning.
- `.planning/phases/31-statistics-sync-refresh-hardening/31-CONTEXT.md` — confirms that metadata-refresh closure belongs to Phase 31 and deploy/UAT closure belongs to Phase 32.

### Runtime Routing & Evidence Touchpoints
- `apps/web/src/router/index.ts` — current router uses `createWebHistory()` with clean `/timeline` and `/statistics` paths plus catch-all redirect.
- `apps/web/src/components/auth/AuthTopbarControl.vue` — authenticated entry points that navigate to timeline/statistics from the topbar menu.
- `apps/web/src/views/TimelinePageView.vue` — current timeline route shell and anonymous/empty/populated state handling.
- `apps/web/src/views/StatisticsPageView.vue` — current statistics route shell and anonymous/empty/error/populated state handling.
- `apps/web/vite.config.ts` — dev-only proxy/fs config, useful as evidence that no repo-visible production SPA fallback exists yet.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `apps/web/src/router/index.ts` — already defines the canonical clean URLs and is the natural home for any auth gating or route-policy closure.
- `apps/web/src/components/auth/AuthTopbarControl.vue` — existing authenticated navigation buttons for Timeline / Statistics; no new navigation surface is needed.
- `apps/web/src/views/TimelinePageView.vue` — existing dedicated route page with restoring / anonymous / empty / populated states and responsive shell.
- `apps/web/src/views/StatisticsPageView.vue` — existing dedicated route page with restoring / anonymous / error / empty / populated states and responsive shell.
- `.planning/phases/29-timeline-page-and-account-entry/29-HUMAN-UAT.md` and `.planning/phases/30-travel-statistics-and-completion-overview/30-HUMAN-UAT.md` — existing acceptance docs to update rather than replace.
- `.planning/phases/29-timeline-page-and-account-entry/29-VERIFICATION.md` and `.planning/phases/30-travel-statistics-and-completion-overview/30-VERIFICATION.md` — existing verification artifacts that already describe the pending human/deploy closure.

### Established Patterns
- The app already uses a persistent shell with route-level views for map, timeline, and statistics.
- Runtime routing already favors clean URL paths; current drift is in planning/verification docs, not in the route definitions themselves.
- Timeline and statistics currently expose route-local anonymous states, so unauthenticated redirect policy will be a deliberate closure change rather than a no-op.
- `apps/web/vite.config.ts` only documents dev-server behavior, so production deep-link closure cannot be inferred from current repo config alone.

### Integration Points
- Route-auth behavior should connect through `apps/web/src/router/index.ts` and the existing auth-session status model instead of introducing a new navigation system.
- Deployment fallback closure may require either repo-managed hosting config files or an explicit external-platform contract recorded in phase docs.
- Human-UAT and verification closure must write back into Phase 29 / 30 documents and align with `.planning/ROADMAP.md` milestone status language.

</code_context>

<specifics>
## Specific Ideas

- Keep the current clean URL contract and normalize all remaining docs to it, even though earlier Phase 29 research / summary history once recommended hash routing.
- Treat preview / staging as a valid acceptance target only when its route handling truly matches the eventual production deploy shape.
- Keep Phase 32 human UAT intentionally narrow: logged-in real data, responsive readability, and direct-open / refresh closure for the two existing pages.
- If the actual hosting platform is not yet captured in-repo, planning should make that platform contract explicit rather than leaving fallback behavior as an implicit assumption.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 32-route-deep-link-and-acceptance-closure*
*Context gathered: 2026-04-27*
