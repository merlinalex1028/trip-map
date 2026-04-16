<script setup lang="ts">
import { computed } from 'vue'

import type { GeoCityCandidate } from '../../types/geo'
import type { MapPointDisplay, SummarySurfaceState } from '../../types/map-point'

interface CandidateListItem {
  candidate: GeoCityCandidate
  canonicalCandidate: {
    displayName: string
    typeLabel: string
    subtitle: string
    candidateHint: string
  }
  statusHint: string
  isRecommended: boolean
}

const props = withDefaults(
  defineProps<{
    surface: SummarySurfaceState
    findSavedPointByCityId?: (cityId: string) => MapPointDisplay | null
    titleClass?: string
    isSaved?: boolean
    isPending?: boolean
    isIlluminatable?: boolean
  }>(),
  {
    findSavedPointByCityId: undefined,
    titleClass: undefined,
    isSaved: false,
    isPending: false,
    isIlluminatable: true,
  },
)

const emit = defineEmits<{
  confirmCandidate: [candidate: GeoCityCandidate]
  continueWithFallback: []
  illuminate: []
  unilluminate: []
}>()

const isCandidateMode = computed(() => props.surface.mode === 'candidate-select')
const candidateSurface = computed(() =>
  props.surface.mode === 'candidate-select' ? props.surface : null,
)
const detailSurface = computed(() =>
  props.surface.mode === 'candidate-select' ? null : props.surface,
)
const summaryPoint = computed(() => detailSurface.value?.point ?? null)
const fallbackPoint = computed(() => candidateSurface.value?.fallbackPoint ?? null)
const summaryMode = computed(() => props.surface.mode)
const summaryTitle = computed(() => {
  if (props.surface.mode === 'candidate-select') {
    return props.surface.fallbackPoint.name
  }

  return props.surface.point.name
})
const summaryTypeLabel = computed(() => {
  if (props.surface.mode === 'candidate-select') {
    return props.surface.fallbackPoint.typeLabel ?? null
  }

  return props.surface.point.typeLabel ?? null
})
const summarySubtitle = computed(() => {
  if (props.surface.mode === 'candidate-select') {
    return props.surface.fallbackPoint.subtitle ?? props.surface.fallbackPoint.cityContextLabel ?? null
  }

  return (
    props.surface.point.subtitle ??
    props.surface.point.cityContextLabel ??
    props.surface.point.countryName
  )
})
const recordSource = computed(() => {
  if (props.surface.mode === 'candidate-select') {
    return props.surface.fallbackPoint.source ?? 'none'
  }

  return props.surface.point.source ?? 'none'
})

const candidateItems = computed<CandidateListItem[]>(() => {
  if (!candidateSurface.value) {
    return []
  }

  return candidateSurface.value.canonicalCandidates.slice(0, 3).map((candidate) => {
    const existingPoint = props.findSavedPointByCityId?.(candidate.placeId) ?? null

    return {
      candidate: {
        cityId: candidate.placeId,
        cityName: candidate.displayName,
        contextLabel: candidate.subtitle,
        matchLevel: 'high',
        distanceKm: 0,
        statusHint: candidate.candidateHint,
      },
      canonicalCandidate: candidate,
      statusHint: existingPoint ? '已存在记录' : candidate.candidateHint,
      isRecommended: candidate.placeId === candidateSurface.value?.recommendedPlaceId,
    }
  })
})

const boundarySupportNotice = computed(() => {
  if (!detailSurface.value || detailSurface.value.boundarySupportState !== 'missing') {
    return null
  }

  return '当前地点暂不支持边界高亮，将仅保存 canonical 地点身份与文本信息'
})

const summaryFallbackNotice = computed(() => {
  if (isCandidateMode.value) {
    return fallbackPoint.value?.fallbackNotice ?? null
  }

  return summaryPoint.value?.fallbackNotice ?? null
})

const detailNotices = computed(() =>
  [summaryFallbackNotice.value, boundarySupportNotice.value].filter(
    (notice): notice is string => Boolean(notice),
  ),
)

function getCandidateStatus(statusHint: string) {
  return statusHint === '已存在记录' ? 'saved' : 'available'
}

