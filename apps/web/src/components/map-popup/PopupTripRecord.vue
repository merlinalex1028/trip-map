<script setup lang="ts">
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'

import type { UpdateTravelRecordRequest } from '@trip-map/contracts'
import type { TimelineEntry } from '../../services/timeline'
import { useMapPointsStore } from '../../stores/map-points'
import { checkDateConflict } from '../../services/date-conflict'
import ConfirmDialog from '../timeline/ConfirmDialog.vue'
import TimelineEditForm from '../timeline/TimelineEditForm.vue'

const props = defineProps<{
  entry: TimelineEntry
}>()

const mapPointsStore = useMapPointsStore()
const { tripsByPlaceId } = storeToRefs(mapPointsStore)

const isEditing = ref(false)
const isSubmitting = ref(false)
const isDeleteDialogOpen = ref(false)

const maxVisibleTags = 3

const dateLabel = computed(() => {
  if (props.entry.startDate === null) {
    return '日期未知'
  }

  if (props.entry.endDate !== null) {
    return `${props.entry.startDate} - ${props.entry.endDate}`
  }

  return props.entry.startDate
})

const notesPreview = computed(() => {
  if (!props.entry.notes) return null
  if (props.entry.notes.length <= 80) return props.entry.notes
  return `${props.entry.notes.slice(0, 80)}...`
})

const visibleTags = computed(() => props.entry.tags.slice(0, maxVisibleTags))
const hiddenTagsCount = computed(() =>
  props.entry.tags.length > maxVisibleTags ? props.entry.tags.length - maxVisibleTags : 0,
)

const conflictingDates = computed(() => {
  if (!isEditing.value) return []
  return checkDateConflict(
    props.entry.placeId,
    props.entry.recordId,
    props.entry.startDate,
    props.entry.endDate,
    tripsByPlaceId.value,
  )
})

const deleteDialogConfig = computed(() => {
  if (props.entry.visitCount === 1) {
    return {
      title: '删除该地点最后一条记录',
      message: '这是该地点的唯一一条记录，删除后将取消该地点的点亮状态。确认删除？',
      tone: 'destructive' as const,
    }
  }
  return {
    title: '删除旅行记录',
    message: '确认删除这条旅行记录？',
    tone: 'default' as const,
  }
})

function handleEditClick() {
  isEditing.value = true
}

function handleEditCancel() {
  isEditing.value = false
}

async function handleEditSubmit(payload: UpdateTravelRecordRequest) {
  isSubmitting.value = true
  try {
    await mapPointsStore.updateRecord(props.entry.recordId, payload)
    isEditing.value = false
  } finally {
    isSubmitting.value = false
  }
}

function handleDeleteClick() {
  isDeleteDialogOpen.value = true
}

function handleDeleteCancel() {
  isDeleteDialogOpen.value = false
}

async function handleDeleteConfirm() {
  await mapPointsStore.deleteSingleRecord(props.entry.recordId)
  isDeleteDialogOpen.value = false
}
</script>

<template>
  <article
    class="grid gap-2 rounded-2xl border border-[#cae8ef] bg-[linear-gradient(180deg,rgba(235,249,253,0.85),rgba(255,255,255,0.92))] p-3"
    data-region="popup-trip-record"
    :data-popup-record-id="entry.recordId"
  >
    <!-- 编辑模式 -->
    <TimelineEditForm
      v-if="isEditing"
      :record="entry"
      :conflicting-dates="conflictingDates"
      :is-submitting="isSubmitting"
      @submit="handleEditSubmit"
      @cancel="handleEditCancel"
    />

    <!-- 只读模式 -->
    <template v-else>
      <!-- 日期显示 -->
      <div class="grid gap-1">
        <p class="text-[0.72rem] font-semibold tracking-[0.08em] text-[var(--color-ink-soft)] uppercase">
          旅行日期
        </p>
        <p class="text-sm font-semibold text-[var(--color-ink-strong)]">
          {{ dateLabel }}
        </p>
      </div>

      <!-- 备注预览 -->
      <p
        v-if="notesPreview"
        class="text-xs leading-5 text-[var(--color-ink-muted)]"
      >
        {{ notesPreview }}
      </p>

      <!-- 标签显示（最多 3 个） -->
      <div
        v-if="entry.tags.length > 0"
        class="flex flex-wrap gap-1.5"
      >
        <span
          v-for="tag in visibleTags"
          :key="tag"
          class="inline-flex items-center rounded-full border border-[var(--color-accent-soft)] bg-[var(--color-accent-soft)]/30 px-2.5 py-0.5 text-[0.68rem] font-semibold text-[var(--color-ink-strong)]"
        >
          {{ tag }}
        </span>
        <span
          v-if="hiddenTagsCount > 0"
          class="inline-flex items-center text-[0.68rem] font-semibold text-[var(--color-ink-soft)]"
        >
          +{{ hiddenTagsCount }} more
        </span>
      </div>

      <!-- 操作栏 -->
      <div class="flex gap-2 pt-1">
        <button
          type="button"
          class="min-h-8 rounded-full border border-[#d6ebf2] bg-[#effafc] px-3 text-[0.7rem] font-semibold text-[var(--color-ink-strong)] transition-all duration-300 ease-out hover:scale-105 active:scale-95"
          data-popup-edit
          @click="handleEditClick"
        >
          编辑
        </button>
        <button
          type="button"
          class="min-h-8 rounded-full border border-[#e8c4c4] bg-[#fef2f2] px-3 text-[0.7rem] font-semibold text-[var(--color-destructive)] transition-all duration-300 ease-out hover:scale-105 active:scale-95"
          data-popup-delete
          @click="handleDeleteClick"
        >
          删除
        </button>
      </div>
    </template>
  </article>

  <!-- 删除确认弹窗 -->
  <ConfirmDialog
    :is-open="isDeleteDialogOpen"
    :title="deleteDialogConfig.title"
    :message="deleteDialogConfig.message"
    :tone="deleteDialogConfig.tone"
    confirm-label="确认删除"
    cancel-label="取消"
    @confirm="handleDeleteConfirm"
    @cancel="handleDeleteCancel"
  />
</template>

<style scoped>
@media (prefers-reduced-motion: reduce) {
  button {
    transform: none !important;
    transition: none !important;
  }
}
</style>
