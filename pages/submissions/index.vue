<script setup lang="ts">
const forms = await unFetch('/api/v1/forms/me', {
  headers: {
    Authorization: `Bearer ${getAuthToken()}`
  }
})

console.log(forms)
</script>

<template>
  <Title>Submissions</Title>
  <div class="flex min-h-screen w-full -mt-3">
    <Aside/>
  </div>
</template>

<style scoped>

</style>