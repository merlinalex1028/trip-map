<script setup lang="ts">
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'

import type { UpdateTravelRecordRequest } from '@trip-map/contracts'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { TimelineEntry } from '../../services/timeline'
import { useMapPointsStore } from '../../stores/map-points'
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
      :trips-by-place-id="tripsByPlaceId"
      :is-submitting="isSubmitting"
      @submit="handleEditSubmit"
      @cancel="handleEditCancel"
    />

    <template v-else>
      <div class="grid gap-5 md:grid-cols-[minmax(0,1fr)_minmax(180px,240px)] md:items-start">
        <div class="min-w-0 space-y-4">
          <header class="space-y-2">
            <div class="flex items-start justify-between gap-3">
              <div class="flex min-w-0 flex-wrap items-center gap-2">
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

              <DropdownMenu>
                <DropdownMenuTrigger as-child>
                  <button
                    type="button"
                    class="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-full border border-white/85 bg-white/80 text-[18px] font-semibold leading-none text-[var(--color-ink-soft)] shadow-[0_10px_24px_rgba(160,130,190,0.12)] transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)] active:scale-95"
                    data-card-management
                    aria-label="管理这条旅行记录"
                  >
                    <span aria-hidden="true">...</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  class="min-w-[7rem] rounded-[20px]"
                >
                  <DropdownMenuItem
                    data-card-edit
                    @click="handleEditClick"
                  >
                    编辑
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    data-card-delete
                    variant="destructive"
                    @click="handleDeleteClick"
                  >
                    删除
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
