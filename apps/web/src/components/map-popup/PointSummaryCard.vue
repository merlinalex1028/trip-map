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

function getCandidateStatus(statusHint: string) {
  return statusHint === '已存在记录' ? 'saved' : 'available'
}

const illuminateLabel = computed(() => (props.isSaved ? '已点亮' : '点亮'))
const illuminateState = computed(() => (props.isSaved ? 'on' : 'off'))
const showIlluminateButton = computed(() => !isCandidateMode.value)
const illuminateHint = computed(() =>
  props.isIlluminatable ? null : '该地点暂不支持点亮',
)

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
    class="point-summary-card"
    data-region="point-summary-card"
    :data-summary-mode="summaryMode"
    :data-record-source="recordSource"
  >
    <header class="point-summary-card__header" data-popup-section="header">
      <p class="point-summary-card__badge">
        {{
          surface.mode === 'candidate-select'
            ? '确认地点'
            : surface.mode === 'detected-preview'
              ? '识别结果'
              : '查看地点'
        }}
      </p>
      <div class="point-summary-card__title-row">
        <h2 :class="['point-summary-card__title', titleClass]" data-display="true" tabindex="-1">
          {{ summaryTitle }}
        </h2>
        <span
          v-if="summaryTypeLabel"
          class="point-summary-card__type-label"
          data-place-type-label="true"
        >
          {{ summaryTypeLabel }}
        </span>
        <button
          v-if="showIlluminateButton"
          class="point-summary-card__illuminate-btn"
          :class="{ 'point-summary-card__illuminate-btn--on': isSaved }"
          :data-illuminate-state="illuminateState"
          :data-illuminatable="String(isIlluminatable)"
          :disabled="isPending || !isIlluminatable"
          :aria-label="illuminateHint ?? undefined"
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

    <div class="point-summary-card__content" data-popup-section="content">
      <div class="point-summary-card__scroll-region" data-scroll-region="true">
        <p
          v-if="isCandidateMode ? fallbackPoint?.fallbackNotice : summaryPoint?.fallbackNotice"
          class="point-summary-card__notice"
          data-notice-tone="fallback"
        >
          {{ isCandidateMode ? fallbackPoint?.fallbackNotice : summaryPoint?.fallbackNotice }}
        </p>
        <p
          v-if="boundarySupportNotice"
          class="point-summary-card__notice"
          data-notice-tone="fallback"
        >
          {{ boundarySupportNotice }}
        </p>

        <div v-if="isCandidateMode" class="point-summary-card__section">
          <div class="point-summary-card__candidate-list">
            <template v-for="item in candidateItems" :key="item.candidate.cityId">
              <button
                v-if="item.isRecommended"
                class="point-summary-card__candidate-action"
                :data-candidate-status="getCandidateStatus(item.statusHint)"
                data-candidate-recommended="true"
                data-cta-tone="selected"
                type="button"
                @click="handleCandidateConfirm(item.candidate)"
              >
                <span class="point-summary-card__candidate-headline">
                  <span class="point-summary-card__candidate-city">
                    {{ item.canonicalCandidate.displayName }}
                  </span>
                  <span class="point-summary-card__candidate-type">
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
                class="point-summary-card__candidate-action"
                :data-candidate-status="getCandidateStatus(item.statusHint)"
                data-cta-tone="selected"
                type="button"
                @click="handleCandidateConfirm(item.candidate)"
              >
                <span class="point-summary-card__candidate-headline">
                  <span class="point-summary-card__candidate-city">
                    {{ item.canonicalCandidate.displayName }}
                  </span>
                  <span class="point-summary-card__candidate-type">
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
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  flex: 1 1 auto;
  gap: var(--space-md);
  min-height: 0;
  padding: var(--space-lg);
  border: 0;
  border-radius: var(--radius-card);
  background:
    radial-gradient(circle at top right, rgba(255, 241, 168, 0.18), transparent 20%),
    var(--texture-ribbon),
    var(--gradient-panel-strong);
  box-shadow: none;
  overflow: hidden;
  position: relative;
}

