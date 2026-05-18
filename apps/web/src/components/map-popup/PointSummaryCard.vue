<script setup lang="ts">
import { computed } from 'vue'

import mapPopupGirl from '@/assets/v8/characters/map-popup-girl.webp'
import logoCat from '@/assets/v8/mascots/logo-cat-outline.png'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  FOOTPRINT_UNAVAILABLE_CATEGORY_COPY,
  type FootprintUnavailableCategory,
} from '../../services/footprint-availability'
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
    footprintUnavailableCategory?: FootprintUnavailableCategory | null
    footprintUnavailableCopy?: string | null
    tripCount?: number
    latestTripLabel?: string | null
  }>(),
  {
    findSavedPointByCityId: undefined,
    titleClass: undefined,
    isSaved: false,
    isPending: false,
    isIlluminatable: true,
    footprintUnavailableCategory: null,
    footprintUnavailableCopy: null,
    tripCount: 0,
    latestTripLabel: null,
  },
)

const emit = defineEmits<{
  confirmCandidate: [candidate: GeoCityCandidate]
  continueWithFallback: []
  dismiss: []
  leaveFootprint: []
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

const showIlluminateButton = computed(() => !isCandidateMode.value)
const resultHeaderLabel = computed(() => {
  if (props.surface.mode === 'candidate-select') {
    return '识别目标'
  }

  if (props.surface.mode === 'detected-preview') {
    return '识别结果'
  }

  return '查看地点'
})
const displayedUnavailableCategory = computed<FootprintUnavailableCategory>(
  () => props.footprintUnavailableCategory ?? 'temporarily_unavailable',
)
const displayedUnavailableCopy = computed(
  () =>
    props.footprintUnavailableCopy ??
    FOOTPRINT_UNAVAILABLE_CATEGORY_COPY[displayedUnavailableCategory.value],
)
const illuminateHint = computed(() =>
  props.isIlluminatable ? null : displayedUnavailableCopy.value,
)
const illuminateButtonLabel = computed(() => '留下足迹')

function getCandidateActionClass(item: CandidateListItem) {
  return [
    'point-summary-card__candidate-action',
    item.isRecommended
      ? 'point-summary-card__candidate-action--recommended'
      : getCandidateStatus(item.statusHint) === 'saved'
        ? 'point-summary-card__candidate-action--saved'
        : 'point-summary-card__candidate-action--available',
  ]
}

function handleIlluminateToggle() {
  if (props.isPending || !props.isIlluminatable) return
  emit('leaveFootprint')
}

function handleCandidateConfirm(candidate: GeoCityCandidate) {
  emit('confirmCandidate', candidate)
}
</script>

<template>
  <article
    class="point-summary-card"
    data-region="point-summary-card"
    data-kawaii-surface="cloud"
    :data-summary-mode="summaryMode"
    :data-record-source="recordSource"
  >
    <div class="point-summary-card__copy">
      <header class="point-summary-card__header" data-popup-section="header">
        <p class="point-summary-card__eyebrow" data-kawaii-role="badge">
          <img
            :src="logoCat"
            alt=""
            aria-hidden="true"
          >
          <span>{{ resultHeaderLabel }}</span>
        </p>
      </header>

      <div class="point-summary-card__title-row">
        <TooltipProvider :delay-duration="120">
          <Tooltip>
            <TooltipTrigger as-child>
              <h2
                :class="['point-summary-card__title', titleClass]"
                data-display="true"
                tabindex="-1"
              >
                {{ summaryTitle }}
              </h2>
            </TooltipTrigger>
            <TooltipContent
              side="top"
              align="start"
              :side-offset="8"
              hide-arrow
              class="point-summary-card__title-tooltip"
            >
              {{ summaryTitle }}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <span
          v-if="summaryTypeLabel"
          class="point-summary-card__type-label"
          data-place-type-label="true"
          data-kawaii-role="type-pill"
        >
          {{ summaryTypeLabel }}
        </span>
      </div>

      <p
        v-if="summarySubtitle"
        class="point-summary-card__meta point-summary-card__meta--subtitle"
        data-place-subtitle="true"
      >
        {{ summarySubtitle }}
      </p>

      <div class="point-summary-card__content" data-popup-section="content">
        <div v-if="isCandidateMode" class="point-summary-card__candidate-list" data-scroll-region="true">
          <button
            v-for="item in candidateItems"
            :key="item.candidate.cityId"
            :class="getCandidateActionClass(item)"
            :data-candidate-status="getCandidateStatus(item.statusHint)"
            :data-candidate-recommended="item.isRecommended ? 'true' : undefined"
            data-cta-tone="selected"
            data-kawaii-role="secondary-cta"
            type="button"
            @click="handleCandidateConfirm(item.candidate)"
          >
            <span class="point-summary-card__candidate-headline">
              <span class="point-summary-card__candidate-city">
                {{ item.canonicalCandidate.displayName }}
              </span>
              <span class="point-summary-card__candidate-type point-summary-card__type-label">
                {{ item.canonicalCandidate.typeLabel }}
              </span>
            </span>
            <span class="point-summary-card__candidate-context">
              {{ item.canonicalCandidate.subtitle }}
            </span>
            <span class="point-summary-card__candidate-hint">{{ item.statusHint }}</span>
            <span class="point-summary-card__candidate-cta">确认地点</span>
          </button>

          <p v-if="!candidateItems.length" class="point-summary-card__empty">
            暂无可确认候选地点，请稍后重试。
          </p>
        </div>

        <div v-else class="point-summary-card__detail-stack">
          <p
            v-for="notice in detailNotices"
            :key="notice"
            class="point-summary-card__notice"
            data-notice-tone="fallback"
          >
            {{ notice }}
          </p>

          <p
            v-if="!isIlluminatable"
            class="point-summary-card__notice"
            data-footprint-unavailable-reason
            :data-footprint-unavailable-category="displayedUnavailableCategory"
            role="note"
          >
            {{ displayedUnavailableCopy }}
          </p>
        </div>
      </div>

      <button
        v-if="showIlluminateButton"
        class="point-summary-card__illuminate-btn"
        :class="{ 'point-summary-card__illuminate-btn--saved': isSaved }"
        data-footprint-cta="true"
        data-kawaii-role="primary-cta"
        :disabled="isPending || !isIlluminatable"
        :aria-label="illuminateHint ?? illuminateButtonLabel"
        :title="illuminateHint ?? undefined"
        type="button"
        @click="handleIlluminateToggle"
      >
        {{ illuminateButtonLabel }}
      </button>
    </div>

    <aside class="point-summary-card__visual" aria-hidden="true">
      <img
        :src="mapPopupGirl"
        alt=""
      >
    </aside>

    <button
      class="point-summary-card__close"
      type="button"
      aria-label="关闭识别结果"
      @click="emit('dismiss')"
    >
      ×
    </button>
  </article>
</template>

<style scoped>
.point-summary-card {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 240px) 180px;
  gap: 0;
  width: 420px;
  height: 260px;
  min-height: 260px;
  overflow: hidden;
  border: 1px solid rgba(242, 214, 232, 0.88);
  border-radius: 24px;
  background:
    radial-gradient(circle at 76% 18%, rgba(255, 197, 216, 0.32), transparent 18%),
    radial-gradient(circle at 92% 76%, rgba(139, 111, 239, 0.16), transparent 20%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(255, 248, 253, 0.96));
  box-shadow:
    0 24px 54px rgba(143, 120, 189, 0.16),
    0 10px 24px rgba(247, 90, 155, 0.08);
}

