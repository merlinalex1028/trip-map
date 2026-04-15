<script setup lang="ts">
import { computed } from 'vue'

import type {
  LocalImportSummary,
  PendingLocalImportDecision,
} from '../../stores/auth-session'

const props = withDefaults(
  defineProps<{
    decision?: PendingLocalImportDecision | null
    summary?: LocalImportSummary | null
    submitting?: boolean
  }>(),
  {
    decision: null,
    summary: null,
    submitting: false,
  },
)

const emit = defineEmits<{
  import: []
  keepCloud: []
  dismissSummary: []
}>()

const isOpen = computed(() => Boolean(props.decision || props.summary))
const isSummaryMode = computed(() => props.summary !== null)
const legacyRecordCount = computed(() => props.decision?.legacyRecordCount ?? 0)
const summaryMessage = computed(() => {
  if (!props.summary) {
    return ''
  }

  return `已导入 ${props.summary.importedCount} 条本地记录，合并 ${props.summary.mergedDuplicateCount} 个重复地点，当前账号共有 ${props.summary.finalCount} 个地点。`
})
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-[6] flex items-center justify-center bg-[rgba(87,66,95,0.16)] px-4 py-6 backdrop-blur-sm"
    data-local-import-dialog-backdrop
  >
    <section
      class="w-full max-w-[32rem] overflow-hidden rounded-[32px] border border-white/85 bg-[var(--color-surface)]/96 text-[var(--color-ink-strong)] shadow-[var(--shadow-stage)] backdrop-blur-xl"
      data-local-import-dialog
      role="dialog"
      aria-modal="true"
      aria-labelledby="local-import-dialog-title"
    >
      <div class="border-b border-white/80 px-6 pb-5 pt-6">
        <p class="text-[0.72rem] font-semibold tracking-[0.18em] text-[var(--color-ink-soft)] uppercase">
          Local Import
        </p>
        <h2 id="local-import-dialog-title" class="mt-2 text-2xl font-semibold">
          {{ isSummaryMode ? '本地记录已整理完成' : '发现本地旧记录' }}
        </h2>
      </div>

      <div class="space-y-5 px-6 pb-6 pt-5">
        <template v-if="!isSummaryMode">
          <p class="text-sm leading-7 text-[var(--color-ink-muted)]">
            当前浏览器里还保留着
            <span class="font-semibold text-[var(--color-ink-strong)]">{{ legacyRecordCount }}</span>
            条本地旧记录。请选择要把它们导入当前账号，还是继续以当前账号云端记录为准。
          </p>

          <div class="grid gap-3">
            <button
              type="button"
              class="inline-flex min-h-11 w-full items-center justify-center rounded-full border border-[color:color-mix(in_srgb,var(--color-accent)_22%,white_78%)] bg-[linear-gradient(135deg,rgba(255,232,242,0.96),rgba(255,246,250,0.96))] px-5 py-3 text-sm font-semibold text-[var(--color-accent-strong)] shadow-[var(--shadow-button)] transition duration-[var(--motion-quick)] hover:-translate-y-0.5"
              :disabled="submitting"
              data-local-import-action="import"
              @click="emit('import')"
            >
              导入本地记录到当前账号
            </button>
            <button
              type="button"
              class="inline-flex min-h-11 w-full items-center justify-center rounded-full border border-white/85 bg-white/86 px-5 py-3 text-sm font-semibold text-[var(--color-ink-strong)] transition duration-[var(--motion-quick)] hover:-translate-y-0.5 hover:bg-white"
              :disabled="submitting"
              data-local-import-action="keep-cloud"
              @click="emit('keepCloud')"
            >
              以当前账号云端记录为准
            </button>
          </div>
        </template>

        <template v-else>
          <div class="rounded-[24px] border border-white/85 bg-white/78 px-5 py-4 shadow-[var(--shadow-float)]">
            <p class="text-sm leading-7 text-[var(--color-ink-muted)]">
              {{ summaryMessage }}
            </p>
            <dl class="mt-4 grid grid-cols-3 gap-3 text-center">
              <div class="rounded-[20px] bg-[var(--color-accent-soft)]/55 px-3 py-3">
                <dt class="text-[0.72rem] font-semibold tracking-[0.12em] text-[var(--color-ink-soft)] uppercase">
                  importedCount
                </dt>
                <dd class="mt-2 text-xl font-semibold text-[var(--color-ink-strong)]">
                  {{ summary?.importedCount ?? 0 }}
                </dd>
              </div>
              <div class="rounded-[20px] bg-[#eef7fb] px-3 py-3">
                <dt class="text-[0.72rem] font-semibold tracking-[0.12em] text-[var(--color-ink-soft)] uppercase">
                  mergedDuplicateCount
                </dt>
                <dd class="mt-2 text-xl font-semibold text-[var(--color-ink-strong)]">
                  {{ summary?.mergedDuplicateCount ?? 0 }}
                </dd>
              </div>
              <div class="rounded-[20px] bg-[#fff6dc] px-3 py-3">
                <dt class="text-[0.72rem] font-semibold tracking-[0.12em] text-[var(--color-ink-soft)] uppercase">
                  finalCount
                </dt>
                <dd class="mt-2 text-xl font-semibold text-[var(--color-ink-strong)]">
                  {{ summary?.finalCount ?? 0 }}
                </dd>
              </div>
            </dl>
          </div>

          <button
            type="button"
            class="inline-flex min-h-11 w-full items-center justify-center rounded-full border border-white/85 bg-white/86 px-5 py-3 text-sm font-semibold text-[var(--color-ink-strong)] transition duration-[var(--motion-quick)] hover:-translate-y-0.5 hover:bg-white"
            data-local-import-action="dismiss-summary"
            @click="emit('dismissSummary')"
          >
            继续浏览地图
          </button>
        </template>
      </div>
    </section>
  </div>
</template>
