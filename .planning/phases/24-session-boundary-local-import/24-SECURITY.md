---
phase: 24
slug: session-boundary-local-import
status: verified
threats_open: 0
asvs_level: 1
created: 2026-04-15
---

# Phase 24 — Security

> Per-phase security contract: threat register, accepted risks, and audit trail.

---

## Trust Boundaries

| Boundary | Description | Data Crossing |
|----------|-------------|---------------|
| browser import payload -> server records module | legacy 本地快照映射出的导入 payload 不可信，必须绑定当前会话用户并经过 DTO 校验 | canonical `CreateTravelRecordRequest[]`、`sid` cookie 会话 |
| incoming local records -> existing cloud records | 本地重复 `placeId` 或云端已存在同 `placeId` 时，不能错误覆盖当前账号权威记录 | `placeId`、地点展示字段、authoritative records snapshot |
| browser localStorage -> auth-session store | `trip-map:point-state:v2` 可能损坏、过期或被手工篡改 | localStorage snapshot、legacy travel records |
| auth-session import gate -> map-points records snapshot | 首登迁移流程不能误清空当前云端权威 records，也不能把失败状态跨账号残留 | `pendingLocalImportDecision`、`localImportSummary`、travel records snapshot |
| anonymous map interaction -> authenticated save path | 匿名浏览允许继续，但保存动作必须升级到登录边界，不能在匿名态直接写记录 | 点亮意图、popup/surface 上下文、登录弹层 |
| app-level import dialog -> store actions | UI 不能替用户静默决定导入策略，必须显式暴露有限路径并展示 authoritative summary | 导入选择、import summary counts |
| logout / switch-account boundary -> map shell state | 会话边界切换时不能泄露上一账号 records，也不能保留过期 modal/menu 状态误导用户 | current user、travel records、summary surface、auth modal/menu |

---

## Threat Register

| Threat ID | Category | Component | Disposition | Mitigation | Status |
|-----------|----------|-----------|-------------|------------|--------|
| T-24-01 | Elevation of Privilege | `POST /records/import` | mitigate | `records.controller.ts` 对 `/records/import` 强制 `SessionAuthGuard` + `@CurrentUser()`，handler 只使用 `user.id`，不接受 body 里的 owner 信息。 | closed |
| T-24-02 | Tampering | import payload de-duplication | mitigate | `ImportTravelRecordsDto` 使用 `ValidationPipe` + `ValidateNested` + `Type(() => CreateTravelRecordDto)` 校验 payload；`records.repository.ts` 先按 `placeId` 折叠输入，再按 `userId + placeId` 去重写入。 | closed |
| T-24-03 | Information Disclosure | cloud/local conflict handling | mitigate | `records.repository.ts` 先查询当前用户已存在的 `placeId`，只 `createMany` 缺失项，并重新读取当前用户 records 作为 authoritative snapshot；`records-import.e2e-spec.ts` 锁定 cloud-wins。 | closed |
| T-24-04 | Tampering | legacy local snapshot parsing | mitigate | `legacy-point-storage.ts` 只接受 `version: 2` 且结构完整的 snapshot；`corrupt` / `incompatible` 都返回非 ready 状态，不进入导入链路。 | closed |
| T-24-05 | Denial of Service | repeated migration prompt | mitigate | `keepCloudRecordsAsSourceOfTruth()` 与 `importLocalRecordsIntoAccount()` 成功后都会清理 `trip-map:point-state:v2`；后续登录不会重复弹迁移 gate。 | closed |
| T-24-06 | Information Disclosure | import gate state vs live records | mitigate | `applyAuthenticatedSnapshot()` 先 `resetTravelRecordsForSessionBoundary()`，再注入云端 records，最后才 `stageLocalImportDecision()`；本地快照检测不会清空当前云端真源。 | closed |
| T-24-07 | Elevation of Privilege | anonymous save interception | mitigate | `LeafletMapStage.vue` 的 `handleIlluminate()` 在匿名态只执行 `openAuthModal('login')` 并直接返回，不触发任何 records 写入。 | closed |
| T-24-08 | Information Disclosure | map context continuity | mitigate | 匿名点亮拦截路径不调用任何清场逻辑；`App.vue` 始终保持 map shell 挂载，人工 UAT 已确认 popup、地图位置和识别上下文不会被清空。 | closed |
| T-24-09 | Repudiation | import choice UX | mitigate | `LocalImportDecisionDialog.vue` 只暴露“导入本地记录到当前账号”与“以当前账号云端记录为准”两条主路径，并展示 authoritative summary counts。 | closed |
| T-24-10 | Information Disclosure | logout / switch-account boundary | mitigate | `applyAnonymousSnapshot()` 与 `applyAuthenticatedSnapshot()` 都先 `resetTravelRecordsForSessionBoundary()`；同时清空 `pendingLocalImportDecision`、`localImportSummary` 和上一账号地图状态。 | closed |
| T-24-11 | Repudiation | account switch feedback | mitigate | `applyAuthenticatedSnapshot()` 在检测到 `previousUser.id !== response.user.id` 时设置 `已切换到 {username}` notice；logout 路径也显式提示 `已退出当前账号`。 | closed |
| T-24-12 | Denial of Service | stale modal/menu state during boundary switch | mitigate | `applyAnonymousSnapshot()` / `applyAuthenticatedSnapshot()` 都会 `closeAuthModal()`；`AuthTopbarControl.vue` 在 `handleLogout()` 中先 `closeMenu()` 再退出，会话边界切换不保留过期认证面板。 | closed |

*Status: open · closed*
*Disposition: mitigate (implementation required) · accept (documented risk) · transfer (third-party)*

---

## Accepted Risks Log

No accepted risks.

---

## Security Audit Trail

| Audit Date | Threats Total | Closed | Open | Run By |
|------------|---------------|--------|------|--------|
| 2026-04-15 | 12 | 12 | 0 | Codex |

---

## Sign-Off

- [x] All threats have a disposition (mitigate / accept / transfer)
- [x] Accepted risks documented in Accepted Risks Log
- [x] `threats_open: 0` confirmed
- [x] `status: verified` set in frontmatter

**Approval:** verified 2026-04-15
