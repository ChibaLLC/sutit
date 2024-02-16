<script setup lang="ts">
import {type Drizzle} from "~/db/types";
import type {APIResponse} from "~/types";

const uuid = useRoute().params?.formUuid
const form = ref({} as {
  form: Drizzle.Form.select,
  fields: Array<Drizzle.FormFields.select[] & { ref: Ref<string> }>,
  paymentDetails: Drizzle.PaymentDetails.select
})
const response = await useAuthFetch(`/api/v1/forms/${uuid}`)
if (response.statusCode === 200) form.value = response.body
form.value.fields = response.body.fields?.map((field: any) => {
  return {
    id: field.id,
    name: field.fieldName,
    type: field.fieldType,
    required: field.required,
    description: field.fieldDescription,
    ref: ref(''),
  }
})
const paymentModal = ref(false)
const payment_success = ref(false)
const payment_details = ref({
  phone: ''
})

async function submitPayment(): Promise<boolean> {
  const response = await useAuthStream(`/api/v1/forms/pay/${uuid}`, {
    method: 'POST',
    body: JSON.stringify({
      phone: payment_details.value.phone
    })
  })

  const data = await getValuesOnStreamEnd<APIResponse>(response).catch(console.error)
  if (!data) return false
  if (typeof data === 'string') return false

  for (const item of data) {
    console.log(item)
    if (item.statusCode === 200) {
      return true
    }
  }

  return false
}

async function processForm() {
  if (
      form.value.paymentDetails &&
      form.value.paymentDetails.amount > 0 &&
      payment_success.value === false &&
      (!payment_details.value.phone ||
          payment_details.value.phone === '') &&
      payment_details.value.phone.length <= 10
  ) {
    paymentModal.value = true
  } else {
    paymentModal.value = false
    payment_success.value = await submitPayment()
    await submit()
  }
}

async function submit() {
  if (payment_success.value) {
    console.log('Payment successful')
  } else {
    alert('Payment failed')
  }
}

</script>

<template>
  <Title>Form | {{ uuid }}</Title>
  <div class="flex min-h-screen -mt-3">
    <Aside/>
    <div class="flex flex-col p-8 lg:w-1/2 ml-auto mr-auto shadow-2xl h-fit mt-4 rounded-md">
      <div class="header">
        <h1 class="text-2xl font-bold flex items-center content-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
               fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
               stroke-linejoin="round" class="h-8 w-8">
            <path d="M17 6.1H3"></path>
            <path d="M21 12.1H3"></path>
            <path d="M15.1 18H3"></path>
          </svg>
          <span class="ml-2">Form {{ form?.form?.formName }}</span>
        </h1>
      </div>
      <form class="form" @submit.prevent="processForm">
        <div v-for="field in form.fields" :key="field.id" class="form-group">
          <FormField :field="field" :preview="true" v-bind="field.ref" />
        </div>
        <div class="buttons">
          <small v-if="form.paymentDetails" class="justify-self-start mt-5 text-gray-500">
            This form requires payment for submission <br>
            <span class="text-red-400 ">Amount Due: {{ form.paymentDetails.amount }}</span> KES
          </small>
          <button class="submit" type="submit">Submit</button>
        </div>
      </form>
      <Modal :open="paymentModal" title="Please provide your MPESA phone number" @close="processForm"
             @cancel="payment_details = {phone: ''}; paymentModal = false">
        <div class="flex flex-col">
          <input type="tel" class="input" placeholder="MPESA Phone Number" v-model="payment_details.phone"/>
        </div>
      </Modal>
    </div>
  </div>
</template>

<style scoped>
.header {
  @apply bg-slate-600;
  @apply p-4;
  @apply rounded-md;
  @apply mb-4;
  @apply text-white;
}

.buttons {
  @apply flex;
  @apply mt-4;
  @apply items-center;
}

.submit {
  @apply bg-emerald-700;
  @apply text-white;
  @apply pl-4 pr-4;
  @apply pt-2 pb-2;
  @apply rounded-md;
  @apply cursor-pointer;
  @apply transition-colors;
  @apply mt-4;
  @apply hover:bg-emerald-600;
  @apply ml-auto;
}

.input {
  @apply w-full;
  @apply h-10;
  @apply px-3;
  @apply py-2;
  @apply text-sm;
  @apply rounded-md;
  @apply border;
  @apply mb-4;
}
</style>