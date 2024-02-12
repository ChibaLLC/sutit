<script setup lang="ts">
import { type APIResponse } from '~/types';

const payment = ref(false)
const done = ref(false)

const payment_details = reactive({
  amount: 0,
  paybill: ''
})

async function createInstance() {
  const hint = document.getElementById('hint')
  if (hint) hint.innerText = 'Scan the QR code with your phone'

  const reader = await useAuthStream('/api/v1/whatsapp/create-instance')

  function callback(data: APIResponse[]) {
    for(const datum of data) {
      console.log(datum)
    }
  }

  function fallback(text: string) {
    console.warn(text)
  }

  await readStream(reader, callback, fallback).catch(console.error)
}
</script>

<template>
  <Title>WhatsApp</Title>
  <div class="flex min-h-screen w-full -mt-3">
    <Aside />
    <div class="flex-1 flex justify-center">
      <h1 class="font-medium text-lg mt-10">Coming Soon</h1>
    </div>
  </div>
</template>

<style scoped>
.button-group{
  @apply mt-4;
  @apply flex;
}
</style>