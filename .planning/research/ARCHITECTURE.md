# Architecture Research: Tailwind CSS v4 集成到 Vue 3 + Vite 8

**Domain:** v4.0 Kawaii UI 重构 & Tailwind 集成
**Date:** 2026-04-08
**Confidence:** HIGH

## Integration Overview

```text
apps/web/
├── vite.config.ts          ← 添加 @tailwindcss/vite 插件
├── src/
│   ├── main.ts             ← 导入 @fontsource-variable/nunito
│   ├── style.css           ← 主 CSS 入口（@import tailwindcss + @theme）
│   └── components/
│       └── *.vue           ← 替换 scoped styles 为 Tailwind 工具类
```

## Step-by-Step Integration

### Step 1: 安装依赖

```bash
pnpm --filter @trip-map/web add -D tailwindcss @tailwindcss/vite
pnpm --filter @trip-map/web add @fontsource-variable/nunito
```

**包说明:**
- `tailwindcss` v4.2.2+ — 核心（含 preflight）
- `@tailwindcss/vite` v4.2.2+ — Vite 8 专用插件（不是 PostCSS 插件）
- `@fontsource-variable/nunito` — 字体 npm 包，无 CDN 依赖

### Step 2: 修改 vite.config.ts

```ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(),  // 必须在 vue() 之前
    vue(),
  ],
})
```

### Step 3: 修改 style.css（主 CSS 入口）

```css
/* 1. Tailwind + preflight */
@import "tailwindcss";

/* 2. Leaflet（在 preflight 之后，避免被 reset 覆盖） */
@import 'leaflet/dist/leaflet.css';

/* 3. Kawaii 主题 token */
@theme {
  /* Color palette */
  --color-sakura: #FFB7B2;
  --color-sakura-dark: #d4746f;
  --color-mint: #B5EAD7;
  --color-mint-dark: #5aad8a;
  --color-lavender: #C7CEEA;
  --color-lavender-dark: #6b7db5;
  --color-cream: #FAFAFA;
  --color-cream-warm: #FFF5F5;

  /* Typography */
  --font-sans: 'Nunito Variable', ui-sans-serif, system-ui, -apple-system, sans-serif;

  /* Custom shadows for kawaii components */
  --shadow-sakura: 0 4px 14px 0 rgba(255, 183, 178, 0.5);
  --shadow-mint: 0 4px 14px 0 rgba(181, 234, 215, 0.5);
  --shadow-lavender: 0 4px 14px 0 rgba(199, 206, 234, 0.5);
  --shadow-cloud: 0 8px 32px 0 rgba(199, 206, 234, 0.4);
}
```

### Step 4: 修改 main.ts

```ts
import '@fontsource-variable/nunito'
import './style.css'
// ... 其余原有代码不变
```

## New vs Modified Files

### 新增文件

| 文件 | 说明 |
|------|------|
| （无新文件） | Tailwind v4 不需要 tailwind.config.js |

### 修改文件

| 文件 | 修改内容 |
|------|----------|
| `apps/web/vite.config.ts` | 添加 `@tailwindcss/vite` 插件 |
| `apps/web/src/style.css` | 添加 `@import "tailwindcss"` + `@theme {}` 块 |
| `apps/web/src/main.ts` | 添加字体 import |
| `apps/web/package.json` | 添加 tailwindcss、@tailwindcss/vite、@fontsource-variable/nunito |
| `apps/web/src/components/*.vue` | 替换 scoped styles 为 Tailwind 工具类 |

## Migration Strategy for Existing Styles

### 现有样式现状
- `src/style.css`：全局 CSS，含 kawaii token CSS 变量（从 quick task 260408-nch）
- Vue SFC `<style scoped>`：各组件局部样式

### 推荐迁移顺序

1. **Phase 1**：安装 Tailwind + 配置 @theme（将现有 CSS 变量对应映射到 Tailwind token）
2. **Phase 2**：从全局 body/页面级 styles 开始迁移
3. **Phase 3**：逐组件迁移，先简单组件（按钮、徽章），后复杂组件（popup、drawer）
4. **Phase 4**：清理残留 scoped styles

### 现有 CSS 变量到 Tailwind 映射

```css
/* 旧 CSS 变量 → Tailwind @theme */
var(--color-kawaii-sakura)    → text-sakura / bg-sakura
var(--color-kawaii-mint)      → text-mint / bg-mint
var(--color-kawaii-lavender)  → text-lavender / bg-lavender
var(--kawaii-topbar-bg)       → bg-white/80 backdrop-blur-sm
```

## Leaflet Conflict Prevention

Leaflet 使用自己的 CSS 系统，与 Tailwind preflight 存在潜在冲突：

### 已知冲突点

| Leaflet 元素 | Tailwind preflight 影响 | 修复方式 |
|-------------|------------------------|---------|
| `.leaflet-control-zoom a` | `a` 标签 reset | Leaflet CSS 在 preflight 后引入即可自动修复 |
| `.leaflet-popup-content` | 行高/字体重置 | Leaflet CSS 在 preflight 后引入即可 |
| `.leaflet-attribution` | 链接颜色 | 同上 |

**关键规则：** CSS 引入顺序 = `@import "tailwindcss"` → `@import "leaflet/..."` → `@theme {}`

### 地图容器禁止使用 CSS transform

```html
<!-- ❌ 绝对不要这样做 -->
<div class="hover:scale-105">
  <LeafletMapStage />
</div>

<!-- ✅ 正确：hover 只用于 UI 组件 -->
<button class="hover:scale-105">点亮</button>
<div class="hover:scale-[1.02]">  <!-- popup card，不是地图容器 -->
```

## Build Order

1. `pnpm install` → 安装新依赖
2. `vite.config.ts` → 添加插件
3. `style.css` → 添加 @import + @theme
4. `main.ts` → 添加字体 import
5. 验证 `pnpm dev` 正常启动，Tailwind 工具类生效
6. 验证 Leaflet 地图控件样式未受影响
7. 逐步迁移组件 scoped styles

## monorepo 注意事项

- `tailwindcss` 和 `@tailwindcss/vite` 安装在 `apps/web`，不是 workspace root
- `@fontsource-variable/nunito` 也安装在 `apps/web`
- Tailwind 配置（`@theme`）只在 `apps/web/src/style.css`，不影响 `apps/server`
- Turborepo pipeline 无需修改（Vite 构建流程不变）

---
*Architecture research for: v4.0 Kawaii UI 重构 & Tailwind 集成*
*Written: 2026-04-08*
