<script setup lang="ts">
import { type Drizzle } from "~/db/types";
import { Status, type APIResponse } from "~/types";

type ServerForm = {
  forms: Omit<Drizzle.Form.select, 'pages'> & {
    pages: FBTypes.Forms
  },
  stores: Omit<Drizzle.Store.select, 'store'> & {
    store: FBTypes.Stores
  }
}

const loading = ref(false)
const ulid = useRoute().params?.formUlid

if (!userIsAuthenticated()) {
  await navigateTo(`/login?redirect=/forms/${ulid}`)
}

const res = await useFetch<APIResponse<ServerForm>>(`/api/v1/forms/${ulid}`, {
  onResponseError({ response }) {
    console.log(response)
  }
}).catch(console.error)

const data = res?.data.value?.body || {} as ServerForm
const paymentModal = ref(false)
const payment_success = ref(false)
const payment_details = ref({
  phone: ''
})

async function submitPayment(): Promise<boolean> {
  if (!payment_details.value.phone || payment_details.value.phone === '') {
    alert('Please provide your MPESA phone number')
    return false
  }
  const response = await useStream(`/api/v1/forms/pay/${ulid}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getAuthToken()}`
    },
    body: {
      phone: payment_details.value.phone
    },
    onResponseError({ response }): Promise<void> | void {
      console.log(response._data.body)
      alert('Payment failed, please try again later')
    }
  }).catch(e => {
    alert('Payment failed, please try again later')
    console.error(e)
  })

  return new Promise((resolve, reject) => {
    if (!response) return reject(false)
    response.on('data', async (data) => {
      switch (data.statusCode) {
        case Status.success:
          resolve(true)
          payment_success.value = true
          loading.value = true
          await submit()
          alert("Payment Complete")
          await navigateTo(`/`)
          break
        case Status.badRequest:
          log.error(data.body)
          resolve(false)
          break
        case Status.internalServerError:
          alert('Payment failed, please try again later')
          resolve(false)
          break
        case Status.unprocessableEntity:
          alert(data.body)
          resolve(false)
          break
        default:
          resolve(false)
      }
    })

    response.on('end', () => {
      resolve(false)
      loading.value = false
    })
  })
}

async function processForm() {
  loading.value = true
  if (
    data.forms.price! > 0 &&
    payment_success.value === false &&
    (!payment_details.value.phone ||
      payment_details.value.phone === '') &&
    payment_details.value.phone.length <= 10
  ) {
    paymentModal.value = true
  } else if (payment_details.value.phone.length >= 10 && payment_details.value.phone !== '' && payment_success.value === false) {
    paymentModal.value = false
    log.info("Processing Payment")
    await submitPayment()
  } else {
    console.log("Submitting form", data)
    payment_success.value = true
    await submit()
  }
}

async function submit() {
  loading.value = true
  if (payment_success.value) {
    await $fetch(`/api/v1/forms/submit/${ulid}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${getAuthToken()}`
      },
      body: {
        form: data
      },
      onResponse({ response }): Promise<void> | void {
        if (response._data.statusCode === Status.success) {
          alert('Form submitted successfully')
        } else {
          alert('Form submission failed, please try again later')
        }
      },
      onResponseError({ response }) {
        log.error(response)
      }
    })
  } else {
    console.log(payment_success.value)
    alert('Payment failed, please try again later')
  }
  loading.value = false
}

function addCharge(amount: number) {
  if (data.forms.price) {
    data.forms.price += amount
  } else {
    data.forms.price = amount
  }
}

const formStoreData = computed(() => {
  return {
    forms: data.forms.pages,
    stores: data.stores.store
  } as FBTypes.FormStoreData
})
</script>

<template>
  <Title>Form | {{ data.forms.formName }}</Title>
  <div class="flex min-h-screen -mt-3">
    <Aside />
    <div class="flex flex-col p-2 w-full max-w-[820px] ml-auto mr-auto shadow-2xl h-fit mt-4 rounded-md">
      <div class="header">
        <h1 class="text-2xl p-2 font-bold flex items-center content-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-8 w-8">
            <path d="M17 6.1H3"></path>
            <path d="M21 12.1H3"></path>
            <path d="M15.1 18H3"></path>
          </svg>
          <span class="ml-2">{{ data.forms.formName }}</span>
        </h1>
        <p class="bg-slate-700 w-full px-4 py-2 pl-12 rounded" v-if="data.forms.formDescription">
          {{ data.forms.formDescription }}
        </p>
      </div>
      <form class="form" @submit.prevent="processForm">
        <FormViewer :data="formStoreData" @submit="processForm" />
        <div class="flex mt-4 items-center ml-5 relative" v-if="data.forms.price > 0">
          <small class="justify-self-start mt-5 text-gray-500 absolute" style="top: -5.85rem">
            This form requires payment for submission <br>
            <span class="text-red-400 ">Amount Due: {{ data.forms.price }}</span> KES
          </small>
        </div>
      </form>
      <Modal :open="paymentModal" name="Please provide your MPESA phone number" @close="processForm"
        @cancel="payment_details = { phone: '' }; paymentModal = false">
        <div class="flex flex-col">
          <input type="tel" class="input" placeholder="MPESA Phone Number" v-model="payment_details.phone" />
        </div>
      </Modal>
    </div>
  </div>
</template>

<style scoped>
.header {
  @apply bg-slate-600;
  @apply rounded-md;
  @apply text-white;
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