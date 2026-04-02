---
status: partial
phase: 16-uat-gap-fallback-smoke-record-schema-typelabel-california
source:
  - 16-VERIFICATION.md
started: 2026-04-02T09:43:23Z
updated: 2026-04-02T09:43:23Z
---

## Current Test

[awaiting human testing]

## Tests

### 1. fallback 点位的点亮入口反馈
expected: fallback 点位的“点亮”按钮为禁用态，或在尝试触发时明确提示“该地点暂不支持点亮”，不再表现为假可点击。
result: pending

### 2. 点亮后 saved overlay 的真实可见性
expected: 点亮成功后，同一 session 内出现对应 saved boundary overlay；reopen 或 refresh 后无残留、无缺失。
result: pending

### 3. California 真实区域点击体验
expected: California 区域内多个真实点击都走 resolved branch，并显示一致的 `一级行政区` 与 `United States · 一级行政区`。
result: pending

## Summary

total: 3
passed: 0
issues: 0
pending: 3
skipped: 0
blocked: 0

## Gaps

None yet.
