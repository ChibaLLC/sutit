<script setup lang="ts">
import type { Pages, Stores } from "@chiballc/nuxt-form-builder";
import { Loader2 } from "lucide-vue-next";

definePageMeta({
	middleware: ["auth"],
	layout: "novbar",
});

const ulid = useRoute().params?.ulid;
const loading = ref(false);
const nuxt = useNuxtApp();

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
			group_invite_message: response.value.meta.group_invite_message,
		},
		requireMerch: response.value.meta.requireMerch || false,
	};
});

async function submit(data: any) {
	loading.value = true;
	await nuxt.callHook("page:loading:start");

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
		window.alertSuccess("Form updated successfully");
		await navigateTo("/forms");
	}
	await nuxt.callHook("page:loading:end");
	loading.value = false;
}
</script>

<template>
	<div class="relative">
		<FormCreator :starter="submitData" @submit="submit" />
		<div v-if="loading" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
			<div class="bg-white rounded-lg p-6 flex items-center space-x-3">
				<Loader2 class="animate-spin h-5 w-5 text-blue-600" />
				<span class="">updating form...</span>
			</div>
		</div>
	</div>
</template>

<style scoped></style>
