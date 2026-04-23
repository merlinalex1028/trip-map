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
    class="relative flex min-h-0 flex-col gap-4 overflow-hidden rounded-[32px] border border-white/80 bg-white/65 p-4 shadow-[var(--shadow-stage)] md:p-6"
    data-region="map-shell"
  >
    <LeafletMapStage class="min-h-0 flex-1" />
    <AuthRestoreOverlay :visible="status === 'restoring'" />
  </section>
</template>
