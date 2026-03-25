---
status: complete
phase: 07-城市选择与兼容基线
source:
  - 07-01-SUMMARY.md
  - 07-02-SUMMARY.md
  - 07-03-SUMMARY.md
  - 07-04-SUMMARY.md
  - 07-05-SUMMARY.md
started: 2026-03-25T08:49:07Z
updated: 2026-03-25T08:53:34Z
---

## Current Test

[testing complete]

## Tests

### 1. 地图点击进入候选确认
expected: 点击一个常见真实城市位置后，应先进入候选确认抽屉，看到“搜索城市”输入，默认最多 3 个候选，并带城市上下文与状态提示；这次应不再出现“地点过少 / 没有明确可获取城市”的情况。
result: pass

### 2. 搜索城市并确认目标
expected: 在候选确认抽屉里输入中文或英文城市名后，候选列表会按输入收窄；点击搜索结果后，应进入对应城市的后续查看或保存流程，而不是走一条单独的分支。
result: pass

### 3. 已记录城市的复用提示
expected: 当你点击或搜索到一个已经记录过的城市时，系统应直接打开旧记录，并给出以“已打开你记录过的”开头的轻提示，而不是新建重复记录。
result: pass

### 4. 无可靠城市时回退到国家或地区
expected: 当系统不能可靠确认城市时，抽屉里应出现“按国家/地区继续记录”主动作，并显示“未能可靠确认城市，已提供国家/地区继续记录”；点击后仍可继续保存流程。
result: pass

### 5. 旧点位兼容查看与编辑
expected: 之前没有 `cityId` 的旧本地点位仍应能正常打开、查看和编辑，不会被强制带回候选确认流程。
result: pass

## Summary

total: 5
passed: 0
passed: 5
issues: 0
pending: 0
skipped: 0
blocked: 0

## Gaps

[none yet]
