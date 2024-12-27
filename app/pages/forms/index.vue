<script setup lang="ts">
definePageMeta({
  middleware: ['auth']
})

const { data: meta } = await useFetch("/api/forms/me", {
  headers: {
    Authorization: `Bearer ${getAuthToken()}`,
  },
  onResponseError({ response }) {
    console.error(response)
  }
})

function getShareableLink(formUuid: string) {
  const link = `${window.location.origin}/forms/${formUuid}`
  navigator?.clipboard?.writeText(link)
  navigator.share({ url: link })

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

function navigateIfTarget(event: MouseEvent, location: string) {
  if ((event.target as HTMLElement)?.tagName?.toLowerCase() !== 'td') return
  navigateTo(location)
}

function deleteForm(ulid: string) {
  const form = meta.value?.find((fs) => fs.ulid === ulid)
  meta.value = meta.value?.filter((fs) => fs.ulid !== ulid)
  $fetch(`/api/forms/${ulid}/delete`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${getAuthToken()}`
    },
    onResponse({ response }) {
      if (response.ok) return
      meta.value?.push(form as any)
    },
    onResponseError({error}){
      log.error(error)
    }
  })
}
</script>
<template>
  <Title>Forms</Title>
  <div class="flex min-h-screen w-full">
    <main class="w-full max-w-[1200px] mx-auto flex flex-col items-center">
      <div class="w-full px-8 mt-5 relative overflow-x-auto rounded-t">
        <div class="py-2 flex justify-between items-center">
          <span class="font-bold text-left text-lg">All your forms so far</span>
          <NuxtLink to="/forms/create"
            class="p-2 text-center bg-emerald-700 text-white rounded hover:bg-emerald-600 transition-colors w-40 font-semibold uppercase">
            Create A Form</NuxtLink>
        </div>
        <table class="w-full text-sm text-left rtl:text-righ rounded bg-gradient-to-br from-white to-slate-100 text-slate-900 mt-1"
          v-if="meta?.length">
          <thead class="text-xs uppercase rounded-t bg-slate-200">
            <tr class="text-left border-b border-gray-200">
              <th class="px-6 py-3 w-5">
                #
              </th>
              <th class="px-6 py-3">
                Name
              </th>
              <th class="px-6 py-3">
                Description
              </th>
              <th class="px-6 py-3">
                Created
              </th>
              <th class="px-6 py-3 w-40">
                Has Payment?
              </th>
              <th class="px-6 py-3 w-5">
                Action
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 border-b">
            <tr v-for="(item, index) in meta" :key="item.ulid"
              class="text-sm cursor-pointer hover:bg-slate-200"
              @click="navigateIfTarget($event, `/forms/${item.ulid}/submissions`)">
              <td class="px-6 py-4 border-r border-gray-100">
                {{ index + 1 }}
              </td>
              <td class="px-6 py-4">
                {{ item.formName }}
              </td>
              <td class="px-6 py-4">
                {{ item.formDescription }}
              </td>
              <td class="px-6 py-4">
                {{ new Date(item.createdAt).toLocaleString() }}
              </td>
              <td class="px-6 py-4">
                {{ item.price_individual || item.price_group ? 'Yes' : 'No' }}
              </td>
              <td class="px-6 py-4">
                <div class="flex justify-center gap-1 items-center h-full">
                  <NuxtLink :to="`/forms/${item.ulid}`" title="view">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                      class="w-5 h-5 hover:text-blue-500 transition-colors" fill="currentColor">
                      <path
                        d="M12.0003 3C17.3924 3 21.8784 6.87976 22.8189 12C21.8784 17.1202 17.3924 21 12.0003 21C6.60812 21 2.12215 17.1202 1.18164 12C2.12215 6.87976 6.60812 3 12.0003 3ZM12.0003 19C16.2359 19 19.8603 16.052 20.7777 12C19.8603 7.94803 16.2359 5 12.0003 5C7.7646 5 4.14022 7.94803 3.22278 12C4.14022 16.052 7.7646 19 12.0003 19ZM12.0003 16.5C9.51498 16.5 7.50026 14.4853 7.50026 12C7.50026 9.51472 9.51498 7.5 12.0003 7.5C14.4855 7.5 16.5003 9.51472 16.5003 12C16.5003 14.4853 14.4855 16.5 12.0003 16.5ZM12.0003 14.5C13.381 14.5 14.5003 13.3807 14.5003 12C14.5003 10.6193 13.381 9.5 12.0003 9.5C10.6196 9.5 9.50026 10.6193 9.50026 12C9.50026 13.3807 10.6196 14.5 12.0003 14.5Z">
                      </path>
                    </svg>
                  </NuxtLink>
                  <span class="rounded" @click.prevent="getShareableLink(item.ulid)" title="share">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="w-5 h-5" fill="currentColor"
                      :id="`copy_link_${item.ulid}`">
                      <path
                        d="M13.1202 17.0228L8.92129 14.7324C8.19135 15.5125 7.15261 16 6 16C3.79086 16 2 14.2091 2 12C2 9.79086 3.79086 8 6 8C7.15255 8 8.19125 8.48746 8.92118 9.26746L13.1202 6.97713C13.0417 6.66441 13 6.33707 13 6C13 3.79086 14.7909 2 17 2C19.2091 2 21 3.79086 21 6C21 8.20914 19.2091 10 17 10C15.8474 10 14.8087 9.51251 14.0787 8.73246L9.87977 11.0228C9.9583 11.3355 10 11.6629 10 12C10 12.3371 9.95831 12.6644 9.87981 12.9771L14.0788 15.2675C14.8087 14.4875 15.8474 14 17 14C19.2091 14 21 15.7909 21 18C21 20.2091 19.2091 22 17 22C14.7909 22 13 20.2091 13 18C13 17.6629 13.0417 17.3355 13.1202 17.0228ZM6 14C7.10457 14 8 13.1046 8 12C8 10.8954 7.10457 10 6 10C4.89543 10 4 10.8954 4 12C4 13.1046 4.89543 14 6 14ZM17 8C18.1046 8 19 7.10457 19 6C19 4.89543 18.1046 4 17 4C15.8954 4 15 4.89543 15 6C15 7.10457 15.8954 8 17 8ZM17 20C18.1046 20 19 19.1046 19 18C19 16.8954 18.1046 16 17 16C15.8954 16 15 16.8954 15 18C15 19.1046 15.8954 20 17 20Z">
                      </path>
                    </svg>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
                      :id="`copy_success_${item.ulid}`" class="w-5 h-5  hidden">
                      <path
                        d="M9.9997 15.1709L19.1921 5.97852L20.6063 7.39273L9.9997 17.9993L3.63574 11.6354L5.04996 10.2212L9.9997 15.1709Z">
                      </path>
                    </svg>
                  </span>
                  <NuxtLink :to="`/forms/${item.ulid}/edit`" title="edit">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 hover:text-orange-500 transition-colors"
                      viewBox="0 0 24 24" fill="currentColor">
                      <path
                        d="M16.7574 2.99677L14.7574 4.99677H5V18.9968H19V9.23941L21 7.23941V19.9968C21 20.5491 20.5523 20.9968 20 20.9968H4C3.44772 20.9968 3 20.5491 3 19.9968V3.99677C3 3.44448 3.44772 2.99677 4 2.99677H16.7574ZM20.4853 2.09727L21.8995 3.51149L12.7071 12.7039L11.2954 12.7063L11.2929 11.2897L20.4853 2.09727Z">
                      </path>
                    </svg>
                  </NuxtLink>
                  <span @click="deleteForm(item.ulid)">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
                      class="w-5 h-5 hover:text-red-500 transition-colors">
                      <path
                        d="M17 6H22V8H20V21C20 21.5523 19.5523 22 19 22H5C4.44772 22 4 21.5523 4 21V8H2V6H7V3C7 2.44772 7.44772 2 8 2H16C16.5523 2 17 2.44772 17 3V6ZM18 8H6V20H18V8ZM13.4142 13.9997L15.182 15.7675L13.7678 17.1817L12 15.4139L10.2322 17.1817L8.81802 15.7675L10.5858 13.9997L8.81802 12.232L10.2322 10.8178L12 12.5855L13.7678 10.8178L15.182 12.232L13.4142 13.9997ZM9 4V6H15V4H9Z">
                      </path>
                    </svg>
                  </span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <div class="flex justify-center items-center p-4" v-else>
          <p class="text-slate-700">No forms found</p>
        </div>
      </div>
    </main>
  </div>
</template>
<style scoped></style>