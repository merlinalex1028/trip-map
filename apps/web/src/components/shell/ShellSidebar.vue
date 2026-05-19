<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

import sidebarCameraGirl from '@/assets/v8/characters/sidebar-camera-girl.webp'
import logoCat from '@/assets/v8/mascots/logo-cat-outline.png'
import defaultAvatar from '@/assets/v8/shell/user-avatar.png'
import KawaiiIcon from '@/components/common/KawaiiIcon.vue'
import {
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import type { KawaiiIconName } from '@/lib/icons/semantic-icons'
import { useAuthSessionStore } from '@/stores/auth-session'

interface NavItem {
  key: string
  to?: string
  label: string
  icon: KawaiiIconName
}

const navItems = [
  { key: 'map', to: '/map', label: '世界足迹', icon: 'map' as const },
  { key: 'journal', to: '/journal', label: '旅途手账', icon: 'journal' as const },
  { key: 'memories', to: '/memories', label: '旅途回忆', icon: 'memories' as const },
] satisfies NavItem[]

const authSessionStore = useAuthSessionStore()
const { currentUser } = storeToRefs(authSessionStore)
const route = useRoute()

const displayUsername = computed(() => currentUser.value?.username ?? '旅行家')
const displayLevel = computed(() => (currentUser.value ? 'Lv.5 资深旅行家' : 'Lv.1 新手旅行家'))
const displayPoints = computed(() => (currentUser.value ? 28 : 0))
function isActiveRoute(item: NavItem) {
  return item.to ? route.path === item.to : false
}

function getNavButtonClass(item: NavItem) {
  return [
    'sidebar-nav-button h-11 rounded-[16px] px-3.5 text-[#8a77cc] transition duration-[var(--motion-quick)] focus-visible:ring-2 focus-visible:ring-[rgba(247,90,155,0.32)]',
    isActiveRoute(item)
      ? 'bg-[linear-gradient(135deg,rgba(255,224,241,0.98),rgba(255,241,249,0.98))] text-[#2f1d72] shadow-[0_12px_24px_rgba(244,143,177,0.18)]'
      : 'bg-transparent hover:-translate-y-0.5 hover:bg-white/64',
  ]
}
</script>

<template>
  <div
    class="shell-sidebar flex h-full min-h-0 flex-col bg-white px-5 py-6"
    data-shell-sidebar
    data-shell-visual-mode="world-footprints"
  >
    <SidebarHeader class="gap-4 px-0 pb-4 pt-0">
      <div class="flex items-center gap-3">
        <img
          :src="logoCat"
          alt=""
          aria-hidden="true"
          class="h-11 w-11 object-contain"
          data-shell-logo
        >
        <div class="min-w-0">
          <h1
            class="text-[21px] font-extrabold leading-none text-[#2f1d72]"
            data-display="true"
          >
            旅记
          </h1>
          <p class="mt-1 text-[11px] font-semibold leading-4 text-[#8a77cc]">
            探索世界 · 记录美好
          </p>
        </div>
      </div>

    </SidebarHeader>

    <div
      class="sidebar-content-frame flex min-h-0 flex-1 flex-col overflow-visible"
      data-shell-sidebar-frame
    >
      <section
        class="sidebar-profile relative px-4 pb-3 pt-2 text-center"
        data-shell-profile-card
      >
        <div class="relative grid justify-items-center gap-2">
          <img
            :src="defaultAvatar"
            alt="默认头像"
            class="h-[104px] w-[104px] rounded-full border border-[#ffd7e8] bg-white object-cover p-1 shadow-[0_12px_26px_rgba(247,90,155,0.16)]"
            data-shell-avatar
          >
          <p class="max-w-full truncate text-[18px] font-extrabold leading-6 text-[#2f1d72]">
            {{ displayUsername }}
          </p>
          <span class="rounded-full bg-[#f1e9ff] px-3 py-1 text-[11px] font-bold leading-4 text-[#8b6fef]">
            {{ displayLevel }}
          </span>
          <p class="flex items-center justify-center gap-2 text-[15px] font-extrabold leading-5 text-[#2f1d72]">
            <KawaiiIcon
              label="旅行积分"
              name="star"
              :decorative="false"
              :size="20"
              class="sidebar-points-icon"
            />
            <span>{{ displayPoints }}</span>
          </p>
        </div>
      </section>

      <SidebarContent
        class="min-h-0 overflow-visible px-0 pb-0 pt-1"
      >
        <nav
          class="sidebar-menu-frame"
          aria-label="已登录导航"
        >
          <SidebarMenu class="gap-2.5">
            <SidebarMenuItem
              v-for="item in navItems"
              :key="item.key"
            >
              <RouterLink
                v-if="item.to"
                v-slot="{ href, navigate }"
                custom
                :to="item.to"
              >
                <SidebarMenuButton
                  :aria-current="isActiveRoute(item) ? 'page' : undefined"
                  :class="getNavButtonClass(item)"
                  :is-active="isActiveRoute(item)"
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
                      :size="24"
                    />
                    <span class="text-sm font-semibold">{{ item.label }}</span>
                  </a>
                </SidebarMenuButton>
              </RouterLink>
            </SidebarMenuItem>
          </SidebarMenu>
        </nav>

        <div
          class="sidebar-illustration flex shrink-0 items-end justify-center overflow-visible px-0"
        >
          <div class="relative h-full w-full overflow-visible">
            <img
              :src="sidebarCameraGirl"
              alt=""
              aria-hidden="true"
              class="sidebar-illustration__image object-contain drop-shadow-[0_18px_28px_rgba(155,116,160,0.16)]"
              data-shell-illustration
            >
          </div>
        </div>
      </SidebarContent>
    </div>

    <!-- Logout removed — pending design review (see 43-UAT.md test 10) -->
  </div>
</template>

<style scoped>
.shell-sidebar {
  overflow: visible;
}

.sidebar-content-frame {
  border: 1px solid rgba(230, 218, 248, 0.94);
  border-radius: 20px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(255, 252, 255, 0.95));
  box-shadow: 0 18px 42px rgba(139, 111, 239, 0.08);
  padding: 14px 14px 0;
}

