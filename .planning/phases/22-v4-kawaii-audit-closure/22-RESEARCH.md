# Phase 22: v4-kawaii-audit-closure - Research

**Researched:** 2026-04-09
**Domain:** Phase 20 formal verification synthesis and v4.0 milestone re-audit closure [VERIFIED: .planning/phases/22-v4-kawaii-audit-closure/22-CONTEXT.md]
**Confidence:** HIGH [VERIFIED: .planning/phases/22-v4-kawaii-audit-closure/22-CONTEXT.md] [VERIFIED: .planning/phases/20-kawaii/20-VALIDATION.md] [VERIFIED: .planning/v4.0-v4.0-MILESTONE-AUDIT.md]

<user_constraints>
## User Constraints (from CONTEXT.md)

以下内容按 `22-CONTEXT.md` 原文复制，供 planner 强约束消费。 [VERIFIED: .planning/phases/22-v4-kawaii-audit-closure/22-CONTEXT.md]

### Locked Decisions

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

### Claude's Discretion
- downstream agents 可以决定 Phase 20 spot-check 的最小命令集合，只要能覆盖 shell、popup/card 和 motion 相关核心合同。
- downstream agents 可以决定在 updated milestone audit 中如何最简洁地呈现“旧 gap 已闭合”的叙事，只要不引入新的历史分叉文件。
- 如果 `REQUIREMENTS.md`、`ROADMAP.md` 或 phase-level tracking 需要同步到 Phase 22 的 closure 结论，具体写法由 planner / executor 决定，但不能改变本阶段“docs closure 优先”的边界。

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| STYLE-03 | 所有按钮/徽章为 pill-shaped（`rounded-full`），配合彩色柔光阴影（阴影色与背景色匹配） [VERIFIED: .planning/REQUIREMENTS.md] | `20-03-SUMMARY.md` 已将按钮/徽章层级与 `PointSummaryCard.kawaii.spec.ts` 绑定；`20-VERIFICATION.md` 只需把 summary、validation 与 spec 合并成 formal source。 [VERIFIED: .planning/phases/20-kawaii/20-03-SUMMARY.md] [VERIFIED: .planning/phases/20-kawaii/20-VALIDATION.md] [VERIFIED: apps/web/src/components/map-popup/PointSummaryCard.kawaii.spec.ts] |
| STYLE-04 | 卡片/容器使用大圆角 + 厚白边 + 柔和阴影，呈现 floating-cloud 效果 [VERIFIED: .planning/REQUIREMENTS.md] | 证据已分布在 `20-02-SUMMARY.md` 的 popup light shell 与 `20-03-SUMMARY.md` 的 inner cloud card；re-audit 需要显式把两层职责写回 requirement coverage。 [VERIFIED: .planning/phases/20-kawaii/20-02-SUMMARY.md] [VERIFIED: .planning/phases/20-kawaii/20-03-SUMMARY.md] [VERIFIED: apps/web/src/components/map-popup/MapContextPopup.kawaii.spec.ts] [VERIFIED: apps/web/src/components/map-popup/PointSummaryCard.kawaii.spec.ts] |
| STYLE-05 | 布局宽松，组件内外使用 generous padding/margin（`p-6` / `gap-4` 以上） [VERIFIED: .planning/REQUIREMENTS.md] | `App.kawaii.spec.ts` 锁定 shell spacing，`PointSummaryCard.kawaii.spec.ts` 锁定 card spacing；formal verification 需把 shell 与 card 两段证据合并叙述。 [VERIFIED: apps/web/src/App.kawaii.spec.ts] [VERIFIED: apps/web/src/components/map-popup/PointSummaryCard.kawaii.spec.ts] [VERIFIED: .planning/phases/20-kawaii/20-01-SUMMARY.md] [VERIFIED: .planning/phases/20-kawaii/20-03-SUMMARY.md] |
| INTER-01 | hover 时平滑放大并上浮，过渡 300ms ease-out [VERIFIED: .planning/REQUIREMENTS.md] | `PointSummaryCard.kawaii.spec.ts` 已锁定 cloud / CTA 的 `hover:scale-105 hover:-translate-y-1 duration-300 ease-out`，当前 spot-check 仍通过。 [VERIFIED: apps/web/src/components/map-popup/PointSummaryCard.kawaii.spec.ts] [VERIFIED: current command `pnpm --filter @trip-map/web test -- src/App.kawaii.spec.ts src/components/map-popup/MapContextPopup.kawaii.spec.ts src/components/map-popup/PointSummaryCard.kawaii.spec.ts`] |
| INTER-02 | 按钮点击轻压（`scale-95`） [VERIFIED: .planning/REQUIREMENTS.md] | `PointSummaryCard.kawaii.spec.ts` 已覆盖 primary / secondary CTA 的 `active:scale-95`，planner 不需要新增测试框架。 [VERIFIED: apps/web/src/components/map-popup/PointSummaryCard.kawaii.spec.ts] [VERIFIED: .planning/phases/20-kawaii/20-03-SUMMARY.md] |
| INTER-03 | 所有过渡使用 300ms `ease-out`，避免硬动画 [VERIFIED: .planning/REQUIREMENTS.md] | `20-03-SUMMARY.md` 与 `PointSummaryCard.kawaii.spec.ts` 已把 motion 家族和 reduced-motion 护栏落盘；`20-VERIFICATION.md` 应引用这两类证据而非重写新规则。 [VERIFIED: .planning/phases/20-kawaii/20-03-SUMMARY.md] [VERIFIED: apps/web/src/components/map-popup/PointSummaryCard.kawaii.spec.ts] |
</phase_requirements>

## Summary

