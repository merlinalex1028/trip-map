# Phase 46: 旅途手账重构 - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-18T17:46:31+08:00
**Phase:** 46-旅途手账重构
**Areas discussed:** 参考图冲突处理, 手账卡片信息密度, 视觉缩略图来源, 编辑删除入口呈现

---

## 参考图冲突处理

| Question | Options | User's choice |
|----------|---------|---------------|
| 参考图里的「添加新旅行」和收藏按钮，在 Phase 46 应该如何处理？ | 完全移除 / 替换为信息 / 保留禁用态 | 完全移除 |
| 空状态里是否可以引导用户去地图？ | 可以引导去世界足迹 / 只说明为空，不给按钮 / 保留顶部返回地图按钮，空状态不放按钮 | 可以引导去世界足迹 |
| 移除顶部「添加新旅行」后，右上角区域怎么处理？ | 保留为空白呼吸区 / 放非交互统计胶囊 / 放返回地图按钮 | 保留为空白呼吸区 |
| 移除收藏按钮后，卡片右侧原本的圆形按钮位置怎么处理？ | 改成纯装饰星形节点 / 完全移除右侧圆形元素 / 改成展开详情按钮 | 改成纯装饰星形节点 |

**Notes:** The mockup is visual guidance only. Add-trip and favorite affordances are explicitly excluded by Phase 46.

---

## 手账卡片信息密度

| Question | Options | User's choice |
|----------|---------|---------------|
| 每张旅行卡片应该更像哪一种？ | 主视图轻量，详情内收 / 保留完整信息卡 / 参考图极简卡 | 主视图轻量，详情内收 |
| 备注和标签摘要在主卡片里怎么呈现？ | 一句旅行摘记摘要 / 备注和标签分区显示 / 只显示标签，不显示备注 | 一句旅行摘记摘要 |
| 同一地点多次旅行的次数信息怎么放？ | 低噪声小徽章 / 作为主标题旁信息 / 主视图不显示次数 | 低噪声小徽章 |
| 卡片里的地区层级应怎么读？ | 一句自然地点路径 / 拆成多个字段块 / 只显示 parentLabel | 一句自然地点路径 |

**Notes:** Main card reading flow should be light and hand-written in spirit, while preserving the value of notes, tags, and repeat visits.

---

## 视觉缩略图来源

| Question | Options | User's choice |
|----------|---------|---------------|
| 卡片右侧缩略图应该怎么来？ | 地点类型/地区驱动的固定插画占位 / 统一旅行插画占位 / 从设计切图中挑多张静态图轮换 | 地点类型/地区驱动的固定插画占位 |
| 缩略图的视觉语气更偏哪种？ | 柔和风景明信片 / 角色插画为主 / 地图/徽章符号为主 | 柔和风景明信片 |
| 不同地点如何决定使用哪张缩略图？ | 确定性映射 / 按旅行日期轮换 / 按记录顺序轮换 | 确定性映射 |
| 缩略图是否需要可访问文本？ | 装饰图，不单独朗读 / 朗读为地点插画 / 朗读具体风格 | 装饰图，不单独朗读 |

**Notes:** Thumbnails should provide stable atmosphere without implying user-uploaded photos or real location imagery.

---

## 编辑删除入口呈现

| Question | Options | User's choice |
|----------|---------|---------------|
| v7 已经支持编辑日期、备注、标签和删除单条旅行记录。Phase 46 里这些操作应该怎么放？ | 收进更多菜单/详情区 / 保留卡片底部按钮 / 只在展开后显示完整编辑表单 | 收进更多菜单/详情区 |
| 点击「更多/详情」后，展开内容应包含哪些？ | 只放管理操作 / 放完整记录详情 + 管理操作 / 直接展开编辑表单 | 只放管理操作 |
| 编辑表单出现时，应该如何占位？ | 卡片内就地替换 / 打开独立弹窗 / 侧边抽屉 | 卡片内就地替换 |
| 删除操作的视觉优先级怎么处理？ | 低噪声但明确危险态 / 和编辑并列同等明显 / 藏得更深 | 低噪声但明确危险态 |

**Notes:** v7 management capabilities stay available, but Phase 46 should visually demote them below the reading experience.

---

## the agent's Discretion

- Exact component boundaries.
- Thumbnail variant names and mapping helper placement.
- Whether the management entry is implemented as a compact menu or small reveal control.
- Exact CSS implementation of glow, node, and lightweight motion.

## Deferred Ideas

- Journal-local add-trip flow.
- Favorites and collections.
- User photo upload or real photo thumbnails.
- Phase 47 memories dashboard content.
