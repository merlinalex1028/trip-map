---
phase: 260408-mom-topbar-title
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/web/src/App.vue
  - apps/web/src/App.spec.ts
autonomous: true
requirements: []
must_haves:
  truths:
    - "页面左上角不再显示旧的海报式标题块，而是显示简洁顶部栏"
    - "顶部栏左侧显示“旅记”，右侧为空白占位，不影响后续扩展"
    - "地图区域在常见桌面视口中占据剩余高度，首页保持一屏内完整展示"
    - "自动化测试不再依赖旧标题文案“旅行世界地图”"
  artifacts:
    - path: "apps/web/src/App.vue"
      provides: "新的顶部栏结构与占满视口的 app shell 布局"
    - path: "apps/web/src/App.spec.ts"
      provides: "围绕新顶部栏和页面骨架的断言"
  key_links:
    - from: "apps/web/src/App.vue"
      to: "LeafletMapStage"
      via: "poster-shell/grid 剩余高度分配"
      pattern: "poster-shell__experience|poster-shell__stage"
    - from: "apps/web/src/App.spec.ts"
      to: "apps/web/src/App.vue"
      via: "挂载 App 后断言顶部栏文案和旧标题移除"
      pattern: "旅记|旅行世界地图"
---

<objective>
将首页左上角旧标题块替换为更轻量的顶部栏，并把地图区域高度重新分配到剩余可视空间。

Purpose: 当前 `PosterTitleBlock` 海报式标题占用过多垂直空间，且测试仍绑定旧标题文案，不适合“顶部栏 + 地图满屏”的新页面结构。
Output: 一个最小改动的执行计划，只涉及 `App.vue` 的壳层布局与 `App.spec.ts` 的直接受影响断言。
</objective>

<execution_context>
@/Users/huangjingping/.codex/get-shit-done/workflows/execute-plan.md
@/Users/huangjingping/.codex/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@AGENTS.md
@CLAUDE.md
@apps/web/src/App.vue
@apps/web/src/App.spec.ts
@apps/web/src/components/PosterTitleBlock.vue

<interfaces>
当前 `App.vue` 负责：

```ts
watch(() => interactionNotice.value?.message, ...)
onUnmounted(() => { ... })
```

当前模板骨架：

```vue
<main class="poster-shell">
  <PosterTitleBlock class="poster-shell__title" />
  <div v-if="interactionNotice" class="app-shell__notice">...</div>
  <section class="poster-shell__experience">
    <LeafletMapStage class="poster-shell__stage" />
  </section>
</main>
```

当前测试仍绑定旧标题：

```ts
expect(wrapper.find('.poster-title-block__ribbon').exists()).toBe(true)
expect(wrapper.text()).toContain('旅行世界地图')
```
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: 用轻量顶部栏替换旧标题块并重分配地图高度</name>
  <files>apps/web/src/App.vue</files>
  <action>
在 `App.vue` 内完成最小壳层调整，不新增状态、不改动现有 Pinia / notice 逻辑，遵循现有 Vue Composition API 结构：

1. 移除 `PosterTitleBlock` 的导入和模板使用，避免旧海报标题继续渲染。
2. 在 `poster-shell` 顶部新增一个简单 top bar 区块，左侧固定显示“旅记”，右侧保留空白容器，使用显式类名而不是元素选择器，保持后续可扩展。
3. 保留 `interactionNotice` 浮层位置和行为，但确保其与新 top bar 不重叠。
4. 调整 `poster-shell`、`poster-shell__experience`、`poster-shell__stage` 的网格/高度样式，让顶部栏只占一行，其余高度优先分配给地图区域；不要改动 `LeafletMapStage` 内部逻辑，也不要引入新的包装组件。
5. 继续让 `App.vue` 作为壳层组合面，避免把地图业务逻辑、标题业务逻辑重新塞回入口组件；此次仅处理布局和静态文案。
  </action>
  <verify>
    <automated>pnpm --filter @trip-map/web test -- --runInBand App.spec.ts</automated>
  </verify>
  <done>`App.vue` 不再渲染 `PosterTitleBlock`；页面左上角显示“旅记”，右上角为空；地图容器在桌面视口中占据剩余高度。</done>
</task>

<task type="auto">
  <name>Task 2: 更新 App 壳层测试，断言新顶部栏并移除旧标题耦合</name>
  <files>apps/web/src/App.spec.ts</files>
  <action>
按黑盒方式更新 `App.spec.ts`，只校验页面骨架和用户可见结果，不依赖组件内部实现细节：

1. 去掉对 `.poster-title-block__ribbon` 和“旅行世界地图”旧文案的断言。
2. 增加对新顶部栏可见文本“旅记”的断言，以及地图 stage 仍存在的断言。
3. 补充“旧标题未出现”的负向断言，确保这次改版不会被回归覆盖。
4. 维持现有 Pinia / fetch mock 方案，不扩展为集成测试，不新增 snapshot。
  </action>
  <verify>
    <automated>pnpm --filter @trip-map/web test -- --runInBand App.spec.ts</automated>
  </verify>
  <done>测试通过且只围绕新的 App 壳层结构断言；旧标题组件文案不再作为测试依赖。</done>
</task>

</tasks>

<verification>
- `pnpm --filter @trip-map/web test -- --runInBand App.spec.ts` 通过
- 页面骨架只保留新顶部栏与地图区域
- 旧标题文案“旅行世界地图”不再出现在首页测试输出中
</verification>

<success_criteria>
打开首页后，左上角显示“旅记”，右上角为空白；页面无需滚动即可看到顶部栏和主要地图区域；对应 App 单测通过且不再绑定旧标题块结构。
</success_criteria>

<output>
After completion, create `.planning/quick/260408-mom-topbar-title/260408-mom-SUMMARY.md`
</output>