Phase 22 是文档与审计收口 phase，不是新的 UI 实现 phase；锁定交付物只有 `20-VERIFICATION.md` 与对 `.planning/v4.0-v4.0-MILESTONE-AUDIT.md` 的原位更新。 [VERIFIED: .planning/phases/22-v4-kawaii-audit-closure/22-CONTEXT.md] [VERIFIED: .planning/ROADMAP.md]

Phase 20 的实现证据已经基本齐全：`20-VALIDATION.md` 为 `approved` 且 `nyquist_compliant: true`，四份 summary 已分别覆盖 shell、popup、cloud card/motion 与 validation closure，三份 kawaii spec 当前再次 spot-check 通过。 [VERIFIED: .planning/phases/20-kawaii/20-VALIDATION.md] [VERIFIED: .planning/phases/20-kawaii/20-01-SUMMARY.md] [VERIFIED: .planning/phases/20-kawaii/20-02-SUMMARY.md] [VERIFIED: .planning/phases/20-kawaii/20-03-SUMMARY.md] [VERIFIED: .planning/phases/20-kawaii/20-04-SUMMARY.md] [VERIFIED: current command `pnpm --filter @trip-map/web test -- src/App.kawaii.spec.ts src/components/map-popup/MapContextPopup.kawaii.spec.ts src/components/map-popup/PointSummaryCard.kawaii.spec.ts`]

当前 audit 自己也已经承认主流程与代码连线正常，六项 STYLE/INTER requirement 之所以还是 `orphaned`，根因仅是 Phase 20 目录缺少 formal `VERIFICATION.md`。 [VERIFIED: .planning/v4.0-v4.0-MILESTONE-AUDIT.md]

**Primary recommendation:** 直接复用 `19-VERIFICATION.md` 的 formal closure 结构，把 `20-VALIDATION.md`、`20-01/02/03/04-SUMMARY.md` 和三份 kawaii spec 汇总成 `20-VERIFICATION.md`，然后原位重写 milestone audit 中 Phase 20 的六项 requirement 行，把 `orphaned` 改算为 `satisfied`；默认 spot-check 只跑三份 kawaii spec，只有出现证据冲突时才扩到 full suite 或新的人工浏览器复验。 [VERIFIED: .planning/phases/19-tailwind-token/19-VERIFICATION.md] [VERIFIED: .planning/phases/22-v4-kawaii-audit-closure/22-CONTEXT.md] [VERIFIED: .planning/phases/20-kawaii/20-VALIDATION.md]

## Project Constraints (from CLAUDE.md)

- 与用户交流必须使用中文。 [VERIFIED: ./CLAUDE.md]
- 开始实现前先简要说明将执行的操作。 [VERIFIED: ./CLAUDE.md]
- 修改代码或文档时优先保持改动最小，并遵循现有项目结构与风格。 [VERIFIED: ./CLAUDE.md]
- 如果使用子代理，必须等待其返回后再继续。 [VERIFIED: ./CLAUDE.md]
- 完成后要用中文简要说明变更内容、影响范围与验证结果。 [VERIFIED: ./CLAUDE.md]
- 前端基线是 Vue 3 Composition API + `<script setup>`、Pinia、Vite 8、Vitest、pnpm 10、Turborepo；Phase 22 不应提出与这套栈冲突的验证方案。 [VERIFIED: ./CLAUDE.md]
- 测试框架统一使用 `vitest run`，前端测试环境是 `happy-dom`。 [VERIFIED: ./CLAUDE.md] [VERIFIED: apps/web/vitest.config.ts]
- 仓库内未发现项目本地 `.claude/skills/` 或 `.agents/skills/` 目录，因此本 phase 不受额外项目私有 skill 规则约束。 [VERIFIED: current repository read]

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `pnpm` | `10.33.0` | 运行 workspace 级验证命令与 phase closure 操作。 [VERIFIED: package.json] [VERIFIED: current command `pnpm --version`] | 根仓 `packageManager` 已锁定 `pnpm@10.33.0`，Phase 20/22 的所有验证命令都基于 `pnpm --filter @trip-map/web ...`。 [VERIFIED: package.json] [VERIFIED: .planning/phases/20-kawaii/20-VALIDATION.md] |
| `vitest` | `4.1.3` | 运行 shell、popup、cloud card 三个 executable contract spot-check。 [VERIFIED: apps/web/package.json] [VERIFIED: current command `pnpm --filter @trip-map/web exec vitest --version`] | `20-VALIDATION.md` 的 quick run 与当前通过的 spot-check 都使用 Vitest；不需要引入 Playwright 或新回归框架。 [VERIFIED: .planning/phases/20-kawaii/20-VALIDATION.md] [VERIFIED: current command `pnpm --filter @trip-map/web test -- src/App.kawaii.spec.ts src/components/map-popup/MapContextPopup.kawaii.spec.ts src/components/map-popup/PointSummaryCard.kawaii.spec.ts`] |
| `vue-tsc` | `3.2.6` in manifest | 作为可选扩大量化门禁，用于在需要时复核 `20-VALIDATION.md` 的 full suite。 [VERIFIED: apps/web/package.json] | `20-VALIDATION.md` 把 `pnpm --filter @trip-map/web typecheck` 定义为 full suite 一部分，但 Phase 22 只在 spot-check 冲突时才需要升级到这一层。 [VERIFIED: .planning/phases/20-kawaii/20-VALIDATION.md] [VERIFIED: .planning/phases/22-v4-kawaii-audit-closure/22-CONTEXT.md] |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `20-VALIDATION.md` | `approved` | 作为 Phase 20 的主 validation source，提供 task map、automated evidence、manual record。 [VERIFIED: .planning/phases/20-kawaii/20-VALIDATION.md] | 编写 `20-VERIFICATION.md` 时始终作为第一引用源。 [VERIFIED: .planning/phases/22-v4-kawaii-audit-closure/22-CONTEXT.md] |
| `20-01/02/03/04-SUMMARY.md` | `2026-04-09` | 作为 plan 级 requirement evidence，分别覆盖 shell、popup、cloud card/motion、validation closure。 [VERIFIED: .planning/phases/20-kawaii/20-01-SUMMARY.md] [VERIFIED: .planning/phases/20-kawaii/20-02-SUMMARY.md] [VERIFIED: .planning/phases/20-kawaii/20-03-SUMMARY.md] [VERIFIED: .planning/phases/20-kawaii/20-04-SUMMARY.md] | 在 `Requirements Coverage` 表中逐条回落 requirement 时使用。 [VERIFIED: .planning/phases/19-tailwind-token/19-VERIFICATION.md] |
| `.planning/v4.0-v4.0-MILESTONE-AUDIT.md` | `status: gaps_found` | 作为 re-audit baseline 与唯一 canonical audit 路径。 [VERIFIED: .planning/v4.0-v4.0-MILESTONE-AUDIT.md] | 完成 `20-VERIFICATION.md` 后原位更新，不新建平行文件。 [VERIFIED: .planning/phases/22-v4-kawaii-audit-closure/22-CONTEXT.md] |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| 复用 `19-VERIFICATION.md` 结构 | 新造一套 Phase 22 专属 verification 模板 | 会把 closure phase 变成文档格式重设计，并削弱与 Phase 19 / Phase 21 的一致性。 [VERIFIED: .planning/phases/19-tailwind-token/19-VERIFICATION.md] [VERIFIED: .planning/phases/21-v4-infra-verification-closure/21-VERIFICATION.md] |
| 仅跑三份 kawaii spec 做当前佐证 | 重跑 full suite + 新的人工浏览器 UAT | 与 `D-04`、`D-05` 的低成本证据策略冲突，且当前没有发现与既有结论冲突的事实。 [VERIFIED: .planning/phases/22-v4-kawaii-audit-closure/22-CONTEXT.md] [VERIFIED: current command `pnpm --filter @trip-map/web test -- src/App.kawaii.spec.ts src/components/map-popup/MapContextPopup.kawaii.spec.ts src/components/map-popup/PointSummaryCard.kawaii.spec.ts`] |
| 原位更新 `.planning/v4.0-v4.0-MILESTONE-AUDIT.md` | 新建 `v4.0-re-audit.md` 或类似平行文件 | 会直接违反 D-06 / D-07，并制造 canonical source 分叉。 [VERIFIED: .planning/phases/22-v4-kawaii-audit-closure/22-CONTEXT.md] |

