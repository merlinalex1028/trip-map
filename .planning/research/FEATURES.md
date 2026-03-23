# Feature Research

**Domain:** 旅行世界地图与离线真实地点识别
**Researched:** 2026-03-23
**Confidence:** HIGH

## Feature Landscape

### Table Stakes (Users Expect These)

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| 世界地图可视化 | 没有地图就无法承载旅行足迹体验 | LOW | v1 可先使用固定投影静态底图 |
| 点击地图识别国家/地区 | 这是“真实点位判断”的核心承诺 | HIGH | 需要投影换算与国家边界命中 |
| 旅行点位创建与高亮 | 用户需要能标记自己去过的地方 | MEDIUM | 点位要区分普通高亮与选中态 |
| 点位详情抽屉 | 用户需要查看和补充地点信息 | MEDIUM | 桌面右抽屉、移动端底抽屉 |
| 点位编辑与删除 | 旅行记录不是一次性写入，必须可改 | MEDIUM | 需要未保存取消与误触恢复策略 |
| 本地持久化 | 用户刷新后不应丢失记录 | MEDIUM | 需种子数据与本地数据合并策略 |

### Differentiators (Competitive Advantage)

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| 无网络地点识别 | 强化隐私与离线能力，体验更可信 | HIGH | 明确区别于在线逆地理编码 |
| 清晰的地点双坐标模型 | 为未来升级城市级识别、地图替换和导出预留空间 | MEDIUM | 同时存 `lat/lng` 与 `x/y` |
| 轻量快速的点亮体验 | 用户从点击到看到结果必须顺滑 | MEDIUM | 地图主视觉不能被表单打断 |

### Anti-Features (Commonly Requested, Often Problematic)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| 在线逆地理编码 API | 看起来最快拿到地点名称 | 破坏离线目标，引入外部依赖与成本 | 静态国家边界 + 本地城市数据 |
| 富媒体旅行日志 | 容易让产品显得更完整 | 会显著扩大 v1 范围，偏离真实点位主线 | 先只支持标题与简介 |
| 社交分享与账号系统 | 很常见，容易联想到“旅行社区” | 对当前单用户产品价值不大，复杂度高 | 先打磨本地记录体验 |

## Feature Dependencies

```text
真实地点识别
    └──requires──> 固定投影与坐标换算
                           └──requires──> 世界地图底图与地理数据

点位创建与高亮
    └──requires──> 真实地点识别

详情抽屉编辑
    └──requires──> 点位创建与选择态

本地持久化
    └──enhances──> 点位创建与详情编辑

城市级识别
    └──requires──> 国家级识别与城市数据集
```

### Dependency Notes

- **真实地点识别 requires 固定投影与坐标换算:** 如果底图与投影规则不一致，命中结果就不可信
- **点位创建与高亮 requires 真实地点识别:** 这是产品主行为，不能跳过
- **详情抽屉编辑 requires 点位创建与选择态:** 抽屉必须围绕当前选中点位工作
- **城市级识别 requires 国家级识别与城市数据集:** 城市识别应该建立在国家级正确性之上

## MVP Definition

### Launch With (v1)

- [ ] 世界地图底图与响应式布局 — 提供完整地图主视图
- [ ] 国家/地区级离线地点识别 — 满足真实点位判断承诺
- [ ] 点位创建、编辑、删除与高亮 — 形成闭环旅行记录
- [ ] 详情抽屉与基础信息维护 — 允许用户补充地点信息
- [ ] `seed + localStorage` 数据管理 — 保证首次演示与持久化

### Add After Validation (v1.x)

- [ ] 城市级匹配 — 依赖城市数据质量与性能验证
- [ ] 更丰富的交互反馈 — 比如 toast、撤销、筛选
- [ ] 简单搜索或快速定位 — 当点位数量变多后再增强

### Future Consideration (v2+)

- [ ] 图片、标签、游记、时间线 — 扩展内容表达
- [ ] 导入导出、云端同步 — 扩展数据可移植性
- [ ] 分享链接、社区互动 — 从个人工具转向社交产品

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| 世界地图展示 | HIGH | LOW | P1 |
| 国家级地点识别 | HIGH | HIGH | P1 |
| 点位 CRUD | HIGH | MEDIUM | P1 |
| 详情抽屉 | HIGH | MEDIUM | P1 |
| 本地持久化 | HIGH | MEDIUM | P1 |
| 城市级匹配 | MEDIUM | HIGH | P2 |
| 搜索/筛选 | MEDIUM | MEDIUM | P2 |
| 富内容与同步 | MEDIUM | HIGH | P3 |

**Priority key:**
- P1: Must have for launch
- P2: Should have, add when possible
- P3: Nice to have, future consideration

## Competitor Feature Analysis

| Feature | Competitor A | Competitor B | Our Approach |
|---------|--------------|--------------|--------------|
| 访问过的地点点亮 | 常见 scratch-map 体验 | 常见旅行打卡体验 | 保留，但要求点击后先完成真实地点识别 |
| 统计/社交/分享 | 常作为后续扩展 | 常作为增长功能 | 明确不纳入 v1 |
| 地点内容扩展 | 常见图片、攻略、标签 | 常见多模块信息流 | v1 只保留标题与简介 |

## Sources

- [PRD.md](/Users/huangjingping/i/trip-map/PRD.md) — 已确认的产品范围与交互要求
- 子研究摘要：Features 维度 — GSD 并行研究结果

---
*Feature research for: 旅行世界地图*
*Researched: 2026-03-23*
