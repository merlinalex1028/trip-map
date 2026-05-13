<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

import sidebarCameraGirl from '@/assets/v8/characters/sidebar-camera-girl.webp'
import defaultAvatar from '@/assets/v8/shell/user-avatar.png'
import sidebarIllustration from '@/assets/v8/shell/sidebar-illustration.png'
import KawaiiIcon from '@/components/common/KawaiiIcon.vue'
import {
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { useAuthSessionStore } from '@/stores/auth-session'

const navItems = [
  { key: 'map', to: '/map', label: '世界足迹', icon: 'map' as const },
  { key: 'journal', to: '/journal', label: '旅途手账', icon: 'journal' as const },
  { key: 'memories', to: '/memories', label: '旅途回忆', icon: 'memories' as const },
]

const authSessionStore = useAuthSessionStore()
const { currentUser } = storeToRefs(authSessionStore)
const route = useRoute()

const displayUsername = computed(() => currentUser.value?.username ?? '旅行家')
const isMapRoute = computed(() => route.path === '/map')
const illustrationSource = computed(() =>
  isMapRoute.value ? sidebarCameraGirl : sidebarIllustration,
)

function isActiveRoute(path: string) {
  return route.path === path
}
</script>

<template>
  <div
    class="flex h-full flex-col"
    data-shell-sidebar
    :data-shell-visual-mode="isMapRoute ? 'world-footprints' : 'default'"
  >
    <SidebarHeader
      :class="[
        'gap-4 px-5 pb-4 pt-5',
        isMapRoute ? 'rounded-b-[32px] bg-[linear-gradient(180deg,rgba(255,248,253,0.92),rgba(255,240,247,0.72))]' : '',
      ]"
    >
      <div class="space-y-1">
        <h1 class="text-2xl font-semibold text-[var(--color-ink-strong)]">
          旅记
        </h1>
        <p class="text-sm leading-6 text-[var(--color-ink-muted)]">
          探索世界 · 记录美好
        </p>
      </div>

      <section
        :class="[
          'rounded-[28px] border border-white/85 p-4 shadow-[var(--shadow-float)]',
          isMapRoute
            ? 'bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(255,245,251,0.82))] shadow-[0_20px_40px_rgba(247,90,155,0.1)]'
            : 'bg-white/76',
        ]"
      >
        <div class="flex items-center gap-4">
          <img
            :src="defaultAvatar"
            alt="默认头像"
            class="h-24 w-24 shrink-0 rounded-full border border-white/90 object-cover shadow-[0_12px_24px_rgba(155,116,160,0.16)]"
            data-shell-avatar
          >
          <div class="min-w-0">
            <p class="truncate text-lg font-semibold text-[var(--color-ink-strong)]">
              {{ displayUsername }}
            </p>
          </div>
        </div>
      </section>
    </SidebarHeader>

    <SidebarContent
      :class="[
        'px-4 pb-4',
        isMapRoute ? 'bg-[radial-gradient(circle_at_top,rgba(242,232,255,0.56),transparent_48%)]' : '',
      ]"
    >
      <SidebarMenu class="gap-2">
        <SidebarMenuItem
          v-for="item in navItems"
          :key="item.key"
        >
          <RouterLink
            v-slot="{ href, navigate }"
            custom
            :to="item.to"
          >
            <SidebarMenuButton
              :aria-current="isActiveRoute(item.to) ? 'page' : undefined"
              :class="[
                'h-12 rounded-[18px] px-4 text-[var(--color-ink-strong)] transition duration-[var(--motion-quick)]',
                isActiveRoute(item.to)
                  ? 'bg-[linear-gradient(135deg,rgba(255,232,242,0.96),rgba(255,246,250,0.96))] text-[var(--color-accent-strong)] shadow-[0_14px_28px_rgba(244,143,177,0.18)]'
                  : isMapRoute
                    ? 'bg-[linear-gradient(180deg,rgba(255,255,255,0.8),rgba(248,240,255,0.72))] hover:bg-white/90'
                    : 'bg-white/70 hover:bg-white/88',
              ]"
              :is-active="isActiveRoute(item.to)"
              as-child
              :data-shell-nav-item="item.key"
            >
              <a
                :href="href"
                @click="navigate"
              >
                <KawaiiIcon
                  :label="item.label"
                  :name="item.icon"
                  :decorative="false"
                  :size="22"
                />
                <span class="text-sm font-semibold">{{ item.label }}</span>
              </a>
            </SidebarMenuButton>
          </RouterLink>
        </SidebarMenuItem>
      </SidebarMenu>

      <div
        :class="[
          'mt-auto flex items-end justify-center px-2 pt-6',
          isMapRoute ? 'rounded-t-[32px] bg-[linear-gradient(180deg,rgba(255,248,253,0),rgba(242,232,255,0.46))]' : '',
        ]"
      >
        <img
          :src="illustrationSource"
          alt=""
          aria-hidden="true"
          :class="[
            'w-full object-contain',
            isMapRoute ? 'max-w-[244px] drop-shadow-[0_18px_28px_rgba(155,116,160,0.2)]' : 'max-w-[220px]',
          ]"
          data-shell-illustration
        >
      </div>
    </SidebarContent>

    <!-- Logout removed — pending design review (see 43-UAT.md test 10) -->
    <div class="px-4 pb-5 pt-0" />
  </div>
</template>
