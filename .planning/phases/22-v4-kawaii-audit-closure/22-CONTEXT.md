# Phase 22: v4 Kawaii 验证归档与复审收口 - Context

**Gathered:** 2026-04-09
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 22 负责把 Phase 20 已完成的 Kawaii 主路径交付收束成正式验证与里程碑复审产物：同一阶段内完成 `20-VERIFICATION.md`，并更新 `v4.0-v4.0-MILESTONE-AUDIT.md`，让 `STYLE-03`、`STYLE-04`、`STYLE-05`、`INTER-01`、`INTER-02`、`INTER-03` 从旧 audit 的 `orphaned` 状态恢复到可审计的 satisfied 候选。

本阶段不新增 UI 功能、不重做组件视觉方向，也不重新打开 Phase 20 的产品范围。重点是 evidence closure、formal verification 和 milestone re-audit 收口。

</domain>

<decisions>
## Implementation Decisions

### 交付边界
- **D-01:** Phase 22 在同一阶段内同时完成 `20-VERIFICATION.md` 和 v4.0 milestone re-audit 收口，不再把两者拆成后续单独 phase。
- **D-02:** 本阶段交付的是“Phase 20 formal verification + updated milestone audit artifact”，而不是新的 UI 行为、视觉改版或额外功能。

### 证据策略
- **D-03:** Phase 20 的 formal verification 以既有证据为主：`20-VALIDATION.md` 与 `20-01/02/03/04-SUMMARY.md` 是主来源。
- **D-04:** 在整理既有证据的基础上，允许补少量当前工作区 spot-check，作为 formal verification 的现时佐证；不要求重新跑一整轮完整门禁。
- **D-05:** 除非 spot-check 暴露与既有结论冲突的事实，否则不追加新的人工浏览器复验，也不把本阶段扩大成再一次完整 UAT。

### 复审产物处理
- **D-06:** milestone re-audit 直接更新现有 `.planning/v4.0-v4.0-MILESTONE-AUDIT.md`，不新建平行的 re-audit 文件。
- **D-07:** 更新后的 audit 文件继续作为 v4.0 的唯一 canonical milestone audit 入口，后续归档与审阅都以这个固定路径为准。

### the agent's Discretion
- downstream agents 可以决定 Phase 20 spot-check 的最小命令集合，只要能覆盖 shell、popup/card 和 motion 相关核心合同。
- downstream agents 可以决定在 updated milestone audit 中如何最简洁地呈现“旧 gap 已闭合”的叙事，只要不引入新的历史分叉文件。
- 如果 `REQUIREMENTS.md`、`ROADMAP.md` 或 phase-level tracking 需要同步到 Phase 22 的 closure 结论，具体写法由 planner / executor 决定，但不能改变本阶段“docs closure 优先”的边界。

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Milestone scope and audit baseline
- `.planning/ROADMAP.md` — Phase 22 的目标、requirements、gap-closure 定义和成功标准。
- `.planning/REQUIREMENTS.md` — `STYLE-03`、`STYLE-04`、`STYLE-05`、`INTER-01`、`INTER-02`、`INTER-03` 的正式 requirement 文本与 traceability 入口。
- `.planning/PROJECT.md` — v4.0 仍是纯前端 Kawaii milestone，Phase 22 不应扩展到新功能。
- `.planning/STATE.md` — 当前项目位置与“Phase 22 ready”状态。
- `.planning/v4.0-v4.0-MILESTONE-AUDIT.md` — 现有 v4.0 audit 基线；本阶段需直接更新这个固定文件。

### Phase 20 evidence chain
- `.planning/phases/20-kawaii/20-CONTEXT.md` — Phase 20 已锁定的真实范围、视觉层级和微交互边界，避免在 verification 里错把 drawer 或未挂载组件写回范围。
- `.planning/phases/20-kawaii/20-VALIDATION.md` — Phase 20 的 approved validation source、Wave 0 覆盖、自动化证据与人工验收记录。
- `.planning/phases/20-kawaii/20-01-SUMMARY.md` — App shell / topbar / notice / map shell 的 STYLE-05 合同来源。
- `.planning/phases/20-kawaii/20-02-SUMMARY.md` — popup 轻壳与内外分层的 STYLE-04 合同来源。
- `.planning/phases/20-kawaii/20-03-SUMMARY.md` — cloud card、pill hierarchy 与 motion requirement 的 STYLE / INTER 主证据。
- `.planning/phases/20-kawaii/20-04-SUMMARY.md` — validation closure、approved manual verification 与回流修复结论。

