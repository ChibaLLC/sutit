<script setup lang="ts">
import { type APIResponse, Status } from "~/types";

const ulid = useRoute().params.formUuid
if (!ulid) navigateTo('/forms')

const { data } = await useFetch<APIResponse>(`/api/v1/forms/submissions/${ulid}`, {
  headers: {
    Authorization: `Bearer ${getAuthToken()}`
  },
  onResponse({ response }): Promise<void> | void {
    const res = response._data as APIResponse
    if (res.statusCode === Status.success) {
      console.log(res.body)
    }
  },
  onResponseError({ response }) {
    console.log(response)
  }
})

const responses = data.value?.body as Array<{
  responses: {
    id: number,
    formId: number,
    userId: number,
    createdAt: string,
    updatedAt: string
  },
  data: {
    id: number,
    responseId: number,
    formFieldId: number,
    value: string
  }
}>

const grouped = responses.reduce((acc, curr) => {
  if (!acc[curr.responses.userId]) {
    acc[curr.responses.userId] = []
  }
  acc[curr.responses.userId].push(curr)
  return acc
}, {} as Record<number, Array<typeof responses[0]>>) as Record<number, Array<typeof responses[0]>>
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
            <tr v-for="(submission, index) in grouped">
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