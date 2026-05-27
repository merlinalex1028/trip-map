<script setup lang="ts">
import {
  Sidebar,
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar'

import ShellSidebar from './ShellSidebar.vue'
</script>

<template>
  <SidebarProvider
    class="h-svh min-h-0 items-stretch overflow-hidden bg-white"
    data-app-shell
    style="--sidebar-width: 280px"
  >
    <Sidebar
      class="z-20 h-svh overflow-visible border-r-0 bg-white shadow-none"
      collapsible="none"
    >
      <ShellSidebar />
    </Sidebar>
    <SidebarInset class="min-h-0 min-w-0 overflow-hidden bg-transparent p-3 sm:p-4 md:h-svh md:p-6">
      <slot />
    </SidebarInset>
  </SidebarProvider>
</template>
