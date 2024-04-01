<script setup lang="ts">
import {type APIResponse, Status} from "~/types";

const ulid = useRoute().params.formUuid
if (!ulid) navigateTo('/forms')

const form = await useFetch(`/api/v1/forms/submissions/${ulid}`, {
  headers: {
    Authorization: `Bearer ${getAuthToken()}`
  },
  onResponse({response}): Promise<void> | void {
    const res = response._data as APIResponse
    if (res.statusCode === Status.success) {
      console.log(res.body)
    }
  },
  onResponseError({response}) {
    console.log(response)
  }
})
</script>

<template>
  <Title>Submissions | {{ ulid }}</Title>
  <div class="flex min-h-screen w-full -mt-3">
    <Aside/>
    <main class="w-full flex flex-col items-center">

    </main>
  </div>
</template>

<style scoped>

</style>