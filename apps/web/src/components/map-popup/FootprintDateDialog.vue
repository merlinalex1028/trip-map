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
import logoCat from '@/assets/v8/mascots/logo-cat-outline.png'
import KawaiiIcon from '@/components/common/KawaiiIcon.vue'
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
      :show-close-button="false"
      class="footprint-date-dialog max-h-[calc(100dvh_-_48px)] w-[min(1120px,calc(100vw_-_48px))] max-w-[1120px] overflow-hidden border-[#f0d6e7] bg-[linear-gradient(180deg,rgba(255,251,254,0.99),rgba(255,247,252,0.98))] p-0 shadow-[0_34px_86px_rgba(108,79,156,0.2)]"
      @close-auto-focus.prevent
    >
      <div
        class="footprint-date-dialog__surface"
        data-region="footprint-date-dialog"
        role="dialog"
      >
        <button
          type="button"
          class="footprint-date-dialog__close"
          aria-label="关闭留下足迹弹窗"
          :disabled="isSubmitting"
          @click="handleCancel"
        >
          <span aria-hidden="true">×</span>
        </button>

        <section class="footprint-date-dialog__place-pane">
          <DialogHeader class="footprint-date-dialog__header">
            <div class="footprint-date-dialog__brand-row">
              <img
                :src="logoCat"
                alt=""
                aria-hidden="true"
              >
              <DialogTitle class="footprint-date-dialog__title">
                留下足迹
              </DialogTitle>
            </div>
            <DialogDescription class="sr-only">
              {{ dialogDescription }}
            </DialogDescription>
          </DialogHeader>

          <div class="footprint-date-dialog__place-copy">
            <div class="footprint-date-dialog__place-title-row">
              <h2
                class="footprint-date-dialog__place-title"
                data-footprint-place-name
              >
                {{ place?.displayName ?? '未选择地点' }}
              </h2>
              <span
                class="footprint-date-dialog__type-pill"
                data-place-type-label="true"
              >
                {{ place?.typeLabel ?? '地点' }}
              </span>
            </div>
            <p
              class="footprint-date-dialog__place-subtitle"
              data-place-subtitle="true"
            >
              {{ place?.subtitle ?? place?.parentLabel ?? '选择一个日期来记录这段旅程。' }}
            </p>
          </div>

          <p class="footprint-date-dialog__speech">
            <span aria-hidden="true">✦</span>
            每一次抵达，都是与世界的温柔相遇
          </p>

          <div class="footprint-date-dialog__visual" aria-hidden="true">
            <img
              :src="footprintDialogGirl"
              alt=""
            >
          </div>
        </section>

        <section class="footprint-date-dialog__date-pane">
          <div class="footprint-date-dialog__date-title">
            <KawaiiIcon
              label="日期"
              name="calendar"
              :decorative="false"
              :size="32"
            />
            <span>选择到达日期</span>
          </div>

          <div
            class="footprint-date-dialog__calendar-shell"
            data-footprint-calendar="true"
          >
            <Calendar
              :model-value="selectedDate"
              locale="zh-CN"
              class="footprint-date-dialog__calendar"
              @update:model-value="handleCalendarChange"
            />
          </div>

          <div class="footprint-date-dialog__quick-row">
            <p class="footprint-date-dialog__quick-label">
              快速选择
            </p>
            <div class="footprint-date-dialog__quick-actions">
              <Button
                v-for="shortcut in [
                  { key: 'today', label: '今天' },
                  { key: 'tomorrow', label: '明天' },
                  { key: 'weekend', label: '本周末' },
                ]"
                :key="shortcut.key"
                type="button"
                :variant="selectedShortcut === shortcut.key ? 'default' : 'outline'"
                size="lg"
                class="footprint-date-dialog__shortcut"
                :aria-pressed="selectedShortcut === shortcut.key"
                :data-footprint-shortcut="shortcut.key"
                @click="handleShortcutClick(shortcut.key as ShortcutKey)"
              >
                <KawaiiIcon
                  v-if="shortcut.key === 'today'"
                  label="今天"
                  name="star"
                  :decorative="true"
                  :size="17"
                />
                {{ shortcut.label }}
              </Button>

              <span class="footprint-date-dialog__quick-divider" aria-hidden="true"></span>

              <label
                class="footprint-date-dialog__shortcut footprint-date-dialog__custom-date"
                :aria-pressed="selectedShortcut === 'custom'"
                data-footprint-shortcut="custom"
                @click="handleShortcutClick('custom')"
              >
                <span>选择其他日期</span>
                <KawaiiIcon
                  label="选择旅行结束日期"
                  name="calendar"
                  :decorative="true"
                  :size="17"
                />
                <input
                  v-model="endDateInput"
                  type="date"
                  :min="selectedDate?.toString() || undefined"
                  aria-label="选择旅行结束日期（可选）"
                  data-footprint-end-date="true"
                >
              </label>
            </div>
          </div>

          <div class="footprint-date-dialog__feedback" aria-live="polite">
            <p
              v-if="hasRangeError"
              class="footprint-date-dialog__error"
              data-footprint-range-error="true"
              role="alert"
            >
              结束日期不能早于开始日期。
            </p>

            <p
              v-if="errorMessage"
              class="footprint-date-dialog__error"
              data-footprint-error="true"
              role="alert"
            >
              {{ failureMessage }}
            </p>
          </div>

          <div class="footprint-date-dialog__actions">
            <Button
              type="button"
              variant="outline"
              size="lg"
              class="footprint-date-dialog__cancel"
              :disabled="isSubmitting"
              data-footprint-cancel="true"
              @click="handleCancel"
            >
              取消
              <span aria-hidden="true">×</span>
            </Button>
            <Button
              type="button"
              size="lg"
              class="footprint-date-dialog__submit"
              :disabled="isSubmitDisabled"
              data-footprint-submit="true"
              @click="handleSubmit"
            >
              <span aria-hidden="true">✦</span>
              {{ isSubmitting ? '正在保存...' : '留下足迹' }}
            </Button>
          </div>
        </section>

        <p class="footprint-date-dialog__footnote">
          <span aria-hidden="true">☆</span>
          足迹会记录在你的旅行时间轴中
          <span aria-hidden="true">☆</span>
        </p>
      </div>
    </DialogContent>
  </Dialog>
