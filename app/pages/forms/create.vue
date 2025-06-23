<template>
	<div class="relative">
		<FormCreator @submit="submit" />
		<div v-if="loading" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
			<div class="bg-white rounded-lg p-6 flex items-center space-x-3">
				<Loader2 class="animate-spin h-5 w-5 text-blue-600" />
				<span class="">Creating form...</span>
			</div>
		</div>
	</div>
</template>
<script setup lang="ts">
import { Loader2 } from "lucide-vue-next";

definePageMeta({
	middleware: ["auth"],
	layout: "novbar",
});
// Added Seo Settings
useSeoMeta({
	description: "Create Form",
	ogTitle: "Create Form",
	ogDescription: "Create forms using sutit",
	ogImage: "/favico.jpeg",
	ogUrl: "[og:url]",
	twitterTitle: "Create Form",
	twitterDescription: "Create Form using sutit",
	twitterImage: "/favico.jpeg",
	twitterCard: "summary",
});
const loading = ref(false);
const nuxt = useNuxtApp();
async function submit(data: any) {
	if (loading.value) return alert("This form is being processed. Please wait.");
	await nuxt.callHook("page:loading:start");
	loading.value = true;
	const res = await $fetch("/api/forms/create", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: "Bearer " + getAuthToken(),
		},
		body: data,
		onResponseError({ response }) {
			window.alertError(unWrapFetchError(response));
		},
	}).catch(() => undefined);

	if (res) {
		window.alertSuccess("Form created successfully");
		await navigateTo("/dashboard");
	}
	await nuxt.callHook("page:loading:end");
	loading.value = false;
}
</script>
