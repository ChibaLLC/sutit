<script setup lang="ts">
const forms = await useAuthFetch('/api/v1/forms/me')
</script>

<template>
  <Title>Submissions</Title>
  <div class="flex min-h-screen w-full -mt-3">
    <Aside/>
  </div>
</template>

<style scoped>

</style>