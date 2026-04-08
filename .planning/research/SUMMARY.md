# Research Summary: v4.0 Kawaii UI 重构 & Tailwind 集成

**Project:** 旅行世界地图
**Milestone:** v4.0
**Date:** 2026-04-08
**Confidence:** HIGH

## Executive Summary

本里程碑是纯前端 UI 层改造：为 `apps/web`（Vue 3 + Vite 8）引入 Tailwind CSS v4，并将整体界面升级为 Kawaii/Anime 可爱风格。技术路径清晰且低风险——Tailwind v4 的 Vite 插件原生支持 Vite 8，CSS-first 配置（无需 `tailwind.config.js`）可直接映射现有 kawaii token，字体通过 npm 包离线加载。最大的工程风险是 Tailwind preflight 与 Leaflet CSS 的顺序冲突，以及 CSS transform 不能用于地图容器，这两点有明确的防护方案。

---

## Recommended Stack

| Package | Version | Purpose | Install Target |
|---------|---------|---------|---------------|
| `tailwindcss` | ^4.2.2 | Tailwind CSS v4 核心 | `apps/web` devDep |
| `@tailwindcss/vite` | ^4.2.2 | Vite 8 专用插件（非 PostCSS） | `apps/web` devDep |
| `@fontsource-variable/nunito` | latest | 离线 Nunito 可变字体 | `apps/web` dep |

**不需要安装：** `tailwind.config.js`（v4 无需）、PostCSS 插件、JS 动画库。

---

## Key Feature Patterns

### Table Stakes

| Feature | Tailwind Implementation |
|---------|------------------------|
| 奶油白全局背景 | `class="bg-[#FAFAFA]"` on body |
| Kawaii 字体 | `@theme { --font-sans: 'Nunito Variable', ... }` |
| Pill 按钮 | `rounded-full px-6 py-2` |
| 樱花粉柔光阴影 | `shadow-[0_4px_14px_0_rgba(255,183,178,0.5)]` |
| Floating-cloud 卡片 | `rounded-3xl border-4 border-white shadow-xl` |
| Hover 轻弹 | `hover:scale-105 hover:-translate-y-1 transition-all duration-300 ease-out` |
| Active 轻压 | `active:scale-95` |

---

## Architecture Approach

### CSS 引入顺序（关键）

```css
/* style.css */
@import "tailwindcss";              /* 1. Tailwind + preflight */
@import 'leaflet/dist/leaflet.css'; /* 2. Leaflet（必须在 preflight 后） */

@theme {                            /* 3. Kawaii token */
  --color-sakura: #FFB7B2;
  --color-mint: #B5EAD7;
  --color-lavender: #C7CEEA;
  --color-cream: #FAFAFA;
  --font-sans: 'Nunito Variable', ui-sans-serif, system-ui;
}
```

### Vite 配置修改

```ts
import tailwindcss from '@tailwindcss/vite'
export default defineConfig({
  plugins: [tailwindcss(), vue()],
})
```

### 字体加载

```ts
// main.ts
import '@fontsource-variable/nunito'
```

---

## Critical Pitfalls

| # | Pitfall | Prevention |
|---|---------|------------|
| 1 | Tailwind preflight 重置 Leaflet 样式 | Leaflet CSS 在 `@import "tailwindcss"` 之后引入 |
| 2 | 用 v3 方式创建 `tailwind.config.js` | v4 无需 config 文件，用 `@theme {}` 块 |
| 3 | 动态拼接 class 名导致生产丢失工具类 | 始终使用完整类名字符串 |
| 4 | Google Fonts CDN 导致 FOUC | 使用 `@fontsource-variable/nunito` npm 包 |
| 5 | scoped 样式与 Tailwind 工具类特异性冲突 | 迁移时彻底删除对应 scoped 规则 |
| 6 | 地图容器使用 CSS transform | Hover/scale 只用于 UI 组件，绝不用于 Leaflet 容器 |

---

## Roadmap Implications

建议 2 个 phase 完成本里程碑：

**Phase 19: Tailwind 基础设施 + 全局 token**
- 安装 4 个包，配置 Vite 插件
- 写 `@theme {}` 块，建立 sakura/mint/lavender/cream 调色板
- 全局字体生效
- 验证 Leaflet 地图控件样式未受影响

**Phase 20: 全面 Kawaii 组件样式迁移**
- 顶部栏：半透明毛玻璃 + 樱花粉标题
- 按钮/徽章：pill-shaped + 彩色柔光阴影
- Popup/卡片：floating-cloud 大圆角白边框
- hover/active 微交互全量应用
- 清理所有遗留 scoped 样式

---

## Confidence Assessment

| Area | Level | Notes |
|------|-------|-------|
| Stack | HIGH | Tailwind v4 + Vite 8 peerDep 已验证，npm 包版本可查 |
| Features | HIGH | PRD 已极度具体，无需额外功能发现 |
| Architecture | HIGH | Vite 插件模式清晰，CSS 引入顺序有官方指导 |
| Pitfalls | HIGH | 来自 Tailwind v4 文档 + Leaflet 已知行为 + 项目历史 |

**Overall:** HIGH — 本里程碑技术路径明确，无重大未知风险。

---
*Research for: v4.0 Kawaii UI 重构 & Tailwind 集成*
*Written: 2026-04-08*
