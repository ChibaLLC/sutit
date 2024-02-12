<script setup lang="ts">
import {type Drizzle} from "~/db/types";

const uuid = useRoute().params?.formUuid
const form = ref({} as { form: Drizzle.Form.select, fields: Drizzle.FormFields.select[] })
const response = await useAuthFetch(`/api/v1/forms/${uuid}`)
if (response.statusCode === 200) form.value = response.body
// @ts-ignore
form.value.fields = form.value?.fields?.map((field) => {
  return {
    name: field.fieldName,
    type: field.fieldType,
    required: field.required,
    description: field.fieldDescription,
    options: JSON.parse(field.fieldOptions || '[]'),
  }
})
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
      <form class="form">
        <div v-for="field in form.fields" :key="field.id" class="form-group">
          <FormField :field="field" :preview="true"/>
        </div>
        <div class="buttons">
          <button class="submit" type="submit">Submit</button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.header{
  @apply bg-slate-600;
  @apply p-4;
  @apply rounded-md;
  @apply mb-4;
  @apply text-white;
}

.buttons{
  @apply flex;
  @apply justify-end;
  @apply mt-4;
}

.submit{
  @apply bg-emerald-700;
  @apply text-white;
  @apply pl-4 pr-4;
  @apply pt-2 pb-2;
  @apply rounded-md;
  @apply cursor-pointer;
  @apply mt-4;
}
</style>