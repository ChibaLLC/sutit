<script setup lang="ts">
import {type APIResponse, Status, type CreditMethod} from "~/types";
import {type Drizzle} from "~/db/types";
import type {FormElementData, Forms, Stores} from "@chiballc/nuxt-form-builder";


definePageMeta({
  middleware: 'auth'
})

interface Input {
  inputType: string;
  type: string;
  label: string;
  placeholder: string;
  value: string;
  index: number;
  description: string;
}

interface Response {
  ulid?: string;
  formName?: string;
  formDescription?: string;
  pages?: Record<string, FormElementData[]>;
  price?: number;
  userUlid?: string;
  createdAt: string;
  updatedAt: string;

  [key: string]: any;
}

interface FormResponse {
  id: number;
  formUlid: string;
  response: Response | Record<string, FormElementData[]>;
  price: number;
  createdAt: string;
  updatedAt: string;
}

interface Store {
  ulid: string;
  formUlid: string;
  store: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

interface FormEntry {
  form_responses: FormResponse;
  stores: Store;
}

type ServerForm = {
  forms: Omit<Drizzle.Form.select, 'pages'> & {
    pages: Forms
  },
  stores: Omit<Drizzle.Store.select, 'store'> & {
    store: Stores
  }
}


type FormEntries = FormEntry[];

const ulid = useRoute().params.formUuid
if (!ulid) navigateTo('/forms')

const {data: form} = await useFetch<APIResponse<ServerForm>>(`/api/v1/forms/${ulid}`, {
  onResponseError({response}) {
    console.log(response)
  },
  onRequestError({error}) {
    console.log(error)
  }
}).then(({data}) => ({data: data.value?.body}))
const {data: response} = await useFetch<APIResponse<FormEntries>>(`/api/v1/forms/submissions/${ulid}`, {
  headers: {
    Authorization: `Bearer ${getAuthToken()}`
  },
  onResponseError({response}) {
    console.log(response)
  }
}).then(({data}) => ({data: data.value?.body}))

const responses = computed(() => {
  if (!response) return {} as {
    meta: FormResponse;
    response: Record<string, FormElementData[]> | undefined;
  }[]
  return response.map(entry => {
    if (isFormElementData(entry.form_responses.response)) {
      return {
        meta: entry.form_responses,
        response: entry.form_responses.response
      }
    } else {
      return {
        meta: entry.form_responses,
        response: entry.form_responses.response.pages
      }
    }
  })
})

function isFormElementData(data: any): data is Record<string, FormElementData[]> {
  return !data.hasOwnProperty('pages')
}

function getFields(pages: Record<string, FormElementData[]>): FormElementData[] {
  return Object.values(pages || {}).reduce((acc, page) => {
    return acc.concat(page)
  }, [])
}

function getData(pile: {
  meta: FormResponse;
  response: Record<string, FormElementData[]> | undefined;
}[] | undefined) {
  if (!pile) return []
  return pile.map(pages => {
    return {
      fields: getFields(pages.response || {}),
      meta: pages.meta
    }
  })
}

let _hasPayment: boolean | undefined
function hasPayment() {
  if (_hasPayment !== undefined) return _hasPayment
  _hasPayment = form?.forms.price !== 0 || Object.values(form?.stores.store).some(store => store.some(item => item.price !== 0))
  return _hasPayment
}

const fields = computed(() => getFields(form?.forms.pages || {}))
const loadingExcel = ref(false)
async function downloadExcel() {
  loadingExcel.value = true
  const res = await $fetch(`/api/v1/forms/submissions/${ulid}/excel`, {
    headers: {
      Authorization: `Bearer ${getAuthToken()}`,
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    },
    onResponseError({response}) {
      console.log(response)
      alert('Failed to download excel file')
      loadingExcel.value = false
    },
    onRequestError({error}) {
      console.log(error)
      alert('Failed to download excel file')
      loadingExcel.value = false
    }
  }).catch(err => {
    console.log(err)
    alert('Failed to download excel file')
    loadingExcel.value = false
  })

  const url = URL.createObjectURL(res)
  const a = document.createElement('a')
  a.href = url
  a.download = `${form?.forms.formName}.xlsx`
  a.click()
  URL.revokeObjectURL(url)
  loadingExcel.value = false
  a.remove()
}

const total = await useFetch<APIResponse<number>>(`/api/v1/forms/submissions/${ulid}/total`, {
  headers: {
    Authorization: `Bearer ${getAuthToken()}`
  },
  onResponseError({response}) {
    console.log(response)
  }
}).then(({data}) => data.value?.body)

const loadingCheckout = ref(false)
const phone = ref('')
const con_phone = ref('')
const helpText = ref(false)
const noMatch = ref(false)

const checkoutMethod = ref<CreditMethod | null>(null)

async function credit() {
  loadingCheckout.value = true
  showCreditMethodsModal.value = false
  const res = await $fetch<APIResponse>(`/api/v1/forms/credit/${ulid}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getAuthToken()}`,
    },
    body: checkoutMethod.value,
    onResponseError({response}) {
      alert(response._data.body || 'Failed to credit, an error occurred')
      loadingCheckout.value = false
    },
    onRequestError({error}) {
      console.log(error)
      loadingCheckout.value = false
    }
  }).catch(err => {
    console.log(err)
    loadingCheckout.value = false
  })

  if (res?.statusCode === Status.success) {
    alert('Credited successfully')
  }
  loadingCheckout.value = false
}

