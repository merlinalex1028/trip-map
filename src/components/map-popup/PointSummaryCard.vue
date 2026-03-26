<script setup lang="ts">
import { computed, shallowRef } from 'vue'

import { searchOfflineCities } from '../../services/city-search'
import type { GeoCityCandidate } from '../../types/geo'
import type { MapPointDisplay, SummarySurfaceState } from '../../types/map-point'

interface CandidateListItem {
  candidate: GeoCityCandidate
  statusHint: string
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

const searchQuery = shallowRef('')
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

const candidateItems = computed<CandidateListItem[]>(() => {
  if (!candidateSurface.value || !fallbackPoint.value) {
    return []
  }

  const normalizedQuery = searchQuery.value.trim()
  const candidates = normalizedQuery
    ? searchOfflineCities({
        query: normalizedQuery,
        origin: {
          lat: fallbackPoint.value.lat,
          lng: fallbackPoint.value.lng
        },
        countryCode: fallbackPoint.value.countryCode,
        limit: 3
      })
    : candidateSurface.value.cityCandidates.slice(0, 3)

  return candidates.map((candidate: GeoCityCandidate) => {
    const existingPoint = props.findSavedPointByCityId?.(candidate.cityId) ?? null

    return {
      candidate,
      statusHint: existingPoint ? '已存在记录' : candidate.statusHint
    }
  })
})

const boundarySupportNotice = computed(() => {
  if (!detailSurface.value || detailSurface.value.boundarySupportState !== 'missing') {
    return null
  }

  return '当前城市暂不支持边界高亮，将仅保存城市身份与文本信息'
})

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
  <article class="point-summary-card" data-region="point-summary-card">
    <header class="point-summary-card__header" data-popup-section="header">
      <p class="point-summary-card__badge">
        {{
          surface.mode === 'candidate-select'
            ? '确认城市'
            : surface.mode === 'detected-preview'
              ? '识别结果'
              : '查看地点'
        }}
      </p>
      <h2 :class="['point-summary-card__title', titleClass]" tabindex="-1">
        {{ isCandidateMode ? fallbackPoint?.name : summaryPoint?.name }}
      </h2>
      <p class="point-summary-card__meta">
        {{ isCandidateMode ? fallbackPoint?.countryName : summaryPoint?.countryName }}
      </p>
      <p
        v-if="isCandidateMode ? fallbackPoint?.cityContextLabel : summaryPoint?.cityContextLabel"
        class="point-summary-card__meta point-summary-card__meta--context"
      >
        {{ isCandidateMode ? fallbackPoint?.cityContextLabel : summaryPoint?.cityContextLabel }}
      </p>
    </header>

    <div class="point-summary-card__content" data-popup-section="content">
      <div class="point-summary-card__scroll-region" data-scroll-region="true">
        <p
          v-if="isCandidateMode ? fallbackPoint?.fallbackNotice : summaryPoint?.fallbackNotice"
          class="point-summary-card__notice"
        >
          {{ isCandidateMode ? fallbackPoint?.fallbackNotice : summaryPoint?.fallbackNotice }}
        </p>
        <p v-if="boundarySupportNotice" class="point-summary-card__notice">
          {{ boundarySupportNotice }}
        </p>

        <div v-if="isCandidateMode" class="point-summary-card__section">
          <label class="point-summary-card__field">
            <span class="point-summary-card__field-label">搜索城市</span>
            <input
              v-model="searchQuery"
              class="point-summary-card__input"
              type="text"
              placeholder="搜索城市"
            />
          </label>

          <div class="point-summary-card__candidate-list">
            <button
              v-for="item in candidateItems"
              :key="item.candidate.cityId"
              class="point-summary-card__candidate-action"
              type="button"
              @click="handleCandidateConfirm(item.candidate)"
            >
              <span class="point-summary-card__candidate-city">{{ item.candidate.cityName }}</span>
              <span class="point-summary-card__candidate-context">{{ item.candidate.contextLabel }}</span>
              <span class="point-summary-card__candidate-hint">{{ item.statusHint }}</span>
              <span class="point-summary-card__candidate-cta">确认城市</span>
            </button>
          </div>

          <p v-if="!candidateItems.length" class="point-summary-card__empty">
            没有匹配城市，请按国家/地区继续记录。
          </p>
        </div>

        <p v-else class="point-summary-card__description">
          {{ summaryPoint?.description }}
        </p>
      </div>
    </div>

    <footer class="point-summary-card__footer" data-popup-section="footer">
      <div class="point-summary-card__actions">
        <template v-if="surface.mode === 'candidate-select'">
          <button class="point-summary-card__action" type="button" @click="handleContinueWithFallback">
            按国家/地区继续记录
          </button>
        </template>

        <template v-else-if="surface.mode === 'detected-preview'">
          <button class="point-summary-card__action point-summary-card__action--primary" type="button" @click="handleSaveDraft">
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
          <button class="point-summary-card__action point-summary-card__action--primary" type="button" @click="handleOpenDrawer">
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
          <button class="point-summary-card__confirm-action" type="button" @click="handleConfirmDestructiveAction">
            确认
          </button>
          <button class="point-summary-card__confirm-cancel" type="button" @click="resetInlineConfirm">
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
  border: 1px solid rgba(143, 117, 80, 0.36);
  background:
    linear-gradient(180deg, rgba(252, 247, 236, 0.96), rgba(240, 225, 197, 0.96)),
    var(--color-surface);
  box-shadow: 0 14px 30px rgba(73, 49, 31, 0.12);
  overflow: hidden;
}

.point-summary-card__header,
.point-summary-card__content,
.point-summary-card__scroll-region,
.point-summary-card__section,
.point-summary-card__candidate-list,
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
  border: 1px solid rgba(200, 100, 59, 0.55);
  color: var(--color-accent);
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

.point-summary-card__meta,
.point-summary-card__candidate-context,
.point-summary-card__candidate-hint,
.point-summary-card__empty {
  color: var(--color-ink-muted);
  font-size: var(--font-label-size);
  line-height: var(--font-label-line-height);
}

.point-summary-card__notice,
.point-summary-card__candidate-cta,
.point-summary-card__confirm-copy {
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
  border: 1px solid rgba(143, 117, 80, 0.38);
  background: rgba(252, 247, 236, 0.92);
  color: var(--color-ink-strong);
  font-size: var(--font-label-size);
}

.point-summary-card__input {
  padding: 0.85rem 0.95rem;
}

.point-summary-card__candidate-action {
  justify-items: start;
  padding: 0.85rem 0.95rem;
  text-align: left;
  cursor: pointer;
}

.point-summary-card__candidate-city {
  font-weight: var(--font-weight-label);
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
  cursor: pointer;
}

.point-summary-card__action--primary,
.point-summary-card__confirm-action {
  border-color: rgba(200, 100, 59, 0.48);
  color: var(--color-accent);
}

.point-summary-card__action--danger {
  border-color: rgba(141, 62, 47, 0.42);
  color: var(--color-danger);
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
