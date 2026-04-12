<script setup lang="ts">
import type { LoginRequest, RegisterRequest } from '@trip-map/contracts'
import { storeToRefs } from 'pinia'
import { computed, nextTick, reactive, shallowRef, useTemplateRef, watch } from 'vue'

import { ApiClientError } from '../../services/api/client'
import { useAuthSessionStore } from '../../stores/auth-session'

type AuthMode = 'login' | 'register'

const authSessionStore = useAuthSessionStore()
const { authMode, isAuthModalOpen, isSubmitting } = storeToRefs(authSessionStore)
const { closeAuthModal, login, openAuthModal, register } = authSessionStore

const loginEmailInput = useTemplateRef<HTMLInputElement>('loginEmailInput')
const registerUsernameInput = useTemplateRef<HTMLInputElement>('registerUsernameInput')
const submitError = shallowRef('')
const lastFocusedElement = shallowRef<HTMLElement | null>(null)

const loginForm = reactive<LoginRequest>({
  email: '',
  password: '',
})

const registerForm = reactive<RegisterRequest>({
  username: '',
  email: '',
  password: '',
})

const activeMode = computed(() => authMode.value)
const titleText = computed(() =>
  activeMode.value === 'login' ? '登录你的账号' : '创建你的账号',
)
const submitLabel = computed(() =>
  activeMode.value === 'login' ? '登录账号' : '创建账号',
)

function resetSubmitError() {
  submitError.value = ''
}

function focusFirstField(mode: AuthMode) {
  if (mode === 'login') {
    loginEmailInput.value?.focus()
    return
  }

  registerUsernameInput.value?.focus()
}

function restoreTriggerFocus() {
  const fallbackTrigger = document.querySelector<HTMLElement>('[data-auth-trigger]')
  ;(lastFocusedElement.value ?? fallbackTrigger)?.focus()
}

function handleDialogClose() {
  closeAuthModal()
}

function switchMode(mode: AuthMode) {
  resetSubmitError()
  openAuthModal(mode)
}

async function handleSubmit() {
  resetSubmitError()

  try {
    if (activeMode.value === 'login') {
      await login({
        email: loginForm.email,
        password: loginForm.password,
      })
    } else {
      await register({
        username: registerForm.username,
        email: registerForm.email,
        password: registerForm.password,
      })
    }

    closeAuthModal()
  } catch (error) {
    if (error instanceof ApiClientError) {
      submitError.value =
        activeMode.value === 'login'
          ? '登录失败，请检查邮箱和密码后重试。'
          : '创建账号失败，请稍后重试。'
      return
    }

    submitError.value = '请求暂时没有成功，请稍后再试。'
  }
}

watch(
  isAuthModalOpen,
  async (open) => {
    if (open) {
      lastFocusedElement.value =
        document.activeElement instanceof HTMLElement ? document.activeElement : null
      resetSubmitError()
      await nextTick()
      focusFirstField(activeMode.value)
      return
    }

    await nextTick()
    restoreTriggerFocus()
  },
  { immediate: true },
)

watch(
  activeMode,
  async (mode) => {
    if (!isAuthModalOpen.value) {
      return
    }

    resetSubmitError()
    await nextTick()
    focusFirstField(mode)
  },
)
</script>

