<script setup lang="ts">
import type { FootprintPlaceSnapshot } from '@/types/map-point'
import type { DateValue } from '@internationalized/date'

import {
  CalendarDate,
  getDayOfWeek,
  getLocalTimeZone,
  parseDate,
  today,
} from '@internationalized/date'
import { computed, ref, shallowRef } from 'vue'

import footprintDialogGirl from '@/assets/v8/characters/footprint-dialog-girl.webp'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

defineOptions({
  name: 'FootprintDateDialog',
})

const props = withDefaults(
  defineProps<{
    open: boolean
    place: FootprintPlaceSnapshot | null
    isSubmitting?: boolean
    errorMessage?: string | null
  }>(),
  {
    isSubmitting: false,
    errorMessage: null,
  },
)

const emit = defineEmits<{
  'update:open': [open: boolean]
  submit: [payload: { startDate: string | null; endDate: string | null }]
  cancel: []
}>()

type ShortcutKey = 'today' | 'tomorrow' | 'weekend' | 'custom'

const timeZone = getLocalTimeZone()
const todayValue = today(timeZone)
const selectedDate = shallowRef<CalendarDate | undefined>(todayValue)
const selectedShortcut = ref<ShortcutKey>('today')
const endDateInput = ref('')

const failureMessage = '足迹暂时没有保存成功，请检查网络后重试。'

const dialogDescription = computed(() => {
  if (!props.place) {
    return '记录这次旅行日期。'
  }

  return `为 ${props.place.displayName} 记录这次旅行日期。`
})

const parsedEndDate = computed<CalendarDate | null>(() => {
  if (!endDateInput.value) {
    return null
  }

  try {
    return parseDate(endDateInput.value)
  } catch {
    return null
  }
})

const hasRangeError = computed(() => {
  if (!selectedDate.value || !parsedEndDate.value) {
    return false
  }

  return parsedEndDate.value.compare(selectedDate.value) < 0
})

const isSubmitDisabled = computed(() => {
  return !props.place || !selectedDate.value || hasRangeError.value || props.isSubmitting
})

function setSelectedDate(date: CalendarDate, shortcut: ShortcutKey) {
  selectedDate.value = date
  selectedShortcut.value = shortcut
}

function handleOpenChange(nextOpen: boolean) {
  if (!nextOpen && props.isSubmitting) {
    return
  }

  emit('update:open', nextOpen)
}

function handleCancel() {
  if (props.isSubmitting) {
    return
  }

  emit('cancel')
  emit('update:open', false)
}

function handleCalendarChange(value: DateValue | undefined) {
  selectedDate.value = value ? parseDate(value.toString()) : undefined
  selectedShortcut.value = 'custom'
}

function handleShortcutClick(shortcut: ShortcutKey) {
  if (shortcut === 'custom') {
    selectedShortcut.value = 'custom'
    return
  }

  if (shortcut === 'today') {
    setSelectedDate(todayValue, 'today')
    return
  }

  if (shortcut === 'tomorrow') {
    setSelectedDate(todayValue.add({ days: 1 }), 'tomorrow')
    return
  }

  const daysUntilSaturday = (6 - getDayOfWeek(todayValue, 'en-US', 'sun') + 7) % 7
  setSelectedDate(todayValue.add({ days: daysUntilSaturday }), 'weekend')
}

function handleSubmit() {
  if (isSubmitDisabled.value || !selectedDate.value) {
    return
  }

  emit('submit', {
    startDate: selectedDate.value.toString(),
    endDate: parsedEndDate.value?.toString() ?? null,
  })
}
</script>