</template>

<style scoped>
.footprint-date-dialog__surface {
  position: relative;
  display: grid;
  grid-template-columns: minmax(300px, 0.8fr) minmax(520px, 1.35fr);
  column-gap: 28px;
  max-height: calc(100dvh - 48px);
  overflow: hidden;
  padding: 42px 42px 58px;
  color: #2f1d72;
}

.footprint-date-dialog__surface::before,
.footprint-date-dialog__surface::after {
  content: '';
  position: absolute;
  pointer-events: none;
}

.footprint-date-dialog__surface::before {
  inset: 0;
  background:
    radial-gradient(circle at 25% 8%, rgba(255, 199, 137, 0.22), transparent 10%),
    radial-gradient(circle at 64% 8%, rgba(255, 155, 192, 0.22), transparent 10%),
    linear-gradient(90deg, rgba(255, 249, 253, 0.98), rgba(255, 255, 255, 0.94));
}

.footprint-date-dialog__surface::after {
  inset: 1px;
  border-radius: 32px;
  border: 1px solid rgba(255, 255, 255, 0.74);
}

.footprint-date-dialog__close {
  position: absolute;
  z-index: 4;
  top: 26px;
  right: 28px;
  display: inline-flex;
  width: 54px;
  height: 54px;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: #6f4aa1;
  cursor: pointer;
  font-size: 56px;
  font-weight: 500;
  line-height: 1;
  transition: transform 180ms ease, color 180ms ease, background-color 180ms ease;
}

.footprint-date-dialog__close:hover,
.footprint-date-dialog__close:focus-visible {
  background: rgba(241, 233, 255, 0.68);
  color: #2f1d72;
  transform: translateY(-1px);
}

.footprint-date-dialog__close:focus-visible {
  outline: 2px solid rgba(247, 90, 155, 0.35);
  outline-offset: 3px;
}

.footprint-date-dialog__close:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.footprint-date-dialog__place-pane,
.footprint-date-dialog__date-pane,
.footprint-date-dialog__footnote {
  position: relative;
  z-index: 1;
}

.footprint-date-dialog__place-pane {
  display: flex;
  min-height: 640px;
  flex-direction: column;
  overflow: hidden;
}

.footprint-date-dialog__header {
  display: block;
  text-align: left;
}

.footprint-date-dialog__brand-row,
.footprint-date-dialog__date-title {
  display: flex;
  align-items: center;
  gap: 14px;
}

.footprint-date-dialog__brand-row img {
  width: 52px;
  height: 44px;
  object-fit: contain;
}

.footprint-date-dialog__title,
.footprint-date-dialog__date-title {
  margin: 0;
  color: #2f1d72;
  font-size: 34px;
  font-weight: 900;
  letter-spacing: 0;
  line-height: 1.1;
}

.footprint-date-dialog__date-title {
  padding-right: 56px;
}

.footprint-date-dialog__date-title [data-kawaii-icon] {
  color: #c199f3;
}

.footprint-date-dialog__place-copy {
  padding-top: 54px;
}

.footprint-date-dialog__place-title-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
}