<template>
  <div
    v-if="isAuthModalOpen"
    class="fixed inset-0 z-[8] flex items-center justify-center bg-[rgba(87,66,95,0.18)] px-4 py-6 backdrop-blur-sm"
    data-auth-dialog-backdrop
  >
    <dialog
      open
      class="m-0 w-full max-w-[30rem] overflow-hidden rounded-[32px] border border-white/85 bg-[var(--color-surface)]/96 p-0 text-[var(--color-ink-strong)] shadow-[var(--shadow-stage)] backdrop-blur-xl"
      data-auth-dialog
      aria-labelledby="auth-dialog-title"
      @keydown.esc.prevent="handleDialogClose"
    >
      <div class="flex items-start justify-between gap-4 border-b border-white/80 px-6 pb-5 pt-6">
        <div>
          <p class="text-[0.72rem] font-semibold tracking-[0.18em] text-[var(--color-ink-soft)] uppercase">
            Account
          </p>
          <h2 id="auth-dialog-title" class="mt-2 text-2xl font-semibold">
            {{ titleText }}
          </h2>
        </div>
        <button
          type="button"
          class="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-white/85 bg-white/82 text-lg text-[var(--color-ink-soft)] transition duration-[var(--motion-quick)] hover:bg-white"
          aria-label="关闭认证弹层"
          @click="handleDialogClose"
        >
          ×
        </button>
      </div>

      <div class="px-6 pb-6 pt-5">
        <div
          class="grid min-h-11 grid-cols-2 gap-2 rounded-full border border-white/85 bg-white/72 p-1"
          role="tablist"
          aria-label="认证方式"
        >
          <button
            id="auth-tab-login"
            type="button"
            role="tab"
            class="min-h-11 rounded-full px-4 text-sm font-semibold transition duration-[var(--motion-quick)]"
            :class="
              activeMode === 'login'
                ? 'bg-[var(--color-accent)] text-white shadow-[var(--shadow-button)]'
                : 'text-[var(--color-ink-soft)] hover:bg-white/80'
            "
            :aria-selected="activeMode === 'login'"
            aria-controls="auth-panel-login"
            @click="switchMode('login')"
          >
            登录
          </button>
          <button
            id="auth-tab-register"
            type="button"
            role="tab"
            class="min-h-11 rounded-full px-4 text-sm font-semibold transition duration-[var(--motion-quick)]"
            :class="
              activeMode === 'register'
                ? 'bg-[var(--color-accent)] text-white shadow-[var(--shadow-button)]'
                : 'text-[var(--color-ink-soft)] hover:bg-white/80'
            "
            :aria-selected="activeMode === 'register'"
            aria-controls="auth-panel-register"
            @click="switchMode('register')"
          >
            注册
          </button>
        </div>

        <form class="mt-6 space-y-4" @submit.prevent="handleSubmit">
          <div
            v-if="activeMode === 'login'"
            id="auth-panel-login"
            role="tabpanel"
            aria-labelledby="auth-tab-login"
            class="space-y-4"
          >
            <label class="block text-sm font-semibold text-[var(--color-ink-strong)]">
              <span class="mb-2 block">邮箱</span>
              <input
                ref="loginEmailInput"
                v-model.trim="loginForm.email"
                name="email"
                type="email"
                autocomplete="email"
                required
                class="min-h-11 w-full rounded-[22px] border border-white/85 bg-white/86 px-4 py-3 text-sm outline-none transition duration-[var(--motion-quick)] focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[color:color-mix(in_srgb,var(--color-accent)_24%,white_76%)]"
              />
            </label>
            <label class="block text-sm font-semibold text-[var(--color-ink-strong)]">
              <span class="mb-2 block">密码</span>
              <input
                v-model="loginForm.password"
                name="password"
                type="password"
                autocomplete="current-password"
                required
                class="min-h-11 w-full rounded-[22px] border border-white/85 bg-white/86 px-4 py-3 text-sm outline-none transition duration-[var(--motion-quick)] focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[color:color-mix(in_srgb,var(--color-accent)_24%,white_76%)]"
              />
            </label>
          </div>

          <div
            v-else
            id="auth-panel-register"
            role="tabpanel"
            aria-labelledby="auth-tab-register"
            class="space-y-4"
          >
            <label class="block text-sm font-semibold text-[var(--color-ink-strong)]">
              <span class="mb-2 block">用户名</span>
              <input
                ref="registerUsernameInput"
                v-model.trim="registerForm.username"
                name="username"
                type="text"
                autocomplete="username"
                maxlength="40"
                required
                class="min-h-11 w-full rounded-[22px] border border-white/85 bg-white/86 px-4 py-3 text-sm outline-none transition duration-[var(--motion-quick)] focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[color:color-mix(in_srgb,var(--color-accent)_24%,white_76%)]"
              />
            </label>
            <label class="block text-sm font-semibold text-[var(--color-ink-strong)]">
              <span class="mb-2 block">邮箱</span>
              <input
                v-model.trim="registerForm.email"
                name="email"
                type="email"
                autocomplete="email"
                required
                class="min-h-11 w-full rounded-[22px] border border-white/85 bg-white/86 px-4 py-3 text-sm outline-none transition duration-[var(--motion-quick)] focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[color:color-mix(in_srgb,var(--color-accent)_24%,white_76%)]"
              />
            </label>
            <label class="block text-sm font-semibold text-[var(--color-ink-strong)]">
              <span class="mb-2 block">密码</span>
              <input
                v-model="registerForm.password"
                name="password"
                type="password"
                autocomplete="new-password"
                required
                class="min-h-11 w-full rounded-[22px] border border-white/85 bg-white/86 px-4 py-3 text-sm outline-none transition duration-[var(--motion-quick)] focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[color:color-mix(in_srgb,var(--color-accent)_24%,white_76%)]"
              />
            </label>
          </div>

          <p
            v-if="submitError"
            class="rounded-[20px] border border-[color:color-mix(in_srgb,var(--color-destructive)_22%,white_78%)] bg-white/82 px-4 py-3 text-sm text-[var(--color-destructive)]"
            role="alert"
          >
            {{ submitError }}
          </p>

          <button
            type="submit"
            class="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-[var(--color-accent)] px-4 py-3 text-sm font-semibold text-white shadow-[var(--shadow-button)] transition duration-[var(--motion-quick)] hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
            :disabled="isSubmitting"
          >
            {{ submitLabel }}
          </button>
        </form>
      </div>
    </dialog>
  </div>
</template>

<style scoped>
dialog::backdrop {
  background: transparent;
}
</style>
