<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed, nextTick, reactive, useTemplateRef, watch, type CSSProperties } from 'vue'

import { useMapPointsStore } from '../../../../src/stores/map-points'
import type { EditablePointSnapshot } from '../../../../src/types/map-point'

const props = withDefaults(
  defineProps<{
    floatingStyles?: CSSProperties | null
    anchorSource?: 'marker' | 'pending' | 'boundary'
  }>(),
  {
    floatingStyles: null,
    anchorSource: 'marker'
  }
)

const mapPointsStore = useMapPointsStore()
const { activeBoundaryCoverageState, activePoint, drawerMode } = storeToRefs(mapPointsStore)
const {
  closeDrawer,
  enterEditMode,
  exitEditMode,
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

const isDrawerVisible = computed(() => {
  return Boolean(activePoint.value) && (drawerMode.value === 'view' || drawerMode.value === 'edit')
})

const drawerStyles = computed(() => ({
  '--point-preview-popup-min-width': '300px',
  '--point-preview-popup-max-width': '360px',
  ...(props.floatingStyles ?? {})
}))

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
  if (drawerMode.value === 'edit') {
    return '编辑地点'
  }

  return activePoint.value?.source === 'detected' ? '识别结果' : '查看地点'
})

const drawerTitle = computed(() => activePoint.value?.name ?? '')
const drawerCountry = computed(() => activePoint.value?.countryName ?? '')
const drawerCoordinates = computed(() => activePoint.value?.coordinatesLabel ?? '')
const drawerFallbackNotice = computed(() => activePoint.value?.fallbackNotice ?? null)