**Installation:** 无需新增依赖；Phase 22 应复用当前仓库工具链与既有 phase 文档。 [VERIFIED: .planning/phases/22-v4-kawaii-audit-closure/22-CONTEXT.md] [VERIFIED: package.json] [VERIFIED: apps/web/package.json]

## Architecture Patterns

### Recommended Project Structure

```text
.planning/
├── v4.0-v4.0-MILESTONE-AUDIT.md      # 原位更新的 canonical milestone audit [VERIFIED: .planning/phases/22-v4-kawaii-audit-closure/22-CONTEXT.md]
└── phases/
    └── 20-kawaii/
        ├── 20-VALIDATION.md          # approved validation source [VERIFIED: .planning/phases/20-kawaii/20-VALIDATION.md]
        ├── 20-01-SUMMARY.md          # shell spacing evidence [VERIFIED: .planning/phases/20-kawaii/20-01-SUMMARY.md]
        ├── 20-02-SUMMARY.md          # popup light-shell evidence [VERIFIED: .planning/phases/20-kawaii/20-02-SUMMARY.md]
        ├── 20-03-SUMMARY.md          # cloud card + motion evidence [VERIFIED: .planning/phases/20-kawaii/20-03-SUMMARY.md]
        ├── 20-04-SUMMARY.md          # validation closure + manual record [VERIFIED: .planning/phases/20-kawaii/20-04-SUMMARY.md]
        └── 20-VERIFICATION.md        # 本 phase 需要新增的 formal verification artifact [VERIFIED: .planning/v4.0-v4.0-MILESTONE-AUDIT.md]
```

### Pattern 1: Formal Verification Synthesis

**What:** 用一个 `20-VERIFICATION.md` 汇总 approved validation、plan summaries 与最小现时 spot-check，把 Phase 20 从“分散证据存在”升级为“可审计单一 source”。 [VERIFIED: .planning/phases/19-tailwind-token/19-VERIFICATION.md] [VERIFIED: .planning/phases/22-v4-kawaii-audit-closure/22-CONTEXT.md]

**When to use:** 当 requirement 已经在 `REQUIREMENTS.md`、`SUMMARY.md`、可执行 spec 中有实现证据，但 milestone audit 仍因缺 formal verification source 而判为 `orphaned` 时使用。 [VERIFIED: .planning/v4.0-v4.0-MILESTONE-AUDIT.md]

**Example:**
```markdown
---
phase: 20-kawaii
status: passed
closure_source:
  - 20-VALIDATION.md
  - 20-01-SUMMARY.md
  - 20-02-SUMMARY.md
  - 20-03-SUMMARY.md
  - 20-04-SUMMARY.md
---
```
Source: `.planning/phases/19-tailwind-token/19-VERIFICATION.md` pattern, adapted to Phase 20 inputs. [VERIFIED: .planning/phases/19-tailwind-token/19-VERIFICATION.md] [VERIFIED: .planning/phases/20-kawaii/20-VALIDATION.md]

### Pattern 2: Requirement-by-Requirement Evidence Back-Linking

