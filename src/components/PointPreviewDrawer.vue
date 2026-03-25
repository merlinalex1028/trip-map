<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed, nextTick, reactive, ref, useTemplateRef, watch } from 'vue'

import { useMapPointsStore } from '../stores/map-points'
import type { GeoCityCandidate } from '../types/geo'
import type { EditablePointSnapshot } from '../types/map-point'

const mapPointsStore = useMapPointsStore()
const { activePoint, drawerMode, pendingCitySelection } = storeToRefs(mapPointsStore)
const {
  clearActivePoint,
  confirmPendingCitySelection,
  continuePendingWithFallback,
  deleteUserPoint,
  enterEditMode,
  exitEditMode,
  findSavedPointByCityId,
  hideSeedPoint,
  saveDraftAsPoint,
  updateSavedPoint
} = mapPointsStore

const panelRef = useTemplateRef<HTMLElement>('panel')
const titleRef = useTemplateRef<HTMLElement>('title')
const drawerTitleId = 'point-preview-drawer-title'

const editForm = reactive<EditablePointSnapshot>({
  name: '',
  description: '',
  isFeatured: false
})
const searchQuery = ref('')

const isCandidateSelectionMode = computed(() => {
  return drawerMode.value === 'candidate-select' && Boolean(pendingCitySelection.value)
})

const pendingFallbackPoint = computed(() => pendingCitySelection.value?.fallbackPoint ?? null)

const displayedCandidateItems = computed(() => {
  const cityCandidates = pendingCitySelection.value?.cityCandidates ?? []
  const normalizedQuery = searchQuery.value.trim().toLowerCase()

  return cityCandidates
    .filter((candidate) => {
      if (!normalizedQuery) {
        return true
      }

      return (
        candidate.cityName.toLowerCase().includes(normalizedQuery) ||
        candidate.contextLabel.toLowerCase().includes(normalizedQuery)
      )
    })
    .slice(0, 3)
    .map((candidate) => {
      const existingPoint = findSavedPointByCityId(candidate.cityId)

      return {
        candidate,
        statusHint: existingPoint ? '已存在记录' : candidate.statusHint
      }
    })
})

const sourceSnapshot = computed<EditablePointSnapshot | null>(() => {
  if (!activePoint.value) {
    return null
  }

  return {
    name: activePoint.value.name,
    description: activePoint.value.description,
    isFeatured: activePoint.value.isFeatured
  }
})

const drawerBadge = computed(() => {
  if (isCandidateSelectionMode.value) {
    return '确认城市'
  }

  if (drawerMode.value === 'edit') {
    return '编辑地点'
  }

  return activePoint.value?.source === 'detected' ? '识别结果' : '查看地点'
})

const drawerTitle = computed(() => {
  if (isCandidateSelectionMode.value) {
    return '先确认城市'
  }

  return activePoint.value?.name ?? ''
})

const drawerCountry = computed(() => {
  if (isCandidateSelectionMode.value) {
    return pendingFallbackPoint.value?.countryName ?? ''
  }

  return activePoint.value?.countryName ?? ''
})

const drawerCoordinates = computed(() => {
  if (isCandidateSelectionMode.value) {
    return pendingFallbackPoint.value?.coordinatesLabel ?? ''
  }

  return activePoint.value?.coordinatesLabel ?? ''
})

const drawerFallbackNotice = computed(() => {
  if (isCandidateSelectionMode.value) {
    return pendingFallbackPoint.value?.fallbackNotice ?? null
  }

  return activePoint.value?.fallbackNotice ?? null
})

const isFallbackPrimary = computed(() => {
  return isCandidateSelectionMode.value && drawerFallbackNotice.value === '未能可靠确认城市，已提供国家/地区继续记录'
})

const hasUnsavedChanges = computed(() => {
  if (drawerMode.value !== 'edit' || !sourceSnapshot.value) {
    return false
  }

  return (
    editForm.name !== sourceSnapshot.value.name ||
    editForm.description !== sourceSnapshot.value.description ||
    editForm.isFeatured !== sourceSnapshot.value.isFeatured
  )
})

watch(
  [() => drawerMode.value, () => activePoint.value?.id, () => pendingCitySelection.value?.fallbackPoint.id],
  () => {
    if (drawerMode.value === 'candidate-select') {
      searchQuery.value = ''
    }

    if (!sourceSnapshot.value) {
      editForm.name = ''
      editForm.description = ''
      editForm.isFeatured = false
      return
    }

    editForm.name = sourceSnapshot.value.name
    editForm.description = sourceSnapshot.value.description
    editForm.isFeatured = sourceSnapshot.value.isFeatured
  },
  {
    immediate: true
  }
)

