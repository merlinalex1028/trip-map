# Project Retrospective

*A living document updated after each milestone. Lessons feed forward into future planning.*

## Milestone: v1.0 — MVP

**Shipped:** 2026-03-24  
**Phases:** 6 | **Plans:** 17 | **Sessions:** 1

### What Was Built

- Poster 风格的 Vue 应用骨架、固定投影世界地图舞台与响应式抽屉预览
- 离线国家/地区识别、点位 CRUD、本地持久化与异常恢复闭环
- 城市增强回退、草稿取消闭环修复，以及完整的 milestone verification / validation / traceability 证据

### What Worked

- Phase 拆分清晰，先搭地图和识别主链路，再补 CRUD、持久化和可用性，整体推进顺序合理
- 用 verification / validation / summary frontmatter 三源交叉校验收尾，能把“代码已做完”和“审计可消费”这两件事分开处理

### What Was Inefficient

- Phase 06 才集中补历史验证材料，说明前面阶段的审计产物没有同步跟上实现节奏
- `gsd-executor` 在当前运行时回传不稳定，导致 execute-phase 后半段需要退回 inline 执行

### Patterns Established

- 固定投影地图交互统一依赖 `lat/lng + x/y` 双坐标契约
- 点位生命周期集中在 `map-points` store，UI 层通过黑盒回归而不是内部状态耦合来验证
- milestone 审计依赖 REQUIREMENTS / VERIFICATION / SUMMARY frontmatter 三源对齐

### Key Lessons

1. 功能闭环和审计闭环不是同一件事，`VERIFICATION.md`、`VALIDATION.md` 和 `requirements-completed` 要尽量随 phase 同步补齐。
2. 对世界地图这类低缩放交互，城市命中逻辑必须按用户点击误差设计容差，不能只按真实公里半径推导。

### Cost Observations

- Model mix: 未单独统计
- Sessions: 1
- Notable: 当子代理回传不稳定时，回退到顺序 inline 执行能保持结果可控，尤其适合文档与验证型工作

---

## Milestone: v8.0 — Yume Kawaii 视觉重构与登录地图体验

**Shipped:** 2026-05-28  
**Phases:** 7 | **Plans:** 32 | **Sessions:** 多轮

### What Was Built

- Yume Kawaii / Soft Pastel Glassmorphism 视觉基座、shadcn-vue primitives、ECharts chart theme 和统一图标方案。
- 未登录落地页、登录门禁、登录后左侧应用壳，以及世界足迹 / 旅途手账 / 旅途回忆三入口信息架构。
- 世界足迹地图、统一地点 popup、独立留下足迹日期弹窗、snapshot-safe 保存链路和可用地点解释体系。
- 旅途手账和旅途回忆 dashboard，均由当前账号真实旅行记录或 server-authoritative stats 驱动。
- 桌面视觉 QA、关键无障碍修复、long-text containment、reduced-motion guard 和 release gate evidence。

### What Worked

- 先建立 UI primitives 与 theme bridge，再逐页迁移，减少了后续页面重构的样式分歧。
- 用 route-facing copy、forbidden surface tests 和 grep audit 锁定“无收藏 / 无添加旅行入口 / 新命名”的产品边界，很适合视觉重构类 milestone。
- Phase 48 用 fixed QA account 和桌面截图矩阵，把视觉、认证、图表和日期弹窗证据收束到可复用流程。

### What Was Inefficient

- `REQUIREMENTS.md` checklist 与 traceability 没有随 phase summary 同步勾选，导致 close 时出现 23 个 accepted known gaps。
- v8.0 没有独立 `MILESTONE-AUDIT.md`，最终选择 proceed anyway，审计信心主要依赖 phase summaries 与 Phase 48 release evidence。
- 开放 debug / quick task 历史债务继续滚动，close 时需要再次确认 deferred items。

### Patterns Established

- `FootprintPlaceSnapshot` 作为日期弹窗保存真源，避免用户切换地图地点后保存错位。
- 地图 popup 统一为 factual place card + 单一 `留下足迹` CTA，历史记录管理留给旅途手账和地图 record 管理入口。
- Memories dashboard 只消费 server-authoritative stats，不渲染静态假数据。
- reduced-motion guard 以局部修复为主，不全局清空视觉 polish。

### Key Lessons

1. milestone close 前应先跑 `$gsd-audit-milestone`，尤其是跨 UI、auth、map、dashboard 的大视觉改造。
2. requirements checklist 应在每个 phase 完成时同步更新，否则最后的 close 会把真实完成度和文档状态混在一起。
3. 对设计图驱动的重构，明确 forbidden surfaces 比只写 target surfaces 更可靠。

### Cost Observations

- Model mix: 未单独统计
- Sessions: 多轮
- Notable: Phase 48 的 evidence-first closeout 很有效，但应该更早介入，而不是只在最后修补文档与验证债务。

---

## Cross-Milestone Trends

### Process Evolution

| Milestone | Sessions | Phases | Key Change |
|-----------|----------|--------|------------|
| v1.0 | 1 | 6 | 建立 phase-driven 交付流程，并在 milestone 末尾形成正式 audit 闭环 |
| v8.0 | 多轮 | 7 | 建立 Yume Kawaii 全应用视觉重构流程，并把桌面截图、无障碍和 release gate evidence 纳入最终收口 |

### Cumulative Quality

| Milestone | Tests | Coverage | Zero-Dep Additions |
|-----------|-------|----------|-------------------|
| v1.0 | 49 | 未单独统计 | 0 |
| v8.0 | Phase 48 release gate passed | 32/32 plans complete; 23 known requirement gaps accepted | 0 |

### Top Lessons (Verified Across Milestones)

1. 地图交互类产品必须尽早把视觉坐标与真实地理坐标的契约锁死，否则后续所有识别和交互都会反复漂移。
2. 如果 planning 文档不跟着实现同步演进，最后一定会用一个专门的 gap-closure milestone 来补材料。