const illuminateLabel = computed(() => (props.isSaved ? '已点亮' : '点亮'))
const illuminateState = computed(() => (props.isSaved ? 'on' : 'off'))
const showIlluminateButton = computed(() => !isCandidateMode.value)
const illuminateHint = computed(() =>
  props.isIlluminatable ? null : '该地点暂不支持点亮',
)
const illuminateAriaLabel = computed(() => illuminateHint.value ?? illuminateLabel.value)
const cloudCardClass =
  'point-summary-card grid flex-1 min-h-0 grid-rows-[auto_minmax(0,1fr)] overflow-hidden relative rounded-3xl border-4 border-white p-6 gap-4 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(253,245,255,0.94))] shadow-[0_24px_48px_rgba(168,121,165,0.18),0_10px_24px_rgba(104,159,192,0.12)] transition-all duration-300 ease-out hover:scale-105 hover:-translate-y-1'
const badgeClass =
  'point-summary-card__badge w-fit rounded-full px-3 py-1 border border-white/80 bg-[linear-gradient(135deg,rgba(255,241,168,0.78),rgba(255,232,242,0.96))] text-[0.75rem] font-bold uppercase tracking-[0.08em] text-[var(--color-ink-strong)] shadow-[0_10px_20px_rgba(244,143,177,0.16)]'
const typePillClass =
  'point-summary-card__type-label w-fit rounded-full px-3 py-1 border border-[#d6ebf2] bg-[#effafc] text-[0.78rem] font-bold text-[var(--color-ink-strong)]'
const noticeClass =
  'point-summary-card__notice rounded-2xl border border-dashed border-[#d7dcea] bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(238,243,248,0.92))] p-4'
const candidateActionBaseClass =
  'point-summary-card__candidate-action relative grid justify-items-start gap-4 text-left min-h-11 rounded-[1.4rem] border p-4 transition-all duration-300 ease-out hover:scale-105 hover:-translate-y-1 active:scale-95'
const candidateActionAvailableClass =
  'border-white/80 bg-[linear-gradient(180deg,rgba(255,252,255,0.98),rgba(255,247,251,0.92))] text-[var(--color-ink-strong)] shadow-[0_12px_24px_rgba(168,121,165,0.14)]'
const candidateActionSavedClass =
  'border-[#cae8ef] bg-[linear-gradient(180deg,rgba(235,249,253,0.98),rgba(223,244,248,0.92))] text-[var(--color-ink-strong)] shadow-[0_12px_24px_rgba(104,159,192,0.18)]'
const candidateActionRecommendedClass =
  'border-[#f4b4c9] bg-[linear-gradient(135deg,rgba(255,241,168,0.42),rgba(255,232,242,0.98))] text-[var(--color-ink-strong)] shadow-[0_12px_24px_rgba(183,146,214,0.18)]'
const primaryCtaBaseClass =
  'point-summary-card__illuminate-btn min-h-11 rounded-full px-4 py-2 text-[var(--font-label-size)] font-bold whitespace-nowrap transition-all duration-300 ease-out hover:scale-105 hover:-translate-y-1 active:scale-95'
const primaryCtaOffClass =
  'border border-[#f4d7e4] bg-[linear-gradient(135deg,rgba(255,232,242,0.96),rgba(255,246,250,0.96))] text-[var(--color-accent-strong)] shadow-[0_14px_28px_rgba(244,143,177,0.34)]'
const primaryCtaOnClass =
  'border border-[#c8e8ef] bg-[linear-gradient(135deg,rgba(147,219,237,0.74),rgba(223,244,248,0.94))] text-[color-mix(in_srgb,var(--color-secondary-strong)_72%,var(--color-ink-strong)_28%)] shadow-[0_14px_28px_rgba(104,159,192,0.2)]'

const illuminateButtonClass = computed(() => [
  primaryCtaBaseClass,
  props.isSaved ? primaryCtaOnClass : primaryCtaOffClass,
])

function getCandidateActionClass(item: CandidateListItem) {
  return [
    candidateActionBaseClass,
    item.isRecommended
      ? candidateActionRecommendedClass
      : getCandidateStatus(item.statusHint) === 'saved'
        ? candidateActionSavedClass
        : candidateActionAvailableClass,
  ]
}

function handleIlluminateToggle() {
  if (props.isPending || !props.isIlluminatable) return
  if (props.isSaved) {
    emit('unilluminate')
  } else {
    emit('illuminate')
  }
}

function handleCandidateConfirm(candidate: GeoCityCandidate) {
  emit('confirmCandidate', candidate)
}

function handleContinueWithFallback() {
  emit('continueWithFallback')
}
</script>