.footprint-date-dialog__place-title {
  margin: 0;
  color: #2f1d72;
  font-size: 50px;
  font-weight: 900;
  letter-spacing: 0;
  line-height: 1.08;
  overflow-wrap: anywhere;
}

.footprint-date-dialog__type-pill {
  display: inline-flex;
  align-items: center;
  border: 1px solid #e6d9fb;
  border-radius: 999px;
  background: #f4edff;
  color: #8b6fef;
  font-size: 20px;
  font-weight: 900;
  line-height: 1;
  padding: 12px 20px;
}

.footprint-date-dialog__place-subtitle {
  margin: 22px 0 0;
  color: #7b6cae;
  font-size: 24px;
  font-weight: 800;
  line-height: 1.5;
}

.footprint-date-dialog__speech {
  position: relative;
  width: min(100%, 275px);
  margin: 32px 0 0 0;
  border: 1px solid rgba(246, 199, 221, 0.74);
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.52);
  box-shadow: 0 18px 38px rgba(247, 90, 155, 0.06);
  color: #8a77cc;
  font-size: 20px;
  font-weight: 900;
  line-height: 1.55;
  padding: 20px 24px;
}

.footprint-date-dialog__speech::after {
  content: '';
  position: absolute;
  left: 44px;
  bottom: -15px;
  width: 28px;
  height: 28px;
  border-right: 1px solid rgba(246, 199, 221, 0.74);
  border-bottom: 1px solid rgba(246, 199, 221, 0.74);
  background: rgba(255, 255, 255, 0.52);
  transform: rotate(45deg);
}

.footprint-date-dialog__speech span {
  color: #ffc28a;
  margin-right: 10px;
}

.footprint-date-dialog__visual {
  flex: 1 1 auto;
  min-height: 0;
  overflow: hidden;
  margin: 18px -36px -64px -60px;
}

.footprint-date-dialog__visual img {
  width: min(455px, 118%);
  max-width: none;
  transform: translate(-8px, 10px);
  filter: drop-shadow(0 24px 32px rgba(143, 120, 189, 0.13));
}

.footprint-date-dialog__date-pane {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto minmax(22px, auto) auto;
  min-height: 640px;
  gap: 22px;
}

.footprint-date-dialog__calendar-shell {
  min-height: 0;
  border: 1px solid rgba(232, 217, 247, 0.92);
  border-radius: 30px;
  background: rgba(255, 255, 255, 0.7);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.9);
  padding: 26px 34px;
}

.footprint-date-dialog__calendar {
  height: 100%;
  min-height: 386px;
}

.footprint-date-dialog__quick-row {
  display: grid;
  gap: 12px;
}

.footprint-date-dialog__quick-label {
  margin: 0;
  color: #5f4b9c;
  font-size: 18px;
  font-weight: 900;
  line-height: 1;
}

.footprint-date-dialog__quick-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 14px;
}

.footprint-date-dialog__shortcut {
  position: relative;
  display: inline-flex;
  min-width: 112px;
  min-height: 46px;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border: 1px solid #eadcf4;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.74);
  color: #5f4b9c;
  cursor: pointer;
  font-size: 18px;
  font-weight: 900;
  line-height: 1;
  padding: 0 22px;
  transition: transform 180ms ease, border-color 180ms ease, box-shadow 180ms ease;
}

.footprint-date-dialog__shortcut[aria-pressed='true'] {
  border-color: #ffb2cd;
  background: #fff2f7;
  color: #f75a9b;
}

.footprint-date-dialog__shortcut:hover,
.footprint-date-dialog__shortcut:focus-visible {
  border-color: #f48fb1;
  box-shadow: 0 12px 24px rgba(247, 90, 155, 0.12);
  transform: translateY(-1px);
}

.footprint-date-dialog__quick-divider {
  width: 1px;
  height: 34px;
  background: #eadcf4;
}

.footprint-date-dialog__custom-date {
  min-width: 208px;
  overflow: hidden;
}

.footprint-date-dialog__custom-date input {
  position: absolute;
  inset: 0;
  cursor: pointer;
  opacity: 0;
}

.footprint-date-dialog__feedback {
  min-height: 22px;
}

.footprint-date-dialog__error {
  margin: 0;
  border: 1px solid #f4c7cf;
  border-radius: 16px;
  background: #fff2f4;
  color: var(--color-destructive);
  font-size: 14px;
  font-weight: 800;
  line-height: 1.45;
  padding: 10px 14px;
}

.footprint-date-dialog__actions {
  display: grid;
  grid-template-columns: minmax(180px, 1fr) minmax(260px, 1.35fr);
  gap: 22px;
  padding-top: 2px;
}