watch(
  [() => activePoint.value?.id, () => drawerMode.value],
  async ([activeId, mode]) => {
    if (!activeId && mode !== 'candidate-select') {
      return
    }

    await nextTick()
    titleRef.value?.focus()
  },
  {
    immediate: true
  }
)

function confirmDiscardChanges() {
  if (!hasUnsavedChanges.value) {
    return true
  }

  return window.confirm('你有未保存的更改，确定关闭吗？')
}

function handleClose() {
  if (!confirmDiscardChanges()) {
    return
  }

  clearActivePoint()
}

function handleEnterEditMode() {
  enterEditMode()
}

function handleCancelEdit() {
  exitEditMode()
}

function handleSave() {
  if (!activePoint.value) {
    return
  }

  const snapshot: EditablePointSnapshot = {
    name: editForm.name.trim() || activePoint.value.name,
    description: editForm.description.trim() || activePoint.value.description,
    isFeatured: editForm.isFeatured
  }

  if (activePoint.value.source === 'detected') {
    saveDraftAsPoint(snapshot)
    return
  }

  updateSavedPoint(activePoint.value.id, snapshot)
}

function handleCandidateClick(candidate: GeoCityCandidate) {
  confirmPendingCitySelection(candidate)
}

function handleFallbackAction() {
  continuePendingWithFallback()
}

function handleDelete() {
  if (!activePoint.value || activePoint.value.source !== 'saved') {
    return
  }

  if (!window.confirm('确定删除这个地点吗？')) {
    return
  }

  deleteUserPoint(activePoint.value.id)
}

function handleHide() {
  if (!activePoint.value || activePoint.value.source !== 'seed') {
    return
  }

  if (!window.confirm('确定隐藏这个预置地点吗？')) {
    return
  }

  hideSeedPoint(activePoint.value.id)
}

function getFocusableElements() {
  if (!panelRef.value) {
    return []
  }

  return Array.from(
    panelRef.value.querySelectorAll<HTMLElement>(
      'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
    )
  ).filter((element) => !element.hasAttribute('disabled') && element.getAttribute('aria-hidden') !== 'true')
}

function handlePanelKeydown(event: KeyboardEvent) {
  if (!activePoint.value && !pendingCitySelection.value) {
    return
  }

  if (event.key === 'Escape') {
    event.preventDefault()
    handleClose()
    return
  }

  if (event.key !== 'Tab') {
    return
  }

  const focusableElements = getFocusableElements()
  const currentFocus = document.activeElement as HTMLElement | null

  if (!focusableElements.length) {
    event.preventDefault()
    titleRef.value?.focus()
    return
  }

  const firstElement = focusableElements[0]
  const lastElement = focusableElements[focusableElements.length - 1]
  const isOnTitle = currentFocus === titleRef.value

  if (event.shiftKey) {
    if (!currentFocus || currentFocus === firstElement || isOnTitle) {
      event.preventDefault()
      lastElement.focus()
    }

    return
  }

  if (!currentFocus || currentFocus === lastElement) {
    event.preventDefault()
    firstElement.focus()
  }
}
</script>

