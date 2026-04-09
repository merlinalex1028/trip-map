# Roadmap: 旅行世界地图

## Milestones

- ✅ **v1.0 MVP** — Phases 1-6，已于 2026-03-24 归档
- ✅ **v2.0 城市主视角与可爱风格重构** — Phases 7-10，已于 2026-03-27 归档
- ✅ **v3.0 全栈化与行政区地图重构** — Phases 11-18，已于 2026-04-03 归档（[详情](milestones/v3.0-ROADMAP.md)）
- 🚧 **v4.0 Kawaii UI 重构 & Tailwind 集成** — Phases 19-20，进行中

---

# v4.0 Kawaii UI 重构 & Tailwind 集成

**Milestone:** v4.0
**Phases:** 19-20
**Requirements:** 12

## Phases

- [x] **Phase 19: Tailwind 基础设施 & 全局 Token** - 安装 Tailwind v4、配置 Vite 插件、建立 kawaii 调色板与字体 token，确保 Leaflet 不受 preflight 影响 (completed 2026-04-09)
- [ ] **Phase 20: Kawaii 组件样式全面迁移** - 将所有 UI 组件迁移为 pill 按钮、floating-cloud 卡片，落地 hover/active 微交互

## Phase Overview

| # | Phase | Goal | Requirements | Success Criteria |
|---|-------|------|--------------|------------------|
| 19 | Tailwind 基础设施 & 全局 Token | 3/3 | Complete    | 2026-04-09 |
| 20 | Kawaii 组件样式全面迁移 | 所有 UI 组件呈现完整 kawaii 视觉与微交互 | STYLE-03, STYLE-04, STYLE-05, INTER-01, INTER-02, INTER-03 | 5 |

## Phase Details

### Phase 19: Tailwind 基础设施 & 全局 Token
**Goal:** 前端开发环境具备可用的 Tailwind CSS 工具类，kawaii 调色板与圆润字体作为全局 token 生效，Leaflet 地图控件不受 preflight 干扰
**Depends on:** Phase 18 (v3.0 delivered)
**Requirements:** INFRA-01, INFRA-02, INFRA-03, INFRA-04, STYLE-01, STYLE-02
**Success Criteria** (what must be TRUE):
  1. 开发者在任意 Vue SFC 的 `class` 属性中输入 `bg-sakura-100 text-lavender-500` 等 kawaii 工具类，浏览器立即渲染对应颜色，无需额外配置
  2. 页面背景显示奶油白（#FAFAFA / #FFF5F5），视觉上与纯白有明显柔和区别
  3. 全站字体渲染为 Nunito Variable（圆润，字母有明显圆角感），与之前的 sans-serif 字体可见区别
  4. 打开地图页面，Leaflet 缩放按钮、归因链接、图层控件样式正常，与 v3.0 视觉一致，无样式崩溃
**Plans:** 3/3 plans complete
Plans:
- [x] 19-01-PLAN.md — 锁定 Tailwind v4 依赖范围、Vite 插件接入与静态契约测试
- [x] 19-02-PLAN.md — 建立 `style.css` 入口、Nunito 字体基线和最小 Tailwind App shell 样板
- [x] 19-03-PLAN.md — 跑完自动化门禁并完成 Leaflet 浏览器冒烟验收
**UI hint:** yes

### Phase 20: Kawaii 组件样式全面迁移
**Goal:** 所有可见 UI 组件（按钮、徽章、弹窗卡片、popup、drawer）均采用 kawaii 视觉语言，hover/active 微交互流畅自然
**Depends on:** Phase 19
**Requirements:** STYLE-03, STYLE-04, STYLE-05, INTER-01, INTER-02, INTER-03
**Success Criteria** (what must be TRUE):
  1. 所有按钮和徽章呈现完整圆角 pill 形状（两端半圆），阴影颜色与按钮背景色匹配，无直角按钮残留
  2. 弹窗卡片（popup、drawer）具有大圆角（2xl/3xl）、白色厚边框（border-4 border-white）和柔和投影，整体呈现浮动云朵效果
  3. 组件内外间距宽松，元素之间有明显呼吸感，不出现拥挤或紧贴边缘的情况
  4. 鼠标悬停可交互元素时，元素平滑放大并轻微上浮，过渡时间约 300ms，动作流畅不跳跃
  5. 点击按钮时有轻微下压感（scale 缩小），松开后弹回，所有过渡使用 ease-out，无生硬线性动画
**Plans:** TBD
**UI hint:** yes

## Progress Table

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 19. Tailwind 基础设施 & 全局 Token | 3/3 | Complete | 2026-04-09 |
| 20. Kawaii 组件样式全面迁移 | 0/TBD | Not started | - |
