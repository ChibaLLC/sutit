<script setup lang="ts">
const uuid = useRoute().params.formUuid
if(!uuid) navigateTo('/forms')
</script>

<template>
  <Title>Submissions | {{uuid}}</Title>
  <div class="flex min-h-screen w-full -mt-3">
    <Aside/>
    <main class="w-full flex flex-col items-center">

    </main>
  </div>
</template>

<style scoped>

</style>