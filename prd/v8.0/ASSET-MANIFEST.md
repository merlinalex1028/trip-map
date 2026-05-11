# v8.0 素材资产清单

本清单用于把 `prd/v8.0` 的 5 张 PNG 设计稿拆成可复用前端素材。原则是：**UI 用代码复原，插画和贴纸用透明素材承接**。

## 源文件

| 文件 | 尺寸 | 用途 |
|------|------|------|
| `落地页.png` | 1536 x 1024 | 落地页整体参考、hero 少女、木牌、旅行路线卡、拍立得卡片、樱花背景参考 |
| `世界足迹.png` | 1536 x 1024 | 地图页整体参考、左侧栏头像、侧边栏角色、地图 popup 少女、星形 pin |
| `留下足迹.png` | 1402 x 1122 | 日期弹窗参考、日期弹窗少女、猫、花草、星星装饰 |
| `旅途手帐.png` | 1536 x 1024 | 手账页参考、侧边栏角色 B、时间轴星形节点、旅行缩略图 |
| `旅途回忆.png` | 1448 x 1086 | 回忆页参考、统计图标、旅行缩略图、底部角色装饰 |

## 输出目录建议

最终进入代码库时，建议放到：

```text
apps/web/src/assets/v8/
  characters/
  mascots/
  stickers/
  pins/
  postcards/
  scenic/
  raw-crops/
```

`raw-crops/` 只放临时裁剪图，不建议长期在产品中引用。

## 必须切出的透明素材

### Characters

| ID | 输出文件 | 来源 | 优先级 | 建议输出 | 说明 |
|----|----------|------|--------|----------|------|
| `char-hero-girl` | `characters/hero-girl.webp` | `落地页.png` | P0 | 高 700-850px，透明 WebP/PNG | 落地页右侧主视觉少女。截图背景复杂，必须抠透明边缘。 |
| `char-map-popup-girl` | `characters/map-popup-girl.webp` | `世界足迹.png` | P0 | 高 230-320px，透明 WebP/PNG | 地图识别 popup 右侧半身少女。 |
| `char-footprint-dialog-girl` | `characters/footprint-dialog-girl.webp` | `留下足迹.png` | P0 | 高 520-720px，透明 WebP/PNG | 日期弹窗左侧少女、猫、花草可作为一个组合切图。 |
| `char-sidebar-camera` | `characters/sidebar-camera-girl.webp` | `世界足迹.png` | P0 | 高 320-430px，透明 WebP/PNG | 世界足迹侧边栏底部坐姿少女，适合地图页。 |
| `char-sidebar-journal` | `characters/sidebar-journal-girl.webp` | `旅途手帐.png` 或 `旅途回忆.png` | P0 | 高 320-430px，透明 WebP/PNG | 手账/回忆页侧边栏底部拿手账少女。 |
| `char-user-avatar` | `characters/user-avatar.webp` | `世界足迹.png` / `旅途手帐.png` | P1 | 256 x 256，圆形友好 | 用户卡片头像，可保留圆形底。 |

### Mascots

| ID | 输出文件 | 来源 | 优先级 | 建议输出 | 说明 |
|----|----------|------|--------|----------|------|
| `logo-cat-outline` | `mascots/logo-cat-outline.svg` 或 `.png` | 所有页面左上角 | P0 | 64-128px | 猫头 logo，若边缘清楚可矢量化，否则透明 PNG。 |
| `cat-sitting` | `mascots/cat-sitting.webp` | `留下足迹.png` / `世界足迹.png` | P1 | 高 160-260px | 白猫正面坐姿。 |
| `cat-peeking` | `mascots/cat-peeking.webp` | `落地页.png` | P2 | 高 120-180px | 落地页右侧木牌上方小猫。 |

### Pins & Nodes