**What:** 在 `Requirements Coverage` 表里按 requirement 列出 source plan、状态与 evidence，确保 `STYLE-03..INTER-03` 能逐项回落到 summary 与 spec。 [VERIFIED: .planning/phases/19-tailwind-token/19-VERIFICATION.md] [VERIFIED: .planning/v4.0-v4.0-MILESTONE-AUDIT.md]

**When to use:** 写 `20-VERIFICATION.md` 和重写 milestone audit 的 requirements table 时使用。 [VERIFIED: .planning/ROADMAP.md]

**Example:**
```markdown
| Requirement | Source Plan | Description | Status | Evidence |
| --- | --- | --- | --- | --- |
| STYLE-04 | `20-02`, `20-03`, `20-04` | popup 外轻内重 + inner cloud card | SATISFIED | `20-02-SUMMARY.md` + `20-03-SUMMARY.md` + `20-VALIDATION.md` |
```
Source: Phase 19 verification table shape plus Phase 20 requirement mapping. [VERIFIED: .planning/phases/19-tailwind-token/19-VERIFICATION.md] [VERIFIED: .planning/phases/20-kawaii/20-02-SUMMARY.md] [VERIFIED: .planning/phases/20-kawaii/20-03-SUMMARY.md] [VERIFIED: .planning/phases/20-kawaii/20-VALIDATION.md]

### Pattern 3: In-Place Milestone Re-Audit

**What:** 直接更新现有 `.planning/v4.0-v4.0-MILESTONE-AUDIT.md` 的 frontmatter、scorecard、requirements coverage、phase audit 和 verdict，不生成第二份 audit。 [VERIFIED: .planning/phases/22-v4-kawaii-audit-closure/22-CONTEXT.md] [VERIFIED: .planning/v4.0-v4.0-MILESTONE-AUDIT.md]

**When to use:** `20-VERIFICATION.md` 写完之后立即使用，因为 D-06 / D-07 已锁定 canonical path。 [VERIFIED: .planning/phases/22-v4-kawaii-audit-closure/22-CONTEXT.md]

**Example:**
```yaml
status: passed
scores:
  requirements: 12/12
  phases: 2/2
```
Source: current milestone audit frontmatter shape; target values follow Phase 22 success criteria after Phase 20 closure. [VERIFIED: .planning/v4.0-v4.0-MILESTONE-AUDIT.md] [VERIFIED: .planning/ROADMAP.md]

### Anti-Patterns to Avoid

- **把 Phase 22 计划成新的 UI 改造或重新设计 phase：** 锁定边界明确排除了新的 UI 行为、视觉改版和额外功能。 [VERIFIED: .planning/phases/22-v4-kawaii-audit-closure/22-CONTEXT.md]
- **把 `drawer`、未挂载组件或旧 wording 写回 verification scope：** Phase 20 context 已说明实际主路径只有 App shell、popup、PointSummaryCard 与相关交互表面。 [VERIFIED: .planning/phases/20-kawaii/20-CONTEXT.md]
- **新建平行 re-audit 文件：** 会破坏单一路径审计入口。 [VERIFIED: .planning/phases/22-v4-kawaii-audit-closure/22-CONTEXT.md]
- **在没有冲突证据时重开完整手工 UAT：** 与 D-04 / D-05 的低成本 closure 策略冲突。 [VERIFIED: .planning/phases/22-v4-kawaii-audit-closure/22-CONTEXT.md]

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Phase 20 formal verification | 新的 verification 文档结构 | 复用 `19-VERIFICATION.md` 的 `Goal Achievement` / `Required Artifacts` / `Requirements Coverage` 结构 | 这是仓库内已经通过 Phase 21 消化过的 closure 模式。 [VERIFIED: .planning/phases/19-tailwind-token/19-VERIFICATION.md] [VERIFIED: .planning/phases/21-v4-infra-verification-closure/21-VERIFICATION.md] |
| 现时行为佐证 | 新的视觉回归或浏览器自动化 harness | 三个现成 kawaii spec + 已 approved 的 manual record | 当前缺的是 evidence consolidation，不是实现测试缺口。 [VERIFIED: .planning/phases/20-kawaii/20-VALIDATION.md] [VERIFIED: current command `pnpm --filter @trip-map/web test -- src/App.kawaii.spec.ts src/components/map-popup/MapContextPopup.kawaii.spec.ts src/components/map-popup/PointSummaryCard.kawaii.spec.ts`] |
| milestone re-audit 文件管理 | 平行的 re-audit 历史分叉文件 | 原位更新 `.planning/v4.0-v4.0-MILESTONE-AUDIT.md` | D-06 / D-07 已锁定唯一路径。 [VERIFIED: .planning/phases/22-v4-kawaii-audit-closure/22-CONTEXT.md] |
| requirement 叙事 | 模糊的“整体已通过”总述 | 对 `STYLE-03..INTER-03` 逐条写 `SATISFIED` 行与 evidence 列 | 旧 audit 失败正是因为 requirement 级 traceability 不完整。 [VERIFIED: .planning/v4.0-v4.0-MILESTONE-AUDIT.md] |

**Key insight:** Phase 22 的核心不是证明 UI 新行为存在，而是把已经存在且已通过的行为证据汇聚成 audit 可消费的单一 formal source。 [VERIFIED: .planning/v4.0-v4.0-MILESTONE-AUDIT.md] [VERIFIED: .planning/phases/20-kawaii/20-VALIDATION.md]

## Common Pitfalls

### Pitfall 1: 把“代码完成”误当成“审计通过”

**What goes wrong:** planner 只看到 Phase 20 已完成的 summary 与勾选的 requirements，就误以为 milestone re-audit 只需改状态文本。 [VERIFIED: .planning/REQUIREMENTS.md] [VERIFIED: .planning/v4.0-v4.0-MILESTONE-AUDIT.md]

