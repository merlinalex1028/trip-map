<script setup lang="ts">
import type {
  HealthStatusResponse,
  SmokeRecordResponse,
} from '@trip-map/contracts'
import { onMounted, shallowRef } from 'vue'

import { createSmokeRecord, fetchHealthStatus } from '../services/api/phase11-smoke'

const healthStatus = shallowRef<HealthStatusResponse | null>(null)
const smokeRecord = shallowRef<SmokeRecordResponse | null>(null)
const healthError = shallowRef<string | null>(null)
const smokeError = shallowRef<string | null>(null)
const isSubmitting = shallowRef(false)

async function loadHealthStatus() {
  healthError.value = null

  try {
    healthStatus.value = await fetchHealthStatus()
  }
  catch (error) {
    healthError.value = error instanceof Error ? error.message : '加载 backend 状态失败'
  }
}

async function handleCreateSmokeRecord() {
  isSubmitting.value = true
  smokeError.value = null

  try {
    smokeRecord.value = await createSmokeRecord()
  }
  catch (error) {
    smokeError.value = error instanceof Error ? error.message : '创建 smoke record 失败'
  }
  finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  void loadHealthStatus()
})
</script>

<template>
  <section class="backend-baseline-panel" aria-label="backend baseline panel">
    <div class="backend-baseline-panel__header">
      <div>
        <p class="backend-baseline-panel__eyebrow">Phase 11 backend baseline</p>
        <h2 class="backend-baseline-panel__title">web -> server -> DB smoke path</h2>
      </div>
      <button
        class="backend-baseline-panel__action"
        type="button"
        :disabled="isSubmitting"
        @click="handleCreateSmokeRecord"
      >
        {{ isSubmitting ? '创建中...' : '创建 smoke record' }}
      </button>
    </div>

    <p v-if="healthError" class="backend-baseline-panel__message backend-baseline-panel__message--error" role="alert">
      {{ healthError }}
    </p>
    <div v-else-if="healthStatus" class="backend-baseline-panel__grid">
      <div class="backend-baseline-panel__item">
        <span class="backend-baseline-panel__label">status</span>
        <strong>{{ healthStatus.status }}</strong>
      </div>
      <div class="backend-baseline-panel__item">
        <span class="backend-baseline-panel__label">service</span>
        <strong>{{ healthStatus.service }}</strong>
      </div>
      <div class="backend-baseline-panel__item">
        <span class="backend-baseline-panel__label">database</span>
        <strong>{{ healthStatus.database }}</strong>
      </div>
      <div class="backend-baseline-panel__item">
        <span class="backend-baseline-panel__label">contractsVersion</span>
        <strong>{{ healthStatus.contractsVersion }}</strong>
      </div>
    </div>
    <p v-else class="backend-baseline-panel__message" role="status">正在加载 backend 状态...</p>

    <p v-if="smokeError" class="backend-baseline-panel__message backend-baseline-panel__message--error" role="alert">
      {{ smokeError }}
    </p>
    <dl v-else-if="smokeRecord" class="backend-baseline-panel__record">
      <div class="backend-baseline-panel__record-item">
        <dt>placeId</dt>
        <dd>{{ smokeRecord.placeId }}</dd>
      </div>
      <div class="backend-baseline-panel__record-item">
        <dt>boundaryId</dt>
        <dd>{{ smokeRecord.boundaryId }}</dd>
      </div>
      <div class="backend-baseline-panel__record-item">
        <dt>placeKind</dt>
        <dd>{{ smokeRecord.placeKind }}</dd>
      </div>
      <div class="backend-baseline-panel__record-item">
        <dt>datasetVersion</dt>
        <dd>{{ smokeRecord.datasetVersion }}</dd>
      </div>
    </dl>
  </section>
</template>

<style scoped>
.backend-baseline-panel {
  display: grid;
  gap: var(--space-md);
  padding: 1rem 1.1rem;
  border: 1px solid color-mix(in srgb, var(--color-frame) 62%, white 38%);
  border-radius: calc(var(--radius-surface) - 8px);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.92), rgba(232, 244, 251, 0.78)),
    color-mix(in srgb, var(--color-surface) 86%, white 14%);
  box-shadow: 0 16px 34px rgba(120, 86, 122, 0.1);
}

.backend-baseline-panel__header {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: var(--space-md);
}

.backend-baseline-panel__eyebrow {
  margin: 0 0 0.25rem;
  color: var(--color-ink-soft);
  font-size: 0.74rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.backend-baseline-panel__title {
  margin: 0;
  color: var(--color-ink-strong);
  font-size: 1rem;
}

.backend-baseline-panel__action {
  min-width: 44px;
  min-height: 44px;
  padding: 0.75rem 1rem;
  border: 1px solid color-mix(in srgb, var(--color-frame) 74%, white 26%);
  border-radius: var(--radius-control);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(244, 249, 252, 0.92));
  color: var(--color-ink-strong);
  font-weight: var(--font-weight-label);
  cursor: pointer;
}

.backend-baseline-panel__action:disabled {
  cursor: wait;
  opacity: 0.7;
}

.backend-baseline-panel__grid,
.backend-baseline-panel__record {
  display: grid;
  gap: 0.75rem;
  grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
}

.backend-baseline-panel__item,
.backend-baseline-panel__record-item {
  display: grid;
  gap: 0.25rem;
  padding: 0.75rem 0.85rem;
  border-radius: calc(var(--radius-control) - 6px);
  background: rgba(255, 255, 255, 0.68);
}

.backend-baseline-panel__label,
.backend-baseline-panel__record-item dt {
  color: var(--color-ink-soft);
  font-size: 0.78rem;
}

.backend-baseline-panel__record-item dd {
  margin: 0;
  color: var(--color-ink-strong);
  font-weight: var(--font-weight-label);
  word-break: break-word;
}

.backend-baseline-panel__message {
  margin: 0;
  color: var(--color-ink-soft);
  font-size: 0.9rem;
}

.backend-baseline-panel__message--error {
  color: var(--color-destructive);
}

@media (max-width: 720px) {
  .backend-baseline-panel__header {
    flex-direction: column;
  }

  .backend-baseline-panel__action {
    width: 100%;
  }
}
</style>