| ID | 输出文件 | 来源 | 优先级 | 建议输出 | 说明 |
|----|----------|------|--------|----------|------|
| `pin-star-pink` | `pins/pin-star-pink.png` | `世界足迹.png` | P0 | 96 x 96 / 128 x 128 | 北京粉色星形 pin。 |
| `pin-star-purple` | `pins/pin-star-purple.png` | `世界足迹.png` | P0 | 96 x 96 / 128 x 128 | 西安紫色星形 pin。 |
| `pin-star-blue` | `pins/pin-star-blue.png` | `世界足迹.png` | P0 | 96 x 96 / 128 x 128 | 上海蓝色星形 pin。 |
| `pin-star-orange` | `pins/pin-star-orange.png` | `世界足迹.png` | P0 | 96 x 96 / 128 x 128 | 广州橙色星形 pin。 |
| `timeline-node-pink` | `pins/timeline-node-pink.png` | `旅途手帐.png` | P1 | 80 x 80 | 时间轴粉色节点。 |
| `timeline-node-purple` | `pins/timeline-node-purple.png` | `旅途手帐.png` | P1 | 80 x 80 | 时间轴紫色节点。 |
| `timeline-node-blue` | `pins/timeline-node-blue.png` | `旅途手帐.png` | P1 | 80 x 80 | 时间轴蓝色节点。 |

### Stickers

| ID | 输出文件 | 来源 | 优先级 | 建议输出 | 说明 |
|----|----------|------|--------|----------|------|
| `wood-sign-vertical` | `stickers/wood-sign-vertical.webp` | `落地页.png` | P1 | 高 300-420px | 落地页右侧四块木牌。含文字时只能用于装饰；若要改文案，需生成无字版。 |
| `wood-sign-next` | `stickers/wood-sign-next.webp` | `世界足迹.png` / `旅途手帐.png` | P1 | 宽 120-220px | 侧边栏“下一站”木牌。 |
| `sparkles-mix` | `stickers/sparkles-mix.png` | 多张图 | P1 | 多个小 PNG 或 sprite | 星星、光点、小泡泡，可直接用 CSS/SVG 替代一部分。 |
| `sakura-branch` | `stickers/sakura-branch.webp` | `落地页.png` | P2 | 宽 500-800px | 顶部樱花枝，截图中与背景融合重，建议重新生成透明素材。 |
| `flower-corner` | `stickers/flower-corner.webp` | `世界足迹.png` / `旅途手帐.png` | P2 | 宽 260-420px | 侧边栏底部花草边角。 |

### Postcards & Scenic Images

| ID | 输出文件 | 来源 | 优先级 | 建议输出 | 说明 |
|----|----------|------|--------|----------|------|
| `postcard-kyoto` | `postcards/kyoto.webp` | `落地页.png` / `旅途手帐.png` | P1 | 320 x 220 或 480 x 320 | 京都/日本缩略图。可裁切矩形，不需要透明。 |
| `postcard-paris` | `postcards/paris.webp` | `落地页.png` / `旅途手帐.png` | P1 | 320 x 220 或 480 x 320 | 巴黎缩略图。 |
| `postcard-island` | `postcards/island.webp` | `落地页.png` / `旅途回忆.png` | P1 | 320 x 220 或 480 x 320 | 海岛/希腊缩略图。 |
| `postcard-shanghai` | `postcards/shanghai.webp` | `落地页.png` / `旅途手帐.png` | P1 | 320 x 220 或 480 x 320 | 上海缩略图。 |
| `scenic-river` | `scenic/river.webp` | `旅途手帐.png` / `旅途回忆.png` | P1 | 480 x 260 | 河源卡片缩略图。 |

## 不建议从 PNG 切出的内容

| 内容 | 原因 | 实现方式 |
|------|------|----------|
| 按钮、卡片、弹窗背景 | 需要响应式、状态、焦点和真实文本 | CSS + shadcn-vue |
| 文字、数字、日期 | 需要真实数据、可访问性和国际化 | HTML 文本 |
| 日历 | 需要真实日期选择与键盘操作 | shadcn-vue Calendar |
| 统计图表 | 需要真实账号数据 | ECharts |
| 地图底图和省市边界 | 需要 Leaflet 交互和真实 GeoJSON | Leaflet + GeoJSON + CSS filter |
| 收藏爱心 | v8.0 明确不做收藏 | 不生成、不引用 |
| 整张页面截图 | 不能适配数据和屏幕尺寸 | 只作为视觉参考 |

## 优先级

P0 必须先准备，否则高保落地会明显失真：

1. `char-hero-girl`
2. `char-map-popup-girl`
3. `char-footprint-dialog-girl`
4. `char-sidebar-camera`
5. `char-sidebar-journal`
6. `pin-star-pink/purple/blue/orange`

P1 可以在 Phase 43-47 中逐步补：

1. 用户头像
2. 猫 logo
3. 小猫
4. 木牌
5. 旅行缩略图
6. 时间轴节点

P2 是氛围增强：

1. 樱花枝
2. 花草边角
3. 光点/泡泡/小星星 sprite
