下面是给 Codex / Cursor / Lovable / v0 直接生成页面时可以使用的完整「UI素材规范 + 设计资源清单 + 页面拆分方案」。

你当前这套风格属于：

「Yume Kawaii（梦かわいい）」 + 「Soft Pastel Glassmorphism」 + 「Anime Travel Diary」

核心特征：

粉白紫渐变
超圆角
半透明毛玻璃
少女插画
发光描边
糖果色图表
超轻阴影
漂浮星星/樱花/云朵

参考设计语言：

一、整体站点架构（最终版）

你的网站现在应拆分为：

1. 地图主页（Map Explore）

你现在最喜欢的页面，不改布局

包含：

地图
点亮地点
地点识别弹窗
右侧小型旅行概览
左侧导航
2. 时间轴页面（独立页面）

不要嵌入地图

页面结构：

顶部 Hero Banner
↓
旅行时间轴
↓
年份筛选
↓
卡片时间流
↓
旅行照片墙

重点：

垂直时间线
发光节点
卡片化旅行记录
大图预览
少女陪伴插画
3. 旅行统计页面（独立页面）

完全 Dashboard 化

页面结构：

统计 Header
↓
核心数据卡片
↓
图表区（环图/折线/热力）
↓
国家统计
↓
城市排行
↓
年度旅行趋势

重点：

全图表化
糖果色数据可视化
大面积留白
毛玻璃卡片
二、整体视觉规范（最重要）
1. 配色系统（直接给 Codex）
主色
--pink: #FFB7D5;
--pink-deep: #FF8FB8;

--lavender: #C8B6FF;
--purple: #9D84FF;

--sky: #BDE7FF;
--mint: #CFFFE5;

--cream: #FFF9F5;
--white: rgba(255,255,255,0.72);

参考：

2. 背景

统一：

background:
linear-gradient(
135deg,
#FFF6FB 0%,
#F7F3FF 45%,
#F2F8FF 100%
);

地图区域：

filter:
saturate(0.7)
brightness(1.08)
blur(0.2px);
3. 卡片风格（核心）
background: rgba(255,255,255,0.55);

backdrop-filter: blur(24px);

border: 1px solid rgba(255,255,255,0.8);

box-shadow:
0 8px 30px rgba(255,182,193,0.12);

border-radius: 32px;
4. 字体（非常关键）

推荐：

中文
优设标题圆
HarmonyOS Sans Rounded
得意黑
阿里妈妈东方大楷（仅标题）
英文
Quicksand
Nunito
Varela Round

Reddit 社区常见推荐：

5. 圆角规范
页面主卡片：36px
小卡片：28px
按钮：999px
输入框：24px
头像：50%
6. 阴影

绝对不能重：

box-shadow:
0 4px 20px rgba(255,183,213,0.18);
三、地图主页 UI 素材清单
1. 左侧导航栏
结构
LOGO（旅记）
↓
用户卡片
↓
导航菜单
↓
底部少女插画
导航图标建议

地图探索：

星星地图

时间轴：

发光时钟

旅行统计：

柱状图

我的收藏：

糖果爱心

设置：

齿轮

图标资源站：

Icons8 Kawaii Icons
IconScout Anime Kawaii Pack
2. 地图 Marker 素材

需要：

粉色星星
紫色星星
蓝色星星
发光定位点
心形标记

Hover：

transform: scale(1.12);
filter: drop-shadow(...);
3. 地点识别弹窗

必须保留：

地点名称
地区标签
点亮按钮
少女角色
漂浮星星

建议：

右侧少女立绘做 Live2D 风格呼吸动画。

4. 搜索框

风格：

height: 56px;
border-radius: 999px;
background: rgba(255,255,255,0.7);

图标：

放大镜
小星星
四、时间轴页面（独立）

这是重点优化。

页面结构
Hero Banner
↓
年份筛选 Tabs
↓
Timeline
↓
旅行照片
1. Hero Banner

内容：

标题：
我的旅行时间轴

副标题：
每一次出发，
都是和世界的温柔相遇。

背景：

云朵
星星
少女旅行插画
2. 时间轴设计

时间轴不要普通线。

而是：

发光渐变竖线

节点：

星星节点
樱花节点
心形节点
3. 时间卡片

结构：

日期
城市
国家
旅行描述
照片
收藏按钮

Hover：

transform: translateY(-4px);
4. 时间轴动画

进入：

fade-up
scale-in

节点：

呼吸光效
五、旅行统计页（重点）

你现在统计页太普通。

应该改成：

「少女系数据可视化」
1. 顶部概览卡

四张：

总旅行次数
去过地点
去过国家
累计天数

每张卡：

渐变背景
小插画
超大数字
2. 环形图（核心）

图表不要默认 echarts 风格。

需要：

糖果色
低对比
圆角边
中心发光

颜色：

粉
紫
蓝
奶黄
薄荷绿
3. 折线图

必须：

圆点发光
曲线圆滑
面积渐变
4. 热力地图

超级推荐：

中国地图热力点亮

去过城市：

发光
星星扩散动画
5. 城市排行榜

不要 table。

用：

横向卡片
+ 城市照片
+ 去过次数
六、插画素材建议

建议统一：

粉发少女
旅行主题
拍照元素
地图元素
纸飞机

风格：

P站系轻小说封面风
七、动画系统（超级重要）

整个网站灵魂。

页面动画
transition:
all 0.35s cubic-bezier(0.34,1.56,0.64,1);

Kawaii UI 推荐：

Hover

按钮：

轻微上浮
果冻缩放

卡片：

发光
边框变亮
背景漂浮物

必须有：

星星
樱花
泡泡
云朵
