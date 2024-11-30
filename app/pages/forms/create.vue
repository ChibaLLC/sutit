<template>
  <FormCreator @submit="submit" />
</template>
<script setup lang="ts">
definePageMeta({
  middleware: ["auth"],
  layout: 'novbar'
})

async function submit(data: any) {
  const res = await $fetch<APIResponse>('/api/v1/forms/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + getAuthToken()
    },
    body: data
  })

  if (res.statusCode < 299) {
    alert('Form created successfully')
    await navigateTo('/forms')
  } else {
    alert(res.body)
  }
}
</script>