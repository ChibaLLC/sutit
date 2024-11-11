<script setup lang="ts">
import type {Forms, Stores, FormStoreData} from "@chiballc/nuxt-form-builder";

definePageMeta({
  middleware: ["auth"],
  layout: 'novbar'
})


const showPriceModal = ref(false)
const showFormNameModal = ref(false)
const helpText = ref(false)

const submitData = reactive({
  name: '',
  description: '',
  allowGroups: false,
  formData: {
    pages: {} as Forms,
    stores: {} as Stores,
  },
  payment: {
    amount: 0
  },
})

function addPaymentOption() {
  showPriceModal.value = true
}

async function submit(data: FormStoreData) {
  submitData.formData = {
    pages: data.forms,
    stores: data.stores
  }
  if (Object.entries(data.forms || {})?.length === 0 && Object.entries(data.stores || {})?.length === 0) {
    alert('Please add a form or a store')
  }

  const res = await $fetch<APIResponse<any>>('/api/v1/forms/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + getAuthToken()
    },
    body: submitData
  })

  if (res.statusCode < 299) {
    alert('Form created successfully')
    await navigateTo('/forms')
  } else {
    alert(res.body)
  }
}

onMounted(() => {
  showFormNameModal.value = true
})

function closeFormDetailsModal() {
  if (submitData.name.trim() === '') {
    helpText.value = true
  } else {
    showFormNameModal.value = false
  }
}
</script>

<template>
  <Title>Build Form</Title>
  <LazyFormBuilder :styles="{height: '100vh'}" @submit="submit">
    <template #footer>
      <LazyFormBuilderFooterItem>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-7 h-7"
             @click="addPaymentOption">
          <path
              d="M22.0049 6.99979H23.0049V16.9998H22.0049V19.9998C22.0049 20.5521 21.5572 20.9998 21.0049 20.9998H3.00488C2.4526 20.9998 2.00488 20.5521 2.00488 19.9998V3.99979C2.00488 3.4475 2.4526 2.99979 3.00488 2.99979H21.0049C21.5572 2.99979 22.0049 3.4475 22.0049 3.99979V6.99979ZM20.0049 16.9998H14.0049C11.2435 16.9998 9.00488 14.7612 9.00488 11.9998C9.00488 9.23836 11.2435 6.99979 14.0049 6.99979H20.0049V4.99979H4.00488V18.9998H20.0049V16.9998ZM21.0049 14.9998V8.99979H14.0049C12.348 8.99979 11.0049 10.3429 11.0049 11.9998C11.0049 13.6566 12.348 14.9998 14.0049 14.9998H21.0049ZM14.0049 10.9998H17.0049V12.9998H14.0049V10.9998Z"></path>
        </svg>
      </LazyFormBuilderFooterItem>
    </template>
  </LazyFormBuilder>
  <Modal :open="showPriceModal" @close="showPriceModal = false" @cancel="showPriceModal = false" name="Add Charge">
    <div>
      <label for="payment-amount">Amount</label>
      <input type="number" id="payment-amount"
             class="border-1 border-solid px-3 py-3 placeholder-gray-400 text-gray-700 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full mt-2"
             placeholder="Amount to charge for the form" v-model="submitData.payment.amount">
    </div>
  </Modal>
  <Modal :open="showFormNameModal" @cancel="closeFormDetailsModal" @close="closeFormDetailsModal"
         name="New Form Details">
    <div>
      <label for="form-name">Name</label>
      <input type="text" id="form-name"
             class="border-1 border-solid px-3 py-3 placeholder-gray-400 text-gray-700 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full mt-1"
             placeholder="Name of the form (Required)" v-model="submitData.name">
      <small class="text-gray-500">This will be the title of the form</small>
    </div>
    <div class="mt-4">
      <label for="form-description">Description</label>
      <textarea id="form-description"
                class="border-1 border-solid px-3 py-3 placeholder-gray-400 text-gray-700 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full mt-1"
                placeholder="Description of the form" v-model="submitData.description"></textarea>
    </div>
    <div class="mt-2 flex gap-3 cursor-pointer flex-row-reverse justify-end">
      <label for="groups">Allow grouped responses</label>
      <input type="checkbox" id="groups" v-model="submitData.allowGroups">
    </div>
    <div v-if="helpText">
      <p class="text-red-500 text-sm">Please provide a name for the form</p>
    </div>
  </Modal>
</template>

<style scoped>

</style>