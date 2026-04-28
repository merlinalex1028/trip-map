# Phase 36: 数据层扩展 - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-28
**Phase:** 36-数据层扩展
**Areas discussed:** 删除端点共存, 错误响应格式, 合约扩展 updatedAt, 标签处理规则, 备注内容限制

---

## 删除端点共存

| Option | Description | Selected |
|--------|-------------|----------|
| 两个端点共存 | 保留旧端点用于地点级清除（取消亮点），新增 /records/record/:id 用于单条删除 | |
| 只保留单条删除 | 废弃旧端点，所有删除统一走单条删除 | ✓ |

**User's choice:** 只保留单条删除
**Follow-up:** 地图 popup「取消亮点」如何处理？
**Options presented:** 前端循环调用 / 后端批量接口 / 内部保留 placeId 删除
**User's choice:** 移除取消亮点功能，删除最后一条该地点的记录时即为当前的取消亮点的效果

---

## 错误响应格式

| Option | Description | Selected |
|--------|-------------|----------|
| 标准 NestJS 格式 | 继续用 NestJS 默认 { statusCode, message, error }，日期冲突时 message 包含冲突记录信息 | ✓ |
| 结构化错误 DTO | 自定义错误 DTO，包含 structured fields（conflictRecordId, conflictDates 等） | |

**User's choice:** 标准 NestJS 格式
**Follow-up:** 409 message 中需要包含哪些冲突信息？
**Options presented:** 包含冲突日期 / 包含冲突 ID + 日期 / 仅提示冲突
**User's choice:** 包含冲突日期，如 "与已有记录冲突: 2024-01-01 ~ 2024-01-05"

---

## 合约扩展 updatedAt

| Option | Description | Selected |
|--------|-------------|----------|
| 添加 updatedAt | TravelRecord 接口新增 updatedAt 字段，前端可感知最后修改时间 | ✓ |
| 不添加 | 不扩展合约，前端乐观更新仅依赖 response 状态码 | |

**User's choice:** 添加 updatedAt

---

## 标签处理规则

| Option | Description | Selected |
|--------|-------------|----------|
| 自动清洗 | 自动 trim、去重、忽略空字符串，返回排序后的数组 | ✓ |
| 仅校验不修改 | 后端仅做长度/数量校验，不修改用户输入的顺序和内容 | |

**User's choice:** 自动清洗

---

## 备注内容限制

| Option | Description | Selected |
|--------|-------------|----------|
| 允许换行 | 允许换行符，前端用 white-space: pre-line 展示 | ✓ |
| 单行纯文本 | 单行纯文本，换行符自动替换为空格 | |
| 基本富文本 | 允许换行 + 基本 HTML（粗体、链接），后端做 sanitize | |

**User's choice:** 允许换行

---

## Claude's Discretion

- PATCH 请求体允许部分更新
- 删除成功返回 204 No Content
- PATCH 时如果只改了备注/标签但没改日期，不触发唯一约束校验
- 标签返回时不做排序

## Deferred Ideas

None
