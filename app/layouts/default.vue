<script setup lang="ts"></script>
<template>
  <div class="min-h-screen bg-gradient-to-b from-background to-muted/20">
    <LayoutAppHeader />
    <div>
      <slot />
    </div>
    <LazyLayoutAppFooter />
  </div>
</template>
