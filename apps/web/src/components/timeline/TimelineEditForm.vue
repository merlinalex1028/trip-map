<script setup lang="ts">
import type { DateValue } from '@internationalized/date'

import { CalendarIcon } from '@radix-icons/vue'
import { parseDate } from '@internationalized/date'
import { computed, shallowRef } from 'vue'

import type { TravelRecord, UpdateTravelRecordRequest } from '@trip-map/contracts'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { checkDateConflict } from '../../services/date-conflict'
import type { TimelineEntry } from '../../services/timeline'

import TagInput from './TagInput.vue'

interface Props {
  record: TimelineEntry
  conflictingDates?: string[]
  tripsByPlaceId?: Map<string, TravelRecord[]>
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

const startDate = shallowRef(props.record.startDate ?? '')
const endDate = shallowRef(props.record.endDate ?? '')
const notes = shallowRef(props.record.notes ?? '')
const tags = shallowRef<string[]>([...props.record.tags])
const isStartDatePickerOpen = shallowRef(false)
const isEndDatePickerOpen = shallowRef(false)

const hasStartDate = computed(() => startDate.value !== '')
const hasRangeError = computed(
  () => hasStartDate.value && endDate.value !== '' && endDate.value < startDate.value,
)
const notesTooLong = computed(() => notes.value.length > 1000)
const isValid = computed(() => hasStartDate.value && !hasRangeError.value && !notesTooLong.value)
const startDateValue = computed(() => getCalendarDateValue(startDate.value))
const endDateValue = computed(() => getCalendarDateValue(endDate.value))

const rangeErrorMessage = computed(() =>
  hasRangeError.value ? '结束日期不能早于开始日期' : null,
)
const notesErrorMessage = computed(() =>
  notesTooLong.value ? '备注不能超过 1000 字符' : null,
)
const visibleConflictingDates = computed(() => {
  if (!props.tripsByPlaceId) {
    return props.conflictingDates
  }

  return checkDateConflict(
    props.record.placeId,
    props.record.recordId,
    startDate.value || null,
    endDate.value || null,
    props.tripsByPlaceId,
  )
})
const fieldIdPrefix = computed(() => `timeline-edit-${props.record.recordId}`)
const rangeErrorId = computed(() => `${fieldIdPrefix.value}-date-range-error`)
const notesErrorId = computed(() => `${fieldIdPrefix.value}-notes-error`)
const dateFieldDescribedBy = computed(() => (rangeErrorMessage.value ? rangeErrorId.value : undefined))
const notesDescribedBy = computed(() => (notesErrorMessage.value ? notesErrorId.value : undefined))

function getCalendarDateValue(value: string) {
  return value ? parseDate(value) : undefined
}

function formatDateLabel(value: string, fallback: string) {
  return value || fallback
}

function handleStartDateChange(value: DateValue | undefined) {
  startDate.value = value?.toString() ?? ''
  isStartDatePickerOpen.value = false
}

function handleEndDateChange(value: DateValue | undefined) {
  endDate.value = value?.toString() ?? ''
  isEndDatePickerOpen.value = false
}

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
    class="grid gap-4"
    data-region="timeline-edit-form"
    @submit.prevent="handleSubmit"
  >
    <div class="grid gap-1.5">
      <span class="text-[var(--font-label-size)] font-bold text-[var(--color-ink-strong)]">
        开始日期
      </span>
      <Popover v-model:open="isStartDatePickerOpen">
        <PopoverTrigger as-child>
          <button
            type="button"
            class="timeline-edit-form__date-button min-h-11 w-full rounded-xl border border-[#d7dcea] bg-white px-3 py-2 text-left text-[var(--font-label-size)] font-bold text-[var(--color-ink-strong)] shadow-[0_10px_22px_rgba(139,111,239,0.06)] transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-[#e6d9ec] hover:bg-white/95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)] active:scale-[0.99]"
            data-edit-input="start-date"
            :aria-invalid="hasStartDate ? undefined : true"
            :aria-describedby="dateFieldDescribedBy"
            aria-label="选择旅行开始日期"
          >
            <CalendarIcon
              class="h-4 w-4 text-[var(--color-accent)]"
              aria-hidden="true"
            />
            <span>{{ formatDateLabel(startDate, '选择开始日期') }}</span>
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          class="z-[70] w-auto rounded-[24px] border-[#eadff8] bg-white/95 p-0 shadow-[0_22px_46px_rgba(108,79,156,0.16)]"
        >
          <Calendar
            :model-value="startDateValue"
            locale="zh-CN"
            layout="month-and-year"
            :max-value="endDateValue"
            data-edit-calendar="start-date"
            @update:model-value="handleStartDateChange"
          />
        </PopoverContent>
      </Popover>
    </div>

    <div class="grid gap-1.5">
      <span class="text-[var(--font-label-size)] font-bold text-[var(--color-ink-strong)]">
        结束日期（可选）
      </span>
      <Popover v-model:open="isEndDatePickerOpen">
        <PopoverTrigger as-child>
          <button
            type="button"
            class="timeline-edit-form__date-button min-h-11 w-full rounded-xl border border-[#d7dcea] bg-white px-3 py-2 text-left text-[var(--font-label-size)] font-bold text-[var(--color-ink-strong)] shadow-[0_10px_22px_rgba(139,111,239,0.06)] transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-[#e6d9ec] hover:bg-white/95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)] active:scale-[0.99]"
            data-edit-input="end-date"
            :aria-invalid="hasRangeError || undefined"
            :aria-describedby="dateFieldDescribedBy"
            aria-label="选择旅行结束日期（可选）"
          >
            <CalendarIcon
              class="h-4 w-4 text-[var(--color-accent)]"
              aria-hidden="true"
            />
            <span>{{ formatDateLabel(endDate, '选择结束日期（可选）') }}</span>
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          class="z-[70] w-auto rounded-[24px] border-[#eadff8] bg-white/95 p-0 shadow-[0_22px_46px_rgba(108,79,156,0.16)]"
        >
          <Calendar
            :model-value="endDateValue"
            locale="zh-CN"
            layout="month-and-year"
            :min-value="startDateValue"
            data-edit-calendar="end-date"
            @update:model-value="handleEndDateChange"
          />
        </PopoverContent>
      </Popover>
    </div>

    <p
      v-if="rangeErrorMessage"
      :id="rangeErrorId"
      class="text-[var(--font-label-size)] font-bold text-[var(--color-destructive)]"
      role="alert"
      data-edit-error="range"
    >
      {{ rangeErrorMessage }}
    </p>

    <p
      v-if="visibleConflictingDates.length > 0"
      class="text-[var(--font-label-size)] font-bold text-[var(--color-destructive)]"
      role="alert"
      data-edit-warning="date-conflict"
    >
      与已有记录 {{ visibleConflictingDates.join('、') }} 存在日期重叠
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
        :aria-invalid="notesTooLong || undefined"
        :aria-describedby="notesDescribedBy"
        aria-label="旅行备注"
      />
    </label>

    <p
      v-if="notesErrorMessage"
      :id="notesErrorId"
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
.timeline-edit-form__date-button {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: 0.625rem;
}

.timeline-edit-form__date-button span {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (prefers-reduced-motion: reduce) {
  button {
    transform: none !important;
    transition: none !important;
  }
}
</style>
