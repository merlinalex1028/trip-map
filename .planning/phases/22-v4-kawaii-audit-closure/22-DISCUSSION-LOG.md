# Phase 22: v4 Kawaii 验证归档与复审收口 - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-09T10:41:42Z
**Phase:** 22-v4-kawaii-audit-closure
**Areas discussed:** 交付边界, 证据策略, 复审产物处理

---

## 交付边界

| Option | Description | Selected |
|--------|-------------|----------|
| A | 同一阶段同时完成 `20-VERIFICATION.md` 和 v4.0 re-audit 收口 | ✓ |
| B | 只先补 `20-VERIFICATION.md`，milestone re-audit 留到后面 | |
| C | 以 milestone re-audit 为主，`20-VERIFICATION.md` 只做到最小满足 | |

**User's choice:** A
**Notes:** 用户希望 Phase 22 一次性完成 Phase 20 formal verification 与 v4.0 复审资料收口，不再拆分新的收尾 phase。

---

## 证据策略

| Option | Description | Selected |
|--------|-------------|----------|
| A | 以 `20-VALIDATION.md` + `20-01/02/03/04-SUMMARY.md` 为主，辅以少量当前 spot-check | ✓ |
| B | 重新跑一轮完整自动化门禁，再决定是否补人工复验 | |
| C | 完全不重跑，只整理既有文档 | |

**User's choice:** A
**Notes:** 用户希望沿用 Phase 21 的文档收束模式，以现有 approved evidence 为主，只补少量当前佐证，不把本阶段重新扩展成完整验证执行。

---

## 复审产物处理

| Option | Description | Selected |
|--------|-------------|----------|
| A | 直接更新现有 `v4.0-v4.0-MILESTONE-AUDIT.md` | ✓ |
| B | 新建一个 re-audit 文件，保留当前 audit 作为补证前快照 | |
| C | 更新现有 audit 文件，但在文档里显式保留前后对照段 | |

**User's choice:** A
**Notes:** 用户更偏好单一稳定入口；planner / executor 应继续把现有 audit 文件当作唯一 canonical milestone audit artifact。

---

## the agent's Discretion

- 最小 spot-check 命令集的具体组合
- updated audit 中“旧 gap 已闭合”的具体叙述方式
- 与 audit closure 相关的 requirements / tracking 同步写法

## Deferred Ideas

None
