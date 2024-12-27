<template>
	<FormCreator @submit="submit" />
</template>
<script setup lang="ts">
definePageMeta({
	middleware: ["auth"],
	layout: "novbar",
});

async function submit(data: any) {	
	const res = await $fetch("/api/forms/create", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: "Bearer " + getAuthToken(),
		},
		body: data,
		onResponseError({response}) {
			window.alertError(unWrapFetchError(response));
		},
	});

	if (res) {
		alert("Form created successfully");
		await navigateTo("/dashboard");
	}
}
</script>