<template>
  <aside
    v-if="activePoint || pendingCitySelection"
    ref="panel"
    class="point-preview-drawer"
    role="dialog"
    aria-modal="false"
    :aria-labelledby="drawerTitleId"
    data-region="point-preview-drawer"
    @keydown="handlePanelKeydown"
  >
    <div class="point-preview-drawer__header">
      <p class="point-preview-drawer__badge">{{ drawerBadge }}</p>
      <button class="point-preview-drawer__close" type="button" @click="handleClose">
        关闭面板
      </button>
      <h2
        :id="drawerTitleId"
        ref="title"
        class="point-preview-drawer__name"
        tabindex="-1"
      >
        {{ drawerTitle }}
      </h2>
      <p class="point-preview-drawer__country">{{ drawerCountry }}</p>
      <p class="point-preview-drawer__coordinate">{{ drawerCoordinates }}</p>
      <p
        v-if="drawerFallbackNotice"
        class="point-preview-drawer__fallback"
        role="status"
      >
        {{ drawerFallbackNotice }}
      </p>
    </div>

    <div class="point-preview-drawer__content">
      <div class="point-preview-drawer__scroll-region" data-scroll-region="true">
        <template v-if="drawerMode === 'edit'">
          <label class="point-preview-drawer__field">
            <span class="point-preview-drawer__field-label">名称</span>
            <input v-model="editForm.name" class="point-preview-drawer__input" type="text" />
          </label>

          <label class="point-preview-drawer__field">
            <span class="point-preview-drawer__field-label">简介</span>
            <textarea v-model="editForm.description" class="point-preview-drawer__textarea" rows="6"></textarea>
          </label>

          <label class="point-preview-drawer__toggle">
            <input v-model="editForm.isFeatured" type="checkbox" />
            <span>点亮状态</span>
          </label>
        </template>

        <template v-else-if="isCandidateSelectionMode">
          <label class="point-preview-drawer__field">
            <span class="point-preview-drawer__field-label">搜索城市</span>
            <input
              v-model="searchQuery"
              class="point-preview-drawer__input"
              type="text"
              placeholder="搜索城市"
            />
          </label>

          <div class="point-preview-drawer__candidate-list">
            <button
              v-for="item in displayedCandidateItems"
              :key="item.candidate.cityId"
              class="point-preview-drawer__candidate"
              type="button"
              @click="handleCandidateClick(item.candidate)"
            >
              <span class="point-preview-drawer__candidate-name">{{ item.candidate.cityName }}</span>
              <span class="point-preview-drawer__candidate-context">{{ item.candidate.contextLabel }}</span>
              <span class="point-preview-drawer__candidate-hint">{{ item.statusHint }}</span>
            </button>
          </div>

          <p
            v-if="!displayedCandidateItems.length"
            class="point-preview-drawer__empty"
          >
            没有匹配城市，请按国家/地区继续记录
          </p>
        </template>

        <p v-else class="point-preview-drawer__description">{{ activePoint?.description }}</p>
      </div>
    </div>

    <div
      class="point-preview-drawer__actions"
      :class="{
        'point-preview-drawer__actions--edit': drawerMode === 'edit'
      }"
    >
      <template v-if="drawerMode === 'candidate-select'">
        <button
          class="point-preview-drawer__action"
          :class="{
            'point-preview-drawer__action--primary': isFallbackPrimary
          }"
          type="button"
          @click="handleFallbackAction"
        >
          按国家/地区继续记录
        </button>
      </template>

      <template v-else-if="drawerMode === 'detected-preview'">
        <button class="point-preview-drawer__action point-preview-drawer__action--primary" type="button" @click="handleEnterEditMode">
          保存为地点
        </button>
      </template>

      <template v-else-if="drawerMode === 'view'">
        <button class="point-preview-drawer__action point-preview-drawer__action--primary" type="button" @click="handleEnterEditMode">
          编辑
        </button>
        <button
          v-if="activePoint?.source === 'saved'"
          class="point-preview-drawer__action point-preview-drawer__action--danger"
          type="button"
          @click="handleDelete"
        >
          删除
        </button>
        <button
          v-if="activePoint?.source === 'seed'"
          class="point-preview-drawer__action"
          type="button"
          @click="handleHide"
        >
          隐藏
        </button>
      </template>

      <template v-else-if="drawerMode === 'edit'">
        <button class="point-preview-drawer__action point-preview-drawer__action--primary" type="button" @click="handleSave">
          保存
        </button>
        <button class="point-preview-drawer__action" type="button" @click="handleCancelEdit">
          取消
        </button>
      </template>
    </div>
  </aside>
</template>

<style scoped>
.point-preview-drawer {
  position: absolute;
  inset-inline: var(--space-md);
  bottom: var(--space-md);
  z-index: 3;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  gap: var(--space-md);
  max-height: min(32rem, calc(100vh - 8.5rem));
  padding: var(--space-lg);
  border: 1px solid rgba(143, 117, 80, 0.62);
  background:
    linear-gradient(180deg, rgba(241, 230, 204, 0.96), rgba(230, 210, 176, 0.98)),
    var(--color-surface);
  box-shadow: 0 22px 36px rgba(73, 49, 31, 0.18);
  backdrop-filter: blur(2px);
  overflow: hidden;
}

.point-preview-drawer__header {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: start;
  gap: var(--space-sm) var(--space-md);
}

.point-preview-drawer__close:focus-visible,
.point-preview-drawer__candidate:focus-visible,
.point-preview-drawer__input:focus-visible,
.point-preview-drawer__textarea:focus-visible,
.point-preview-drawer__action:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--color-accent) 72%, white 28%);
  outline-offset: 3px;
}

.point-preview-drawer__close {
  justify-self: end;
  min-width: 44px;
  min-height: 44px;
  padding: 0.65rem 0.95rem;
  border: 1px solid rgba(200, 100, 59, 0.38);
  background: rgba(252, 247, 236, 0.94);
  color: var(--color-accent);
  font-size: var(--font-label-size);
  font-weight: var(--font-weight-label);
  cursor: pointer;
}

.point-preview-drawer__name,
.point-preview-drawer__country,
.point-preview-drawer__coordinate,
.point-preview-drawer__description {
  margin: 0;
}

