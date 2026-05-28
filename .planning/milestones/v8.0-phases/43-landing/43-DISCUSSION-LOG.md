# Phase 43: Landing、登录门禁与应用壳 - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-11T09:30:06Z
**Phase:** 43-Landing、登录门禁与应用壳
**Areas discussed:** 落地页还原重点, 登录门禁与跳转, 应用壳导航模型, URL 与全局文案兼容

---

## 落地页还原重点

| Option | Description | Selected |
|--------|-------------|----------|
| 首屏高保优先 | 首屏尽量接近设计稿；下半区风格一致即可 | |
| 整页高保优先 | 首屏和下半区都尽量还原设计稿，包括背景与装饰 | ✓ |
| 功能门禁优先 | 优先匿名 landing、登录入口和门禁闭环，复杂视觉后置 | |
| 其他 | 用户可自由描述优先级 | |

**User's choice:** 整页高保优先。`prd/v8.0/切图` 里有落地页高保的上下分割背景切图可以还原高保。
**Notes:** 后续追问确认背景切图承载大场景，交互 UI 覆盖其上；除上下背景外，切图文件夹中的其他透明元素也可用于高保还原。用户还确认当前系统已放弃移动端，不需要考虑移动端兼容；桌面端按设计稿比例居中缩放。

---

## 登录门禁与跳转

| Option | Description | Selected |
|--------|-------------|----------|
| 永远进入 `/map` | 登录/注册成功后统一进入世界足迹地图 | ✓ |
| 回到原本想访问的页面 | 保存 redirect intent，登录后回原 protected route | |
| 落地页登录去 `/map`，受保护页登录回原页面 | 折中但逻辑更复杂 | |
| 其他 | 用户可指定更细跳转规则 | |

**User's choice:** 登录/注册成功后永远进入 `/map`。
**Notes:** 后续追问确认匿名访问受保护页面时直接回 `/` 普通落地页，不自动打开登录弹窗或显示登录提示；会话恢复中先显示短暂恢复/加载态再决定 landing 或 `/map`；登出后回 `/` 落地页。

---

## 应用壳导航模型

| Option | Description | Selected |
|--------|-------------|----------|
| 登录后以左侧栏为主，移除旧顶栏导航职责 | 贴近设计稿，品牌、用户卡、导航、插画、退出集中在左侧栏 | ✓ |
| 左侧栏 + 顶栏并存 | 主导航在左侧栏，账号/退出留在顶栏 | |
| 先保留顶栏，只新增轻量侧栏 | 改动较小但不够贴近高保设计 | |
| 其他 | 用户可指定顶栏职责 | |

**User's choice:** 登录后以左侧栏为主，移除旧顶栏导航职责。
**Notes:** 后续追问确认所有应用页统一使用一张可靠侧栏插画；用户区目前只展示头像和用户名，头像默认来自高保切图并预留后续上传扩展；三项主导航固定为世界足迹、旅途手账、旅途回忆，不显示收藏或未来占位入口。

---

## URL 与全局文案兼容

| Option | Description | Selected |
|--------|-------------|----------|
| 新增新路径并兼容旧路径 | `/map`、`/journal`、`/memories` 为主，旧路径 redirect | |
| 只新增 `/map`，保留 `/timeline` 和 `/statistics` | 改动少但 URL 与新文案不一致 | |
| 彻底替换旧路径，不保留兼容 redirect | 最干净，需要同步修改相关内容 | ✓ |
| 其他 | 用户可指定具体路径名 | |

**User's choice:** 彻底替换旧路径，不保留兼容 redirect，需同步修改相关内容。
**Notes:** 后续追问确认新路径为 `/map`、`/journal`、`/memories`；用户可见文案和路由/测试名都同步迁移，但不强制做大规模文件/组件重命名；旧 `/timeline`、`/statistics` 按未知路由处理并回 `/`。

---

## the agent's Discretion

No areas were delegated to the agent's discretion.

## Deferred Ideas

- User-uploaded avatar support is deferred; Phase 43 only reserves the replacement path.
- Sidebar travel summaries, badges, progress, or stats are deferred.
- Mobile landing/shell compatibility is deferred/out of current system scope.