const showPhoneModal = ref(false)
const showCreditMethodsModal = ref(false)
function addPhone() {
  if (!phone.value.trim() || !con_phone.value.trim() || phone.value !== con_phone.value) {
    helpText.value = true
  } else {
    helpText.value = false
    showPhoneModal.value = false
    checkoutMethod.value = {phone: phone.value} satisfies CreditMethod
    credit()
  }
}

const paybillData = reactive({
  paybill_no: '',
  account_no: ''
})
const showPaybillModal = ref(false)
function addPayBill() {
  if (!paybillData.paybill_no.trim() || !paybillData.account_no.trim()) {
    helpText.value = true
  } else {
    helpText.value = false
    showPaybillModal.value = false
    checkoutMethod.value = paybillData satisfies CreditMethod
    credit()
  }
}

const buyGoodsData = reactive({
  till_no: '',
  till_no_confirm: ''
})
const showBuyGoodsModal = ref(false)
function addBuyGoods() {
  if (!buyGoodsData.till_no.trim() || !buyGoodsData.till_no_confirm.trim() || buyGoodsData.till_no !== buyGoodsData.till_no_confirm) {
    helpText.value = true
  } else {
    helpText.value = false
    showBuyGoodsModal.value = false
    checkoutMethod.value = buyGoodsData satisfies CreditMethod
    credit()
  }
}

watch([phone, con_phone], () => {
  noMatch.value = !!(con_phone.value && con_phone.value !== phone.value);
})
</script>