.point-preview-drawer__badge {
  width: fit-content;
  margin: 0;
  padding: 0.3rem 0.6rem;
  border: 1px solid rgba(200, 100, 59, 0.55);
  color: var(--color-accent);
  font-size: var(--font-label-size);
  font-weight: var(--font-weight-label);
  line-height: var(--font-label-line-height);
}

.point-preview-drawer__name {
  grid-column: 1 / -1;
  color: var(--color-ink-strong);
  font-size: var(--font-heading-size);
  font-weight: var(--font-weight-heading);
  line-height: var(--font-heading-line-height);
}

.point-preview-drawer__country,
.point-preview-drawer__coordinate {
  grid-column: 1 / -1;
  color: var(--color-ink-muted);
  font-size: var(--font-label-size);
  line-height: var(--font-label-line-height);
}

.point-preview-drawer__fallback {
  grid-column: 1 / -1;
  margin: 0;
  color: var(--color-accent);
  font-size: var(--font-label-size);
  font-weight: var(--font-weight-label);
  line-height: var(--font-label-line-height);
}

.point-preview-drawer__content {
  min-height: 0;
}

.point-preview-drawer__scroll-region {
  display: grid;
  gap: var(--space-md);
  max-height: 100%;
  overflow-y: auto;
  padding-inline-end: 0.15rem;
}

.point-preview-drawer__description {
  max-width: 30rem;
  white-space: pre-wrap;
  word-break: break-word;
}

.point-preview-drawer__candidate-list {
  display: grid;
  gap: var(--space-sm);
}

.point-preview-drawer__candidate {
  display: grid;
  gap: 0.18rem;
  justify-items: start;
  padding: 0.85rem 0.95rem;
  border: 1px solid rgba(143, 117, 80, 0.38);
  background: rgba(252, 247, 236, 0.88);
  color: var(--color-ink-strong);
  text-align: left;
  cursor: pointer;
}

.point-preview-drawer__candidate-name,
.point-preview-drawer__candidate-context,
.point-preview-drawer__candidate-hint,
.point-preview-drawer__empty {
  margin: 0;
}

.point-preview-drawer__candidate-name {
  font-weight: var(--font-weight-label);
}

.point-preview-drawer__candidate-context,
.point-preview-drawer__empty {
  color: var(--color-ink-muted);
  font-size: var(--font-label-size);
  line-height: var(--font-label-line-height);
}

.point-preview-drawer__candidate-hint {
  color: var(--color-accent);
  font-size: var(--font-label-size);
  line-height: var(--font-label-line-height);
}

.point-preview-drawer__field {
  display: grid;
  gap: var(--space-xs);
}

.point-preview-drawer__field-label,
.point-preview-drawer__toggle {
  color: var(--color-ink-strong);
  font-size: var(--font-label-size);
  font-weight: var(--font-weight-label);
  line-height: var(--font-label-line-height);
}

.point-preview-drawer__toggle {
  display: inline-flex;
  align-items: center;
  gap: var(--space-sm);
}

.point-preview-drawer__input,
.point-preview-drawer__textarea {
  width: 100%;
  border: 1px solid rgba(143, 117, 80, 0.48);
  background: rgba(252, 247, 236, 0.9);
  color: var(--color-ink-strong);
  font: inherit;
}

.point-preview-drawer__input {
  min-height: 2.75rem;
  padding: 0.75rem 0.85rem;
}

.point-preview-drawer__textarea {
  min-height: 7rem;
  padding: 0.75rem 0.85rem;
  resize: vertical;
}

.point-preview-drawer__actions {
  position: sticky;
  bottom: 0;
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
  padding-top: var(--space-sm);
  border-top: 1px solid rgba(143, 117, 80, 0.24);
  background: linear-gradient(180deg, rgba(230, 210, 176, 0.18), rgba(230, 210, 176, 0.9));
}

.point-preview-drawer__action {
  min-width: 44px;
  min-height: 44px;
  padding: 0.65rem 1rem;
  border: 1px solid rgba(143, 117, 80, 0.45);
  background: rgba(252, 247, 236, 0.88);
  color: var(--color-ink-strong);
  cursor: pointer;
}

.point-preview-drawer__action--primary {
  border-color: rgba(200, 100, 59, 0.58);
  color: var(--color-accent);
}

.point-preview-drawer__action--danger {
  border-color: rgba(141, 62, 47, 0.48);
  color: #8d3e2f;
}

@media (min-width: 960px) {
  .point-preview-drawer {
    inset-inline: auto var(--space-lg);
    top: var(--space-lg);
    bottom: auto;
    width: min(23rem, calc(100% - var(--space-3xl)));
    max-height: min(36rem, calc(100vh - 8rem));
    min-height: 20rem;
  }

  .point-preview-drawer__actions {
    position: static;
    padding-top: 0;
    border-top: 0;
    background: transparent;
  }
}
</style>
