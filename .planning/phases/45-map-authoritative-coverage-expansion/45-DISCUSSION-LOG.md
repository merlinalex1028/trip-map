# Phase 45: 可用地点覆盖扩展 - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-15T11:57:26+08:00
**Phase:** 45-可用地点覆盖扩展
**Areas discussed:** 覆盖盘点口径, 补齐优先级, 不可用解释文案颗粒度, 一致性验证范围

---

## 覆盖盘点口径

| Question | Option | Description | Selected |
|----------|--------|-------------|----------|
| Phase 45 的覆盖盘点应该以什么为主？ | 断点审计优先 | 按 `canonical resolve`、前端保存 guard、geometry manifest、metadata catalog、record API 等断点定位。 | ✓ |
| Phase 45 的覆盖盘点应该以什么为主？ | 用户体验优先 | 按用户点击后看到的结果分类。 | |
| Phase 45 的覆盖盘点应该以什么为主？ | 两层都要 | 用户体验分类加开发者技术原因。 | |
| 断点审计要覆盖哪些输入来源？ | 真实运行链路优先 | 以当前 resolve、popup guard、record API 能实际产出的断点为主。 | ✓ |
| 断点审计要覆盖哪些输入来源？ | 数据全集扫描优先 | 扫 manifest、shards、metadata catalog、fixtures 的所有潜在不一致。 | |
| 断点审计要覆盖哪些输入来源？ | 两者结合 | 运行链路主清单，数据全集扫描作附录或诊断输出。 | |
| 审计输出要放在哪里、给谁看？ | 开发者测试/日志优先 | 用 focused tests、fixture matrix、脚本/日志输出呈现类别、数量和原因。 | ✓ |
| 审计输出要放在哪里、给谁看？ | 应用内开发者面板 | 在 dev-only route 或现有面板里展示覆盖诊断。 | |
| 审计输出要放在哪里、给谁看？ | 文档报告 | 产出 markdown 报告列断点和结论。 | |
| 断点分类要细到什么程度？ | 保存阻断原因级别 | 分类到缺 `boundaryId`、缺 manifest geometry、缺 metadata catalog、record API 拒绝、前端 guard 阻断等。 | ✓ |
| 断点分类要细到什么程度？ | 用户文案级别 | 只分为当前不支持保存、需要确认候选、完全未接入数据。 | |
| 断点分类要细到什么程度？ | 底层数据字段级别 | 逐字段列出 canonical identity、metadata、geometryRef 是否齐全。 | |

**User's choice:** 断点审计优先；真实运行链路优先；开发者测试/日志优先；保存阻断原因级别。  
**Notes:** Phase 45 should avoid becoming a broad data scanner or user-facing diagnostics project.

---

## 补齐优先级

| Question | Option | Description | Selected |
|----------|--------|-------------|----------|
| 补齐时优先处理哪类断点？ | 完整 canonical identity 但保存链路断裂 | Server 已能返回完整 canonical identity，但保存、高亮或回放链路没接顺。 | ✓ |
| 补齐时优先处理哪类断点？ | 用户点击 fallback 地区 | Server 未 resolved，但前端 fallback 识别出国家/地区。 | |
| 补齐时优先处理哪类断点？ | record API 拒绝的 authoritative 不一致 | 优先处理 `POST /records` metadata/catalog 不匹配。 | |
| 如果同一类断点很多，排序依据是什么？ | 当前用户最可能点到的地图范围 | 优先当前点击/resolve 主链路可稳定复现的地点。 | ✓ |
| 如果同一类断点很多，排序依据是什么？ | 国家/地区覆盖数量最大化 | 优先提高支持国家/地区数量。 | |
| 如果同一类断点很多，排序依据是什么？ | 实现成本最低优先 | 先修只需小改动的小缺口。 | |
| 对 fallback 地区要做到什么程度？ | 只解释，不补齐 | fallback 地区保持不可保存解释，不生成 save payload。 | ✓ |
| 对 fallback 地区要做到什么程度？ | 少量人工白名单补齐 | 为用户明显关心且数据可靠的 fallback 地区加白名单。 | |
| 对 fallback 地区要做到什么程度？ | 转为候选确认流程 | fallback 后尝试给出可确认候选。 | |
| 补齐时遇到需要新地理数据源/大规模数据生成的缺口怎么办？ | 记录为 deferred，不在 Phase 45 做 | 只修已有数据和链路能支撑的缺口。 | ✓ |
| 补齐时遇到需要新地理数据源/大规模数据生成的缺口怎么办？ | 做最小数据生成脚本 | 允许 planner 加小脚本补齐 manifest/metadata。 | |
| 补齐时遇到需要新地理数据源/大规模数据生成的缺口怎么办？ | 只要能补就补 | planner 自行判断并尽量多扩展。 | |

**User's choice:** 优先修完整 canonical identity 但保存链路断裂的可复现样本；fallback 只解释；新数据源/大规模生成 deferred。  
**Notes:** The phase should optimize for reproducible UAT value, not raw coverage count.

