<script setup lang="ts">
import { type APIResponse, Status } from "~/types";
import {type Drizzle} from "~/db/types";

const ulid = useRoute().params.formUuid
if (!ulid) navigateTo('/forms')

const { data } = await useFetch<APIResponse<Drizzle.Form.select>>(`/api/v1/forms/submissions/${ulid}`, {
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
</script>

<template>
  <Title>Submissions | {{ ulid }}</Title>
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
              <td class="border border-gray-300">{{ index }}</td>
              <td class="border border-gray-300">{{ submission[0].responses.createdAt }}</td>
              <td class="border border-gray-300">
                <ul>
                  <li v-for="response in submission">
                    {{ response.data.value }}
                  </li>
                </ul>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>
  </div>
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
</style>