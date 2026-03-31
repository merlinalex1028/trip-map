# Phase 13 Discussion Log

**Phase:** 13 - 行政区数据与几何交付
**Date:** 2026-03-31
**Status:** Completed

## Summary

- User chose to discuss all identified gray areas for Phase 13.
- Decisions were captured for geometry resource entry, static asset sharding strategy, canonical boundary identity mapping, and coordinate adaptation verification depth.
- The user consistently preferred“权威引用走 `server`、几何仍走版本化静态资产、不要把 Phase 13 扩成重型几何服务或一次性做完整 GIS 平台”。

## Q&A Audit Trail

### 1. 资源入口怎么定

**Question:** Phase 13 的几何资源入口应该如何定义？

**Options presented:**
- **A:** `server` 返回 `boundary ref / asset key / datasetVersion`，前端再按引用拉静态几何资源
- **B:** 前端完全自己根据 `boundaryId` 和本地 manifest 推导资源路径，`server` 不管几何入口
- **C:** `server` 直接返回完整几何 GeoJSON

**User selection:** A

**Captured decision:**
- `server` 提供权威的边界引用与资源入口信息
- 前端按引用加载版本化静态几何资源
- Phase 13 不走 `server` 内联完整 GeoJSON 的重型方案

### 2. 资产切分粒度怎么定

**Question:** 几何静态资产应该按什么粒度交付？

**Options presented:**
- **A:** 中国一整包、海外一整包，各自单文件版本化交付
- **B:** 按区域分片交付，例如中国按省级包住下属市级几何、海外按国家包住 `admin-1` 几何，并保留 manifest
- **C:** 一条 `boundaryId` 对应一个几何文件

**User selection:** B

**Captured decision:**
- 几何资产按区域分片交付
- 中国优先按省级或同等维护单元切分
- 海外优先按国家切分 `admin-1` 几何
- 前端通过 manifest 解析并定位需要加载的分片

### 3. `boundaryId` 和 geometry asset id 的关系

**Question:** canonical `boundaryId` 和可渲染几何资源 id 应如何关联？

**Options presented:**
- **A:** 保留“canonical `boundaryId` -> geometry asset id”的显式映射层
- **B:** 强行把 canonical `boundaryId` 直接改造成可渲染 geometry id
- **C:** 中国走直连、海外走映射，分两套规则

**User selection:** A

**Captured decision:**
- 保留 canonical `boundaryId` 到 renderable geometry id 的显式映射层
- canonical `boundaryId` 继续作为跨端主身份锚点
- renderable geometry id 可独立演进，但必须被 manifest 稳定映射

### 4. 坐标适配与验证做到什么程度

**Question:** Phase 13 应如何固定坐标适配与验证强度？

**Options presented:**
- **A:** 统一收口到单一坐标标准，并在构建/测试里固定转换规则 + 代表性自动化验点
- **B:** 先只写规则文档和少量人工验收
- **C:** 直接做大规模几何校验体系，覆盖大量边界和空间关系断言

**User selection:** A

**Captured decision:**
- 采用单一对外坐标标准与固定转换规则
- 通过构建或测试中的代表性自动化验点证明中国与海外边界不明显错位
- 北京、香港、California 这类样例进入优先验证集合

## Final Locked Decisions

1. `server` 返回边界引用 / asset key / datasetVersion，前端按引用加载静态几何资源
2. 几何静态资产按区域分片交付，中国优先省级分片，海外优先国家分片
3. 保留 canonical `boundaryId` 到 renderable geometry id 的显式映射层
4. 坐标适配采用单一标准 + 固定转换规则 + 自动化代表性验点
5. 北京、香港、California 进入优先验证基线

## the agent's Discretion

- manifest 字段名、asset key 结构与分片目录设计
- 中国与海外分片的具体边界切分细则
- 坐标标准的最终对外表达形式与内部转换实现
- 自动化验证的落地形态和测试层级

## Deferred Ideas

- 完整 `Leaflet` 地图主舞台迁移
- popup / drawer / 高亮在 `Leaflet` 中的完整交互恢复
- records CRUD 与点亮写链路服务端化
- 对象存储 / 几何服务化 / 大规模 GIS 校验平台
