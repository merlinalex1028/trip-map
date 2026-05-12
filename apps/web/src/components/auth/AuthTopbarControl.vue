<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed } from 'vue'

import { useAuthSessionStore } from '../../stores/auth-session'

const authSessionStore = useAuthSessionStore()
const { currentUser, status } = storeToRefs(authSessionStore)
const { openAuthModal } = authSessionStore

const isAuthenticated = computed(
  () => status.value === 'authenticated' && currentUser.value !== null,
)

function openLoginDialog() {
  openAuthModal('login')
}
</script>

<template>
  <div class="relative flex items-center justify-end">
    <button
      v-if="!isAuthenticated"
      type="button"
      class="inline-flex min-h-11 items-center justify-center rounded-full border border-white/85 bg-white/88 px-4 py-2 text-sm font-semibold text-[var(--color-ink-strong)] shadow-[var(--shadow-button)] transition duration-[var(--motion-quick)] hover:-translate-y-0.5 hover:bg-white"
      data-auth-trigger="anonymous"
      @click="openLoginDialog"
    >
      登录 / 注册
    </button>
  </div>
</template>
