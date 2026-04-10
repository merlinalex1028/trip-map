# Requirements: 旅行世界地图

**Defined:** 2026-04-08
**Milestone:** v4.0 Kawaii UI 重构 & Tailwind 集成
**Core Value:** 用户点击地图后，系统必须能以本地静态地理数据稳定判断真实地点，并把旅行点位可靠保存下来。

## v4.0 Requirements

### Infrastructure（基础设施）

- [x] **INFRA-01**: `apps/web` 已安装 `tailwindcss` v4 + `@tailwindcss/vite`，`vite.config.ts` 已配置 Tailwind Vite 插件
- [x] **INFRA-02**: `apps/web/src/style.css` 包含 `@import "tailwindcss"` + `@theme {}` kawaii 调色板，Leaflet CSS 在其后引入（顺序正确）
- [x] **INFRA-03**: `@fontsource-variable/nunito` 已安装，在 `main.ts` 导入，Nunito Variable 字体全局生效
- [x] **INFRA-04**: Leaflet 地图控件、缩放按钮、归因链接在 Tailwind 集成后样式正常，无 preflight 副作用

### Style System（样式体系）

- [x] **STYLE-01**: 页面全局背景为奶油白（#FAFAFA / #FFF5F5），Tailwind 工具类可使用 `sakura`、`mint`、`lavender`、`cream` 颜色
- [x] **STYLE-02**: 全站字体为 Nunito Variable（圆润友好），通过 `@theme --font-sans` 设置为默认字体
- [x] **STYLE-03**: 所有按钮/徽章为 pill-shaped（`rounded-full`），配合彩色柔光阴影（阴影色与背景色匹配）
- [x] **STYLE-04**: 卡片/容器使用大圆角（`rounded-3xl`）+ `border-4 border-white` + 柔和 box-shadow，呈现 floating-cloud 浮动效果
- [x] **STYLE-05**: 布局宽松，组件内外使用 generous padding/margin（`p-6` / `gap-4` 以上），元素不拥挤

### Interactions（微交互）

- [x] **INTER-01**: 可交互元素（按钮、卡片）hover 时平滑放大（`scale-105`）并上浮（`-translate-y-1`），过渡 300ms ease-out
- [x] **INTER-02**: 按钮点击（active state）轻压（`scale-95`），体感弹性
- [x] **INTER-03**: 所有过渡使用 ease-out timing（300ms），避免 linear / ease-in 硬动画

## Future Requirements

### v5.0+

- 用户账号体系（AUTH）
- 多设备数据同步（SYNC）
- 更多海外国家支持（GEOX）

## Out of Scope

| Feature | Reason |
|---------|--------|
| 后端逻辑变更 | 本次纯前端 UI 层改造，server 不涉及 |
| Dark mode | 与 Kawaii 浅色主题冲突，本次不要求 |
| JS 动画库（framer-motion 等） | 纯 CSS transition 已满足需求 |
| Google Fonts CDN | 使用 @fontsource npm 包代替，无 CDN 依赖 |
| 用户账号体系 | 延至后续里程碑 |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| INFRA-01 | Phase 21 | Complete |
| INFRA-02 | Phase 21 | Complete |
| INFRA-03 | Phase 21 | Complete |
| INFRA-04 | Phase 21 | Complete |
| STYLE-01 | Phase 21 | Complete |
| STYLE-02 | Phase 21 | Complete |
| STYLE-03 | Phase 22 | Complete |
| STYLE-04 | Phase 22 | Complete |
| STYLE-05 | Phase 22 | Complete |
| INTER-01 | Phase 22 | Complete |
| INTER-02 | Phase 22 | Complete |
| INTER-03 | Phase 22 | Complete |

**Coverage:**
- v4.0 requirements: 12 total
- Mapped to phases: 12
- Unmapped: 0 ✓

---
*Requirements defined: 2026-04-08*
*Last updated: 2026-04-10 — Phase 22 closure synced after milestone re-audit*
