# Debug Session: Phase 02 Projection Frame Mismatch

## Symptom

- 点击日本明显陆地区域时，识别结果落到了中国
- 点击香港区域时，识别结果落到了 Myanmar
- 海洋无效提示与边界保守提示正常，说明问题集中在点击坐标与底图地理框架不一致

## Root Cause

第一轮修复只解决了“投影常量与球面框横向宽度不一致”的问题，但人工复测表明，当前系统仍然存在更基础的对齐缺陷：

- 地图点击是按容器矩形比例直接做 `normalized -> lng/lat` 反算
- 用户看到的地图却是一张已经渲染好的 SVG 图片，其中真实可视地理像素、装饰留白、边框和地图内容并不是由运行时点击层直接驱动
- 也就是说，当前点击判定依赖的是“推断出来的绘图区”，不是“真实渲染出来的地图像素位置”

这会带来两个后果：

- 一旦 SVG 中的可视陆地轮廓和假定绘图区之间还有细小漂移，点击结果就会在全图表现为系统性偏左上或偏左下，而不是只在某个国家出错
- 现有自动化回归测试主要验证服务层数学自洽，没有真正覆盖“浏览器里用户点到哪里，识别点就落到哪里”的交互级对齐，因此会出现单测全绿、人工点击仍整体偏移的情况

## Affected Files

- [map-projection.ts](/Users/huangjingping/i/trip-map/src/services/map-projection.ts)
- [world-map.svg](/Users/huangjingping/i/trip-map/src/assets/world-map.svg)
- [WorldMapStage.vue](/Users/huangjingping/i/trip-map/src/components/WorldMapStage.vue)
- [geo-lookup.spec.ts](/Users/huangjingping/i/trip-map/src/services/geo-lookup.spec.ts)

## Recommended Fix

1. 不再只靠“人工维护的 plotLeft / plotWidth”推断点击映射，改为从真实渲染契约中导出可点击地理框
2. 让地图展示层和点击反算层共享同一份显式 frame metadata，避免图片像素和投影常量再次漂移
3. 增加交互级回归测试，覆盖“点击位置与结果点位保持对齐”的真实页面行为，而不仅是服务层数学测试
