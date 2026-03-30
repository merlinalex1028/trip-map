<script setup lang="ts">
import { computed, shallowRef } from 'vue'

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

const props = defineProps<{
  surface: SummarySurfaceState
  findSavedPointByCityId?: (cityId: string) => MapPointDisplay | null
  titleClass?: string
}>()

const emit = defineEmits<{
  confirmCandidate: [candidate: GeoCityCandidate]
  continueWithFallback: []
  saveDraft: []
  openDrawer: []
  enterEdit: []
  toggleFeatured: []
  deletePoint: []
  hidePoint: []
}>()

const destructiveAction = shallowRef<'delete' | 'hide' | null>(null)

const isCandidateMode = computed(() => props.surface.mode === 'candidate-select')
const candidateSurface = computed(() =>
  props.surface.mode === 'candidate-select' ? props.surface : null
)
const detailSurface = computed(() =>
  props.surface.mode === 'candidate-select' ? null : props.surface
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

const destructiveLabel = computed(() => {
  if (!summaryPoint.value) {
    return null
  }

  if (summaryPoint.value.source === 'saved') {
    return '删除地点'
  }

  if (summaryPoint.value.source === 'seed') {
    return '隐藏预置地点'
  }

  return null
})

const destructivePrompt = computed(() => {
  if (destructiveAction.value === 'delete') {
    return '删除地点：确认删除这个地点？'
  }

  if (destructiveAction.value === 'hide') {
    return '隐藏预置地点：确认隐藏这个预置地点？'
  }

  return null
})

function resetInlineConfirm() {
  destructiveAction.value = null
}

function handleCandidateConfirm(candidate: GeoCityCandidate) {
  resetInlineConfirm()
  emit('confirmCandidate', candidate)
}

function handleContinueWithFallback() {
  resetInlineConfirm()
  emit('continueWithFallback')
}

function handleSaveDraft() {
  resetInlineConfirm()
  emit('saveDraft')
}

function handleOpenDrawer() {
  resetInlineConfirm()
  emit('openDrawer')
}

function handleEnterEdit() {
  resetInlineConfirm()
  emit('enterEdit')
}

function handleToggleFeatured() {
  resetInlineConfirm()
  emit('toggleFeatured')
}

function handleRequestDestructiveAction() {
  if (!summaryPoint.value) {
    return
  }

  destructiveAction.value = summaryPoint.value.source === 'saved' ? 'delete' : 'hide'
}

function handleConfirmDestructiveAction() {
  if (destructiveAction.value === 'delete') {
    emit('deletePoint')
  }

  if (destructiveAction.value === 'hide') {
    emit('hidePoint')
  }

  destructiveAction.value = null
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
        <h2 :class="['point-summary-card__title', titleClass]" tabindex="-1">
          {{ summaryTitle }}
        </h2>
        <span
          v-if="summaryTypeLabel"
          class="point-summary-card__type-label"
          data-place-type-label="true"
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

        <p v-else class="point-summary-card__description">
          {{ summaryPoint?.description }}
        </p>
      </div>
    </div>

    <footer class="point-summary-card__footer" data-popup-section="footer">
      <div class="point-summary-card__actions">
        <template v-if="surface.mode === 'detected-preview'">
          <button
            class="point-summary-card__action point-summary-card__action--primary"
            data-cta-tone="selected"
            type="button"
            @click="handleSaveDraft"
          >
            保存为地点
          </button>
          <button class="point-summary-card__action" type="button" @click="handleOpenDrawer">
            查看详情
          </button>
          <button class="point-summary-card__action" type="button" @click="handleToggleFeatured">
            点亮状态
          </button>
        </template>

        <template v-else>
          <button
            class="point-summary-card__action point-summary-card__action--primary"
            data-cta-tone="selected"
            type="button"
            @click="handleOpenDrawer"
          >
            查看详情
          </button>
          <button class="point-summary-card__action" type="button" @click="handleEnterEdit">
            编辑地点
          </button>
          <button class="point-summary-card__action" type="button" @click="handleToggleFeatured">
            点亮状态
          </button>
          <button
            v-if="destructiveLabel"
            class="point-summary-card__action point-summary-card__action--danger"
            data-cta-tone="destructive"
            type="button"
            @click="handleRequestDestructiveAction"
          >
            {{ destructiveLabel }}
          </button>
        </template>
      </div>

      <div v-if="destructivePrompt" class="point-summary-card__confirm-row">
        <p class="point-summary-card__confirm-copy">{{ destructivePrompt }}</p>
        <div class="point-summary-card__confirm-actions">
          <button
            class="point-summary-card__confirm-action"
            data-cta-tone="selected"
            type="button"
            @click="handleConfirmDestructiveAction"
          >
            确认
          </button>
          <button
            class="point-summary-card__confirm-cancel"
            data-cta-tone="destructive"
            type="button"
            @click="resetInlineConfirm"
          >
            取消
          </button>
        </div>
      </div>
    </footer>
  </article>
</template>

<style scoped>
.point-summary-card {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  flex: 1 1 auto;
  gap: var(--space-md);
  min-height: 0;
  padding: var(--space-lg);
  border: 1px solid rgba(199, 171, 200, 0.56);
  border-radius: var(--radius-surface);
  background: linear-gradient(180deg, rgba(255, 252, 253, 0.96), rgba(232, 244, 251, 0.94));
  box-shadow: var(--shadow-surface);
  overflow: hidden;
}

.point-summary-card__header,
.point-summary-card__content,
.point-summary-card__scroll-region,
.point-summary-card__section,
.point-summary-card__candidate-list,
.point-summary-card__title-row,
.point-summary-card__candidate-headline,
.point-summary-card__footer,
.point-summary-card__actions,
.point-summary-card__confirm-row,
.point-summary-card__confirm-actions,
.point-summary-card__field {
  display: grid;
  gap: var(--space-sm);
}

.point-summary-card__badge,
.point-summary-card__title,
.point-summary-card__meta,
.point-summary-card__notice,
.point-summary-card__description,
.point-summary-card__empty,
.point-summary-card__candidate-city,
.point-summary-card__candidate-context,
.point-summary-card__candidate-hint,
.point-summary-card__candidate-cta,
.point-summary-card__confirm-copy {
  margin: 0;
}

.point-summary-card__badge {
  width: fit-content;
  padding: 0.3rem 0.6rem;
  border: 1px solid rgba(244, 143, 177, 0.42);
  border-radius: var(--radius-pill);
  background: rgba(255, 220, 232, 0.72);
  color: var(--color-ink-strong);
  font-size: var(--font-label-size);
  font-weight: var(--font-weight-label);
  line-height: var(--font-label-line-height);
}

.point-summary-card__title {
  color: var(--color-ink-strong);
  font-size: var(--font-heading-size);
  font-weight: var(--font-weight-heading);
  line-height: var(--font-heading-line-height);
}

.point-summary-card__title-row,
.point-summary-card__candidate-headline {
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
}

.point-summary-card__type-label,
.point-summary-card__candidate-type {
  width: fit-content;
  padding: 0.2rem 0.55rem;
  border: 1px solid rgba(132, 199, 216, 0.48);
  border-radius: var(--radius-pill);
  background: rgba(223, 244, 248, 0.92);
  color: var(--color-ink-strong);
  font-size: var(--font-label-size);
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

.point-summary-card__notice,
.point-summary-card__confirm-copy {
  color: var(--color-ink-strong);
  font-size: var(--font-label-size);
  font-weight: var(--font-weight-label);
  line-height: var(--font-label-line-height);
}

.point-summary-card__notice {
  padding: 0.7rem 0.85rem;
  border: 1px dashed rgba(184, 198, 217, 0.84);
  border-radius: var(--radius-control);
  background: rgba(238, 243, 248, 0.96);
}

.point-summary-card__candidate-cta {
  color: var(--color-accent);
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
  padding-inline-end: 0.25rem;
}

.point-summary-card__description {
  color: var(--color-ink-strong);
  white-space: pre-wrap;
  word-break: break-word;
}

.point-summary-card__field-label {
  color: var(--color-ink-strong);
  font-size: var(--font-label-size);
  font-weight: var(--font-weight-label);
  line-height: var(--font-label-line-height);
}

.point-summary-card__input,
.point-summary-card__candidate-action,
.point-summary-card__action,
.point-summary-card__confirm-action,
.point-summary-card__confirm-cancel {
  min-height: 44px;
  border: 1px solid rgba(199, 171, 200, 0.48);
  border-radius: var(--radius-control);
  background: rgba(255, 250, 252, 0.92);
  color: var(--color-ink-strong);
  font-size: var(--font-label-size);
}

.point-summary-card__input {
  padding: 0.85rem 0.95rem;
}

.point-summary-card__candidate-action {
  position: relative;
  justify-items: start;
  padding: 0.85rem 0.95rem;
  gap: var(--space-xs);
  text-align: left;
  cursor: pointer;
}

.point-summary-card__candidate-action[data-candidate-status='saved'] {
  border-color: rgba(132, 199, 216, 0.76);
  background: rgba(223, 244, 248, 0.9);
}

.point-summary-card__candidate-action[data-candidate-status='available'] {
  background: rgba(255, 250, 252, 0.92);
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

.point-summary-card__actions {
  grid-template-columns: repeat(auto-fit, minmax(132px, 1fr));
}

.point-summary-card__footer {
  align-content: start;
  padding-top: var(--space-xs);
}

.point-summary-card__action,
.point-summary-card__confirm-action,
.point-summary-card__confirm-cancel {
  padding: 0.75rem 0.95rem;
  font-weight: var(--font-weight-label);
  cursor: pointer;
}

.point-summary-card__action--primary,
.point-summary-card__confirm-action {
  border-color: rgba(244, 143, 177, 0.56);
  background: rgba(255, 220, 232, 0.88);
  color: var(--color-ink-strong);
}

.point-summary-card__action--danger {
  border-color: rgba(200, 100, 100, 0.48);
  background: rgba(255, 243, 244, 0.94);
  color: var(--color-destructive);
}

.point-summary-card__confirm-cancel {
  color: var(--color-destructive);
}

.point-summary-card__input:focus-visible,
.point-summary-card__candidate-action:focus-visible,
.point-summary-card__action:focus-visible,
.point-summary-card__confirm-action:focus-visible,
.point-summary-card__confirm-cancel:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--color-accent) 72%, white 28%);
  outline-offset: 3px;
}
</style>
