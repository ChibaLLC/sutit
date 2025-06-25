<template>
	<FormCreator @submit="submit" />
</template>
<script setup lang="ts">
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
async function submit(data: any) {
	if (loading.value) return alert("This form is being processed. Please wait.");
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
		alert("Form created successfully");
		await navigateTo("/dashboard");
	}

	loading.value = false;
}
</script>