.footprint-date-dialog__cancel,
.footprint-date-dialog__submit {
  min-height: 76px;
  border-radius: 999px;
  font-size: 26px;
  font-weight: 900;
  line-height: 1;
}

.footprint-date-dialog__cancel {
  border: 1px solid #eadcf4;
  background: rgba(255, 255, 255, 0.76);
  color: #8a77cc;
}

.footprint-date-dialog__submit {
  gap: 14px;
  border: 0;
  background: linear-gradient(135deg, #ff6aa6 0%, #f4488f 100%);
  box-shadow: 0 20px 40px rgba(244, 72, 143, 0.26);
  color: white;
}

.footprint-date-dialog__submit span {
  color: #fff8c7;
  font-size: 32px;
}

.footprint-date-dialog__footnote {
  position: absolute;
  left: 50%;
  bottom: 18px;
  display: flex;
  align-items: center;
  gap: 18px;
  margin: 0;
  color: #a48ddd;
  font-size: 20px;
  font-weight: 900;
  line-height: 1;
  transform: translateX(-50%);
  white-space: nowrap;
}

.footprint-date-dialog__footnote span {
  color: #b99bf0;
}

.footprint-date-dialog :deep([data-slot='calendar']) {
  display: grid;
  height: 100%;
  padding: 0;
}

.footprint-date-dialog :deep([data-slot='calendar'] > div:last-child) {
  margin-top: 26px;
}

.footprint-date-dialog :deep([data-slot='calendar-header']) {
  position: relative;
}

.footprint-date-dialog :deep([data-slot='calendar-heading']) {
  color: #3b267e;
  font-size: 26px;
  font-weight: 900;
  letter-spacing: 0;
  line-height: 1.2;
}

.footprint-date-dialog :deep([data-slot='calendar-prev-button']),
.footprint-date-dialog :deep([data-slot='calendar-next-button']) {
  color: #a98adf;
}

.footprint-date-dialog :deep([data-slot='calendar-grid']) {
  height: 100%;
}

.footprint-date-dialog :deep([data-slot='calendar-grid-row']) {
  gap: 12px;
}

.footprint-date-dialog :deep([data-slot='calendar-head-cell']) {
  color: #8a77cc;
  font-size: 18px;
  font-weight: 900;
}

.footprint-date-dialog :deep([data-slot='calendar-cell']) {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 45px;
  background: transparent;
}

.footprint-date-dialog :deep([data-slot='calendar-cell-trigger']) {
  width: 46px;
  height: 46px;
  border-radius: 999px;
  color: #3b267e;
  cursor: pointer;
  font-size: 18px;
  font-weight: 800;
  transition: transform 180ms ease, box-shadow 180ms ease, background-color 180ms ease;
}

.footprint-date-dialog :deep([data-slot='calendar-cell-trigger'][data-selected]) {
  background: linear-gradient(135deg, #ff7bad, #f4488f);
  box-shadow: 0 12px 24px rgba(244, 72, 143, 0.28);
  color: #fff;
  transform: scale(1.08);
}

.footprint-date-dialog :deep([data-slot='calendar-cell-trigger'][data-today]:not([data-selected])) {
  background: #fff1f7;
  color: #f75a9b;
}

.footprint-date-dialog :deep([data-slot='calendar-cell-trigger'][data-outside-view]) {
  color: #c9bed9;
}

@media (max-width: 1040px) {
  .footprint-date-dialog__surface {
    grid-template-columns: 1fr;
    max-height: calc(100dvh - 48px);
    overflow: auto;
    padding: 32px 24px 72px;
  }

  .footprint-date-dialog__place-pane,
  .footprint-date-dialog__date-pane {
    min-height: auto;
  }

  .footprint-date-dialog__visual {
    display: none;
  }

  .footprint-date-dialog__place-copy {
    padding-top: 24px;
  }
}

@media (max-width: 720px) {
  .footprint-date-dialog__surface {
    padding-inline: 18px;
  }

  .footprint-date-dialog__place-title {
    font-size: 38px;
  }

  .footprint-date-dialog__title,
  .footprint-date-dialog__date-title {
    font-size: 28px;
  }

  .footprint-date-dialog__calendar-shell {
    padding: 18px 12px;
  }

  .footprint-date-dialog :deep([data-slot='calendar-grid-row']) {
    gap: 4px;
  }

  .footprint-date-dialog__actions {
    grid-template-columns: 1fr;
  }
}

@media (prefers-reduced-motion: reduce) {
  .footprint-date-dialog__close,
  .footprint-date-dialog__shortcut,
  .footprint-date-dialog :deep([data-slot='calendar-cell-trigger']) {
    transition: none;
    transform: none;
  }
}
</style>
