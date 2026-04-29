<script setup lang="ts">
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'

import type { UpdateTravelRecordRequest } from '@trip-map/contracts'
import type { TimelineEntry } from '../../services/timeline'
import { useMapPointsStore } from '../../stores/map-points'
import { checkDateConflict } from '../../services/date-conflict'
import ConfirmDialog from './ConfirmDialog.vue'
import TimelineEditForm from './TimelineEditForm.vue'

const props = defineProps<{
  entry: TimelineEntry
}>()

const mapPointsStore = useMapPointsStore()
const { tripsByPlaceId } = storeToRefs(mapPointsStore)

const isEditing = ref(false)
const isSubmitting = ref(false)
const isDeleteDialogOpen = ref(false)

const secondaryLabel = computed(() => props.entry.subtitle || props.entry.parentLabel)

const dateLabel = computed(() => {
  if (props.entry.startDate === null) {
    return '日期未知'
  }

  if (props.entry.endDate !== null) {
    return `${props.entry.startDate} - ${props.entry.endDate}`
  }

  return props.entry.startDate
})

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
    class="grid gap-4 rounded-[28px] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(255,246,250,0.94))] p-5 shadow-[var(--shadow-float)]"
    data-region="timeline-entry"
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
      <header class="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-start">
        <div class="min-w-0 space-y-2">
          <div class="flex flex-wrap items-center gap-2">
            <h3 class="text-xl font-semibold text-[var(--color-ink-strong)]">
              {{ entry.displayName }}
            </h3>
            <span
              class="inline-flex items-center rounded-full border border-[#d6ebf2] bg-[#effafc] px-3 py-1 text-xs font-semibold text-[var(--color-ink-strong)]"
            >
              {{ entry.typeLabel }}
            </span>
          </div>
          <p class="text-sm leading-6 text-[var(--color-ink-muted)]">
            {{ secondaryLabel }}
          </p>
        </div>

        <p
          class="inline-flex w-fit items-center rounded-full border border-white/85 bg-white/88 px-3 py-1 text-xs font-semibold text-[var(--color-ink-soft)]"
        >
          <template v-if="entry.visitCount > 1">第 {{ entry.visitOrdinal }} 次 / 共 {{ entry.visitCount }} 次</template>
          <template v-else>首次记录</template>
        </p>
      </header>

      <div class="grid gap-3 md:grid-cols-2">
        <div class="rounded-[22px] border border-white/85 bg-white/78 p-4">
          <p class="text-[0.72rem] font-semibold tracking-[0.08em] text-[var(--color-ink-soft)] uppercase">
            旅行日期
          </p>
          <p class="mt-2 text-base font-semibold text-[var(--color-ink-strong)]">
            {{ dateLabel }}
          </p>
        </div>

        <div class="rounded-[22px] border border-white/85 bg-white/78 p-4">
          <p class="text-[0.72rem] font-semibold tracking-[0.08em] text-[var(--color-ink-soft)] uppercase">
            国家 / 地区
          </p>
          <p class="mt-2 text-base font-semibold text-[var(--color-ink-strong)]">
            {{ entry.parentLabel }}
          </p>
        </div>
      </div>

      <!-- 备注显示 -->
      <div
        v-if="entry.notes"
        class="rounded-[22px] border border-white/85 bg-white/78 p-4"
      >
        <p class="text-[0.72rem] font-semibold tracking-[0.08em] text-[var(--color-ink-soft)] uppercase">
          备注
        </p>
        <p class="mt-2 text-sm leading-6 text-[var(--color-ink-strong)]">
          {{ entry.notes }}
        </p>
      </div>

      <!-- 标签显示 -->
      <div
        v-if="entry.tags && entry.tags.length > 0"
        class="flex flex-wrap gap-2"
      >
        <span
          v-for="tag in entry.tags"
          :key="tag"
          class="inline-flex items-center rounded-full border border-[var(--color-accent-soft)] bg-[var(--color-accent-soft)]/30 px-3 py-1 text-xs font-semibold text-[var(--color-ink-strong)]"
        >
          {{ tag }}
        </span>
      </div>

      <!-- 操作栏 -->
      <div class="flex gap-3 border-t border-white/80 pt-4">
        <button
          type="button"
          class="min-h-9 rounded-full border border-[#d6ebf2] bg-[#effafc] px-4 text-xs font-semibold text-[var(--color-ink-strong)] transition-all duration-300 ease-out hover:scale-105 active:scale-95"
          data-card-edit
          @click="handleEditClick"
        >
          编辑
        </button>
        <button
          type="button"
          class="min-h-9 rounded-full border border-[#e8c4c4] bg-[#fef2f2] px-4 text-xs font-semibold text-[var(--color-destructive)] transition-all duration-300 ease-out hover:scale-105 active:scale-95"
          data-card-delete
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
