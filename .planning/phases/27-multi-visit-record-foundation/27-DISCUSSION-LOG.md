# Phase 27: Multi-Visit Record Foundation - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-17T10:33:44Z
**Phase:** 27-Multi-Visit Record Foundation
**Areas discussed:** 旅行日期规则, 已点亮地点再次记录, 历史旧记录迁移

---

## 旅行日期规则

| Option | Description | Selected |
|--------|-------------|----------|
| 必填具体日期 | 先选日期再保存，避免后续时间轴与统计口径模糊 | ✓ |
| 预填今天 | 自动带入今天，用户可修改或直接保存 | |
| 允许日期未知 | 新记录也可不填日期，直接保存为未知 | |

**User's choice:** 新增旅行记录时必须填写日期后才能保存。
**Notes:** 用户随后补充要求日期精度到天，并支持结束日期。

| Option | Description | Selected |
|--------|-------------|----------|
| 精确到天 `YYYY-MM-DD` | 当前阶段最简单，足够支撑后续时间轴 | ✓ |
| 只到年月 | 录入更宽松，但会弱化时间轴表达 | |
| 模糊表达 | 允许约某年/某月等不精确日期 | |

**User's choice:** 日期精度固定到天。
**Notes:** 用户明确要求同时支持结束日期。

| Option | Description | Selected |
|--------|-------------|----------|
| 结束日期可选 | 不填表示单日旅行；填写时结束日期需大于等于开始日期 | ✓ |
| 结束日期必填 | 所有旅行都必须填写开始与结束日期 | |
| 暂不存结束日期 | 先只存单日，范围以后再扩展 | |

**User's choice:** 结束日期可选，不填表示单日旅行。
**Notes:** 产品语义是“单日或日期范围”，不是强制双日期。

---

## 已点亮地点再次记录

| Option | Description | Selected |
|--------|-------------|----------|
| 当前 popup 内完成 | 点击后在现有地图 popup 卡片里展开日期表单，保持主链路不跳转 | ✓ |
| 轻量独立对话框 | 在 popup 中点按钮后再打开独立 dialog 填写 | |
| 别的页面/入口 | 不在 popup 内做，迁移到其他入口 | |

**User's choice:** 已点亮地点的“再记一次旅行”仍在当前 popup 内完成。
**Notes:** 这与当前地图主舞台交互连续性一致。

| Option | Description | Selected |
|--------|-------------|----------|
| 轻量摘要 | 展示“已去过 N 次 + 最近一次日期/日期范围” | ✓ |
| 只展示次数 | 只显示去过次数，不带日期摘要 | |
| 直接展开最近记录列表 | 在 popup 中直接列出最近几次历史记录 | |

**User's choice:** 默认展示次数和最近一次日期摘要。
**Notes:** 用户没有要求在 popup 中直接查看完整历史列表，详细历史留给后续时间轴阶段。

---

## 历史旧记录迁移

| Option | Description | Selected |
|--------|-------------|----------|
| 日期未知 | 每个旧地点转换成 1 条历史旅行记录，日期标记为未知 | ✓ |
| 用 `createdAt` 近似回填 | 把旧保存时间当作旅行发生日期 | |
| 账号与本地分流 | 账号旧记录回填，本地旧记录仍标记未知 | |

**User's choice:** 所有旧记录统一迁成“1 条历史旅行记录 + 日期未知”。
**Notes:** 该口径同时适用于账号内已有旧记录和首次登录导入的本地旧记录。

---

## the agent's Discretion

- 日期输入控件采用何种具体 UI 组件与视觉呈现
- “日期未知”的底层数据结构表示方式
- 前端是否额外维护 place 级聚合视图以兼容现有 `placeId` 主链路

## Deferred Ideas

None.
