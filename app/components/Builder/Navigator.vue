<script setup lang="ts"></script>
<template>
  <div class="from-background to-muted/10 bg-gradient-to-b px-6 py-6">
    <Tabs default-value="pages" class="w-full">
      <TabsList class="bg-muted/50 grid h-12 w-full grid-cols-3 border-0 p-1">
        <TabsTrigger
          value="pages"
          class="data-[state=active]:bg-background data-[state=active]:text-foreground gap-2 transition-all duration-200 data-[state=active]:shadow-md"
        >
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Pages
        </TabsTrigger>
        <TabsTrigger
          value="stores"
          class="data-[state=active]:bg-background data-[state=active]:text-foreground gap-2 transition-all duration-200 data-[state=active]:shadow-md"
        >
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </svg>
          Stores
        </TabsTrigger>
        <TabsTrigger
          value="settings"
          class="data-[state=active]:bg-background data-[state=active]:text-foreground gap-2 transition-all duration-200 data-[state=active]:shadow-md"
        >
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          Settings
        </TabsTrigger>
      </TabsList>

      <div class="mt-6">
        <TabsContent value="pages" class="mt-0">
          <slot name="pages" />
        </TabsContent>
        <TabsContent value="stores" class="mt-0">
          <slot name="stores" />
        </TabsContent>
        <TabsContent value="settings" class="mt-0">
          <slot name="settings" />
        </TabsContent>
      </div>
    </Tabs>
  </div>
</template>
