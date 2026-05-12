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
    class="min-h-svh items-stretch bg-cream-100"
    data-app-shell
    style="--sidebar-width: 280px"
  >
    <Sidebar
      class="border-r border-[#e8ddf6] bg-white/82 backdrop-blur-xl"
      collapsible="none"
    >
      <ShellSidebar />
    </Sidebar>
    <SidebarInset class="min-w-0 bg-transparent p-6">
      <slot />
    </SidebarInset>
  </SidebarProvider>
</template>
