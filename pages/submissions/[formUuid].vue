<script setup lang="ts">
import { type APIResponse, Status } from "~/types";
import { type Drizzle } from "~/db/types";
import type { FormElementData, Forms, Stores } from "@chiballc/nuxt-form-builder";
import { capitalize } from "vue";

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

const { data: form } = await useFetch<APIResponse<ServerForm>>(`/api/v1/forms/${ulid}`, {
  onResponseError({ response }) {
    console.log(response)
  },
  onRequestError({ error }) {
    console.log(error)
  }
}).then(({ data }) => ({ data: data.value?.body }))
const { data: response } = await useFetch<APIResponse<FormEntries>>(`/api/v1/forms/submissions/${ulid}`, {
  headers: {
    Authorization: `Bearer ${getAuthToken()}`
  },
  onResponseError({ response }) {
    console.log(response)
  }
}).then(({ data }) => ({ data: data.value?.body }))

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
      Authorization: `Bearer ${getAuthToken()}`
    }
  }).catch(err => {
    console.log(err)
    alert('Failed to download excel file')
    loadingExcel.value = false
  })
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${form?.forms.formName}.xlsx`
  a.click()
  URL.revokeObjectURL(url)
  loadingExcel.value = false
}
</script>

<template>
  <Title>Submissions | {{ ulid }}</Title>
  <ClientOnly>
    <div class="flex min-h-screen w-full -mt-3">
      <Aside />
      <main class="w-full flex flex-col items-center">
        <div class="mt-4 w-full flex justify-between items-center px-10">
          <span class="text-2xl font-bold text-left">Submissions for {{ capitalize(form?.forms.formName!) }}</span>
          <span>
            <button
              class="flex items-center space-x-2 gap-2 px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded text-gray-700 dark:text-gray-200 :hover:bg-gray-200 dark:hover:bg-gray-700 dark:hover:text-white transition-colors"
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
          </span>
        </div>

        <div class="w-full mt-4 px-10 relative overflow-x-auto">
          <table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
            <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-900 dark:text-gray-400">
              <tr class="text-left">
                <th v-for="field in fields" class=" px-6 py-3">
                  {{ field.label }}
                </th>
                <th v-if="hasPayment()" class=" px-6 py-3">
                  Payment
                </th>
              </tr>
            </thead>
            <tbody class=" divide-y divide-gray-200 bg-white border-b dark:bg-gray-800 dark:border-gray-00">
              <tr v-for="data in getData(responses as any)"
                class="text-sm text-gray-700 dark:text-gray-400 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
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
      </main>
    </div>
  </ClientOnly>
</template>

<style scoped></style>