### Executable UI contract evidence
- `apps/web/src/App.kawaii.spec.ts` — thin-shell topbar、notice pill、roomy map shell 的可执行合同。
- `apps/web/src/components/map-popup/MapContextPopup.kawaii.spec.ts` — popup 外轻内重、arrow pointer-safety 与 light shell 合同。
- `apps/web/src/components/map-popup/PointSummaryCard.kawaii.spec.ts` — cloud card、badge/type pill/CTA hierarchy、spacing 与 motion family 的可执行合同。

### Prior closure pattern to imitate
- `.planning/phases/21-v4-infra-verification-closure/21-VERIFICATION.md` — Phase 21 如何把已有 validation / summaries 收束为 formal verification，并把 milestone audit 留到下游收口。
- `.planning/phases/19-tailwind-token/19-VERIFICATION.md` — Phase-level verification 的结构模板、coverage 粒度和 gap-closure 叙事范式。

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `20-VALIDATION.md` 已经是 `approved / nyquist_compliant: true / wave_0_complete: true`，说明 Phase 22 不需要先补 validation，只需要把它提升为 formal verification source。
- `20-01/02/03/04-SUMMARY.md` 已按 plan 粒度拆开 shell、popup、card/motion、validation closure，天然适合逐项映射到 `STYLE-03~05`、`INTER-01~03`。
- `App.kawaii.spec.ts`、`MapContextPopup.kawaii.spec.ts`、`PointSummaryCard.kawaii.spec.ts` 已提供现成的 executable contract，可作为 spot-check 输入与 verification evidence。
- 现有 `.planning/v4.0-v4.0-MILESTONE-AUDIT.md` 已明确列出 Phase 20 六项 requirement 的 orphaned 原因，是更新 re-audit 结果的直接基线。

### Established Patterns
- Phase 21 已建立“validation + summaries -> formal verification”的 closure 模式，Phase 22 应沿用这个 pattern 处理 Phase 20，而不是发明新的 verification 样式。
- 当前 v4.0 audit 的问题不是代码集成断裂，而是 verification artifact 缺失；因此 Phase 22 应优先做 evidence consolidation，而不是回到产品实现。
- Phase 20 的 UI 合同大量依赖 class-string spec 与 approved manual record 的组合，formal verification 需要明确承认这一证据结构，而不是误写成“全靠新跑的视觉回归”。

### Integration Points
- `20-VERIFICATION.md` 需要把 `20-VALIDATION.md`、`20-01/02/03/04-SUMMARY.md`、以及 3 份 kawaii spec 串成单一 formal verification source。
- 更新后的 `.planning/v4.0-v4.0-MILESTONE-AUDIT.md` 需要同时消费 `19-VERIFICATION.md` 与新建的 `20-VERIFICATION.md`，把 v4.0 的 12 个 requirements 从旧的 orphaned 结论重算到当前状态。
- 如果 planner 认为需要更新 `REQUIREMENTS.md` 或 milestone tracking，应该把它视为 audit closure 的附属同步，而不是新的产品范围。

</code_context>

<specifics>
## Specific Ideas

- 用户明确要求同一阶段内同时完成 Phase 20 formal verification 和 v4.0 milestone re-audit 收口。
- 用户明确选择沿用 Phase 21 的低成本证据策略：以既有 validation / summary 为主，只补少量当前 spot-check。
- 用户明确要求 milestone audit 保持单一固定路径，直接更新现有 `.planning/v4.0-v4.0-MILESTONE-AUDIT.md`，不生成平行 re-audit 文件。

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 22-v4-kawaii-audit-closure*
*Context gathered: 2026-04-09*
