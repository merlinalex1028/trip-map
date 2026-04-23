<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed, onMounted, onUnmounted, shallowRef, useTemplateRef } from 'vue'
import { useRouter } from 'vue-router'

import { useAuthSessionStore } from '../../stores/auth-session'

const authSessionStore = useAuthSessionStore()
const { currentUser, isSubmitting, status } = storeToRefs(authSessionStore)
const { logout, openAuthModal } = authSessionStore
const router = useRouter()

const root = useTemplateRef<HTMLElement>('root')
const isMenuOpen = shallowRef(false)

const isAuthenticated = computed(
  () => status.value === 'authenticated' && currentUser.value !== null,
)

function openLoginDialog() {
  openAuthModal('login')
}

function toggleMenu() {
  if (!isAuthenticated.value) {
    return
  }

  isMenuOpen.value = !isMenuOpen.value
}

function closeMenu() {
  isMenuOpen.value = false
}

function handleNavigateToTimeline() {
  closeMenu()
  void router.push('/timeline')
}

async function handleLogout() {
  closeMenu()
  await logout()
}

function handleDocumentPointerDown(event: PointerEvent) {
  if (!isMenuOpen.value || !root.value) {
    return
  }

  if (root.value.contains(event.target as Node)) {
    return
  }

  closeMenu()
}

function handleDocumentKeydown(event: KeyboardEvent) {
  if (event.key !== 'Escape') {
    return
  }

  closeMenu()
}

onMounted(() => {
  document.addEventListener('pointerdown', handleDocumentPointerDown)
  document.addEventListener('keydown', handleDocumentKeydown)
})

onUnmounted(() => {
  document.removeEventListener('pointerdown', handleDocumentPointerDown)
  document.removeEventListener('keydown', handleDocumentKeydown)
})
</script>

<template>
  <div ref="root" class="relative flex items-center justify-end">
    <button
      v-if="!isAuthenticated"
      type="button"
      class="inline-flex min-h-11 items-center justify-center rounded-full border border-white/85 bg-white/88 px-4 py-2 text-sm font-semibold text-[var(--color-ink-strong)] shadow-[var(--shadow-button)] transition duration-[var(--motion-quick)] hover:-translate-y-0.5 hover:bg-white"
      data-auth-trigger="anonymous"
      @click="openLoginDialog"
    >
      登录 / 注册
    </button>

    <div v-else class="relative flex justify-end">
      <button
        type="button"
        class="inline-flex min-h-11 max-w-36 items-center gap-2 rounded-full border border-[color:color-mix(in_srgb,var(--color-accent)_26%,white_74%)] bg-[var(--color-surface)]/95 px-4 py-2 text-sm font-semibold text-[var(--color-ink-strong)] shadow-[var(--shadow-button)] transition duration-[var(--motion-quick)] hover:-translate-y-0.5 md:max-w-48"
        data-auth-trigger="authenticated"
        aria-haspopup="menu"
        :aria-expanded="isMenuOpen"
        @click="toggleMenu"
      >
        <span
          class="h-2.5 w-2.5 shrink-0 rounded-full bg-[var(--color-accent)]"
          aria-hidden="true"
        ></span>
        <span class="truncate">{{ currentUser?.username }}</span>
        <span class="shrink-0 text-xs text-[var(--color-ink-soft)]" aria-hidden="true">▾</span>
      </button>

      <div
        v-if="isMenuOpen && currentUser"
        class="absolute right-0 top-[calc(100%+0.75rem)] z-[7] w-64 overflow-hidden rounded-[28px] border border-white/85 bg-[var(--color-surface)]/95 p-3 shadow-[var(--shadow-float)] backdrop-blur-xl"
        data-auth-menu
        role="menu"
      >
        <div class="rounded-[22px] bg-white/72 px-4 py-3 text-left" data-auth-menu-item="username">
          <p class="text-[0.72rem] font-semibold tracking-[0.12em] text-[var(--color-ink-soft)] uppercase">
            用户名
          </p>
          <p class="mt-1 truncate text-sm font-semibold text-[var(--color-ink-strong)]">
            {{ currentUser.username }}
          </p>
        </div>
        <div class="mt-2 rounded-[22px] bg-white/72 px-4 py-3 text-left" data-auth-menu-item="email">
          <p class="text-[0.72rem] font-semibold tracking-[0.12em] text-[var(--color-ink-soft)] uppercase">
            邮箱
          </p>
          <p class="mt-1 truncate text-sm text-[var(--color-ink-strong)]">
            {{ currentUser.email }}
          </p>
        </div>
        <div
          class="mx-1 my-3 h-px bg-[color:color-mix(in_srgb,var(--color-frame)_70%,white_30%)]"
          aria-hidden="true"
        ></div>
        <button
          type="button"
          class="inline-flex min-h-11 w-full items-center gap-3 rounded-full border border-[color:color-mix(in_srgb,var(--color-accent)_24%,white_76%)] bg-white/86 px-4 py-2 text-sm font-semibold text-[var(--color-ink-strong)] shadow-[var(--shadow-button)] transition duration-[var(--motion-quick)] hover:bg-white"
          data-auth-menu-item="timeline"
          role="menuitem"
          @click="handleNavigateToTimeline"
        >
          <span
            class="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent-soft)] text-[var(--color-accent)]"
            aria-hidden="true"
          >
            <span class="relative h-3.5 w-3.5">
              <span class="absolute left-1/2 top-0 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-current"></span>
              <span class="absolute left-1/2 top-[0.4rem] h-[0.45rem] w-px -translate-x-1/2 bg-current"></span>
              <span class="absolute left-1/2 bottom-0 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-current"></span>
            </span>
          </span>
          <span>时间轴</span>
        </button>
        <button
          type="button"
          class="mt-2 inline-flex min-h-11 w-full items-center justify-center rounded-full border border-[color:color-mix(in_srgb,var(--color-destructive)_22%,white_78%)] bg-white/86 px-4 py-2 text-sm font-semibold text-[var(--color-destructive)] transition duration-[var(--motion-quick)] hover:bg-white"
          data-auth-menu-item="logout"
          role="menuitem"
          :disabled="isSubmitting"
          @click="handleLogout"
        >
          退出登录
        </button>
      </div>
    </div>
  </div>
</template>
