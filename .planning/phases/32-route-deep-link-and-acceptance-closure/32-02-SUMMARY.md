---
phase: 32-route-deep-link-and-acceptance-closure
plan: 02
subsystem: deploy-config
tags:
  - deploy
  - spa-fallback
  - vercel
  - netlify
requires: []
provides:
  - spa-fallback-config
  - deploy-contract
affects:
  - apps/web/vercel.json
  - apps/web/_redirects
  - .planning/phases/32-route-deep-link-and-acceptance-closure/32-DEPLOY.md
tech-stack:
  added: []
  patterns:
    - HTML5 History Mode SPA fallback
    - multi-platform deploy config (Vercel, Netlify, Cloudflare Pages)
key-files:
  created:
    - apps/web/vercel.json
    - apps/web/_redirects
    - .planning/phases/32-route-deep-link-and-acceptance-closure/32-DEPLOY.md
  modified: []
decisions:
  - "spa-fallback 采用多平台配置文件 + 合约文档组合，覆盖 Vercel/Netlify/Cloudflare Pages"
  - "所有非 asset/非 /api/* 路径 rewrite 到 index.html"
metrics:
  duration: ""
  completed: "2026-04-28T05:10:00Z"
---

# Phase 32 Plan 02: Deploy Fallback 配置 摘要

为 HTML5 History Mode（`createWebHistory()`）配置 SPA fallback，确保用户直接访问或刷新 `/timeline`、`/statistics` 时不返回 404。

## 完成的任务

| Task | 名称 | 类型 | 提交 |
|------|------|------|------|
| 1 | 发现托管平台并创建 SPA fallback 配置 | auto | 911f44c |
| 2 | 验证 preview/staging 的 deep-link/refresh 行为 | checkpoint:human-verify | approved |

## 实现细节

### 配置文件
- **vercel.json**: Vercel rewrite 规则 — 非 `/api/*` 路径 → `/index.html`
- **_redirects**: Netlify / Cloudflare Pages SPA fallback — `/* /index.html 200`
- **32-DEPLOY.md**: 部署回退合约文档，涵盖各平台配置指南和验证步骤

### 验收结果
Task 2 人工验证已批准 — 部署环境 deep-link/refresh 行为符合预期。

## 偏离计划

无。

## Self-Check: PASSED

- [x] `apps/web/vercel.json` 存在，包含 rewrites 规则
- [x] `apps/web/_redirects` 存在，包含 SPA fallback
- [x] `32-DEPLOY.md` 存在，记录平台合约和验证步骤
- [x] 提交 911f44c 存在
- [x] Task 2 人工验证 approved
