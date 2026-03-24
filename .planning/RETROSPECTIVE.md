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

## Cross-Milestone Trends

### Process Evolution

| Milestone | Sessions | Phases | Key Change |
|-----------|----------|--------|------------|
| v1.0 | 1 | 6 | 建立 phase-driven 交付流程，并在 milestone 末尾形成正式 audit 闭环 |

### Cumulative Quality

| Milestone | Tests | Coverage | Zero-Dep Additions |
|-----------|-------|----------|-------------------|
| v1.0 | 49 | 未单独统计 | 0 |

### Top Lessons (Verified Across Milestones)

1. 地图交互类产品必须尽早把视觉坐标与真实地理坐标的契约锁死，否则后续所有识别和交互都会反复漂移。
2. 如果 planning 文档不跟着实现同步演进，最后一定会用一个专门的 gap-closure milestone 来补材料。
