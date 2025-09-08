<script setup lang="ts">
import "vue-sonner/style.css";
</script>
<template>
  <div>
    <NuxtRouteAnnouncer />
    <Toaster />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
