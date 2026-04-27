# Phase 32: Route Deep-Link & Acceptance Closure - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-27T18:06:00+0800
**Phase:** 32-route-deep-link-and-acceptance-closure
**Areas discussed:** 路由契约与部署收口, 未登录直达行为, 部署验收环境, 人工 UAT 覆盖边界

---

## 路由契约与部署收口

| Option | Description | Selected |
|--------|-------------|----------|
| A | 保留 clean URL，并把真实部署方式需要的 rewrite/fallback 作为本阶段正式契约写进文档，若仓库能落配置就一起落。 | ✓ |
| B | 改回 hash URL（`#/timeline`、`#/statistics`），彻底去掉部署 fallback 依赖。 | |
| C | 保留 clean URL，但只做人工验收记录，不把部署契约沉淀到仓库文档。 | |

**User's choice:** A  
**Notes:** 继续沿用当前 `/timeline`、`/statistics` clean URL 运行时契约，并把 deploy fallback 当作真实 closure 项；如果实际托管平台允许把配置纳入仓库，则一并沉淀。

---

## 未登录直达行为

| Option | Description | Selected |
|--------|-------------|----------|
| A | 保持现状：允许直达页面，未登录时显示该页自己的 anonymous state + 登录 CTA。 | |
| B | 未登录时统一重定向回 `/`。 | ✓ |
| C | `/timeline` 保持直达，`/statistics` 重定向首页。 | |

**User's choice:** B  
**Notes:** 未登录 direct-open `/timeline` 或 `/statistics` 时都应 fail closed 到地图首页，不再把 route-level anonymous shell 作为产品契约。

---

## 部署验收环境

| Option | Description | Selected |
|--------|-------------|----------|
| A | 必须以真实生产环境为准。 | |
| B | 以 staging / preview 为准，只要部署形态与生产一致即可。 | ✓ |
| C | 两者都可以，先 preview 验，再由文档注明生产待最终人工确认。 | |

**User's choice:** B  
**Notes:** 本阶段以与生产路由行为一致的 preview / staging 环境作为通过门槛，不要求把生产环境作为唯一验收点。

---

## 人工 UAT 覆盖边界

| Option | Description | Selected |
|--------|-------------|----------|
| A | 只验收主链路：已登录真实数据 + 桌面/手机 + `/timeline` `/statistics` 的 direct-open / refresh。 | ✓ |
| B | 主链路之外，再补匿名态人工验收。 | |
| C | 主链路 + 匿名态 + 空状态都纳入人工 UAT。 | |

**User's choice:** A  
**Notes:** Phase 32 不扩成全面 UI 复验，主链路 closure 完成即可；匿名态和空状态继续主要依赖已有自动化覆盖。

---

## the agent's Discretion

- 具体采用路由守卫、组件重定向还是等价最小实现，由后续规划与实现决定。
- 若实际托管平台存在可仓库化配置，则由后续规划确定采用哪种配置文件或交付形态。
- 文档回写顺序与证据组织方式由后续规划决定，但必须保持 clean URL 和 preview/staging 验收契约一致。

## Deferred Ideas

None.
