<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <section
    class="flex min-h-0 flex-col gap-5 overflow-hidden rounded-[32px] border border-white/80 bg-white/70 p-5 shadow-[var(--shadow-stage)] md:p-6"
    data-region="timeline-shell"
    data-route-view="timeline"
  >
    <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div class="space-y-2">
        <p
          class="inline-flex w-fit items-center rounded-full border border-white/85 bg-white/85 px-3 py-1 text-[0.68rem] font-semibold tracking-[0.12em] text-[var(--color-ink-soft)] uppercase"
        >
          Timeline
        </p>
        <div class="space-y-1">
          <h2 class="text-[clamp(1.6rem,2.6vw,2.2rem)] font-semibold text-[var(--color-ink-strong)]">
            时间轴
          </h2>
          <p class="text-sm leading-6 text-[var(--color-ink-muted)]">
            独立时间轴页面骨架已就位，后续会在这里接入你的旅行历史。
          </p>
        </div>
      </div>
      <RouterLink
        class="inline-flex min-h-11 items-center justify-center rounded-full border border-white/85 bg-white/88 px-4 py-2 text-sm font-semibold text-[var(--color-ink-strong)] shadow-[var(--shadow-button)] transition duration-[var(--motion-quick)] hover:-translate-y-0.5 hover:bg-white"
        to="/"
      >
        返回地图
      </RouterLink>
    </div>

    <div
      class="flex min-h-0 flex-1 items-center justify-center rounded-[28px] border border-dashed border-[color:color-mix(in_srgb,var(--color-frame)_70%,white_30%)] bg-[color:color-mix(in_srgb,white_78%,var(--color-accent-soft)_22%)] px-6 py-10 text-center"
    >
      <div class="max-w-md space-y-3">
        <p class="text-base font-semibold text-[var(--color-ink-strong)]">时间轴内容将在后续计划接入</p>
        <p class="text-sm leading-6 text-[var(--color-ink-muted)]">
          当前页面只负责承接独立路由与返回地图导航，切换到这里时不会再渲染地图主舞台。
        </p>
      </div>
    </div>
  </section>
</template>
