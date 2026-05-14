<script setup lang="ts">
import { storeToRefs } from 'pinia'

import AuthRestoreOverlay from '../components/auth/AuthRestoreOverlay.vue'
import LeafletMapStage from '../components/LeafletMapStage.vue'
import { useAuthSessionStore } from '../stores/auth-session'

const authSessionStore = useAuthSessionStore()
const { status } = storeToRefs(authSessionStore)
</script>

<template>
  <section
    class="relative flex min-h-[calc(100svh_-_2rem)] flex-1 flex-col overflow-visible rounded-[28px] bg-transparent p-0 md:min-h-[calc(100svh_-_3rem)]"
    data-region="map-shell"
    data-route-view="map"
    aria-label="世界足迹"
  >
    <LeafletMapStage class="min-h-0 flex-1" />
    <AuthRestoreOverlay :visible="status === 'restoring'" />
  </section>
</template>