<template>
  <Title>Submissions | {{ ulid }}</Title>
  <ClientOnly>
    <div class="flex min-h-screen w-full -mt-3">
      <Pill/>
      <main class="w-full flex flex-col items-center max-w-[1200px] mx-auto">
        <div class="mt-4 w-full flex justify-between items-center px-10">
          <span class="font-bold text-left uppercase" style="font-size: larger;">
            Submissions for {{ form?.forms.formName }}</span>

          <div class="flex gap-1">
            <button
                class="flex items-center space-x-2 gap-2 px-3 py-1 bg-[#262626] rounded text-white :hover:bg-gray-20 transition-colors"
                @click="downloadExcel" :class="{ 'cursor-not-allowed': loadingExcel }" :disabled="loadingExcel">
              Excel
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4"
                   v-if="!loadingExcel">
                <path
                    d="M2.85858 2.87732L15.4293 1.0815C15.7027 1.04245 15.9559 1.2324 15.995 1.50577C15.9983 1.52919 16 1.55282 16 1.57648V22.4235C16 22.6996 15.7761 22.9235 15.5 22.9235C15.4763 22.9235 15.4527 22.9218 15.4293 22.9184L2.85858 21.1226C2.36593 21.0522 2 20.6303 2 20.1327V3.86727C2 3.36962 2.36593 2.9477 2.85858 2.87732ZM4 4.73457V19.2654L14 20.694V3.30599L4 4.73457ZM17 19H20V4.99997H17V2.99997H21C21.5523 2.99997 22 3.44769 22 3.99997V20C22 20.5523 21.5523 21 21 21H17V19ZM10.2 12L13 16H10.6L9 13.7143L7.39999 16H5L7.8 12L5 7.99997H7.39999L9 10.2857L10.6 7.99997H13L10.2 12Z">
                </path>
              </svg>
              <span :class="{ 'animate-spin': loadingExcel }" class="w-full grid place-items-center" v-else>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5">
                    <path
                        d="M18.364 5.63604L16.9497 7.05025C15.683 5.7835 13.933 5 12 5C8.13401 5 5 8.13401 5 12C5 15.866 8.13401 19 12 19C15.866 19 19 15.866 19 12H21C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C14.4853 3 16.7353 4.00736 18.364 5.63604Z">
                    </path>
                  </svg>
                </span>
            </button>
            <button
                class="flex items-center space-x-2 gap-2 px-3 py-1 bg-[#262626] rounded text-white :hover:bg-gray-20 transition-colors"
                v-if="hasPayment()" @click="showCreditMethodsModal = true"
                :class="{ 'cursor-not-allowed': loadingCheckout }"
                :disabled="loadingCheckout">
              Credit
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" v-if="!loadingCheckout"
                   class="w-4 h-4">
                <path
                    d="M12 9C11.4477 9 11 9.44771 11 10V15.5856L9.70711 14.2928C9.3166 13.9024 8.68343 13.9024 8.29292 14.2928C7.90236 14.6834 7.90236 15.3165 8.29292 15.7071L11.292 18.7063C11.6823 19.0965 12.3149 19.0968 12.7055 18.707L15.705 15.7137C16.0955 15.3233 16.0955 14.69 15.705 14.2996C15.3145 13.909 14.6814 13.909 14.2908 14.2996L13 15.5903V10C13 9.44771 12.5523 9 12 9Z"
                    fill="currentColor"/>
                <path fill-rule="evenodd" clip-rule="evenodd"
                      d="M21 1C22.6569 1 24 2.34315 24 4V8C24 9.65685 22.6569 11 21 11H19V20C19 21.6569 17.6569 23 16 23H8C6.34315 23 5 21.6569 5 20V11H3C1.34315 11 0 9.65685 0 8V4C0 2.34315 1.34315 1 3 1H21ZM22 8C22 8.55228 21.5523 9 21 9H19V7H20C20.5523 7 21 6.55229 21 6C21 5.44772 20.5523 5 20 5H4C3.44772 5 3 5.44772 3 6C3 6.55229 3.44772 7 4 7H5V9H3C2.44772 9 2 8.55228 2 8V4C2 3.44772 2.44772 3 3 3H21C21.5523 3 22 3.44772 22 4V8ZM7 7V20C7 20.5523 7.44772 21 8 21H16C16.5523 21 17 20.5523 17 20V7H7Z"
                      fill="currentColor"/>
              </svg>
              <span :class="{ 'animate-spin': loadingCheckout }" class="w-full grid place-items-center" v-else>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5">
                    <path
                        d="M18.364 5.63604L16.9497 7.05025C15.683 5.7835 13.933 5 12 5C8.13401 5 5 8.13401 5 12C5 15.866 8.13401 19 12 19C15.866 19 19 15.866 19 12H21C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C14.4853 3 16.7353 4.00736 18.364 5.63604Z">
                    </path>
                  </svg>
                </span>
            </button>
            <span class="flex items-center space-x-2 px-3 py-1 rounded text-[#262626]" v-if="hasPayment()">
                <span class="text-[#262626]">Total:</span>
                <span class="text-[#262626] font-bold font-mono">KES {{ total }}</span>
              </span>
          </div>
        </div>

        <div class="w-full mt-2 px-10 relative overflow-x-auto rounded-t">
          <table class="w-full text-sm text-left rtl:text-right bg-[#262626] rounded-t">
            <thead class="text-xs bg-[#262626] text-white uppercase bg-gray-5 rounded-t">
            <tr class="text-left border-b border-gray-100">
              <th v-for="field in fields" class="px-6 py-3">
                {{ field.label }}
              </th>
              <th v-if="hasPayment()" class="px-6 py-3">
                Payment
              </th>
            </tr>
            </thead>
            <tbody class="divide-y divide-slate-900 text-white border-b">
            <tr v-for="data in getData(responses as any)" class="text-sm text-gray-700cursor-pointer hover:bg-[#333]">
              <td v-for="column of data.fields" class="px-6 py-4">
                {{ column.value }}
              </td>
              <td v-if="hasPayment()" class="px-6 py-4">
                KES {{ data.meta.price }}
              </td>
            </tr>
            </tbody>
          </table>
        </div>

        <Modal title="Choose a Credit Method" :open="showCreditMethodsModal" @close="showCreditMethodsModal = false"
               @cancel="showCreditMethodsModal = false">
          <div class="flex flex-col gap-2">
            <button @click="showPhoneModal = true"
                    class="flex items-center justify-between space-x-2 gap-2 px-3 py-1 bg-[#262626] rounded text-white">
              <span>Your Phone Number</span>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4">
                <path
                    d="M7 4V20H17V4H7ZM6 2H18C18.5523 2 19 2.44772 19 3V21C19 21.5523 18.5523 22 18 22H6C5.44772 22 5 21.5523 5 21V3C5 2.44772 5.44772 2 6 2ZM12 17C12.5523 17 13 17.4477 13 18C13 18.5523 12.5523 19 12 19C11.4477 19 11 18.5523 11 18C11 17.4477 11.4477 17 12 17Z"></path>
              </svg>
            </button>
            <button @click="showBuyGoodsModal = true"
                    class="flex items-center justify-between space-x-2 gap-2 px-3 py-1 bg-[#262626] rounded text-white">
              <span>Your Till Number</span>
              <svg fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4">
                <path fill-rule="evenodd"
                      d="M16,6 L20,6 C21.1045695,6 22,6.8954305 22,8 L22,16 C22,17.1045695 21.1045695,18 20,18 L16,18 L16,19.9411765 C16,21.0658573 15.1177541,22 14,22 L4,22 C2.88224586,22 2,21.0658573 2,19.9411765 L2,4.05882353 C2,2.93414267 2.88224586,2 4,2 L14,2 C15.1177541,2 16,2.93414267 16,4.05882353 L16,6 Z M20,11 L16,11 L16,16 L20,16 L20,11 Z M14,19.9411765 L14,4.05882353 C14,4.01396021 13.9868154,4 14,4 L4,4 C4.01318464,4 4,4.01396021 4,4.05882353 L4,19.9411765 C4,19.9860398 4.01318464,20 4,20 L14,20 C13.9868154,20 14,19.9860398 14,19.9411765 Z M5,19 L5,17 L7,17 L7,19 L5,19 Z M8,19 L8,17 L10,17 L10,19 L8,19 Z M11,19 L11,17 L13,17 L13,19 L11,19 Z M5,16 L5,14 L7,14 L7,16 L5,16 Z M8,16 L8,14 L10,14 L10,16 L8,16 Z M11,16 L11,14 L13,14 L13,16 L11,16 Z M13,5 L13,13 L5,13 L5,5 L13,5 Z M7,7 L7,11 L11,11 L11,7 L7,7 Z M20,9 L20,8 L16,8 L16,9 L20,9 Z"/>
              </svg>
            </button>
            <button @click="showPaybillModal = true"
                    class="flex items-center space-x-2 justify-between gap-2 px-3 py-1 bg-[#262626] rounded text-white">
              <span>Send To Paybill</span>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4">
                <path
                    d="M20 9V5H4V9H20ZM20 11H4V19H20V11ZM3 3H21C21.5523 3 22 3.44772 22 4V20C22 20.5523 21.5523 21 21 21H3C2.44772 21 2 20.5523 2 20V4C2 3.44772 2.44772 3 3 3ZM5 12H8V17H5V12ZM5 6H7V8H5V6ZM9 6H11V8H9V6Z"></path>
              </svg>
            </button>
          </div>
        </Modal>

        <LazyModal title="Enter Phone Number" @close="addPhone()" @cancel="showPhoneModal = false"
               :open="showPhoneModal">
          <div>
            <label for="phone">Phone Number</label>
            <input type="tel" id="phone"
                   class="border-1 border-solid px-3 py-3 placeholder-gray-400 text-gray-700 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full mt-1"
                   placeholder="Phone number" v-model="phone">
            <small class="text-gray-500">This is where the funds will be sent</small>
          </div>
          <div class="mt-2">
            <label for="phone">Phone Number Again</label>
            <input type="tel" id="phone_confirm"
                   class="border-1 border-solid px-3 py-3 placeholder-gray-400 text-gray-700 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full mt-1"
                   placeholder="Phone number" v-model="con_phone">
            <small class="text-gray-500">Just to make sure we have the right one</small>
          </div>
          <div v-if="helpText">
            <p class="text-red-500 text-sm">Please provide a phone number</p>
          </div>
          <div v-if="noMatch">
            <p class="text-red-500 text-sm">Phone numbers do not match</p>
          </div>
        </LazyModal>

        <LazyModal title="Enter Till Number" @close="addBuyGoods()"
               @cancel="showBuyGoodsModal = false"
               :open="showBuyGoodsModal">
          <div>
            <label for="till_no">Till Number</label>
            <input type="tel" id="till_no"
                   class="border-1 border-solid px-3 py-3 placeholder-gray-400 text-gray-700 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full mt-1"
                   placeholder="Till number" v-model="buyGoodsData.till_no">
            <small class="text-gray-500">This is where the funds will be paid to</small>
          </div>
          <div>
            <label for="till_no_confirm">Till Number Again</label>
            <input type="tel" id="till_no_confirm"
                   class="border-1 border-solid px-3 py-3 placeholder-gray-400 text-gray-700 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full mt-1"
                   placeholder="Till number" v-model="buyGoodsData.till_no_confirm">
            <small class="text-gray-500">Just to make sure we have the right one</small>
          </div>
          <div v-if="helpText">
            <p class="text-red-500 text-sm">Please provide a till number</p>
          </div>
        </LazyModal>

        <LazyModal title="Enter Paybill Details" @close="addPayBill()"
               @cancel="showPaybillModal = false"
               :open="showPaybillModal">
          <div>
            <label for="paybill_no">Paybill Number</label>
            <input type="tel" id="paybill_no"
                   class="border-1 border-solid px-3 py-3 placeholder-gray-400 text-gray-700 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full mt-1"
                   placeholder="Paybill number" v-model="paybillData.paybill_no">
            <small class="text-gray-500">This is the paybill number</small>
          </div>
          <div class="mt-2">
            <label for="account_no">Account Number</label>
            <input type="tel" id="account_no"
                   class="border-1 border-solid px-3 py-3 placeholder-gray-400 text-gray-700 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full mt-1"
                   placeholder="Account number" v-model="paybillData.account_no">
            <small class="text-gray-500">This is the account number</small>
          </div>
          <div v-if="helpText">
            <p class="text-red-500 text-sm">Please provide a paybill number</p>
          </div>
        </LazyModal>
      </main>
    </div>
  </ClientOnly>
</template>

<style scoped></style>
