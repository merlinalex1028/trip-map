# Phase 47: 旅途回忆 Dashboard - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md - this log preserves the alternatives considered.

**Date:** 2026-05-22
**Phase:** 47-旅途回忆 Dashboard
**Areas discussed:** 趋势与分布图的统计口径, 旅行风格雷达图的依据, 热门足迹排行规则, 回忆缩略图区的语义

---

## 趋势与分布图的统计口径

| Question | Options Considered | Selected |
|----------|--------------------|----------|
| 月度趋势折线图和年度趋势柱状图，主口径用什么？ | 按旅行次数 / 按去重地点数 / 两者都表达 / 交给后续规划决定 | 按旅行次数 |
| 国家/地区分布环图按什么分布？ | 按旅行次数 / 按去重地点数 / 按两层信息表达 / 交给后续规划决定 | 按旅行次数 |
| 时间范围怎么处理？ | 先固定全部时间 / 提供时间范围筛选 / 只筛趋势图 / 交给后续规划决定 | 先固定全部时间 |
| 没有旅行日期的记录怎么进入时间图表？ | 不进入月度/年度趋势 / 按创建记录时间计入 / 单独显示日期未标注 / 交给后续规划决定 | 不进入月度/年度趋势 |

**User's choice:** Keep the dashboard all-time and use trip occurrences for trends and distribution.
**Notes:** Undated records stay out of time-bucketed trend charts instead of being assigned to record creation time.

---

## 旅行风格雷达图的依据

| Question | Options Considered | Selected |
|----------|--------------------|----------|
| 雷达图的维度从哪里来？ | 只用现有真实字段能稳定推导的维度 / 尽量贴近高保图的风格维度 / 改成更直接的数据雷达 / 交给后续规划决定 | 只用现有真实字段能稳定推导的维度 |
| 如果现有数据不足以支撑高保图那类风格维度，Phase 47 应怎么处理？ | 换成可解释的真实画像维度 / 保留旅行风格外观，但弱化解释 / 数据不足时不渲染雷达图 / 交给后续规划决定 | 换成可解释的真实画像维度 |
| 雷达图的语气更偏哪一种？ | 回忆画像 / 风格评分 / 探索档案 / 交给后续规划决定 | 回忆画像 |
| 数据量很少时，雷达图怎么呈现？ | 仍可显示，但明确是初步画像 / 达到记录阈值后再显示 / 只在数据丰富时显示完整雷达 / 交给后续规划决定 | 仍可显示，但明确是初步画像 |

**User's choice:** Keep the radar honest and memory-oriented.
**Notes:** Mockup style labels are not locked when current real fields cannot support them.

---

## 热门足迹排行规则

| Question | Options Considered | Selected |
|----------|--------------------|----------|
| 热门足迹按什么排？ | 按重复去访次数 / 按最近旅行优先 / 按综合排序 / 交给后续规划决定 | 按重复去访次数 |
| 次数相同的时候怎么处理？ | 最近去访者靠前 / 最早留下足迹者靠前 / 地点名称稳定排序 / 交给后续规划决定 | 最近去访者靠前 |
| 排行项里最该突出什么？ | 地点 + 去访次数 + 最近日期 / 地点 + 地区路径 + 去访次数 / 地点 + 缩略图 + 去访次数 / 交给后续规划决定 | 地点 + 去访次数 + 最近日期 |
| 排行数量怎么定？ | 固定 Top 5 / 按可用空间自适应 / 固定 Top 3 / 交给后续规划决定 | 固定 Top 5 |

**User's choice:** Treat popularity as repeat visits, with recency only as the tie break.
**Notes:** Ranking remains a visual memories module and does not expand into a leaderboard browser.

---

## 回忆缩略图区的语义

| Question | Options Considered | Selected |
|----------|--------------------|----------|
| 底部横滑缩略图区和真实记录的关系怎么定？ | 关联真实旅行记录的装饰明信片 / 纯氛围风景带 / 关联热门地点 / 交给后续规划决定 | 关联真实旅行记录的装饰明信片 |
| 这些明信片优先挑哪些记录？ | 最近的有日期回忆 / 最近创建的旅行记录 / 从热门足迹里挑 / 交给后续规划决定 | 最近的有日期回忆 |
| 明信片卡片上要不要显示文字信息？ | 显示轻量地点与日期 / 只显示地点名 / 只做图片，不叠文字 / 交给后续规划决定 | 显示轻量地点与日期 |
| 这块缩略图区要承载交互吗？ | 只横滑浏览 / 点击回到对应手账记录 / 点击放大查看明信片 / 交给后续规划决定 | 只横滑浏览 |

**User's choice:** Make the strip real-record-aware but decorative and browse-only.
**Notes:** Postcards must not look like uploaded user photos or become a hidden detail-navigation feature.

---

## the agent's Discretion

- Choose exact explainable radar dimensions from currently trustworthy real record fields.
- Choose chart and section component boundaries and the postcard illustration mapping.
- Choose the data-layer shape that best preserves real-account semantics while keeping the dashboard current after records change.

## Deferred Ideas

- Time-range filtering for the memories dashboard.
- Postcard deep-links, zoom viewers, and photo-viewer interactions.
- Favorites, photo upload, and real achievement data models.
