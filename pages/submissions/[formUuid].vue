<script setup lang="ts">
import { type APIResponse, Status } from "~/types";
import { type Drizzle } from "~/db/types";
import type { Forms, Stores } from "@chiballc/nuxt-form-builder";


const ulid = useRoute().params.formUuid
if (!ulid) navigateTo('/forms')

const response = await useFetch<APIResponse<Array<{ stores: Omit<Drizzle.StoreResponses.select, 'response'> & { response: Stores }, form_responses: Omit<Drizzle.FormResponses.select, 'response'> & { response: Forms } }>>>(`/api/v1/forms/submissions/${ulid}`, {
  headers: {
    Authorization: `Bearer ${getAuthToken()}`
  },
  onResponse({ response }): Promise<void> | void {
    const res = response._data as APIResponse<any>
    if (res.statusCode === Status.success) {
      console.log(res.body)
    }
  },
  onResponseError({ response }) {
    console.log(response)
  }
}).catch(console.error)

const data = response!.data!.value || { body: [] }
</script>

<template>
  <Title>Submissions | {{ ulid }}</Title>
  <ClientOnly>
    <div class="flex min-h-screen w-full -mt-3">
      <Aside />
      <main class="w-full flex flex-col items-center">
        <h1 class="text-2xl font-bold mt-4">Submissions</h1>

        <div class="w-full mt-4 px-10">
          <table class="w-full">
            <thead>
              <tr>
                <th class="border border-gray-300">ID</th>
                <th class="border border-gray-300">Date</th>
                <th class="border border-gray-300">Response</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(submission, index) in data.body">
                <td class="border border-gray-300">{{ index + 1 }}</td>
                <td class="border border-gray-300">{{ submission.form_responses.createdAt }}</td>
                <td class="border border-gray-300">
                  <ul>
                    <li v-for="pages in submission.form_responses.response">
                      <ul>
                        <li v-for="field of pages">
                          <span>{{ field?.label }}</span>:&nbsp;
                          <span>{{ field?.value }}</span>
                        </li>
                      </ul>
                      <hr>
                    </li>
                  </ul>
                  <ul v-for="store in submission.stores.response">
                    <li v-for="field of store">
                      <span>{{ field?.name }}</span>:&nbsp;
                    </li>
                    <hr>
                  </ul>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    </div>
  </ClientOnly>
</template>

<style scoped>
table {
  border-collapse: collapse;
  width: 100%;
}

th,
td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

th {
  background-color: #f2f2f2;
}

tr:nth-child(even) {
  background-color: #f2f2f2;
}

tr:hover {
  background-color: #f2f2f2;
}


td:is(:nth-child(1)) {
  width: 10%;
}

td:is(:nth-child(2)) {
  width: 20%;
}

td:is(:nth-child(3)) {
  width: 50%;
}

td:is(:nth-child(4)) {
  width: 10%;
}
</style>import type { Stores, Forms } from "@chiballc/nuxt-form-builder";
