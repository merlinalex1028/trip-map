<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

const calendarValue = ref()
</script>

<template>
  <div class="p-6 space-y-8">
    <h1 class="text-2xl font-bold" data-testid="showcase-title">
      UI Primitives
    </h1>
    <p class="text-muted-foreground">
      Yume Kawaii Theme
    </p>

    <section class="space-y-2">
      <h2 class="text-lg font-semibold">Button</h2>
      <div class="flex flex-wrap gap-2">
        <Button>Default</Button>
        <Button variant="destructive">
          Destructive
        </Button>
        <Button variant="outline">
          Outline
        </Button>
        <Button disabled>
          Disabled
        </Button>
      </div>
    </section>

    <section class="space-y-2">
      <h2 class="text-lg font-semibold">Card</h2>
      <Card class="max-w-sm">
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>Card description</CardDescription>
        </CardHeader>
        <CardContent>
          Card content area.
        </CardContent>
        <CardFooter>
          Footer
        </CardFooter>
      </Card>
    </section>

    <section class="space-y-2">
      <h2 class="text-lg font-semibold">Dialog</h2>
      <Dialog>
        <DialogTrigger as-child>
          <Button data-testid="showcase-dialog-trigger">
            Open Dialog
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dialog Title</DialogTitle>
            <DialogDescription>This is a dialog for the showcase.</DialogDescription>
          </DialogHeader>
          <p>Dialog body content.</p>
        </DialogContent>
      </Dialog>
    </section>

    <section class="space-y-2">
      <h2 class="text-lg font-semibold">Popover</h2>
      <Popover>
        <PopoverTrigger as-child>
          <Button data-testid="showcase-popover-trigger">
            Open Popover
          </Button>
        </PopoverTrigger>
        <PopoverContent>
          <p>Popover content for the showcase.</p>
        </PopoverContent>
      </Popover>
    </section>

    <section class="space-y-2">
      <h2 class="text-lg font-semibold">Dropdown Menu</h2>
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Button>Open Menu</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Item One</DropdownMenuItem>
          <DropdownMenuItem>Item Two</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </section>

    <section class="space-y-2">
      <h2 class="text-lg font-semibold">Calendar</h2>
      <Calendar v-model="calendarValue" />
    </section>

    <section class="space-y-2">
      <h2 class="text-lg font-semibold">Tabs</h2>
      <Tabs default-value="one">
        <TabsList>
          <TabsTrigger value="one">
            Tab One
          </TabsTrigger>
          <TabsTrigger value="two">
            Tab Two
          </TabsTrigger>
        </TabsList>
        <TabsContent value="one">
          Content for tab one.
        </TabsContent>
        <TabsContent value="two">
          Content for tab two.
        </TabsContent>
      </Tabs>
    </section>

    <section class="space-y-2">
      <h2 class="text-lg font-semibold">Skeleton</h2>
      <div class="space-y-2">
        <Skeleton class="h-4 w-[250px]" data-state="loading" />
        <Skeleton class="h-4 w-[200px]" data-state="loading" />
      </div>
    </section>

    <section class="space-y-2">
      <h2 class="text-lg font-semibold">Scroll Area</h2>
      <ScrollArea class="h-32 w-48 rounded-md border p-2">
        <p v-for="i in 20" :key="i">
          Line {{ i }}
        </p>
      </ScrollArea>
    </section>
  </div>
</template>
