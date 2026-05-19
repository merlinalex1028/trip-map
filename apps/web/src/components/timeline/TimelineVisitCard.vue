<script setup lang="ts">
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'

import type { UpdateTravelRecordRequest } from '@trip-map/contracts'
import type { TimelineEntry } from '../../services/timeline'
import { useMapPointsStore } from '../../stores/map-points'
import { checkDateConflict } from '../../services/date-conflict'
import ConfirmDialog from './ConfirmDialog.vue'
import JournalPostcardThumb from './JournalPostcardThumb.vue'
import TimelineEditForm from './TimelineEditForm.vue'
import {
  getJournalLocationPath,
  getJournalPostcardVariant,
  getJournalSummary,
  getVisibleJournalTags,
} from './journal-thumbnails'

const props = defineProps<{
  entry: TimelineEntry
}>()

const mapPointsStore = useMapPointsStore()
const { tripsByPlaceId } = storeToRefs(mapPointsStore)

const isEditing = ref(false)
const isSubmitting = ref(false)
const isDeleteDialogOpen = ref(false)

const dateLabel = computed(() => {
  if (props.entry.startDate === null) {
    return '日期未知'
  }

  if (props.entry.endDate !== null) {
    return `${props.entry.startDate} - ${props.entry.endDate}`
  }

  return props.entry.startDate
})

const journalSummary = computed(() => getJournalSummary(props.entry.notes))
const journalLocationPath = computed(() => getJournalLocationPath(props.entry))
const journalPostcardVariant = computed(() => getJournalPostcardVariant(props.entry))
const visibleTags = computed(() => getVisibleJournalTags(props.entry.tags))

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
    <TimelineEditForm
      v-if="isEditing"
      :record="entry"
      :conflicting-dates="conflictingDates"
      :is-submitting="isSubmitting"
      @submit="handleEditSubmit"
      @cancel="handleEditCancel"
    />

    <template v-else>
      <div class="grid gap-5 md:grid-cols-[minmax(0,1fr)_minmax(180px,240px)] md:items-start">
        <div class="min-w-0 space-y-4">
          <header class="space-y-2">
            <div class="flex flex-wrap items-center gap-2">
              <p class="text-[var(--font-label-size)] font-semibold leading-[1.4] text-[var(--color-ink-soft)]">
                {{ dateLabel }}
              </p>
              <p
                v-if="entry.visitCount > 1"
                class="inline-flex w-fit items-center rounded-full border border-white/85 bg-white/88 px-3 py-1 text-[var(--font-label-size)] font-semibold leading-[1.4] text-[var(--color-ink-soft)]"
              >
                第 {{ entry.visitOrdinal }} 次 / 共 {{ entry.visitCount }} 次
              </p>
            </div>

            <h3 class="text-[24px] font-semibold leading-[1.2] text-[var(--color-ink-strong)]">
              {{ entry.displayName }}
            </h3>

            <p class="text-[var(--font-label-size)] font-semibold leading-[1.4] text-[var(--color-ink-muted)]">
              {{ journalLocationPath }}
            </p>
          </header>

          <div class="space-y-2">
            <p class="text-[var(--font-label-size)] font-semibold leading-[1.4] text-[var(--color-accent-strong)]">
              旅行摘记
            </p>
            <p class="line-clamp-3 text-[16px] font-normal leading-[1.5] text-[var(--color-ink-strong)] md:line-clamp-2">
              {{ journalSummary }}
            </p>
          </div>

          <div
            v-if="visibleTags.visible.length > 0"
            class="flex flex-wrap gap-2"
          >
            <span
              v-for="tag in visibleTags.visible"
              :key="tag"
              class="inline-flex items-center rounded-full border border-[#f6d6e6] bg-[#fff0f7] px-3 py-1 text-[var(--font-label-size)] font-semibold leading-[1.4] text-[var(--color-ink-strong)] shadow-[0_6px_16px_rgba(244,143,177,0.16)]"
              data-journal-tag
            >
              {{ tag }}
            </span>
            <span
              v-if="visibleTags.hiddenCount > 0"
              class="inline-flex items-center rounded-full border border-[#dce5ff] bg-[#eef4ff] px-3 py-1 text-[var(--font-label-size)] font-semibold leading-[1.4] text-[var(--color-ink-soft)]"
              data-journal-tags-more
            >
              +{{ visibleTags.hiddenCount }}
            </span>
          </div>
        </div>

        <JournalPostcardThumb :variant="journalPostcardVariant" />
      </div>

      <div class="flex gap-3 pt-1">
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
