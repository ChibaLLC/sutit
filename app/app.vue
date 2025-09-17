<script setup lang="ts">
import "vue-sonner/style.css";
</script>
<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtLoadingIndicator
      color="repeating-linear-gradient(to right, #6366f1, #8b5cf6, #ec4899)"
    />
    <Toaster />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
