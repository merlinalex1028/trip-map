# Phase 14: Leaflet 地图主链路迁移 - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-31
**Phase:** 14-Leaflet 地图主链路迁移
**Areas discussed:** 底图与瓦片, 图层加载策略, 点击→识别→popup 链路, 高亮与 popup 锚定

---

## 底图与瓦片

### 瓦片源选择

| Option | Description | Selected |
|--------|-------------|----------|
| OpenStreetMap | 免费、无需 API key、全球覆盖。简单直接，适合个人项目。但中国境内地名可能不够本地化。 | |
| 天地图 | 中国地图数据合规、中文地名完善。需要注册 key，但对个人开发免费。 | |
| 你来决定 | 只要能全球覆盖、中国地名可读就行 | |

**User's choice:** 高德地图 (AMap)
**Notes:** 用户最初选择高德，后因海外覆盖较弱改为 Bing Maps

### 海外底图处理

| Option | Description | Selected |
|--------|-------------|----------|
| 统一高德 | 全球都用高德瓦片，海外区域底图质量可接受就行 | |
| 分区切换瓦片源 | 中国境内用高德，海外切换到 OSM 或其他国际瓦片源 | |
| 你来决定 | 具体策略交给 Claude 判断 | |

**User's choice:** 不使用高德了，换用微软 Bing Maps
**Notes:** 用户意识到高德海外质量不足后，直接选择 Bing Maps 作为全球统一底图

### Bing Maps API key

| Option | Description | Selected |
|--------|-------------|----------|
| 我会自己申请 | 开发时去 Bing Maps Dev Center 注册免费 key | |
| 已经有 key | 已有 Bing Maps API key | |
| 你来决定 | 具体集成方式交给 Claude 判断 | ✓ |

**User's choice:** 你来决定

### 多语言地名

| Option | Description | Selected |
|--------|-------------|----------|
| 中文优先 | 底图地名用中文显示即可 | |
| 中英双语 | 底图地名同时显示中英文，或支持用户切换 | ✓ |
| 你来决定 | 语言策略交给 Claude 判断 | |

**User's choice:** 中英双语

### 初始视图

| Option | Description | Selected |
|--------|-------------|----------|
| 世界全览 | 初始加载时显示完整世界地图 | |
| 中国居中 | 初始加载时以中国为中心展示 | ✓ |
| 你来决定 | 具体视图策略交给 Claude 判断 | |

**User's choice:** 中国居中

### 缩放限制

| Option | Description | Selected |
|--------|-------------|----------|
| 不限制 | 用户可以自由缩放到任意级别 | |
| 限制范围 | 设置最小/最大缩放 | ✓ |
| 你来决定 | 具体缩放范围交给 Claude 判断 | |

**User's choice:** 限制范围

### 视觉风格

| Option | Description | Selected |
|--------|-------------|----------|
| 淡雅简洁 | 浅色底图，让行政区高亮和点亮状态更突出 | ✓ |
| 标准街道图 | 普通街道地图风格，信息量大 | |
| 你来决定 | 视觉风格交给 Claude 判断 | |

**User's choice:** 淡雅简洁

---

## 图层加载策略

### 加载时机

| Option | Description | Selected |
|--------|-------------|----------|
| 按需加载 | 用户点击或缩放到某区域时才加载对应分片 | ✓ |
| 预加载已点亮区域 | 启动时优先加载用户已点亮地点对应分片 | |
| 全量预加载 | 启动时加载所有分片 | |
| 你来决定 | 加载策略交给 Claude 判断 | |

**User's choice:** 按需加载
**Notes:** 结合"已点亮始终可见"需求，实际策略为"按需 + 已点亮优先预加载"混合模式

### 已点亮可见性

| Option | Description | Selected |
|--------|-------------|----------|
| 始终可见 | 已点亮地点边界始终显示，无论缩放级别 | ✓ |
| 缩放可见 | 只在一定缩放级别下才显示已点亮边界 | |
| 你来决定 | 可见性策略交给 Claude 判断 | |

**User's choice:** 始终可见

### 加载反馈与失败处理

**User's choice:** 你来决定
**Notes:** 加载状态指示器、失败重试等细节交给 Claude 判断

---

## 点击→识别→popup 链路

### 点击触发方式

| Option | Description | Selected |
|--------|-------------|----------|
| 点击瓦片底图 | 点击地图任意位置，Leaflet 提供经纬度后调 server resolve API | ✓ |
| 点击 GeoJSON 图层 | 只能点击已加载的 GeoJSON 边界区域 | |
| 混合模式 | 优先检测 GeoJSON 图层命中，未命中则回退到底图点击 | |
| 你来决定 | 点击触发方式交给 Claude 判断 | |

**User's choice:** 点击瓦片底图

### 识别反馈

| Option | Description | Selected |
|--------|-------------|----------|
| 坐标点 + loading | 点击后先显示临时标记和 loading 状态 | ✓ |
| 直接等待 popup | 无明显视觉反馈，等 server 返回后直接弹 popup | |
| 你来决定 | 识别反馈交给 Claude 判断 | |

**User's choice:** 坐标点 + loading

### 点击已点亮区域

| Option | Description | Selected |
|--------|-------------|----------|
| 直接打开记录 | 识别到已点亮地点，跳过 resolve，直接打开 popup | ✓ |
| 始终走 resolve | 无论是否已点亮，都先调 server resolve | |
| 你来决定 | 具体策略交给 Claude 判断 | |

**User's choice:** 直接打开记录

---

## 高亮与 popup 锚定

### 高亮渲染方式

| Option | Description | Selected |
|--------|-------------|----------|
| GeoJSON 图层样式 | Leaflet 原生 GeoJSON layer + style 函数 | ✓ |
| 独立高亮 overlay | 底层 GeoJSON 图层 + 单独 overlay 叠加 | |
| 你来决定 | 高亮渲染方式交给 Claude 判断 | |

**User's choice:** GeoJSON 图层样式

### popup 锚定方式

| Option | Description | Selected |
|--------|-------------|----------|
| Leaflet 原生 popup | L.popup 绑定到行政区中心点 | |
| 继续用 @floating-ui | 保留现有锚定逻辑，锚点改为 Leaflet 坐标转屏幕位置 | ✓ |
| 你来决定 | 锚定方式交给 Claude 判断 | |

**User's choice:** 继续用 @floating-ui

### 高亮状态数

| Option | Description | Selected |
|--------|-------------|----------|
| 三态区分 | 已点亮、当前选中、未记录 | ✓ |
| 四态区分 | 三态 + 低置信回退 | |
| 你来决定 | 状态视觉设计交给 Claude 判断 | |

**User's choice:** 三态区分

### popup 视觉风格

| Option | Description | Selected |
|--------|-------------|----------|
| 完全保留现有风格 | 只改底层锚点计算 | |
| 微调适配 Leaflet | 保留主视觉，允许小幅调整适配 Leaflet 交互 | ✓ |
| 你来决定 | 视觉策略交给 Claude 判断 | |

**User's choice:** 微调适配 Leaflet

---

## Claude's Discretion

- Bing Maps API key 集成方式（插件选型、加载方式）
- 缩放级别具体数值范围
- 底图淡雅风格的具体实现方式
- 图层加载反馈与失败处理策略
- popup 与 @floating-ui 在地图拖动/缩放时的同步策略
- 候选确认在 Leaflet 中的交互形式
- 识别失败时的视觉反馈
- 高亮三态的具体配色
- 临时标记的视觉设计

## Deferred Ideas

None — discussion stayed within phase scope.
