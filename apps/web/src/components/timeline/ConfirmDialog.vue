<script setup lang="ts">
interface Props {
  isOpen: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  tone?: 'default' | 'destructive'
}

const props = withDefaults(defineProps<Props>(), {
  confirmLabel: '确认',
  cancelLabel: '取消',
  tone: 'default',
})

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()

function handleBackdropClick(event: MouseEvent) {
  if (event.target === event.currentTarget) {
    emit('cancel')
  }
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    emit('cancel')
  }
}
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-[6] flex items-center justify-center bg-[rgba(87,66,95,0.16)] px-4 py-6 backdrop-blur-sm"
    data-confirm-dialog-backdrop
    role="dialog"
    aria-modal="true"
    @click="handleBackdropClick"
    @keydown="handleKeydown"
  >
    <section
      class="w-full max-w-[28rem] overflow-hidden rounded-[32px] border border-white/85 bg-[var(--color-surface)]/96 text-[var(--color-ink-strong)] shadow-[var(--shadow-stage)] backdrop-blur-xl"
      data-confirm-dialog-content
    >
      <div class="border-b border-white/80 px-6 pb-5 pt-6">
        <h2 class="text-2xl font-semibold" data-confirm-dialog-title>
          {{ title }}
        </h2>
      </div>

      <div class="space-y-5 px-6 pb-6 pt-5">
        <p class="text-sm leading-7 text-[var(--color-ink-muted)]" data-confirm-dialog-message>
          {{ message }}
        </p>

        <div class="grid gap-3">
          <button
            type="button"
            :class="[
              'inline-flex min-h-11 w-full items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition',
              tone === 'destructive'
                ? 'border border-[#e8c4c4] bg-[#fef2f2] text-[var(--color-destructive)] hover:bg-[#fde8e8]'
                : 'border border-[color:color-mix(in_srgb,var(--color-accent)_22%,white_78%)] bg-[linear-gradient(135deg,rgba(255,232,242,0.96),rgba(255,246,250,0.96))] text-[var(--color-accent-strong)] shadow-[var(--shadow-button)]',
            ]"
            data-confirm-dialog-confirm
            @click="emit('confirm')"
          >
            {{ confirmLabel }}
          </button>

          <button
            type="button"
            class="inline-flex min-h-11 w-full items-center justify-center rounded-full border border-white/85 bg-white/86 px-5 py-3 text-sm font-semibold text-[var(--color-ink-strong)] transition hover:bg-white"
            data-confirm-dialog-cancel
            @click="emit('cancel')"
          >
            {{ cancelLabel }}
          </button>
        </div>
      </div>
    </section>
  </div>
</template>