**Why it happens:** 当前 audit 明确说明六项 requirement 的根因不是实现缺失，而是 `20-VERIFICATION.md` 缺失。 [VERIFIED: .planning/v4.0-v4.0-MILESTONE-AUDIT.md]

**How to avoid:** 先产出 `20-VERIFICATION.md`，再修改 audit；不要跳过 formal source 这一步。 [VERIFIED: .planning/ROADMAP.md] [VERIFIED: .planning/phases/22-v4-kawaii-audit-closure/22-CONTEXT.md]

**Warning signs:** 审计表里 `REQUIREMENTS.md` 与 `SUMMARY` 都是 listed/completed，但 `VERIFICATION.md` 一列仍是 `missing`。 [VERIFIED: .planning/v4.0-v4.0-MILESTONE-AUDIT.md]

### Pitfall 2: 把 Phase 22 扩成完整复验或新 UAT

**What goes wrong:** planner 追加 full suite、build、浏览器重测甚至视觉回归，导致 docs closure 变成新的执行 phase。 [VERIFIED: .planning/phases/22-v4-kawaii-audit-closure/22-CONTEXT.md]

**Why it happens:** 容易忽视 D-04 / D-05 已明确允许只做少量 current spot-check。 [VERIFIED: .planning/phases/22-v4-kawaii-audit-closure/22-CONTEXT.md]

**How to avoid:** 默认只跑三份 kawaii spec；只有 spot-check 与既有 evidence 冲突时，才升级到 `20-VALIDATION.md` 的 full suite 或新 manual check。 [VERIFIED: .planning/phases/20-kawaii/20-VALIDATION.md] [VERIFIED: current command `pnpm --filter @trip-map/web test -- src/App.kawaii.spec.ts src/components/map-popup/MapContextPopup.kawaii.spec.ts src/components/map-popup/PointSummaryCard.kawaii.spec.ts`]

**Warning signs:** 计划里出现 build、完整 `typecheck`、浏览器 UAT 作为默认前置，而不是作为冲突处理 fallback。 [VERIFIED: .planning/phases/22-v4-kawaii-audit-closure/22-CONTEXT.md]

### Pitfall 3: scope 回退到旧 wording 而不是当前代码事实

**What goes wrong:** verification 文案把 `drawer` 或未挂载组件重新纳入范围，导致 evidence 对不上实际主路径。 [VERIFIED: .planning/phases/20-kawaii/20-CONTEXT.md]

**Why it happens:** `ROADMAP.md` 对 Phase 20 仍保留过时的 “popup、drawer” 措辞。 [VERIFIED: .planning/phases/20-kawaii/20-CONTEXT.md] [VERIFIED: .planning/ROADMAP.md]

**How to avoid:** Phase 22 的 scope 叙事严格沿用 `20-CONTEXT.md` 对真实主路径的定义。 [VERIFIED: .planning/phases/20-kawaii/20-CONTEXT.md]

**Warning signs:** `20-VERIFICATION.md` 中出现 `drawer`、未挂载组件名或与 `MapContextPopup` / `PointSummaryCard` 无关的 UI 表面。 [VERIFIED: .planning/phases/20-kawaii/20-CONTEXT.md]

### Pitfall 4: 误信 `pnpm dev` 会自动提供完整手工验收环境

**What goes wrong:** 如果 Phase 22 真要补跑人工 spot-check，直接执行根 `pnpm dev` 可能只启动 web，不会自动拉起 server。 [VERIFIED: package.json] [VERIFIED: ./CLAUDE.md]

**Why it happens:** `CLAUDE.md` 的命令说明写的是“同时启动 web + server”，但根脚本实际是 `turbo run dev --filter=@trip-map/web`。 [VERIFIED: ./CLAUDE.md] [VERIFIED: package.json]

**How to avoid:** 除非证据冲突需要新手工复验，否则不要重开浏览器验收；若必须复验，显式分别启动 `pnpm dev:web` 与 `pnpm dev:server`。 [VERIFIED: .planning/phases/22-v4-kawaii-audit-closure/22-CONTEXT.md] [VERIFIED: package.json] [VERIFIED: apps/server/package.json]

**Warning signs:** 计划写成“运行 `pnpm dev` 后进行完整浏览器复验”，但没有提到后端进程。 [VERIFIED: package.json]

## Code Examples

Verified patterns from the codebase:

### Formal Verification Frontmatter

```markdown
---
phase: 19-tailwind-token
verified: 2026-04-09T18:02:09+08:00
status: passed
score: 6/6 requirements satisfied
closure_source:
  - 19-VALIDATION.md
  - 19-01-SUMMARY.md
  - 19-02-SUMMARY.md
  - 19-03-SUMMARY.md
---
```
Source: `.planning/phases/19-tailwind-token/19-VERIFICATION.md`. [VERIFIED: .planning/phases/19-tailwind-token/19-VERIFICATION.md]

### Minimal Phase 22 Spot-Check

```bash
pnpm --filter @trip-map/web test -- \
  src/App.kawaii.spec.ts \
  src/components/map-popup/MapContextPopup.kawaii.spec.ts \
  src/components/map-popup/PointSummaryCard.kawaii.spec.ts
```
Source: Phase 20 quick-run contract plus current passing execution. [VERIFIED: .planning/phases/20-kawaii/20-VALIDATION.md] [VERIFIED: current command `pnpm --filter @trip-map/web test -- src/App.kawaii.spec.ts src/components/map-popup/MapContextPopup.kawaii.spec.ts src/components/map-popup/PointSummaryCard.kawaii.spec.ts`]

### Requirement Evidence Shape

