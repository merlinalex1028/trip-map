# Phase 12 Discussion Log

**Phase:** 12 - Canonical 地点语义
**Date:** 2026-03-30
**Status:** Completed

## Summary

- User chose to discuss all identified gray areas for Phase 12.
- Decisions were captured for中国侧特殊行政区归类、歧义命中时的 canonical 返回策略、跨表面语义展示格式，以及不可靠命中时的失败口径。
- The user consistently preferred“真实行政语义优先、不要伪装成城市、不要把不确定结果包装成成功”。

## Q&A Audit Trail

### 1. 特殊行政区与层级归类

**Question:** 中国侧正式地点应如何处理直辖市、港澳与其他非“市”的地级单位？

**Options presented:**
- **A:** 严格双态，港澳按中国特别行政区单列展示，内部仍归中国体系处理
- **B:** 中国全域尽量压进 `CN_CITY`
- **C:** 港澳先不纳入正式 canonical 目标，命中时走 fallback

**User selection:** A

**Additional follow-up selections:**
- 北京 / 上海 / 天津 / 重庆明确标成“直辖市”
- 中国侧其他非“市”的地级单位按真实行政称谓展示

**Captured decision:**
- 港澳按“特别行政区”展示，但仍归中国侧语义体系处理
- 直辖市明确显示为“直辖市”
- 自治州、地区、盟等维持真实行政称谓，不伪装成城市

### 2. 歧义命中时的 canonical 返回策略

**Question:** `server` 成为权威来源后，歧义命中还要不要保留候选确认链路？

**Options presented:**
- **A:** 保留候选确认链路，由 `server` 返回 canonical 候选集和推荐项
- **B:** `server` 只返回一个 canonical 结果，前端不再承担候选确认
- **C:** 高置信唯一返回，低置信才返回候选集

**User selection:** A

**Additional follow-up selection:**
- 候选列表上限保持 3 个

**Captured decision:**
- 歧义场景继续保留候选确认链路
- 候选、推荐项和必要提示由 `server` 返回
- 前端继续承接确认体验，但不再维护另一套主判定逻辑
- 候选最多 3 个

### 3. 跨表面的语义展示格式

**Question:** popup、drawer、记录表面中，正式地点语义应如何展示才不会被统一看成“城市”？

**Options presented:**
- **A:** 主标题旁明确显示真实类型标签
- **B:** 主标题不加标签，只在副标题里说明层级
- **C:** 只在候选确认态显示标签，保存后弱化

**User selection:** A

**Additional follow-up selection:**
- 副标题统一为“上级归属 + 类型语义”

**Captured decision:**
- 主标题旁明确显示真实类型标签，如“直辖市”“特别行政区”“一级行政区”等
- 副标题统一采用“上级归属 + 类型语义”的格式
- 跨表面展示不再把不同正式语义混称为“城市”

### 4. 无法可靠命中时的失败口径

**Question:** 当无法可靠命中中国侧正式地点或海外一级行政区时，系统应该如何处理？

**Options presented:**
- **A:** 允许明确 fallback，但不能伪装成 canonical 成功
- **B:** 严格失败，不允许创建任何记录
- **C:** 默认失败，但允许用户手动强制 fallback 创建

**User selection:** B

**Captured decision:**
- 不可靠命中时严格失败
- 不创建任何 fallback 记录
- 不再继续“按国家/地区记录”的兜底路径

## Final Locked Decisions

1. 中国侧正式地点按真实行政称谓展示，不统一伪装成“城市”
2. 北京 / 上海 / 天津 / 重庆明确展示为“直辖市”
3. 港澳展示为“特别行政区”，但仍归中国侧语义体系
4. 歧义命中继续保留候选确认链路，由 `server` 返回候选集与推荐项
5. 候选列表上限保持 3 个
6. 跨表面主标题旁明确显示真实类型标签
7. 副标题统一采用“上级归属 + 类型语义”
8. 无法可靠命中正式 canonical 地点时严格失败，不创建 fallback 记录

## the agent's Discretion

- 中国侧正式地点类型的契约编码与枚举演进方式
- 候选返回 payload 的字段命名和失败 reason 结构
- 类型标签的具体视觉样式与别名策略

## Deferred Ideas

- 几何资产交付与数据版本清单
- `Leaflet` 图层迁移
- 记录 CRUD 与点亮闭环
- 旧数据迁移或兼容链路