.point-summary-card::before {
  content: '✦';
  position: absolute;
  top: 38px;
  left: 246px;
  color: #ffc28a;
  font-size: 24px;
  line-height: 1;
}

.point-summary-card::after {
  content: '✧';
  position: absolute;
  right: 156px;
  bottom: 86px;
  color: #ff9bc0;
  font-size: 20px;
  line-height: 1;
}

.point-summary-card__copy {
  z-index: 1;
  display: flex;
  min-width: 0;
  flex-direction: column;
  padding: 22px 0 24px 28px;
}

.point-summary-card__header {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  min-width: 0;
  gap: 12px;
}

.point-summary-card__eyebrow,
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

.point-summary-card__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #2f1d72;
  font-size: 18px;
  font-weight: 800;
  line-height: 1.2;
}

.point-summary-card__eyebrow img {
  width: 30px;
  height: 26px;
  object-fit: contain;
}

.point-summary-card__close {
  position: absolute;
  z-index: 3;
  top: 14px;
  right: 16px;
  display: inline-flex;
  width: 34px;
  height: 34px;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: #6e5aa6;
  cursor: pointer;
  font-size: 34px;
  font-weight: 500;
  line-height: 1;
  transition: transform 180ms ease, color 180ms ease, background-color 180ms ease;
}

.point-summary-card__close:hover,
.point-summary-card__close:focus-visible {
  background: rgba(241, 233, 255, 0.82);
  color: #2f1d72;
  transform: translateY(-1px);
}

.point-summary-card__close:focus-visible {
  outline: 2px solid rgba(247, 90, 155, 0.36);
  outline-offset: 2px;
}

.point-summary-card__title-row {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 12px;
  padding-top: 30px;
}

.point-summary-card__title-row :deep([data-slot='tooltip-trigger']) {
  min-width: 0;
}

