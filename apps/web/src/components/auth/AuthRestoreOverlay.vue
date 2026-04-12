<script setup lang="ts">
defineProps<{
  visible: boolean
}>()
</script>

<template>
  <div
    v-if="visible"
    class="pointer-events-none absolute inset-0 z-[3] flex items-center justify-center bg-[rgba(250,250,250,0.22)] px-4 backdrop-blur-[3px]"
    data-auth-restore-overlay
  >
    <div
      class="flex w-full max-w-sm flex-col items-center rounded-[28px] border border-white/85 bg-white/78 px-6 py-6 text-center shadow-[var(--shadow-float)]"
    >
      <span
        class="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-accent-soft)] text-[var(--color-accent)]"
        aria-hidden="true"
      >
        ···
      </span>
      <p class="text-base font-semibold text-[var(--color-ink-strong)]">正在恢复账号会话</p>
      <p class="mt-2 text-sm leading-6 text-[var(--color-ink-muted)]">
        正在载入你的云端旅行记录。
      </p>
    </div>
  </div>
</template>