```typescript
expect(cloudClass).toContain('duration-300')
expect(cloudClass).toContain('ease-out')
expect(cloudClass).toContain('hover:scale-105')
expect(className).toContain('border-4')
expect(className).toContain('rounded-3xl')
```
Source: `apps/web/src/components/map-popup/PointSummaryCard.kawaii.spec.ts`. [VERIFIED: apps/web/src/components/map-popup/PointSummaryCard.kawaii.spec.ts]

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `REQUIREMENTS.md` + `SUMMARY.md` 足够代表 phase closure | `REQUIREMENTS.md` + approved `VALIDATION.md` + `SUMMARY.md` + formal `VERIFICATION.md` 才能通过 milestone audit | 在 2026-04-09 的 v4.0 audit 与 Phase 21 closure 中被明确固化。 [VERIFIED: .planning/v4.0-v4.0-MILESTONE-AUDIT.md] [VERIFIED: .planning/phases/21-v4-infra-verification-closure/21-VERIFICATION.md] | planner 必须把 formal verification artifact 当成第一产物，而不是可选附录。 [VERIFIED: .planning/ROADMAP.md] |
| “重新 audit” 意味着重跑实现与完整 UAT | 当前标准是优先消费已 approved 的 validation / summary，并用少量 current spot-check 做现时佐证 | 2026-04-09 的 `22-CONTEXT.md` 已锁定此策略。 [VERIFIED: .planning/phases/22-v4-kawaii-audit-closure/22-CONTEXT.md] | Phase 22 可以保持小而快，不需要重新进入产品开发节奏。 [VERIFIED: .planning/phases/22-v4-kawaii-audit-closure/22-CONTEXT.md] |
| popup 外壳自己承担全部 cloud 造型 | 当前标准是 `MapContextPopup` 外轻内重，`PointSummaryCard` 承担主 cloud 表面 | 2026-04-09 的 Phase 20 plan 02/03 已锁定。 [VERIFIED: .planning/phases/20-kawaii/20-02-SUMMARY.md] [VERIFIED: .planning/phases/20-kawaii/20-03-SUMMARY.md] | `STYLE-04` 的 formal verification 必须写成双层职责，不然容易与现有代码不符。 [VERIFIED: .planning/v4.0-v4.0-MILESTONE-AUDIT.md] |

**Deprecated/outdated:**

- “新建一个平行 re-audit 文件” 是过时做法；当前 canonical 路径必须继续是 `.planning/v4.0-v4.0-MILESTONE-AUDIT.md`。 [VERIFIED: .planning/phases/22-v4-kawaii-audit-closure/22-CONTEXT.md]
- 把 `drawer` 当作 Phase 20 必交表面是过时 scope；当前主路径只有 shell / popup / point summary card。 [VERIFIED: .planning/phases/20-kawaii/20-CONTEXT.md]

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | 如果 planner 需要同步 `REQUIREMENTS.md` / `ROADMAP.md` 元数据，建议把它放在 `20-VERIFICATION.md` 与 milestone audit 更新之后作为次级任务。 [ASSUMED] | Resolved Questions | 任务顺序可能不够优，导致 planner 选择不同的文档同步节奏。 |
| A2 | docs-only wave merge 可以继续只跑 quick run，而不是默认升级到 full suite。 [ASSUMED] | Validation Architecture | 可能低估 planner 想要的验证强度。 |
| A3 | 本研究在 2026-05-09 前对当前仓库结构仍然有效，前提是 Phase 20/22 文档与 specs 未发生变化。 [ASSUMED] | Metadata | 若 phase 文档或测试入口提前变化，部分计划建议会过期。 |

## Resolved Questions

1. **是否在 Phase 22 内同步更新 `REQUIREMENTS.md` / `ROADMAP.md` 的状态元数据？**
   - Resolution: **RESOLVED (2026-04-09)**。采用 `22-02-PLAN.md` Task 2 的最小元数据同步方案，在 `20-VERIFICATION.md` 与 `.planning/v4.0-v4.0-MILESTONE-AUDIT.md` 完成更新之后，再按 closure 结果同步 `ROADMAP.md` / `REQUIREMENTS.md`；若 audit 与 tracking 已天然一致，则不额外扩写内容。 [VERIFIED: .planning/phases/22-v4-kawaii-audit-closure/22-02-PLAN.md] [VERIFIED: .planning/phases/22-v4-kawaii-audit-closure/22-CONTEXT.md]
   - Why this closes the question: 该方案满足 `22-CONTEXT.md` 留给 downstream discretion 的边界，同时保持 “docs closure 优先”，不把元数据同步提前成主产物。 [VERIFIED: .planning/phases/22-v4-kawaii-audit-closure/22-CONTEXT.md]
   - Planning consequence: research 与 plan 现已对齐，Phase 22 默认保留 2-plan 结构，其中 `22-02` Task 2 专门负责必要且最小的 tracking sync。 [VERIFIED: .planning/phases/22-v4-kawaii-audit-closure/22-02-PLAN.md]

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | 执行 `pnpm` / `vitest` / docs closure 脚本 | ✓ | `v22.22.1` | — [VERIFIED: current command `node --version`] |
| `pnpm` | 运行 workspace 验证命令 | ✓ | `10.33.0` | — [VERIFIED: current command `pnpm --version`] |
| `vitest` | 最小现时 spot-check | ✓ | `4.1.3` | — [VERIFIED: current command `pnpm --filter @trip-map/web exec vitest --version`] |
| `vue-tsc` | 可选 expanded full suite/typecheck | ✓ | `3.2.6` in manifest | 如只做 docs closure，默认不需要升级到这一层。 [VERIFIED: apps/web/package.json] [VERIFIED: .planning/phases/20-kawaii/20-VALIDATION.md] |
| `@trip-map/server` dev script | 仅在必须重开人工浏览器复验时使用 | ✓ | `0.1.0` package script present | 优先不重开手工复验；若必须复验，分别启动 `pnpm dev:web` 与 `pnpm dev:server`。 [VERIFIED: apps/server/package.json] [VERIFIED: package.json] |

