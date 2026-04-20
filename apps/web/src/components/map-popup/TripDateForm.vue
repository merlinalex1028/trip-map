<script setup lang="ts">
import { computed, ref } from 'vue'

defineOptions({
  name: 'TripDateForm',
})

interface Props {
  isSubmitting?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isSubmitting: false,
})

const emit = defineEmits<{
  submit: [payload: { startDate: string | null; endDate: string | null }]
  cancel: []
}>()

const startDate = ref('')
const endDate = ref('')

const hasStartDate = computed(() => startDate.value !== '')
const hasRangeError = computed(
  () => hasStartDate.value && endDate.value !== '' && endDate.value < startDate.value,
)
const isValid = computed(() => hasStartDate.value && !hasRangeError.value)
const rangeErrorMessage = computed(() =>
  hasRangeError.value ? '结束日期不能早于开始日期' : null,
)

function handleSubmit() {
  if (!isValid.value || props.isSubmitting) {
    return
  }

  emit('submit', {
    startDate: startDate.value || null,
    endDate: endDate.value || null,
  })
}

function handleCancel() {
  emit('cancel')
}
</script>

<template>
  <form
    class="trip-date-form grid gap-3 rounded-2xl border border-[#e6d9ec] bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(253,245,255,0.94))] p-4"
    data-region="trip-date-form"
    data-kawaii-surface="form"
    @submit.prevent="handleSubmit"
  >
    <label class="trip-date-form__field grid gap-1">
      <span class="trip-date-form__label text-[var(--font-label-size)] font-bold text-[var(--color-ink-strong)]">
        开始日期
      </span>
      <input
        v-model="startDate"
        type="date"
        required
        :max="endDate || undefined"
        class="trip-date-form__input min-h-11 rounded-xl border border-[#d7dcea] bg-white px-3 py-2 text-[var(--font-label-size)] text-[var(--color-ink-strong)]"
        data-trip-date-input="start"
        aria-label="选择旅行开始日期"
      />
    </label>

    <label class="trip-date-form__field grid gap-1">
      <span class="trip-date-form__label text-[var(--font-label-size)] font-bold text-[var(--color-ink-strong)]">
        结束日期（可选）
      </span>
      <input
        v-model="endDate"
        type="date"
        :min="startDate || undefined"
        class="trip-date-form__input min-h-11 rounded-xl border border-[#d7dcea] bg-white px-3 py-2 text-[var(--font-label-size)] text-[var(--color-ink-strong)]"
        data-trip-date-input="end"
        aria-label="选择旅行结束日期（可选）"
      />
    </label>

    <p
      v-if="rangeErrorMessage"
      class="trip-date-form__error text-[var(--font-label-size)] font-bold text-[var(--color-destructive)]"
      data-trip-date-error="range"
      role="alert"
    >
      {{ rangeErrorMessage }}
    </p>

    <div class="trip-date-form__actions grid grid-cols-[1fr_auto] gap-3 pt-1">
      <button
        type="submit"
        class="trip-date-form__submit min-h-11 rounded-full border border-[#f4d7e4] bg-[linear-gradient(135deg,rgba(255,232,242,0.96),rgba(255,246,250,0.96))] px-4 py-2 text-[var(--font-label-size)] font-bold text-[var(--color-accent-strong)] shadow-[0_14px_28px_rgba(244,143,177,0.34)] transition-all duration-300 ease-out hover:scale-105 hover:-translate-y-1 active:scale-95 disabled:cursor-not-allowed disabled:opacity-55"
        :disabled="!isValid || isSubmitting"
        data-trip-date-submit="true"
        aria-label="保存此次旅行记录"
      >
        保存去访
      </button>

      <button
        type="button"
        class="trip-date-form__cancel min-h-11 rounded-full border border-[#d7dcea] bg-white/80 px-4 py-2 text-[var(--font-label-size)] font-bold text-[var(--color-ink-muted)] transition-all duration-300 ease-out hover:scale-105 active:scale-95"
        data-trip-date-cancel="true"
        @click="handleCancel"
      >
        取消
      </button>
    </div>
  </form>
</template>

<style scoped>
@media (prefers-reduced-motion: reduce) {
  .trip-date-form__submit,
  .trip-date-form__cancel {
    transform: none !important;
    transition: none !important;
  }
}
</style>