<template>
  <Dialog :open="open" @update:open="handleOpenChange">
    <DialogContent
      :force-mount="true"
      :show-close-button="false"
      class="footprint-date-dialog w-[min(960px,calc(100vw-2rem))] max-w-[960px] overflow-hidden border-[#f0d6e7] bg-[linear-gradient(180deg,rgba(255,248,253,0.98),rgba(250,250,255,0.96))] p-0 shadow-[0_32px_80px_rgba(108,79,156,0.18)]"
    >
      <div
        class="footprint-date-dialog__surface relative grid gap-6 p-6 sm:p-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)]"
        data-region="footprint-date-dialog"
        role="dialog"
      >
        <button
          type="button"
          class="footprint-date-dialog__close absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/70 bg-white/80 text-xl text-[var(--color-ink-strong)] shadow-[0_12px_28px_rgba(143,120,189,0.16)] transition hover:scale-105"
          aria-label="关闭留下足迹弹窗"
          :disabled="isSubmitting"
          @click="handleCancel"
        >
          <span aria-hidden="true">×</span>
        </button>

        <div class="footprint-date-dialog__content grid gap-6">
          <DialogHeader class="space-y-3 text-left">
            <DialogTitle class="text-[32px] font-semibold leading-[1.1] text-[var(--color-ink-strong)]">
              留下足迹
            </DialogTitle>
            <DialogDescription class="text-base leading-6 text-[var(--color-ink-muted)]">
              {{ dialogDescription }}
            </DialogDescription>
          </DialogHeader>

          <section class="footprint-date-dialog__place-card grid gap-3 rounded-[28px] border border-white/80 bg-white/78 p-5 shadow-[0_20px_40px_rgba(247,90,155,0.08)]">
            <p class="text-sm font-semibold uppercase tracking-[0.08em] text-[#8b6fef]">
              Footprint Snapshot
            </p>
            <div class="grid gap-2">
              <h2
                class="text-2xl font-semibold leading-tight text-[var(--color-ink-strong)]"
                data-footprint-place-name
              >
                {{ place?.displayName ?? '未选择地点' }}
              </h2>
              <div class="flex flex-wrap items-center gap-2">
                <span
                  class="rounded-full border border-[#f6c7dd] bg-[#fff0f7] px-3 py-1 text-sm font-semibold text-[var(--color-accent-strong)]"
                  data-place-type-label="true"
                >
                  {{ place?.typeLabel ?? '地点' }}
                </span>
                <span
                  class="text-sm leading-6 text-[var(--color-ink-muted)]"
                  data-place-subtitle="true"
                >
                  {{ place?.subtitle ?? place?.parentLabel ?? '选择一个日期来记录这段旅程。' }}
                </span>
              </div>
            </div>
          </section>

          <section class="grid gap-4 rounded-[28px] border border-[#f4dce8] bg-[rgba(255,255,255,0.74)] p-5">
            <div class="grid gap-2">
              <p class="text-sm font-semibold text-[var(--color-ink-strong)]">
                快捷日期
              </p>
              <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Button
                  v-for="shortcut in [
                    { key: 'today', label: '今天' },
                    { key: 'tomorrow', label: '明天' },
                    { key: 'weekend', label: '本周末' },
                    { key: 'custom', label: '其他日期' },
                  ]"
                  :key="shortcut.key"
                  type="button"
                  :variant="selectedShortcut === shortcut.key ? 'default' : 'outline'"
                  size="lg"
                  class="min-h-11 rounded-full border-[#f0d6e7] text-sm font-semibold"
                  :aria-pressed="selectedShortcut === shortcut.key"
                  :data-footprint-shortcut="shortcut.key"
                  @click="handleShortcutClick(shortcut.key as ShortcutKey)"
                >
                  {{ shortcut.label }}
                </Button>
              </div>
            </div>

            <div
              class="rounded-[24px] border border-[#efd9e7] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(250,243,255,0.92))] p-3"
              data-footprint-calendar="true"
            >
              <Calendar
                :model-value="selectedDate"
                class="rounded-[20px] bg-transparent"
                @update:model-value="handleCalendarChange"
              />
            </div>

            <label class="grid gap-2">
              <span class="text-sm font-semibold text-[var(--color-ink-strong)]">
                结束日期（可选）
              </span>
              <input
                v-model="endDateInput"
                type="date"
                class="min-h-11 rounded-2xl border border-[#dcd8f3] bg-white/90 px-4 py-3 text-sm text-[var(--color-ink-strong)] outline-none transition focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[rgba(247,90,155,0.22)]"
                :min="selectedDate?.toString() || undefined"
                aria-label="选择旅行结束日期（可选）"
              >
            </label>

            <p
              v-if="hasRangeError"
              class="text-sm font-semibold text-[var(--color-destructive)]"
              data-footprint-range-error="true"
              role="alert"
            >
              结束日期不能早于开始日期。
            </p>

            <p
              v-if="errorMessage"
              class="rounded-2xl border border-[#f4c7cf] bg-[#fff2f4] px-4 py-3 text-sm font-semibold text-[var(--color-destructive)]"
              data-footprint-error="true"
              role="alert"
            >
              {{ failureMessage }}
            </p>

            <div class="grid gap-3 pt-2 sm:grid-cols-[1fr_auto]">
              <Button
                type="button"
                size="lg"
                class="min-h-11 rounded-full text-base font-semibold"
                :disabled="isSubmitDisabled"
                data-footprint-submit="true"
                @click="handleSubmit"
              >
                {{ isSubmitting ? '正在保存...' : '保存足迹' }}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                class="min-h-11 rounded-full border-[#d8dceb] bg-white/86 text-base font-semibold text-[var(--color-ink-muted)]"
                :disabled="isSubmitting"
                data-footprint-cancel="true"
                @click="handleCancel"
              >
                取消
              </Button>
            </div>
          </section>
        </div>

        <aside class="footprint-date-dialog__visual grid gap-4 rounded-[32px] border border-[#f2ddf4] bg-[linear-gradient(180deg,rgba(255,240,247,0.95),rgba(234,246,255,0.9))] p-5 text-[var(--color-ink-strong)]">
          <div class="grid gap-2 rounded-[24px] bg-white/70 p-4 shadow-[0_18px_34px_rgba(139,111,239,0.12)]">
            <p class="text-sm font-semibold text-[#8b6fef]">
              旅途小提示
            </p>
            <p class="text-base leading-6 text-[var(--color-ink-muted)]">
              先记录你抵达的那一天。如果这段旅程跨越多天，再补上结束日期就可以了。
            </p>
          </div>

          <div class="relative overflow-hidden rounded-[28px] bg-[linear-gradient(180deg,rgba(255,255,255,0.72),rgba(255,248,253,0.9))] p-4">
            <img
              :src="footprintDialogGirl"
              alt=""
              aria-hidden="true"
              class="mx-auto h-auto w-full max-w-[320px] object-contain"
            >
          </div>
        </aside>
      </div>
    </DialogContent>
  </Dialog>
</template>

<style scoped>
.footprint-date-dialog__close:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

@media (max-width: 1023px) {
  .footprint-date-dialog__visual {
    order: -1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .footprint-date-dialog__close {
    transition: none;
    transform: none;
  }
}
</style>
