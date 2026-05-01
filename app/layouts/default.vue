<script setup lang="ts"></script>
<template>
  <div class="from-background to-muted/20 flex min-h-screen flex-col bg-gradient-to-b">
    <LayoutAppHeader />
    <main class="flex-1">
      <slot />
    </main>
    <LazyLayoutAppFooter />
  </div>
</template>