<template>
  <article
    :class="cloudCardClass"
    data-region="point-summary-card"
    data-kawaii-surface="cloud"
    :data-summary-mode="summaryMode"
    :data-record-source="recordSource"
  >
    <header class="point-summary-card__header grid gap-4" data-popup-section="header">
      <p :class="badgeClass" data-kawaii-role="badge">
        {{
          surface.mode === 'candidate-select'
            ? '确认地点'
            : surface.mode === 'detected-preview'
              ? '识别结果'
              : '查看地点'
        }}
      </p>
      <div class="point-summary-card__title-row grid min-w-0 grid-cols-[minmax(0,1fr)_auto_auto] items-start gap-3">
        <h2
          :class="['point-summary-card__title', 'min-w-0 break-words', titleClass]"
          data-display="true"
          tabindex="-1"
        >
          {{ summaryTitle }}
        </h2>
        <span
          v-if="summaryTypeLabel"
          :class="[typePillClass, 'self-start']"
          data-place-type-label="true"
          data-kawaii-role="type-pill"
        >
          {{ summaryTypeLabel }}
        </span>
        <button
          v-if="showIlluminateButton"
          :class="illuminateButtonClass"
          :data-illuminate-state="illuminateState"
          :data-illuminatable="String(isIlluminatable)"
          data-kawaii-role="primary-cta"
          :disabled="isPending || !isIlluminatable"
          :aria-label="illuminateAriaLabel"
          :title="illuminateHint ?? undefined"
          type="button"
          @click="handleIlluminateToggle"
        >
          {{ illuminateLabel }}
        </button>
      </div>
      <p
        v-if="summarySubtitle"
        class="point-summary-card__meta point-summary-card__meta--subtitle"
        data-place-subtitle="true"
      >
        {{ summarySubtitle }}
      </p>
    </header>

    <div class="point-summary-card__content flex min-h-0 overflow-hidden" data-popup-section="content">
      <div class="point-summary-card__scroll-region grid flex-1 min-h-0 gap-4 overflow-y-auto pr-1.5" data-scroll-region="true">
        <p
          v-for="notice in detailNotices"
          :key="notice"
          :class="noticeClass"
          data-notice-tone="fallback"
        >
          {{ notice }}
        </p>

        <div v-if="isCandidateMode" class="point-summary-card__section grid gap-4">
          <div class="point-summary-card__candidate-list grid gap-4">
            <template v-for="item in candidateItems" :key="item.candidate.cityId">
              <button
                v-if="item.isRecommended"
                :class="getCandidateActionClass(item)"
                :data-candidate-status="getCandidateStatus(item.statusHint)"
                data-candidate-recommended="true"
                data-cta-tone="selected"
                data-kawaii-role="secondary-cta"
                type="button"
                @click="handleCandidateConfirm(item.candidate)"
              >
                <span class="point-summary-card__candidate-headline grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                  <span class="point-summary-card__candidate-city">
                    {{ item.canonicalCandidate.displayName }}
                  </span>
                  <span class="point-summary-card__candidate-type" :class="typePillClass">
                    {{ item.canonicalCandidate.typeLabel }}
                  </span>
                </span>
                <span class="point-summary-card__candidate-context">
                  {{ item.canonicalCandidate.subtitle }}
                </span>
                <span class="point-summary-card__candidate-hint">{{ item.statusHint }}</span>
                <span class="point-summary-card__candidate-cta">确认地点</span>
              </button>
              <button
                v-else
                :class="getCandidateActionClass(item)"
                :data-candidate-status="getCandidateStatus(item.statusHint)"
                data-cta-tone="selected"
                data-kawaii-role="secondary-cta"
                type="button"
                @click="handleCandidateConfirm(item.candidate)"
              >
                <span class="point-summary-card__candidate-headline grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                  <span class="point-summary-card__candidate-city">
                    {{ item.canonicalCandidate.displayName }}
                  </span>
                  <span class="point-summary-card__candidate-type" :class="typePillClass">
                    {{ item.canonicalCandidate.typeLabel }}
                  </span>
                </span>
                <span class="point-summary-card__candidate-context">
                  {{ item.canonicalCandidate.subtitle }}
                </span>
                <span class="point-summary-card__candidate-hint">{{ item.statusHint }}</span>
                <span class="point-summary-card__candidate-cta">确认地点</span>
              </button>
            </template>
          </div>

          <p v-if="!candidateItems.length" class="point-summary-card__empty">
            暂无可确认候选地点，请稍后重试。
          </p>
        </div>
      </div>
    </div>
  </article>
</template>

<style scoped>
.point-summary-card {
  background:
    radial-gradient(circle at top right, rgba(255, 241, 168, 0.22), transparent 22%),
    radial-gradient(circle at left center, rgba(223, 244, 248, 0.38), transparent 28%);
}

