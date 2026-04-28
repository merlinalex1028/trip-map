# Phase 32: Deploy Fallback Contract

**Hosting Provider:** 未绑定（待部署时确定）
**Router Mode:** `createWebHistory()` — HTML5 History Mode（需要 SPA fallback）
**Generated:** 2026-04-28

## SPA Fallback 规则

无论最终选择哪个 hosting provider，核心规则一致：

**非 asset（.js/.css/.png/.ico/.woff2 等）、非 `/api/*` 的请求 → serve SPA entry (`index.html`)**

此规则确保用户在浏览器直接访问 `/timeline` 或 `/statistics`（或刷新页面）时，hosting 层将请求回退到 `index.html`，Vue Router 在客户端接管路由匹配，router guard 决定是否允许访问。

## 仓库内配置文件

| 文件 | 平台 | 规则 |
|------|------|------|
| `apps/web/vercel.json` | Vercel | `rewrites`: 非 `/api/*` 路径 → `/index.html` |
| `apps/web/_redirects` | Netlify / Cloudflare Pages | `/*  /index.html  200` |

## 验证步骤（部署后执行）

1. **部署到 preview/staging 环境**
2. **已登录**状态，浏览器直接访问 `[preview-url]/timeline` → 正常显示时间轴页面
3. **已登录**状态，浏览器直接访问 `[preview-url]/statistics` → 正常显示统计页面
4. **未登录**状态，浏览器直接访问 `[preview-url]/timeline` → redirect 到 `/`
5. **未登录**状态，浏览器直接访问 `[preview-url]/statistics` → redirect 到 `/`
6. 在 `/timeline` 页面按 F5 刷新 → 正常重新加载，不返回 404
7. 在 `/statistics` 页面按 F5 刷新 → 正常重新加载，不返回 404

**预期结果：** 均不返回 404，SPA 正常加载并进入对应路由页面（已登录）或 redirect 到 `/`（未登录）。

## 平台特定说明

### Vercel
使用 `apps/web/vercel.json` 的 `rewrites` 配置。部署时确保 `outputDirectory` 指向 Vite build 产出的 `dist/` 目录。

### Netlify / Cloudflare Pages
使用 `apps/web/_redirects` 文件。确保 build 后该文件被复制到 `dist/_redirects`（Cloudflare Pages）或由 Netlify 直接读取仓库根目录（Netlify 支持仓库内任意位置的 `_redirects`，但通常放在 build 输出目录）。

### 其他平台（GitHub Pages / Render / Railway / 自建 Nginx）
参考对应平台的 SPA fallback 文档。核心原理相同：
```
location / {
  try_files $uri $uri/ /index.html;
}
```

## 证据

[部署验收完成后在此填写截图或文字证据]
