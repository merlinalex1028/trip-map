# Phase 10 Visual QA

本清单只覆盖当前桌面 anchored popup + deep drawer 主链路，用于验证 Phase 10 的统一风格、四态辨识和交互可靠性。不要把 `MobilePeekSheet`、safe-area 或任何移动端壳层重新带回本阶段验收。

## 统一风格

- [ ] 标题区、通知条、地图舞台、popup、drawer 共用暖粉 / 淡蓝 / 圆角语言，没有残留旧土棕主色块。
- [ ] 页面背景、卡片外框和主壳层阴影属于同一套 scrapbook 氛围，而不是组件各自漂移。
- [ ] `PosterTitleBlock` 只通过缎带、下划线和配色增强气质，没有改动标题文案或引入花哨装饰字体。

## 四态辨识

- [ ] `未记录` 使用中性浅底，且与其他状态至少有颜色以外的一种额外 cue 区分。
- [ ] `已记录` 使用淡蓝 / 蓝绿色语义，在 marker、badge、提示区里保持一致。
- [ ] `当前选中` 使用暖粉主高亮，在 popup / CTA / 标题强调中保持一致。
- [ ] `低置信回退` 使用更冷更浅的蓝灰提示态，并带明确 notice/outline 语义。
- [ ] 当前桌面 anchored popup + deep drawer 主链路里，四态不会因为圆角、纹理或装饰层而互相混淆。

## 交互命中

- [ ] 装饰层和纹理层不会覆盖 marker、popup、drawer、按钮的实际点击区域。
- [ ] 所有仅用于装饰的图层都保持 `pointer-events: none`。
- [ ] 连续点击地图空白区、marker、popup CTA、drawer 操作按钮时，没有误点、穿透或“点不到”的情况。

## 减少动态效果

- [ ] 在默认动效下，连续动画只服务当前选中或草稿态，不会让 saved/background 持续抢注意力。
- [ ] 打开系统 `prefers-reduced-motion` 后，核心状态仍可通过颜色、描边、标签等 cue 清晰辨识。
- [ ] reduced-motion 模式下，popup / marker / notice 的反馈仍完整，不会因为去动画而丢失状态信息。