[data-kawaii-surface="cloud"]:hover,
[data-kawaii-surface="cloud"]:focus-within {
  border-color: color-mix(in srgb, rgba(244, 143, 177, 0.4) 38%, white 62%);
  box-shadow:
    0 28px 56px rgba(168, 121, 165, 0.2),
    0 12px 28px rgba(104, 159, 192, 0.16);
}

.point-summary-card__badge,
.point-summary-card__title,
.point-summary-card__meta,
.point-summary-card__notice,
.point-summary-card__empty,
.point-summary-card__candidate-city,
.point-summary-card__candidate-context,
.point-summary-card__candidate-hint,
.point-summary-card__candidate-cta {
  margin: 0;
}

.point-summary-card__title {
  color: var(--color-ink-strong);
  font-size: clamp(1.45rem, 2vw, 1.8rem);
  font-weight: var(--font-weight-display);
  line-height: var(--font-heading-line-height);
  letter-spacing: 0.03em;
}

.point-summary-card__candidate-type {
  display: inline-flex;
  align-items: center;
}

.point-summary-card__meta,
.point-summary-card__candidate-context,
.point-summary-card__candidate-hint,
.point-summary-card__empty {
  color: var(--color-ink-muted);
  font-size: var(--font-label-size);
  line-height: var(--font-label-line-height);
}

.point-summary-card__candidate-cta {
  color: var(--color-accent-strong);
  font-size: var(--font-label-size);
  font-weight: var(--font-weight-label);
  line-height: var(--font-label-line-height);
}

.point-summary-card__content {
  display: flex;
  min-height: 0;
  overflow: hidden;
}

.point-summary-card__scroll-region {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding-inline-end: 0.35rem;
  scrollbar-width: thin;
  scrollbar-color: color-mix(in srgb, var(--color-frame) 64%, white 36%) transparent;
}

.point-summary-card__candidate-city {
  font-weight: var(--font-weight-label);
}

.point-summary-card__candidate-hint {
  color: var(--color-ink-muted);
}

.point-summary-card__candidate-action[data-candidate-status='saved'] .point-summary-card__candidate-hint {
  color: color-mix(in srgb, var(--color-state-saved) 70%, var(--color-ink-strong) 30%);
}

.point-summary-card__candidate-action {
  cursor: pointer;
  font-size: var(--font-label-size);
}

.point-summary-card__candidate-action::before {
  content: '';
  position: absolute;
  inset: 0.22rem;
  border-radius: calc(var(--radius-control) - 1px);
  border: var(--border-highlight);
  pointer-events: none;
}

.point-summary-card__candidate-action[data-candidate-status='saved'] {
  border-color: color-mix(in srgb, var(--color-secondary) 66%, white 34%);
}

.point-summary-card__candidate-action[data-candidate-status='available'] {
  border-color: color-mix(in srgb, var(--color-frame) 58%, white 42%);
}

.point-summary-card__candidate-action[data-candidate-recommended='true'] {
  border-color: color-mix(in srgb, var(--color-accent) 58%, var(--color-lemon) 42%);
}

.point-summary-card__candidate-action:hover,
.point-summary-card__candidate-action:focus-visible {
  border-color: color-mix(in srgb, var(--color-frame-strong) 72%, white 28%);
  box-shadow:
    0 14px 24px rgba(168, 121, 165, 0.16),
    0 0 0 1px rgba(255, 255, 255, 0.5);
}

.point-summary-card__candidate-action:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--color-accent) 72%, white 28%);
  outline-offset: 3px;
}

.point-summary-card__illuminate-btn {
  line-height: var(--font-label-line-height);
  cursor: pointer;
}

.point-summary-card__illuminate-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.point-summary-card__illuminate-btn:not(:disabled):hover,
.point-summary-card__illuminate-btn:not(:disabled):focus-visible {
  box-shadow:
    0 16px 30px rgba(244, 143, 177, 0.3),
    0 0 0 1px rgba(255, 255, 255, 0.5);
}

.point-summary-card__illuminate-btn:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--color-accent) 72%, white 28%);
  outline-offset: 3px;
}

@media (prefers-reduced-motion: reduce) {
  [data-kawaii-surface="cloud"] {
    transform: none !important;
  }

  [data-kawaii-role="primary-cta"] {
    transform: none !important;
  }

  [data-kawaii-role="secondary-cta"] {
    transform: none !important;
  }
}
</style>