.sidebar-content-frame :deep([data-slot='sidebar-content']) {
  scrollbar-width: none;
}

.sidebar-content-frame :deep([data-slot='sidebar-content']::-webkit-scrollbar) {
  width: 0;
  height: 0;
}

.sidebar-profile::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(circle at 86% 28%, rgba(255, 155, 186, 0.44) 0 4px, transparent 5px);
}

.sidebar-nav-button {
  color: #8a77cc;
}

.sidebar-nav-button[data-active='true'] [data-kawaii-icon] {
  color: #f75a9b;
}

.sidebar-nav-button:not([data-active='true']) [data-kawaii-icon] {
  color: #9b82ef;
}

.sidebar-points-icon {
  transform: scale(1.15);
}

.sidebar-nav-button:disabled {
  cursor: default;
}

.sidebar-menu-frame {
  flex: 1 1 auto;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  padding: 8px 0;
  scrollbar-color: rgba(185, 155, 240, 0.42) transparent;
  scrollbar-width: thin;
}

.sidebar-menu-frame::-webkit-scrollbar {
  width: 6px;
}

.sidebar-menu-frame::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: rgba(185, 155, 240, 0.36);
}

.sidebar-menu-frame::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar-illustration {
  height: clamp(210px, 30svh, 278px);
  border-radius: 0 0 22px 22px;
}

.sidebar-illustration__image {
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 310px;
  max-width: none;
  transform: translateX(-52%) scale(1.12);
  transform-origin: 50% 100%;
}

@media (max-height: 760px) {
  .sidebar-profile {
    padding-top: 0;
    padding-bottom: 0.5rem;
  }

  .sidebar-illustration {
    height: clamp(176px, 27svh, 224px);
  }

  .sidebar-illustration__image {
    width: 268px;
  }
}
</style>