**Missing dependencies with no fallback:**

- None. [VERIFIED: current command `node --version`] [VERIFIED: current command `pnpm --version`] [VERIFIED: current command `pnpm --filter @trip-map/web exec vitest --version`]

**Missing dependencies with fallback:**

- None, but root `pnpm dev` 不是完整 web+server 启动入口；若 planner 引入新的人工浏览器复验，必须显式处理 server 进程。 [VERIFIED: package.json] [VERIFIED: ./CLAUDE.md]

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | `vitest 4.1.3` + `happy-dom`。 [VERIFIED: apps/web/package.json] [VERIFIED: apps/web/vitest.config.ts] [VERIFIED: current command `pnpm --filter @trip-map/web exec vitest --version`] |
| Config file | `apps/web/vitest.config.ts`。 [VERIFIED: apps/web/vitest.config.ts] |
| Quick run command | `pnpm --filter @trip-map/web test -- src/App.kawaii.spec.ts src/components/map-popup/MapContextPopup.kawaii.spec.ts src/components/map-popup/PointSummaryCard.kawaii.spec.ts`。 [VERIFIED: .planning/phases/20-kawaii/20-VALIDATION.md] |
| Full suite command | `pnpm --filter @trip-map/web test -- src/App.kawaii.spec.ts src/App.spec.ts src/components/map-popup/MapContextPopup.kawaii.spec.ts src/components/map-popup/MapContextPopup.spec.ts src/components/map-popup/PointSummaryCard.kawaii.spec.ts src/components/map-popup/PointSummaryCard.spec.ts && pnpm --filter @trip-map/web typecheck`。 [VERIFIED: .planning/phases/20-kawaii/20-VALIDATION.md] |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| STYLE-03 | pill badge / CTA hierarchy remains intact | unit | `pnpm --filter @trip-map/web test -- src/components/map-popup/PointSummaryCard.kawaii.spec.ts` | ✅ [VERIFIED: apps/web/src/components/map-popup/PointSummaryCard.kawaii.spec.ts] |
| STYLE-04 | popup 外轻内重 + cloud card surface | unit | `pnpm --filter @trip-map/web test -- src/components/map-popup/MapContextPopup.kawaii.spec.ts src/components/map-popup/PointSummaryCard.kawaii.spec.ts` | ✅ [VERIFIED: apps/web/src/components/map-popup/MapContextPopup.kawaii.spec.ts] [VERIFIED: apps/web/src/components/map-popup/PointSummaryCard.kawaii.spec.ts] |
| STYLE-05 | thin shell spacing + roomy card spacing | unit | `pnpm --filter @trip-map/web test -- src/App.kawaii.spec.ts src/components/map-popup/PointSummaryCard.kawaii.spec.ts` | ✅ [VERIFIED: apps/web/src/App.kawaii.spec.ts] [VERIFIED: apps/web/src/components/map-popup/PointSummaryCard.kawaii.spec.ts] |
| INTER-01 | hover lift uses `scale-105` + `-translate-y-1` + `duration-300 ease-out` | unit | `pnpm --filter @trip-map/web test -- src/components/map-popup/PointSummaryCard.kawaii.spec.ts` | ✅ [VERIFIED: apps/web/src/components/map-popup/PointSummaryCard.kawaii.spec.ts] |
| INTER-02 | CTA active state uses `scale-95` | unit | `pnpm --filter @trip-map/web test -- src/components/map-popup/PointSummaryCard.kawaii.spec.ts` | ✅ [VERIFIED: apps/web/src/components/map-popup/PointSummaryCard.kawaii.spec.ts] |
| INTER-03 | motion family stays on `duration-300 ease-out` with reduced-motion guard | unit | `pnpm --filter @trip-map/web test -- src/components/map-popup/PointSummaryCard.kawaii.spec.ts` | ✅ [VERIFIED: apps/web/src/components/map-popup/PointSummaryCard.kawaii.spec.ts] |

### Sampling Rate

- **Per task commit:** 跑三份 kawaii spec quick run。 [VERIFIED: .planning/phases/20-kawaii/20-VALIDATION.md]
- **Per wave merge:** 如本 wave 只改文档，继续使用三份 kawaii spec；如 spot-check 暴露冲突，再升级到 full suite。 [VERIFIED: .planning/phases/22-v4-kawaii-audit-closure/22-CONTEXT.md] [ASSUMED]
- **Phase gate:** `20-VERIFICATION.md` 与 updated milestone audit 内容一致，且 quick run 仍为绿色。 [VERIFIED: .planning/ROADMAP.md] [VERIFIED: current command `pnpm --filter @trip-map/web test -- src/App.kawaii.spec.ts src/components/map-popup/MapContextPopup.kawaii.spec.ts src/components/map-popup/PointSummaryCard.kawaii.spec.ts`] |

### Wave 0 Gaps

