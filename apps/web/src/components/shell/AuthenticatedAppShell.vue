<script setup lang="ts">
import {
  Sidebar,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'

import ShellSidebar from './ShellSidebar.vue'
</script>

<template>
  <SidebarProvider
    class="h-svh min-h-0 items-stretch overflow-hidden bg-white"
    data-app-shell
    style="--sidebar-width: 260px"
  >
    <Sidebar
      class="z-20 h-svh overflow-visible border-r-0 bg-white shadow-none"
      collapsible="offcanvas"
    >
      <ShellSidebar />
    </Sidebar>
    <SidebarInset class="min-h-0 min-w-0 overflow-hidden bg-transparent p-3 sm:p-4 md:h-svh md:p-6">
      <div class="flex items-center gap-3 pb-3 md:hidden">
        <SidebarTrigger
          class="h-11 w-11 rounded-full border border-white/80 bg-white/88 text-[#8a77cc] shadow-[var(--shadow-button)]"
          data-shell-mobile-trigger
        />
        <p class="text-sm font-semibold text-[#6b5ac0]">打开导航</p>
      </div>
      <slot />
    </SidebarInset>
  </SidebarProvider>
</template>