const drawerBoundarySupportNotice = computed(() => {
  if (activeBoundaryCoverageState.value !== 'missing') {
    return null
  }

  return '当前城市暂不支持边界高亮，将仅保存城市身份与文本信息'
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
  [() => drawerMode.value, () => activePoint.value?.id],
  () => {
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
  [() => activePoint.value?.id, () => drawerMode.value, () => isDrawerVisible.value],
  async ([activeId, mode, visible]) => {
    if (!activeId || !visible || (mode !== 'view' && mode !== 'edit')) {
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

  closeDrawer()
}

function handleEnterEditMode() {
  enterEditMode()
}

function handleCancelEdit() {
  if (!confirmDiscardChanges()) {
    return
  }

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

function getPopupElement() {
  return panelRef.value
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
  if (!isDrawerVisible.value) {
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

defineExpose({
  getPopupElement
})
</script>

<template>
  <aside
    v-if="isDrawerVisible"
    ref="panel"
    class="point-preview-drawer"
    :data-drawer-mode="drawerMode"
    role="dialog"
    aria-modal="false"
    :aria-labelledby="drawerTitleId"
    :data-popup-anchor-source="anchorSource"
    :style="drawerStyles"
    data-region="point-preview-drawer"
    @keydown="handlePanelKeydown"
    @click.stop
  >
    <div class="point-preview-drawer__arrow" aria-hidden="true"></div>
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
        data-notice-tone="fallback"
        role="status"
      >
        {{ drawerFallbackNotice }}
      </p>
      <p
        v-if="drawerBoundarySupportNotice"
        class="point-preview-drawer__fallback point-preview-drawer__fallback--boundary"
        data-notice-tone="fallback"
        role="status"
      >
        {{ drawerBoundarySupportNotice }}
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

        <div v-else class="point-preview-drawer__detail">
          <p class="point-preview-drawer__description">{{ activePoint?.description }}</p>
        </div>
      </div>
    </div>

    <div
      class="point-preview-drawer__actions"
      :class="{
        'point-preview-drawer__actions--edit': drawerMode === 'edit'
      }"
    >
      <template v-if="drawerMode === 'view'">
        <button class="point-preview-drawer__action point-preview-drawer__action--primary" type="button" @click="handleEnterEditMode">
          编辑地点
        </button>
      </template>

      <template v-else-if="drawerMode === 'edit'">
        <button class="point-preview-drawer__action" type="button" @click="handleCancelEdit">
          放弃编辑
        </button>
        <button class="point-preview-drawer__action point-preview-drawer__action--primary" type="button" @click="handleSave">
          保存
        </button>
      </template>
    </div>
  </aside>
</template>

<style scoped>
.point-preview-drawer {
  position: absolute;
  z-index: 4;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  gap: var(--space-md);
  min-width: var(--point-preview-popup-min-width);
  max-width: var(--point-preview-popup-max-width);
  min-height: 0;
  padding: var(--space-lg);
  border: 1px solid rgba(199, 171, 200, 0.58);
  border-radius: var(--radius-surface);
  background: linear-gradient(180deg, rgba(255, 249, 252, 0.98), rgba(232, 244, 251, 0.92));
  overflow: hidden;
  box-shadow: var(--shadow-stage);
}

.point-preview-drawer__arrow {
  position: absolute;
  left: 1.5rem;
  top: 100%;
  width: 1rem;
  height: 1rem;
  border-right: 1px solid rgba(199, 171, 200, 0.58);
  border-bottom: 1px solid rgba(199, 171, 200, 0.58);
  background: linear-gradient(180deg, rgba(255, 249, 252, 0.98), rgba(232, 244, 251, 0.92));
  transform: translateY(-50%) rotate(45deg);
}

.point-preview-drawer__header {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: start;
  gap: var(--space-sm) var(--space-md);
}

.point-preview-drawer__close:focus-visible,
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
  border: 1px solid rgba(199, 171, 200, 0.48);
  border-radius: var(--radius-control);
  background: rgba(255, 252, 253, 0.94);
  color: var(--color-ink-strong);
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
  border: 1px solid rgba(199, 171, 200, 0.48);
  border-radius: var(--radius-pill);
  background: rgba(255, 220, 232, 0.66);
  color: var(--color-ink-strong);
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
  padding: 0.75rem 0.85rem;
  border: 1px dashed rgba(184, 198, 217, 0.84);
  border-radius: var(--radius-control);
  background: rgba(238, 243, 248, 0.96);
  color: var(--color-ink-strong);
  font-size: var(--font-label-size);
  font-weight: var(--font-weight-label);
  line-height: var(--font-label-line-height);
}

.point-preview-drawer__content {
  display: flex;
  flex: 1 1 auto;
  min-height: 0;
  overflow: hidden;
}

.point-preview-drawer__scroll-region {
  display: grid;
  flex: 1 1 auto;
  gap: var(--space-md);
  min-height: 0;
  overflow-y: auto;
  padding-inline-end: 0.15rem;
  overscroll-behavior: contain;
}

.point-preview-drawer__description {
  max-width: 30rem;
  white-space: pre-wrap;
  word-break: break-word;
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
  border: 1px solid rgba(199, 171, 200, 0.48);
  border-radius: var(--radius-control);
  background: rgba(255, 252, 253, 0.94);
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
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
  padding-top: var(--space-sm);
  border-top: 1px solid rgba(199, 171, 200, 0.28);
  background: linear-gradient(180deg, rgba(255, 252, 253, 0.28), rgba(232, 244, 251, 0.76));
}

.point-preview-drawer__action {
  min-width: 44px;
  min-height: 44px;
  padding: 0.65rem 1rem;
  border: 1px solid rgba(199, 171, 200, 0.48);
  border-radius: var(--radius-control);
  background: rgba(255, 252, 253, 0.92);
  color: var(--color-ink-strong);
  cursor: pointer;
}

.point-preview-drawer__action--primary {
  border-color: rgba(244, 143, 177, 0.56);
  background: rgba(255, 220, 232, 0.88);
  color: var(--color-ink-strong);
}

.point-preview-drawer__action--danger {
  border-color: rgba(141, 62, 47, 0.48);
  color: #8d3e2f;
}
</style>
