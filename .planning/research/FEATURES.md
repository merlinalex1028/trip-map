# Features Research: Kawaii UI Design System

**Domain:** v4.0 Kawaii UI 重构 & Tailwind 集成
**Date:** 2026-04-08
**Confidence:** HIGH

## Table Stakes (必须实现)

| Feature | Description | Tailwind Pattern |
|---------|-------------|-----------------|
| Pastel color palette | 奶油白底色 + 樱花粉/薄荷绿/淡紫 | bg-[#FAFAFA] + @theme extension |
| Rounded fonts | Nunito Variable / Quicksand 字体 | font-nunito via @theme --font-sans |
| Pill buttons | 全圆角按钮/徽章 | rounded-full |
| Colored soft shadow | 按钮阴影色匹配背景 | shadow-[0_4px_14px_0_rgba(255,183,178,0.4)] |
| Floating-cloud cards | 大圆角 + 白色厚边框 + 柔和 shadow | rounded-3xl border-4 border-white shadow-xl |
| Hover lift | 轻弹放大上浮 | hover:scale-105 hover:-translate-y-1 transition-all duration-300 ease-out |
| Active squish | 点击轻压 | active:scale-95 |
| Generous spacing | 宽松 padding / margin | p-6 md:p-8 gap-4 gap-6 |

## Differentiators (锦上添花)

| Feature | Description | Notes |
|---------|-------------|-------|
| Component-matched shadows | 每种颜色系有对应色调阴影 | Tailwind v4 @theme 自定义 shadow utilities |
| Backdrop blur on topbar | 半透明毛玻璃顶栏 | bg-white/80 backdrop-blur-sm |
| Map marker kawaii style | 地图 marker 圆润可爱化 | CSS border-radius + kawaii token colors |

## Anti-Features (明确排除)

| Feature | Reason |
|---------|--------|
| JS animation libraries (framer-motion, animejs) | 纯 CSS transition 已满足需求，添加库是过度工程 |
| Dark mode | 本次不要求，且与 kawaii 浅色主题冲突 |
| Complex CSS animations / keyframes | 超出 PRD 范围，bouncy ease-out 已足够 |

## Component-Specific Patterns

### 全局背景
```html
<body class="bg-[#FAFAFA] font-nunito">
```

### 顶部栏 (TopBar)
```html
<div class="bg-white/80 backdrop-blur-sm border-b border-[#FFB7B2]/20 px-4 py-2 flex items-center">
  <span class="font-nunito font-semibold text-lg text-[#d4746f]">旅记</span>
</div>
```

### 主要按钮 (Primary Button)
```html
<button class="
  rounded-full px-6 py-2
  bg-[#FFB7B2] text-white font-nunito font-semibold
  shadow-[0_4px_14px_0_rgba(255,183,178,0.5)]
  hover:scale-105 hover:-translate-y-1
  active:scale-95
  transition-all duration-300 ease-out
">
```

### 卡片/Popup (Cards)
```html
<div class="
  rounded-3xl border-4 border-white
  bg-white/90 backdrop-blur-sm
  shadow-[0_8px_32px_0_rgba(199,206,234,0.4)]
  p-6
  transition-all duration-300 ease-out
  hover:scale-[1.02] hover:-translate-y-1
">
```

### 徽章 (Badges)
```html
<span class="
  rounded-full px-3 py-1 text-sm font-nunito
  bg-[#C7CEEA]/30 text-[#6b7db5]
  border border-[#C7CEEA]/50
">
```

## Font Loading Strategy

使用 `@fontsource-variable/nunito`（npm 包，零 CORS 风险，不依赖 Google Fonts CDN）：

```ts
// main.ts
import '@fontsource-variable/nunito'
```

```css
/* @theme block in global CSS */
--font-sans: 'Nunito Variable', ui-sans-serif, system-ui;
```

**不推荐** Google Fonts CDN link：可能存在网络延迟、FOUC（无样式内容闪烁）风险。

## Feature Dependencies

- 所有组件样式 → Tailwind v4 集成（前置 Phase）
- 字体工具类 → @fontsource-variable/nunito 安装
- 颜色工具类 → @theme 配置 kawaii palette
- hover/active 效果 → Tailwind transition utilities（内置，无额外安装）
- Leaflet 地图样式 → 需要 Tailwind preflight 安全隔离

---
*Feature research for: v4.0 Kawaii UI 重构 & Tailwind 集成*
*Written: 2026-04-08*
