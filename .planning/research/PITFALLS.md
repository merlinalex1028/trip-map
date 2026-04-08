# Pitfalls Research: Tailwind CSS + Kawaii UI 集成

**Domain:** 为现有 Vue 3 + Vite 8 + Leaflet 应用添加 Tailwind CSS v4 + Kawaii UI
**Date:** 2026-04-08
**Confidence:** HIGH

## Critical Pitfalls

### Pitfall 1: Tailwind preflight 重置 Leaflet 样式

**What goes wrong:**
Tailwind preflight (`@import "tailwindcss"` 包含的 CSS reset) 会重置所有 HTML 元素的默认样式，包括 `a`、`button`、`img`、`svg` 等。Leaflet 的 popup、控件按钮和归因链接依赖浏览器默认样式，preflight 后会出现控件丢失样式、popup 布局崩掉、地图操作按钮变形等问题。

**Prevention:**
- 确保 Leaflet CSS 的 `@import 'leaflet/dist/leaflet.css'` 在 Tailwind `@import "tailwindcss"` 之后引入
- 如有冲突，用 Tailwind v4 的 `@layer base` 或具体选择器覆盖，不要直接修改 Leaflet 源码

```css
/* style.css — 正确顺序 */
@import "tailwindcss";           /* 1. Tailwind + preflight */
@import 'leaflet/dist/leaflet.css'; /* 2. Leaflet (覆盖 preflight 副作用) */

@theme {                         /* 3. Kawaii token */
  --color-sakura: #FFB7B2;
}
```

**Phase to address:** Phase 1（Tailwind 集成）

---

### Pitfall 2: Tailwind v4 CSS-first config 与 v3 JS config 混淆

**What goes wrong:**
Tailwind v4 使用 CSS-first 配置（`@theme {}` 块，无 `tailwind.config.js`）。若参考 v3 教程创建 `tailwind.config.js`，或者同时安装 v3 的 PostCSS 插件（`tailwindcss` PostCSS plugin），会导致构建失败或配置完全不生效。

**Prevention:**
- 使用 `@tailwindcss/vite` 插件（不是 PostCSS 插件）
- 不创建 `tailwind.config.js`（v4 不需要也不用）
- 配置全部写在 CSS `@theme {}` 块

```ts
// vite.config.ts
import tailwindcss from '@tailwindcss/vite'

export default {
  plugins: [
    tailwindcss(),
    vue(),
  ]
}
```

**Phase to address:** Phase 1

---

### Pitfall 3: content/purge 配置导致生产环境丢失工具类

**What goes wrong:**
Tailwind v4 自动从 Vite 的模块图推断需要扫描的文件，但如果类名是动态拼接的（如 `'bg-' + color`），这些类不会被包含在生产构建中。结果是开发环境正常，生产打包后按钮颜色消失。

**Prevention:**
- 避免动态拼接 Tailwind 类名，改用完整类名或 safelist
- 在 `@source` 中显式声明扫描路径（如有需要）

```css
/* 如有非标准扫描路径 */
@source "../src/**/*.vue";
```

**Phase to address:** Phase 1 + Phase 2（组件样式迁移时）

---

### Pitfall 4: Google Fonts CDN 导致 FOUC（无样式内容闪烁）

**What goes wrong:**
用 `<link href="https://fonts.googleapis.com/css2?family=Nunito...">` 加载字体，在中国大陆网络环境下可能因 CDN 被屏蔽而导致字体完全不加载，整个 Kawaii 感消失，UI 退化为系统字体。

**Prevention:**
- 使用 `@fontsource-variable/nunito` npm 包，字体与 bundle 一起发布
- 无网络依赖，无 FOUC 风险

```ts
// main.ts
import '@fontsource-variable/nunito'
```

**Phase to address:** Phase 1

---

### Pitfall 5: Tailwind 工具类与现有 scoped style CSS specificity 冲突

**What goes wrong:**
Vue SFC 的 `<style scoped>` 生成带属性选择器的 CSS（如 `button[data-v-xxxxxx]`），其特异性高于普通 Tailwind 工具类。迁移过程中，旧 scoped 样式会覆盖新 Tailwind 工具类，表现为部分样式"看起来没生效"。

**Prevention:**
- 逐组件迁移时，彻底移除旧 `<style scoped>` 中已被 Tailwind 覆盖的规则
- 不要两套样式系统并存太久
- 如确需 Tailwind 覆盖 scoped，可用 `!important` 修饰符（`!rounded-full`），但应视为临时方案

**Phase to address:** Phase 2（组件样式迁移）

---

### Pitfall 6: hover/active 动效与 Leaflet 地图交互冲突

**What goes wrong:**
对地图容器或其父元素添加 `hover:scale-105` 会导致 Leaflet 内部坐标系计算错位（因为 CSS transform 影响地图点击坐标映射），出现"点击地图，弹窗出现在错误位置"。

**Prevention:**
- **绝对不要**对 Leaflet 地图容器（`#map` 或 `LeafletMapStage`）应用 CSS transform
- hover/scale 效果只用于 UI 组件（按钮、卡片、popup），不用于地图舞台

**Phase to address:** Phase 2

---

## Technical Debt Patterns

| Shortcut | Short-term Benefit | Long-term Cost | Acceptable? |
|----------|---------------------|----------------|-------------|
| scoped + Tailwind 并存 | 渐进迁移快 | 特异性冲突难排查 | 仅迁移过渡期可接受 |
| 动态拼接 class 名 | 代码灵活 | 生产环境丢失样式 | 不可接受 |
| 对地图容器加 transform | 视觉效果好 | Leaflet 坐标错乱 | 不可接受 |
| 用 Google Fonts CDN | 接入快 | FOUC + 网络依赖 | 不可接受 |

## "Looks Done But Isn't" Checklist

- [ ] **Leaflet 控件检查:** 地图缩放按钮、归因链接、图层切换控件样式是否正常
- [ ] **生产构建检查:** `pnpm build` 后，所有 Tailwind 工具类是否都存在于输出 CSS
- [ ] **字体检查:** 在无网络 / 国内环境下，Nunito 字体是否正常加载
- [ ] **地图点击检查:** 添加 hover 效果后，地图点击坐标是否仍然准确
- [ ] **scoped 清理确认:** 迁移后是否有遗留 scoped 样式与 Tailwind 冲突

---
*Pitfalls research for: v4.0 Kawaii UI 重构 & Tailwind 集成*
*Written: 2026-04-08*
