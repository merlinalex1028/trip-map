<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import { storeToRefs } from 'pinia'
import { DotsHorizontalIcon } from '@radix-icons/vue'

import type { UpdateTravelRecordRequest } from '@trip-map/contracts'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
} from './journal-thumbnails'

const props = defineProps<{
  entry: TimelineEntry
}>()

const mapPointsStore = useMapPointsStore()
const { tripsByPlaceId } = storeToRefs(mapPointsStore)

const isEditDialogOpen = shallowRef(false)
const isSubmitting = shallowRef(false)
const isDeleteDialogOpen = shallowRef(false)

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
  isEditDialogOpen.value = true
}

function handleEditOpenChange(nextOpen: boolean) {
  if (!nextOpen && isSubmitting.value) {
    return
  }

  isEditDialogOpen.value = nextOpen
}

function handleEditCancel() {
  if (isSubmitting.value) {
    return
  }

  isEditDialogOpen.value = false
}

async function handleEditSubmit(payload: UpdateTravelRecordRequest) {
  isSubmitting.value = true
  try {
    const wasUpdated = await mapPointsStore.updateRecord(props.entry.recordId, payload)
    if (wasUpdated) {
      isEditDialogOpen.value = false
    }
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
  const wasDeleted = await mapPointsStore.deleteSingleRecord(props.entry.recordId)
  if (wasDeleted) {
    isDeleteDialogOpen.value = false
  }
}
</script>

<template>
  <article
    class="timeline-entry-card relative grid min-w-0 gap-4 overflow-hidden rounded-[26px] border border-[#eee7f8] bg-[rgba(255,255,255,0.72)] p-5 shadow-[0_16px_38px_rgba(139,111,239,0.08)] backdrop-blur-[2px] transition duration-[var(--motion-emphasis)] hover:-translate-y-0.5 hover:border-[#e7dafa] hover:bg-white/82 md:min-h-[170px] md:px-8 md:py-5"
    data-region="timeline-entry"
  >
    <div class="grid min-w-0 gap-5 md:grid-cols-[minmax(0,1fr)_230px] md:items-center md:gap-8">
      <div class="min-w-0">
        <div class="flex items-start justify-between gap-3">
          <div class="flex min-w-0 flex-wrap items-center gap-2">
            <p class="text-[19px] font-extrabold leading-[1.3] text-[var(--color-accent)] md:text-[20px]">
              {{ dateLabel }}
            </p>
            <p
              v-if="entry.visitCount > 1"
              class="inline-flex w-fit items-center rounded-full border border-[#eadff8] bg-white/72 px-2.5 py-0.5 text-[12px] font-bold leading-5 text-[var(--color-ink-soft)]"
            >
              第 {{ entry.visitOrdinal }} 次 / 共 {{ entry.visitCount }} 次
            </p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <button
                type="button"
                class="timeline-entry-card__menu-button inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-transparent bg-transparent text-[var(--color-ink-soft)] opacity-70 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-[#eadff8] hover:bg-white/82 hover:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)] active:scale-95"
                data-card-management
                aria-label="管理这条旅行记录"
              >
                <DotsHorizontalIcon
                  class="h-4 w-4"
                  aria-hidden="true"
                />
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

        <h3
          class="mt-2 min-w-0 break-words text-[26px] font-extrabold leading-[1.18] text-[var(--color-ink-strong)]"
          data-card-title
        >
          {{ entry.displayName }}
        </h3>

        <p
          class="mt-2 min-w-0 break-words text-[16px] font-bold leading-6 text-[var(--color-ink-muted)]"
          data-card-location
        >
          {{ journalLocationPath }}
        </p>

        <p
          class="mt-2 min-w-0 break-words line-clamp-2 text-[16px] font-semibold leading-6 text-[var(--color-ink-muted)]"
          data-card-summary
        >
          {{ journalSummary }}
        </p>
      </div>

      <JournalPostcardThumb
        class="justify-self-start md:justify-self-end"
        :variant="journalPostcardVariant"
      />
    </div>
  </article>

  <Dialog
    :open="isEditDialogOpen"
    @update:open="handleEditOpenChange"
  >
    <DialogContent
      class="max-h-[calc(100dvh-2rem)] w-[min(560px,calc(100vw-2rem))] overflow-y-auto border-[#eadff8] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(255,248,253,0.98))] p-6 shadow-[0_30px_78px_rgba(108,79,156,0.18)] sm:max-w-[560px]"
      data-region="timeline-edit-dialog"
    >
      <DialogHeader class="gap-2 pr-8">
        <DialogTitle class="text-[24px] font-extrabold leading-tight text-[var(--color-ink-strong)]">
          编辑旅行记录
        </DialogTitle>
        <DialogDescription class="text-[14px] font-semibold leading-6 text-[var(--color-ink-muted)]">
          调整日期、摘记和标签。
        </DialogDescription>
      </DialogHeader>

      <TimelineEditForm
        :record="entry"
        :trips-by-place-id="tripsByPlaceId"
        :is-submitting="isSubmitting"
        @submit="handleEditSubmit"
        @cancel="handleEditCancel"
      />
    </DialogContent>
  </Dialog>

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
  .timeline-entry-card,
  .timeline-entry-card:hover,
  .timeline-entry-card__menu-button,
  .timeline-entry-card__menu-button:hover {
    transition: none !important;
    transform: none !important;
  }
}
</style>
