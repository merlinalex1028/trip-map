---
phase: 35
slug: test-fixture-alignment
status: verified
threats_open: 0
asvs_level: 1
created: 2026-04-28
---

# Phase 35 — Security

> Per-phase security contract: threat register, accepted risks, and audit trail.

---

## Trust Boundaries

| Boundary | Description | Data Crossing |
|----------|-------------|---------------|
| None | Phase 35 为 test fixture 对齐的纯测试文件变更，未修改任何生产代码路径、API 端点或数据流。无信任边界。 | N/A |

---

## Threat Register

| Threat ID | Category | Component | Disposition | Mitigation | Status |
|-----------|----------|-----------|-------------|------------|--------|
| T-35-01 | Tampering | N/A — test file only | accept | 仅修改测试夹具文件（records.service.spec.ts），不涉及生产代码路径或用户数据。修改内容将常量引用与硬编码值对齐，无安全风险。变更通过 git 追踪并经过测试验证。 | closed |

*Status: open · closed*
*Disposition: mitigate (implementation required) · accept (documented risk) · transfer (third-party)*

---

## Accepted Risks Log

| Risk ID | Threat Ref | Rationale | Accepted By | Date |
|---------|------------|-----------|-------------|------|
| AR-35-01 | T-35-01 | 测试文件变更，仅修改 test fixture 中的硬编码常量为已导入的权威常量引用，不涉及生产路径或用户数据，无运行时安全影响。 | gsd-security-auditor | 2026-04-28 |

*Accepted risks do not resurface in future audit runs.*

---

## Security Audit Trail

| Audit Date | Threats Total | Closed | Open | Run By |
|------------|---------------|--------|------|--------|
| 2026-04-28 | 1 | 1 | 0 | gsd-security-auditor |

---

## Sign-Off

- [x] All threats have a disposition (mitigate / accept / transfer)
- [x] Accepted risks documented in Accepted Risks Log
- [x] `threats_open: 0` confirmed
- [x] `status: verified` set in frontmatter

**Approval:** verified 2026-04-28
