<script setup lang="ts">
import { type APIResponse, Status } from '~/types';
import {readStream} from "~/utils/http";

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
  <div class="flex min-h-screen w-full container -mt-3">
    <Aside />
    <div class="flex-1 flex justify-center items-center flex-col">
      <div class="flex flex-col items-center">
        <h1 class="text-2xl font-bold mb-4" id="hint">Press the button to get started</h1>
        <canvas id="qr-code" class="w-72 h-72"></canvas>
      </div>

      <div class="button-group">
        <button @click="createInstance" class="mt-4 bg-slate-500 text-white px-4 py-2 rounded-md">Create Instance</button>
        <button @click="payment = true" class="mt-4 bg-green-500 text-white px-4 py-2 rounded-md" v-if="done">Add Payment</button>
      </div>
    </div>
    <Modal :open="payment" @close="payment = false;" @cancel="payment = false" :title="`Add Payment`">
      <div class="p-4">
        <div class="form-group">
          <label for="amount" class="text-white dark:text-slate-900 font-semibold mb-2">Amount in KES</label>
          <input type="number" id="amount" class="input" v-model="payment_details.amount" />
        </div>
        <div class="form-group mt-2">
          <label for="description" class="text-white dark:text-slate-900 font-semibold mb-2">Paybill
            Number</label>
          <input type="text" id="description" class="input" v-model="payment_details.paybill" />
        </div>
      </div>
    </Modal>
  </div>
</template>

<style scoped>
.button-group{
  @apply mt-4;
  @apply flex;
}
</style>