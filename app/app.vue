<script setup lang="ts">
import "vue-sonner/style.css";
</script>
<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtLoadingIndicator />
    <Toaster />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