.point-summary-card__header,
.point-summary-card__content,
.point-summary-card__scroll-region,
.point-summary-card__section,
.point-summary-card__candidate-list,
.point-summary-card__title-row,
.point-summary-card__candidate-headline {
  display: grid;
  gap: var(--space-sm);
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

.point-summary-card__badge {
  width: fit-content;
  padding: 0.34rem 0.72rem;
  border: 1px solid color-mix(in srgb, var(--color-frame-strong) 58%, white 42%);
  border-radius: var(--radius-pill);
  background: var(--gradient-accent-soft);
  color: var(--color-ink-strong);
  font-size: 0.75rem;
  font-weight: var(--font-weight-label);
  line-height: var(--font-label-line-height);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  box-shadow: var(--shadow-button);
}

.point-summary-card__title {
  color: var(--color-ink-strong);
  font-size: clamp(1.45rem, 2vw, 1.8rem);
  font-weight: var(--font-weight-display);
  line-height: var(--font-heading-line-height);
  letter-spacing: 0.03em;
}

.point-summary-card__title-row {
  grid-template-columns: minmax(0, 1fr) auto auto;
  align-items: center;
}

.point-summary-card__candidate-headline {
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
}

.point-summary-card__type-label,
.point-summary-card__candidate-type {
  width: fit-content;
  padding: 0.24rem 0.62rem;
  border: 1px solid color-mix(in srgb, var(--color-secondary) 52%, white 48%);
  border-radius: var(--radius-pill);
  background: rgba(223, 244, 248, 0.9);
  color: var(--color-ink-strong);
  font-size: 0.78rem;
  font-weight: var(--font-weight-label);
  line-height: var(--font-label-line-height);
}

.point-summary-card__meta,
.point-summary-card__candidate-context,
.point-summary-card__candidate-hint,
.point-summary-card__empty {
  color: var(--color-ink-muted);
  font-size: var(--font-label-size);
  line-height: var(--font-label-line-height);
}

.point-summary-card__notice {
  margin: 0;
  color: var(--color-ink-strong);
  font-size: var(--font-label-size);
  font-weight: var(--font-weight-label);
  line-height: var(--font-label-line-height);
  padding: 0.82rem 0.96rem;
  border: 1px dashed color-mix(in srgb, var(--color-secondary) 48%, var(--color-frame) 52%);
  border-radius: var(--radius-control);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.8), rgba(238, 243, 248, 0.92));
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
  position: relative;
  display: grid;
  justify-items: start;
  padding: 0.98rem 1rem;
  gap: var(--space-xs);
  text-align: left;
  cursor: pointer;
  min-height: 44px;
  border: var(--border-soft);
  border-radius: calc(var(--radius-control) + 2px);
  background:
    linear-gradient(180deg, rgba(255, 252, 255, 0.96), rgba(255, 247, 251, 0.92));
  color: var(--color-ink-strong);
  font-size: var(--font-label-size);
  box-shadow: var(--shadow-button);
  transition:
    transform var(--motion-emphasis) ease,
    border-color var(--motion-emphasis) ease,
    box-shadow var(--motion-emphasis) ease,
    background var(--motion-emphasis) ease;
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
  background:
    linear-gradient(180deg, rgba(235, 249, 253, 0.98), rgba(223, 244, 248, 0.9));
}

.point-summary-card__candidate-action[data-candidate-status='available'] {
  background:
    linear-gradient(180deg, rgba(255, 252, 255, 0.96), rgba(255, 247, 251, 0.92));
}

.point-summary-card__candidate-action[data-candidate-recommended='true'] {
  border-color: color-mix(in srgb, var(--color-accent) 58%, var(--color-lemon) 42%);
  background:
    linear-gradient(135deg, rgba(255, 241, 168, 0.42), rgba(255, 232, 242, 0.96));
}

.point-summary-card__candidate-action:hover,
.point-summary-card__candidate-action:focus-visible {
  transform: translateY(-1px);
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
  padding: 0.38rem 0.82rem;
  border: 1px solid color-mix(in srgb, var(--color-frame) 56%, white 44%);
  border-radius: var(--radius-pill);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.92), rgba(238, 243, 248, 0.94));
  color: var(--color-ink-muted);
  font-size: var(--font-label-size);
  font-weight: var(--font-weight-label);
  line-height: var(--font-label-line-height);
  cursor: pointer;
  white-space: nowrap;
  min-height: 32px;
  box-shadow: var(--shadow-button);
  transition:
    transform var(--motion-emphasis) ease,
    background var(--motion-emphasis) ease,
    border-color var(--motion-emphasis) ease,
    color var(--motion-emphasis) ease;
}

.point-summary-card__illuminate-btn--on {
  border-color: color-mix(in srgb, var(--color-secondary) 68%, white 32%);
  background: linear-gradient(135deg, rgba(147, 219, 237, 0.72), rgba(223, 244, 248, 0.94));
  color: color-mix(in srgb, var(--color-secondary-strong) 72%, var(--color-ink-strong) 28%);
}

.point-summary-card__illuminate-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.point-summary-card__illuminate-btn:not(:disabled):hover,
.point-summary-card__illuminate-btn:not(:disabled):focus-visible {
  transform: translateY(-1px);
}

.point-summary-card__illuminate-btn:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--color-accent) 72%, white 28%);
  outline-offset: 3px;
}

@media (prefers-reduced-motion: reduce) {
  .point-summary-card__illuminate-btn {
    transition: none;
  }
}
</style>
