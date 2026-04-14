# Phase 24: Session Boundary & Local Import - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-14T03:24:35Z
**Phase:** 24-Session Boundary & Local Import
**Areas discussed:** 匿名保存拦截, 首登本地记录选择, 导入去重与结果反馈, 退出登录与切账号边界

---

## 匿名保存拦截

| Option | Description | Selected |
|--------|-------------|----------|
| 立即弹登录弹层 | 匿名用户点击点亮/保存时，立刻打开统一认证弹层，并保留当前地图上下文 | ✓ |
| 先给轻提示，再由用户自己点登录 | 第一次只显示 notice，不自动弹登录 | |
| 先允许预览，不允许提交保存 | 保留预览态，但真正提交保存时才拦截登录 | |

**User's choice:** 立即弹登录弹层  
**Notes:** 用户确认匿名用户一旦触发点亮/保存，就直接进入统一登录弹层，且不丢失当前地点/地图上下文。

---

## 首登本地记录选择

| Option | Description | Selected |
|--------|-------------|----------|
| 默认导入本地到账号 | 检测到本地记录后自动导入并在后台去重 | |
| 弹一次明确选择弹层 | 只有本地有记录时，登录成功后让用户在“导入本地”和“以云端为准”之间主动选择 | ✓ |
| 默认以云端为准，只给次级导入入口 | 登录后先显示云端，另给导入本地的次级入口 | |

**User's choice:** 弹一次明确选择弹层  
**Notes:** 用户明确要求不要静默默认覆盖；只有本地有旧记录时才出现这一步。

---

## 导入去重与结果反馈

| Option | Description | Selected |
|--------|-------------|----------|
| 完全静默自动去重 | 系统自动合并，不额外反馈细节 | |
| 自动去重 + 导入结果摘要 | 自动按 canonical place 去重，导入结束后给轻量结果说明 | ✓ |
| 逐条冲突确认 | 本地与云端冲突时逐条问用户 | |

**User's choice:** 自动去重 + 导入结果摘要  
**Notes:** 用户接受 canonical 级自动去重，但希望保留“导入了多少、合并了多少”的结果感知。

---

## 退出登录与切账号边界

| Option | Description | Selected |
|--------|-------------|----------|
| 静默切换 | 直接清边界并加载新数据，不额外提示 | |
| 明确 notice + 立即清边界 | 退出和切账号都给用户清晰提示，同时立即清掉上一账号数据 | ✓ |
| 完整过渡面板 | 用更重的过渡块覆盖界面直到切换完成 | |

**User's choice:** 明确 notice + 立即清边界  
**Notes:** 用户希望界面清楚告诉他为什么点亮状态刚刚变化，不要让账号切换显得像“无声出错”。

---

## the agent's Discretion

- 导入结果摘要的精确文案、展示时长与排版。
- 登录弹层和导入选择弹层之间的具体过渡方式。
- 切账号 notice 是否带用户名与加载中的具体措辞。

## Deferred Ideas

- 逐条冲突确认或高级 merge 规则
- 多设备最终一致与更细粒度同步提示
- 设备管理 / 退出所有设备
- 本地导入后的撤销能力
