<script setup lang="ts">
import type { APIResponse } from '~/types';

const { data } = await useFetch<APIResponse<any>>('/api/v1/forms/me', {
  headers: {
    Authorization: `Bearer ${getAuthToken()}`
  }
})

const forms = data.value?.body
</script>

<template>
  <Title>Submissions</Title>
  <div class="flex min-h-screen w-full -mt-3">
    <Pill />
  </div>
</template>

<style scoped></style>