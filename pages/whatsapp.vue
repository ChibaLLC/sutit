<script setup lang="ts">
import { type APIResponse, Status } from '~/types';
import QRCode from 'qrcode';

const payment = ref(false)
const done = ref(false)

const payment_details = reactive({
  amount: 0,
  paybill: ''
})

async function createInstance() {
  const hint = document.getElementById('hint')
  if (hint) hint.innerText = 'Scan the QR code with your phone'

  const response = await useAuthFetch('/api/v1/whatsapp/create-instance', {
    stream: true,
  })

  function callback(data: APIResponse) {
    if (data.statusCode === Status.whatsappWebQR) {
      QRCode.toCanvas(data.body, { errorCorrectionLevel: 'H' }, (err, canvas) => {
        if (err) throw err
        const qrCode = document.getElementById('qr-code')
        qrCode?.appendChild(canvas)
      })
    } else if (data.statusCode === Status.SSEStart) {
      if (hint) hint.innerText = "Loading..."
    } else if (Status.whatsappWebReady) {
      if (hint) hint.innerText = "WhatsApp Web is ready"
      document.getElementById('qr-code')?.remove()
      done.value = true
    }
  }

  function fallback(text: string) {
    console.warn(text)
  }

  if(response.statusCode === Status.success){
    response.body(callback, fallback)
  } else {
    console.error(response)
  }
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

      <button @click="createInstance" class="mt-4 bg-slate-500 text-white px-4 py-2 rounded-md">Create Instance</button>
      <button @click="payment = true" class="mt-4 bg-green-500 text-white px-4 py-2 rounded-md" v-if="done">Add Payment</button>
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

<style scoped></style>