---

## 不可用解释文案颗粒度

| Question | Option | Description | Selected |
|----------|--------|-------------|----------|
| 不可保存地点的用户文案应该怎么表达？ | 温和原因 + 不暴露技术字段 | 用户能理解，不暴露 `boundaryId`、metadata、manifest 等内部词。 | ✓ |
| 不可保存地点的用户文案应该怎么表达？ | 明确原因类别 | 显示缺边界数据、缺保存元数据、不在正式支持目录等。 | |
| 不可保存地点的用户文案应该怎么表达？ | 统一一句不可用 | 所有不可保存都显示同一句。 | |
| 不同不可用原因是否需要不同用户文案？ | 少量分层 | 用户看到 2-3 类友好原因，内部仍记录精确技术原因。 | ✓ |
| 不同不可用原因是否需要不同用户文案？ | 完全统一 | 所有不可用原因显示同一句。 | |
| 不同不可用原因是否需要不同用户文案？ | 逐原因映射 | 每个技术阻断原因都有一条用户文案。 | |
| 不可用入口应该如何呈现？ | 保留禁用 CTA + 就地说明 | 显示禁用的 `留下足迹` 并在附近解释原因。 | ✓ |
| 不可用入口应该如何呈现？ | 隐藏 CTA，只显示说明 | 不显示无法执行的动作。 | |
| 不可用入口应该如何呈现？ | CTA 可点，打开解释弹层 | 点击后进入解释层。 | |
| 开发者日志/测试里的技术原因要不要和用户文案建立映射？ | 建立映射表 | 技术原因映射到少量用户文案类别。 | ✓ |
| 开发者日志/测试里的技术原因要不要和用户文案建立映射？ | 只记录技术原因 | UI 自己决定文案。 | |
| 开发者日志/测试里的技术原因要不要和用户文案建立映射？ | 只测试用户文案 | 只验证用户能看到的文案。 | |

**User's choice:** 温和用户文案、少量分层、禁用 CTA + 就地说明，并建立技术原因到文案类别的映射表。  
**Notes:** Phase 44 already locked the disabled CTA behavior; Phase 45 should refine reasons and mappings.

---

## 一致性验证范围

| Question | Option | Description | Selected |
|----------|--------|-------------|----------|
| 一致性验证应该以什么样本为中心？ | 新增/修复覆盖样本矩阵 | Phase 45 补齐哪些地点，就让这些地点贯穿链路。 | ✓ |
| 一致性验证应该以什么样本为中心？ | 全量回归矩阵 | 对所有已支持 canonical 地点做一致性检查。 | |
| 一致性验证应该以什么样本为中心？ | 少量手工 UAT 样本 | 选几个地点手动点地图验证。 | |
| 矩阵要覆盖哪些链路？ | resolve -> save -> replay -> derived views | 覆盖 resolve、`POST /records`、bootstrap/replay、journal/memories 派生数据。 | ✓ |
| 矩阵要覆盖哪些链路？ | 只到 save API | 覆盖 resolve 和 `POST /records`。 | |
| 矩阵要覆盖哪些链路？ | 前端点击到弹窗为主 | 覆盖地图点击、弹窗 CTA 和高亮。 | |
| 地图高亮验证要怎么处理？ | manifest/geometry lookup 断言 + focused 前端测试 | 用自动化确认 geometryRef 可查、边界可加载/高亮状态成立。 | ✓ |
| 地图高亮验证要怎么处理？ | Playwright 地图可视验证 | 真跑浏览器看地图高亮。 | |
| 地图高亮验证要怎么处理？ | 只验证数据，不验证高亮 | 不覆盖地图高亮。 | |
| 测试失败时应该暴露什么信息？ | 暴露 canonical identity + 阻断原因 | 失败信息包含 `placeId`、`boundaryId` 和分类原因。 | ✓ |
| 测试失败时应该暴露什么信息？ | 只暴露用户文案类别 | 只输出 product-facing 类别。 | |
| 测试失败时应该暴露什么信息？ | 完整字段 diff | 输出完整字段差异。 | |

**User's choice:** 以新增/修复样本矩阵验证 `resolve -> save -> replay -> derived views`；地图高亮用 manifest/geometry lookup 和 focused 前端测试；失败信息暴露 canonical identity 和阻断原因。  
**Notes:** Full visual QA and all-supported-place regression matrix are intentionally out of scope for Phase 45.

---

## the agent's Discretion

- Exact helper/module boundaries, fixture names, and test file placement are left to downstream agents.

## Deferred Ideas

- New geodata sources, broad data generation, or long-term catalog governance should become a separate future data coverage effort.
- Fallback country/region recognition should not be upgraded into saveable records in this phase.
- A dev-only coverage dashboard or in-app diagnostic panel is not part of Phase 45.
- Full Playwright visual QA for map highlight rendering remains outside this phase unless later QA work explicitly requires it.