None — `App.kawaii.spec.ts`、`MapContextPopup.kawaii.spec.ts`、`PointSummaryCard.kawaii.spec.ts` 已经覆盖本 phase 六项 requirement 的 contract level evidence。 [VERIFIED: .planning/phases/20-kawaii/20-VALIDATION.md] [VERIFIED: apps/web/src/App.kawaii.spec.ts] [VERIFIED: apps/web/src/components/map-popup/MapContextPopup.kawaii.spec.ts] [VERIFIED: apps/web/src/components/map-popup/PointSummaryCard.kawaii.spec.ts]

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | 本 phase 只处理前端 UI 审计资料，不涉及认证流。 [VERIFIED: .planning/PROJECT.md] |
| V3 Session Management | no | 本 phase 不改 session/cookie/token 逻辑。 [VERIFIED: .planning/PROJECT.md] |
| V4 Access Control | no | 本 phase 不引入新的受控资源访问。 [VERIFIED: .planning/PROJECT.md] |
| V5 Input Validation | yes | 继续依赖 Vue 文本插值、避免 `v-html`，并保留 title/notice/candidate hint 的 escaped-text spec。 [VERIFIED: apps/web/src/App.kawaii.spec.ts] [VERIFIED: apps/web/src/components/map-popup/MapContextPopup.kawaii.spec.ts] [VERIFIED: apps/web/src/components/map-popup/PointSummaryCard.kawaii.spec.ts] |
| V6 Cryptography | no | 本 phase 无加密相关实现。 [VERIFIED: .planning/PROJECT.md] |

### Known Threat Patterns for This Phase

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| popup title / notice / candidate hint 被回归成 raw HTML 渲染 | Tampering | 保持 Vue 文本插值和现有 kawaii spec 的 “escaped text / no `v-html`” 合同。 [VERIFIED: apps/web/src/App.kawaii.spec.ts] [VERIFIED: apps/web/src/components/map-popup/MapContextPopup.kawaii.spec.ts] [VERIFIED: apps/web/src/components/map-popup/PointSummaryCard.kawaii.spec.ts] |
| re-audit 文案声称 requirement satisfied，但没有回链到真实 summary/spec | Repudiation | 在 `20-VERIFICATION.md` 与 milestone audit 中保留逐 requirement 的 evidence 列。 [VERIFIED: .planning/phases/19-tailwind-token/19-VERIFICATION.md] [VERIFIED: .planning/v4.0-v4.0-MILESTONE-AUDIT.md] |

## Sources

### Primary (HIGH confidence)

- `.planning/phases/22-v4-kawaii-audit-closure/22-CONTEXT.md` - Phase 22 锁定边界、证据策略、canonical audit 路径。 [VERIFIED: .planning/phases/22-v4-kawaii-audit-closure/22-CONTEXT.md]
- `.planning/ROADMAP.md` - Phase 22 goal、requirements、success criteria。 [VERIFIED: .planning/ROADMAP.md]
- `.planning/v4.0-v4.0-MILESTONE-AUDIT.md` - 当前 orphaned 根因、requirements coverage baseline、re-audit 目标。 [VERIFIED: .planning/v4.0-v4.0-MILESTONE-AUDIT.md]
- `.planning/phases/20-kawaii/20-VALIDATION.md` - approved validation、quick/full run 命令、manual record。 [VERIFIED: .planning/phases/20-kawaii/20-VALIDATION.md]
- `.planning/phases/20-kawaii/20-01-SUMMARY.md` / `20-02-SUMMARY.md` / `20-03-SUMMARY.md` / `20-04-SUMMARY.md` - Phase 20 shell、popup、cloud card/motion、validation closure 证据。 [VERIFIED: .planning/phases/20-kawaii/20-01-SUMMARY.md] [VERIFIED: .planning/phases/20-kawaii/20-02-SUMMARY.md] [VERIFIED: .planning/phases/20-kawaii/20-03-SUMMARY.md] [VERIFIED: .planning/phases/20-kawaii/20-04-SUMMARY.md]
- `.planning/phases/19-tailwind-token/19-VERIFICATION.md` - 当前仓库可复用的 formal verification 模板。 [VERIFIED: .planning/phases/19-tailwind-token/19-VERIFICATION.md]
- `apps/web/src/App.kawaii.spec.ts` / `apps/web/src/components/map-popup/MapContextPopup.kawaii.spec.ts` / `apps/web/src/components/map-popup/PointSummaryCard.kawaii.spec.ts` - executable contracts for STYLE/INTER evidence. [VERIFIED: apps/web/src/App.kawaii.spec.ts] [VERIFIED: apps/web/src/components/map-popup/MapContextPopup.kawaii.spec.ts] [VERIFIED: apps/web/src/components/map-popup/PointSummaryCard.kawaii.spec.ts]
- Current command outputs: `node --version`, `pnpm --version`, `pnpm --filter @trip-map/web exec vitest --version`, `pnpm --filter @trip-map/web test -- ...` - environment availability 与最小现时 spot-check 结果。 [VERIFIED: current command output]

### Secondary (MEDIUM confidence)

- None. [VERIFIED: current repository read]

### Tertiary (LOW confidence)

- Resolved metadata-sync note and the recommendation that docs-only wave merges stay on quick run remain planning guidance rather than new product-scope facts. [ASSUMED]

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH - 全部来自当前仓库 manifest、Vitest 配置与本地命令输出。 [VERIFIED: package.json] [VERIFIED: apps/web/package.json] [VERIFIED: apps/web/vitest.config.ts] [VERIFIED: current command output]
- Architecture: HIGH - Phase 22 boundary、Phase 19 verification pattern、Phase 20 evidence链与当前 milestone audit 基线互相一致。 [VERIFIED: .planning/phases/22-v4-kawaii-audit-closure/22-CONTEXT.md] [VERIFIED: .planning/phases/19-tailwind-token/19-VERIFICATION.md] [VERIFIED: .planning/v4.0-v4.0-MILESTONE-AUDIT.md]
- Pitfalls: HIGH - 均可直接从当前 docs mismatch、audit failure reason 与命令事实验证。 [VERIFIED: ./CLAUDE.md] [VERIFIED: package.json] [VERIFIED: .planning/v4.0-v4.0-MILESTONE-AUDIT.md]

**Research date:** 2026-04-09 [VERIFIED: system date]
**Valid until:** 2026-05-09 for repository-internal planning, unless Phase 20/22 docs or web specs change before planning. [ASSUMED]
