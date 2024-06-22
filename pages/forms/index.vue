<script setup lang="ts">
import { type APIResponse, Status } from "~/types";

const forms = ref<any[]>([])

if (!userIsAuthenticated()) {
  await navigateTo("/login?redirect=forms")
}

const { data } = await useFetch<APIResponse>("/api/v1/forms/me", {
  headers: {
    Authorization: `Bearer ${getAuthToken()}`,
  }
}).catch(console.error)

const res = data.value as APIResponse
if (res.statusCode === Status.success) {
  forms.value = res.body
}


function getShareableLink(formUuid: string) {
  const link = `${window.location.origin}/forms/${formUuid}`
  navigator.clipboard.writeText(link)

  const copyLink = document.getElementById(`copy_link_${formUuid}`)
  const copySuccess = document.getElementById(`copy_success_${formUuid}`)

  if (copyLink && copySuccess) {
    copyLink.classList.add('hidden')
    copySuccess.classList.remove('hidden')
    setTimeout(() => {
      copyLink.classList.remove('hidden')
      copySuccess.classList.add('hidden')
    }, 2000)
  }
}

onMounted(() => {
  const trs = document.getElementsByTagName('tr') as HTMLCollectionOf<HTMLElement>

  for (let i = 0; i < trs.length; i++) {
    for (let j = 0; j < trs[i].children.length - 1; j++) {
      trs[i].children[j].addEventListener('click', async () => {
        const location = trs[i].getAttribute('data-location')
        if (location) await navigateTo(`/submissions/${location}`)
      })
    }
  }
})
</script>
<template>
  <Title>Dashboard</Title>
  <div class="flex min-h-screen w-full -mt-3">
    <Aside />
    <main class="w-full flex flex-col items-center">
      <div class="relative rounded-xl overflow-auto">
        <div class="flex self-start">
          <NuxtLink to="/forms/create"
            class="p-4 mb-5 bg-emerald-700 text-white rounded mt-4 ml-auto hover:bg-emerald-600 transition-colors">
            Create Form
          </NuxtLink>
        </div>
        <div class="shadow-lg overflow-hidden my-8 border-slate-900">
          <table class="border-collapse table-auto w-full text-sm" v-if="forms.length > 0">
            <thead>
              <tr>
                <th class="border-b font-medium p-4 pl-8 pt-0 pb-3 text-slate-700 text-left">
                  Id
                </th>
                <th class="border-b font-medium p-4 pl-8 pt-0 pb-3 text-slate-700 text-left">
                  Name
                </th>
                <th class="border-b font-medium p-4 pl-8 pt-0 pb-3 text-slate-700 text-left">
                  Created
                </th>
                <th class="border-b font-medium p-4 pl-8 pt-0 pb-3 text-slate-700 text-left">
                  Has Payment?
                </th>
                <th class="border-b font-medium p-4 pl-8 pt-0 pb-3 text-slate-700 text-center">
                  View
                </th>
              </tr>
            </thead>
            <tbody class="bg-white">
              <tr v-for="form in forms" :key="form.id" class="hover:bg-gray-100 hover:cursor-pointer"
                :data-location="form.ulid" title="tr">
                <td class="border-b border-slate-100 p-4 pl-8 text-slate-700">
                  {{ form.ulid }}
                </td>
                <td class="border-b border-slate-100 p-4 pl-8 text-slate-700">
                  {{ form.formName }}
                </td>
                <td class="border-b border-slate-100 p-4 pl-8 text-slate-700">
                  {{ form.createdAt }}
                </td>
                <td class="border-b border-slate-100 p-4 pl-8 text-slate-700">
                  {{ form.price ? 'Yes' : 'No' }}
                </td>
                <td class="border-b border-slate-100 p-4 pl-8 text-slate-700 flex items-center">
                  <NuxtLink :to="`/forms/${form.ulid}`">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="w-5 h-5 fill-slate-700">
                      <path
                        d="M12.0003 3C17.3924 3 21.8784 6.87976 22.8189 12C21.8784 17.1202 17.3924 21 12.0003 21C6.60812 21 2.12215 17.1202 1.18164 12C2.12215 6.87976 6.60812 3 12.0003 3ZM12.0003 19C16.2359 19 19.8603 16.052 20.7777 12C19.8603 7.94803 16.2359 5 12.0003 5C7.7646 5 4.14022 7.94803 3.22278 12C4.14022 16.052 7.7646 19 12.0003 19ZM12.0003 16.5C9.51498 16.5 7.50026 14.4853 7.50026 12C7.50026 9.51472 9.51498 7.5 12.0003 7.5C14.4855 7.5 16.5003 9.51472 16.5003 12C16.5003 14.4853 14.4855 16.5 12.0003 16.5ZM12.0003 14.5C13.381 14.5 14.5003 13.3807 14.5003 12C14.5003 10.6193 13.381 9.5 12.0003 9.5C10.6196 9.5 9.50026 10.6193 9.50026 12C9.50026 13.3807 10.6196 14.5 12.0003 14.5Z">
                      </path>
                    </svg>
                  </NuxtLink>
                  <span class="p-2 text-white rounded" @click.prevent="getShareableLink(form.formUuid)" title="copy">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="w-5 h-5 fill-slate-700"
                      :id="`copy_link_${form.ulid}`">
                      <path
                        d="M13.1202 17.0228L8.92129 14.7324C8.19135 15.5125 7.15261 16 6 16C3.79086 16 2 14.2091 2 12C2 9.79086 3.79086 8 6 8C7.15255 8 8.19125 8.48746 8.92118 9.26746L13.1202 6.97713C13.0417 6.66441 13 6.33707 13 6C13 3.79086 14.7909 2 17 2C19.2091 2 21 3.79086 21 6C21 8.20914 19.2091 10 17 10C15.8474 10 14.8087 9.51251 14.0787 8.73246L9.87977 11.0228C9.9583 11.3355 10 11.6629 10 12C10 12.3371 9.95831 12.6644 9.87981 12.9771L14.0788 15.2675C14.8087 14.4875 15.8474 14 17 14C19.2091 14 21 15.7909 21 18C21 20.2091 19.2091 22 17 22C14.7909 22 13 20.2091 13 18C13 17.6629 13.0417 17.3355 13.1202 17.0228ZM6 14C7.10457 14 8 13.1046 8 12C8 10.8954 7.10457 10 6 10C4.89543 10 4 10.8954 4 12C4 13.1046 4.89543 14 6 14ZM17 8C18.1046 8 19 7.10457 19 6C19 4.89543 18.1046 4 17 4C15.8954 4 15 4.89543 15 6C15 7.10457 15.8954 8 17 8ZM17 20C18.1046 20 19 19.1046 19 18C19 16.8954 18.1046 16 17 16C15.8954 16 15 16.8954 15 18C15 19.1046 15.8954 20 17 20Z">
                      </path>
                    </svg>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
                      :id="`copy_success_${form.ulid}`" class="w-5 h-5 fill-slate-700 hidden">
                      <path
                        d="M9.9997 15.1709L19.1921 5.97852L20.6063 7.39273L9.9997 17.9993L3.63574 11.6354L5.04996 10.2212L9.9997 15.1709Z">
                      </path>
                    </svg>
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
          <div class="flex justify-center items-center p-4" v-else>
            <p class="text-slate-700">No forms found</p>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
<style scoped></style>