.point-summary-card__title {
  min-width: 0;
  overflow: hidden;
  color: #2f1d72;
  font-size: 32px;
  font-weight: 900;
  letter-spacing: 0;
  line-height: 1.08;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.point-summary-card__type-label {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  border: 1px solid #e5d9fa;
  border-radius: 999px;
  background: #f3edff;
  color: #8b6fef;
  font-size: 14px;
  font-weight: 800;
  line-height: 1;
  padding: 8px 12px;
}

:global(.point-summary-card__title-tooltip) {
  max-width: 280px;
  border: 1px solid rgba(236, 214, 245, 0.96);
  border-radius: 14px;
  background: rgba(255, 252, 255, 0.98);
  box-shadow: 0 14px 32px rgba(139, 111, 239, 0.16);
  color: #2f1d72;
  font-size: 14px;
  font-weight: 800;
  line-height: 1.45;
  overflow-wrap: anywhere;
  padding: 9px 12px;
}

.point-summary-card__candidate-type {
  font-size: 12px;
  padding: 6px 10px;
}

.point-summary-card__meta,
.point-summary-card__candidate-context,
.point-summary-card__candidate-hint,
.point-summary-card__empty {
  color: #7b6cae;
  font-size: 16px;
  font-weight: 700;
  line-height: 1.55;
}

.point-summary-card__meta {
  padding-top: 12px;
}

.point-summary-card__content {
  display: block;
  min-height: 0;
  padding-top: 8px;
}

.point-summary-card__detail-stack {
  display: grid;
  gap: 8px;
  max-height: 72px;
  overflow: auto;
  padding-right: 2px;
  scrollbar-width: thin;
}

.point-summary-card__notice {
  border: 1px solid rgba(232, 219, 247, 0.88);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.7);
  color: #7b6cae;
  font-size: 13px;
  font-weight: 700;
  line-height: 1.45;
  padding: 9px 12px;
}

.point-summary-card__candidate-list {
  display: grid;
  max-height: 104px;
  gap: 6px;
  overflow: auto;
  padding: 2px 4px 2px 0;
  scrollbar-width: thin;
}

.point-summary-card__candidate-headline {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 8px;
}

.point-summary-card__candidate-action {
  position: relative;
  display: grid;
  justify-items: start;
  gap: 3px;
  min-height: 56px;
  border: 1px solid rgba(240, 214, 231, 0.9);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.72);
  color: #2f1d72;
  cursor: pointer;
  padding: 10px 12px;
  text-align: left;
  transition: transform 180ms ease, border-color 180ms ease, box-shadow 180ms ease;
}

.point-summary-card__candidate-action--recommended {
  border-color: #f3abc9;
  background: linear-gradient(135deg, rgba(255, 232, 242, 0.98), rgba(255, 248, 253, 0.98));
}

.point-summary-card__candidate-action--saved {
  border-color: #c5e8ef;
  background: rgba(235, 249, 253, 0.86);
}

.point-summary-card__candidate-city {
  color: #2f1d72;
  font-size: 15px;
  font-weight: 900;
  line-height: 1.25;
  overflow-wrap: anywhere;
}

.point-summary-card__candidate-context,
.point-summary-card__candidate-hint,
.point-summary-card__candidate-cta {
  font-size: 12px;
  line-height: 1.35;
}

.point-summary-card__candidate-cta {
  color: #f75a9b;
  font-weight: 900;
}

.point-summary-card__candidate-action:hover,
.point-summary-card__candidate-action:focus-visible {
  border-color: #f48fb1;
  box-shadow: 0 12px 24px rgba(247, 90, 155, 0.13);
  transform: translateY(-1px);
}

.point-summary-card__candidate-action:focus-visible {
  outline: 2px solid rgba(247, 90, 155, 0.36);
  outline-offset: 3px;
}

.point-summary-card__illuminate-btn {
  display: inline-flex;
  width: fit-content;
  min-width: 174px;
  min-height: 50px;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: auto;
  border: 0;
  border-radius: 999px;
  background: linear-gradient(135deg, #ff6aa6 0%, #f4488f 100%);
  box-shadow: 0 14px 24px rgba(244, 72, 143, 0.3);
  color: white;
  cursor: pointer;
  font-size: 20px;
  font-weight: 900;
  line-height: 1;
  padding: 0 28px;
  transition: transform 180ms ease, box-shadow 180ms ease, opacity 180ms ease;
}

.point-summary-card__illuminate-btn::before {
  content: '★';
  color: #fff7b7;
  font-size: 21px;
  line-height: 1;
}

.point-summary-card__illuminate-btn--saved {
  background: linear-gradient(135deg, #7fd9eb 0%, #66b8ef 100%);
  box-shadow: 0 16px 30px rgba(102, 184, 239, 0.22);
}

.point-summary-card__illuminate-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.point-summary-card__illuminate-btn:not(:disabled):hover,
.point-summary-card__illuminate-btn:not(:disabled):focus-visible {
  box-shadow: 0 18px 34px rgba(244, 72, 143, 0.34);
  transform: translateY(-1px);
}

.point-summary-card__illuminate-btn:focus-visible {
  outline: 2px solid rgba(247, 90, 155, 0.36);
  outline-offset: 3px;
}

.point-summary-card__visual {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
  overflow: hidden;
  padding: 48px 26px 24px 10px;
}

.point-summary-card__visual img {
  width: 138px;
  max-width: none;
  transform: translateX(-2px) translateY(8px);
  filter: drop-shadow(0 18px 20px rgba(143, 120, 189, 0.16));
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

@media (max-width: 520px) {
  .point-summary-card {
    grid-template-columns: minmax(0, 1fr) 112px;
  }

  .point-summary-card__copy {
    padding: 18px 4px 20px 18px;
  }

  .point-summary-card__title {
    font-size: 24px;
  }

  .point-summary-card__visual img {
    width: 132px;
  }
}
</style>
