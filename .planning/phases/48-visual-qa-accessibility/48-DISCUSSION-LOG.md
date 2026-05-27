# Phase 48: Visual QA、Accessibility 与回归验证 - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-27T06:02:34Z
**Phase:** 48-Visual QA、Accessibility 与回归验证
**Areas discussed:** 截图验收矩阵, 地图与图表非空验证, 键盘与焦点门槛, 动效降级与视觉失败标准, 回归测试范围

---

## 截图验收矩阵

| Question | Options considered | Selected |
|----------|--------------------|----------|
| 截图验收矩阵应该按什么覆盖深度来规划？ | 核心状态优先 / 全状态穷举 / 你来决定 | 核心状态优先 |
| 桌面/移动 viewport 应该怎么定？ | 两档固定视口 / 三档固定视口 / 你来决定 | 只看桌面；后续不要再出现移动端 |
| 桌面截图的状态覆盖要怎么定？ | 真实 populated 主路径 / 主路径 + 空态 / 主路径 + 错误态 | 真实 populated 主路径 |
| 截图验收证据应该怎么留下？ | 截图文件 + 简短核查表 / 只保留人工说明 / 自动截图差异基线 | 截图文件 + 简短核查表 |
| 截图验收是否允许边截图边修复？ | 发现即修 / 只记录不修复 / 只修阻断问题 | 发现即修 |

**User's choice:** 核心状态优先，桌面 only，真实 populated 主路径，截图文件 + 简短核查表，发现即修。  
**Notes:** 用户明确说“系统已经没有移动端了，后续都不要再出现了”，这 supersedes ROADMAP/REQUIREMENTS 中旧的移动端字样。

---

## 地图与图表非空验证

| Question | Options considered | Selected |
|----------|--------------------|----------|
| 非空验证应该采用哪种方式？ | 人工运行 + 截图核查 / 新增自动化浏览器 smoke / 两者结合 | 人工运行 + 截图核查 |
| 地图页非空截图应覆盖哪个状态？ | 已有足迹账号 / 新账号空地图 / 两个账号都看 | 已有足迹账号 |
| 旅途回忆图表非空应该怎么判定？ | 所有四个图表都可见 / 至少一个图表可见 / 按数据可用性判定 | 所有四个图表都可见 |
| 如果本地数据不足导致图表或标记不全，Phase 48 应该怎么处理？ | 准备固定测试账号/种子数据 / 人工临时创建记录 / 允许数据不足跳过 | 准备固定测试账号/种子数据 |

**User's choice:** 人工运行 + 截图核查；使用已有足迹账号；四个 ECharts 图表都必须可见；准备固定测试账号/种子数据。  
**Notes:** Phase 48 不要求新增 Playwright/browser smoke，只要本地桌面运行证据稳定可复现。

---

## 键盘与焦点门槛

| Question | Options considered | Selected |
|----------|--------------------|----------|
| 键盘验收范围应该覆盖哪些主流程？ | 核心可操作路径 / 所有页面可聚焦元素 / 只查 Dialog/Calendar | 核心可操作路径 |
| 焦点管理的阻断标准应该是什么？ | 主流程焦点不丢失 / 严格 focus trap 审计 / 只修明显问题 | 主流程焦点不丢失 |
| aria 标签和语义检查要到什么程度？ | 关键控件可读 / 全页面语义审计 / 只看无文本按钮 | 关键控件可读 |
| 可访问性发现问题后怎么处理？ | 主流程问题必须修 / 只记录问题 / 按严重程度处理 | 主流程问题必须修 |

**User's choice:** 核心路径键盘 QA，主流程焦点不丢失，关键控件可读，主流程 accessibility 问题必须修。  
**Notes:** 验收聚焦登录入口、侧边导航、地图 popup、日期弹窗、Calendar，而不是全页面逐项 WCAG 审计。

---

## 动效降级与视觉失败标准

| Question | Options considered | Selected |
|----------|--------------------|----------|
| prefers-reduced-motion 的验收范围应该覆盖哪些动效？ | 核心页面装饰与交互动效 / 只覆盖交互动效 / 只覆盖已明确写了 media query 的组件 | 核心页面装饰与交互动效 |
| 视觉失败的阻断门槛怎么定义？ | 影响阅读或操作即阻断 / 只有主流程不可用才阻断 / 像素级还原设计图 | 影响阅读或操作即阻断 |
| 长文本风险要不要作为专门验收项？ | 要，重点看地点/用户名 / 不要，截图发现再说 / 只看地点名 | 要，重点看地点/用户名 |
| 修复视觉问题时允许多大范围的样式调整？ | 局部修复优先 / 可统一抽样式 / 允许视觉系统重整 | 局部修复优先 |

**User's choice:** reduced-motion 覆盖核心页面装饰与交互动效；影响阅读或操作即阻断；专门检查长地点/用户名/备注/标签；局部修复优先。  
**Notes:** Phase 48 不追求像素级还原，也不做全局视觉系统重整。

---

## 回归测试范围

| Question | Options considered | Selected |
|----------|--------------------|----------|
| Phase 48 的发布门测试应该跑到什么范围？ | web + server + contracts 全套测试 / 只跑 web 测试 / 测试 + build + typecheck 全套 | web + server + contracts 全套测试 |
| 如果 server e2e 因本地数据库不可用失败，应该怎么处理？ | 区分环境失败和真实失败 / 必须配置 DB 跑通 / 跳过 server 测试 | 区分环境失败和真实失败 |
| 截图/无障碍修复是否需要补单元测试？ | 有代码修复才补针对性测试 / 所有 QA 项都补测试 / 不补新测试 | 有代码修复才补针对性测试 |
| Phase 48 完成时的证据包应该包含哪些内容？ | 测试结果 + 截图核查表 / 只记录测试结果 / 完整 QA 报告 | 测试结果 + 截图核查表 |

**User's choice:** 发布门跑 web + server + contracts；server DB 环境失败与真实失败分开记录；有代码修复才补针对性测试；证据包包含测试结果 + 截图核查表。  
**Notes:** Build/typecheck 未锁定为默认发布门；planner 可在风险需要时增加，但不是本次用户决策。

---

## the agent's Discretion

- 选择具体桌面截图尺寸、截图文件命名、核查表格式和保存路径。
- 选择固定测试账号/种子数据的实现方式。
- 选择因代码修复而新增的 focused tests 的具体位置。
- 选择 DB 环境不可用时可运行的 server unit/contract 子集。

## Deferred Ideas

None.
