<script setup lang="ts"></script>
<template>
  <div class="min-h-screen bg-gradient-to-b from-background to-muted/20 flex flex-col">
    <LayoutAppHeader />
    <main class="flex-1">
      <slot />
    </main>
    <LazyLayoutAppFooter />
  </div>
</template>
