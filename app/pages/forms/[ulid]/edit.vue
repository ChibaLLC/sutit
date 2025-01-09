<script setup lang="ts">
import type { Pages, Stores } from "@chiballc/nuxt-form-builder";

definePageMeta({
	middleware: ["auth"],
	layout: "novbar",
});

const ulid = useRoute().params?.ulid;
const { data: response } = await useFetch<ReconstructedDbForm>(`/api/forms/${ulid}`, {
	onResponseError({ response }) {
		console.log(response);
	},
});

const submitData = computed(() => {
	if (!response.value) return undefined;
	return {
		name: response.value.meta.formName,
		description: response.value.meta.formDescription,
		allowGroups: response.value.meta.allowGroups || false,
		form: {
			pages: response.value.pages as Pages,
			stores: response.value.stores as Stores,
		},
		payment: {
			amount: response.value.meta.price_individual,
			group_amount: response.value.meta.price_group,
			group_limit: response.value.meta.group_member_count,
			group_message: response.value.meta.group_invite_message,
		},
		requireMerch: response.value.meta.requireMerch || false,
	};
});

async function submit(data: any) {
	const res = await $fetch(`/api/forms/${response.value?.meta.ulid}/update`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: "Bearer " + getAuthToken(),
		},
		body: data,
		onResponseError({ error }) {
			window.alertError(error?.message || "Unknown Error Occurred When Trying To Update The Form");
		},
	});

	if (res) {
		alert("Form updated successfully");
		await navigateTo("/forms");
	}
}
</script>

<template>
	<FormCreator :starter="submitData" @submit="submit" />
</template>

<style scoped></style>
