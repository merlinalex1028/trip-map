<script setup lang="ts">
import { computed, ref } from 'vue'

import type { UpdateTravelRecordRequest } from '@trip-map/contracts'
import type { TimelineEntry } from '../../services/timeline'

import TagInput from './TagInput.vue'

interface Props {
  record: TimelineEntry
  conflictingDates?: string[]
  isSubmitting?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  conflictingDates: () => [],
  isSubmitting: false,
})

const emit = defineEmits<{
  submit: [payload: UpdateTravelRecordRequest]
  cancel: []
}>()

const startDate = ref(props.record.startDate ?? '')
const endDate = ref(props.record.endDate ?? '')
const notes = ref(props.record.notes ?? '')
const tags = ref<string[]>([...props.record.tags])

const hasStartDate = computed(() => startDate.value !== '')
const hasRangeError = computed(
  () => hasStartDate.value && endDate.value !== '' && endDate.value < startDate.value,
)
const notesTooLong = computed(() => notes.value.length > 1000)
const isValid = computed(() => hasStartDate.value && !hasRangeError.value && !notesTooLong.value)

const rangeErrorMessage = computed(() =>
  hasRangeError.value ? '结束日期不能早于开始日期' : null,
)
const notesErrorMessage = computed(() =>
  notesTooLong.value ? '备注不能超过 1000 字符' : null,
)

function handleSubmit() {
  if (!isValid.value || props.isSubmitting) {
    return
  }

  const trimmedNotes = notes.value.trim()
  emit('submit', {
    startDate: startDate.value || null,
    endDate: endDate.value || null,
    notes: trimmedNotes || null,
    tags: tags.value,
  })
}
</script>

<template>
  <form
    class="grid gap-3 rounded-[22px] border border-[#e6d9ec] bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(253,245,255,0.94))] p-4"
    data-region="timeline-edit-form"
    @submit.prevent="handleSubmit"
  >
    <p class="text-[var(--font-label-size)] font-bold text-[var(--color-ink-strong)]">
      编辑旅行记录
    </p>

    <label class="grid gap-1">
      <span class="text-[var(--font-label-size)] font-bold text-[var(--color-ink-strong)]">
        开始日期
      </span>
      <input
        v-model="startDate"
        type="date"
        required
        :max="endDate || undefined"
        class="min-h-11 rounded-xl border border-[#d7dcea] bg-white px-3 py-2 text-[var(--font-label-size)] text-[var(--color-ink-strong)]"
        data-edit-input="start-date"
        aria-label="选择旅行开始日期"
      />
    </label>

    <label class="grid gap-1">
      <span class="text-[var(--font-label-size)] font-bold text-[var(--color-ink-strong)]">
        结束日期（可选）
      </span>
      <input
        v-model="endDate"
        type="date"
        :min="startDate || undefined"
        class="min-h-11 rounded-xl border border-[#d7dcea] bg-white px-3 py-2 text-[var(--font-label-size)] text-[var(--color-ink-strong)]"
        data-edit-input="end-date"
        aria-label="选择旅行结束日期（可选）"
      />
    </label>

    <p
      v-if="rangeErrorMessage"
      class="text-[var(--font-label-size)] font-bold text-[var(--color-destructive)]"
      role="alert"
      data-edit-error="range"
    >
      {{ rangeErrorMessage }}
    </p>

    <p
      v-if="conflictingDates.length > 0"
      class="text-[var(--font-label-size)] font-bold text-[var(--color-destructive)]"
      role="alert"
      data-edit-warning="date-conflict"
    >
      与已有记录 {{ conflictingDates.join('、') }} 存在日期重叠
    </p>

    <label class="grid gap-1">
      <span class="text-[var(--font-label-size)] font-bold text-[var(--color-ink-strong)]">
        备注
      </span>
      <textarea
        v-model="notes"
        maxlength="1000"
        rows="3"
        class="min-h-24 resize-none rounded-xl border border-[#d7dcea] bg-white px-3 py-2 text-[var(--font-label-size)] text-[var(--color-ink-strong)]"
        data-edit-input="notes"
        aria-label="旅行备注"
      />
    </label>

    <p
      v-if="notesErrorMessage"
      class="text-[var(--font-label-size)] font-bold text-[var(--color-destructive)]"
      role="alert"
      data-edit-error="notes"
    >
      {{ notesErrorMessage }}
    </p>

    <div class="grid gap-1">
      <span class="text-[var(--font-label-size)] font-bold text-[var(--color-ink-strong)]">
        标签
      </span>
      <TagInput
        :tags="tags"
        @update:tags="tags = $event"
      />
    </div>

    <div class="grid grid-cols-[1fr_auto] gap-3 pt-1">
      <button
        type="submit"
        class="min-h-11 rounded-full border border-[#f4d7e4] bg-[linear-gradient(135deg,rgba(255,232,242,0.96),rgba(255,246,250,0.96))] px-4 py-2 text-[var(--font-label-size)] font-bold text-[var(--color-accent-strong)] shadow-[0_14px_28px_rgba(244,143,177,0.34)] transition-all duration-300 ease-out hover:scale-105 hover:-translate-y-1 active:scale-95 disabled:cursor-not-allowed disabled:opacity-55"
        :disabled="!isValid || isSubmitting"
        data-edit-submit="true"
        aria-label="保存修改"
      >
        保存修改
      </button>

      <button
        type="button"
        class="min-h-11 rounded-full border border-[#d7dcea] bg-white/80 px-4 py-2 text-[var(--font-label-size)] font-bold text-[var(--color-ink-muted)] transition-all duration-300 ease-out hover:scale-105 active:scale-95"
        data-edit-cancel="true"
        @click="emit('cancel')"
      >
        取消
      </button>
    </div>
  </form>
</template>

<style scoped>
@media (prefers-reduced-motion: reduce) {
  button {
    transform: none !important;
    transition: none !important;
  }
}
</style>
