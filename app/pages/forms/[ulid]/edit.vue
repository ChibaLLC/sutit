<script setup lang="ts">
import type { Forms, Stores } from "@chiballc/nuxt-form-builder";

definePageMeta({
    middleware: ["auth"],
    layout: 'novbar'
})

const ulid = useRoute().params?.ulid
const response = await useFetch<APIResponse<ServerForm>>(`/api/v1/forms/${ulid}`, {
    onResponseError({ response }) {
        console.log(response)
    }
}).then(({ data }) => data.value?.body)

const submitData = reactive({
    name: response!.forms.formName,
    description: response?.forms.formDescription,
    allowGroups: response?.forms.allowGroups || false,
    formData: {
        pages: response?.forms.pages || {} as Forms,
        stores: response?.stores.store || {} as Stores
    },
    payment: {
        amount: response?.forms.price_individual,
        group_amount: response?.forms.price_group_amount,
        group_limit: response?.forms.price_group_count,
        group_message: response?.forms.price_group_message || ""
    },
    requireMerch: response?.forms.requireMerch || false
})

async function submit(data: any) {
    const res = await $fetch<APIResponse>(`/api/v1/forms/${response?.forms.ulid}/update`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + getAuthToken()
        },
        body: data,
        onResponseError({ error }) {
            window.alertError(error?.message || "Unknown Error Occurred When Trying To Update The Form")
        }
    })

    if (res?.statusCode < 299) {
        alert('Form updated successfully')
        await navigateTo('/forms')
    } else {
        alert(res.body)
    }
}
</script>

<template>
    <Title>Build Form</Title>
    <FormCreator :starter="submitData" @submit="submit"/>
</template>

<style scoped></style>