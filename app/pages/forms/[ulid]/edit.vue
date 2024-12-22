<script setup lang="ts">
definePageMeta({
	middleware: ["auth"],
	layout: "novbar",
});

const ulid = useRoute().params?.ulid;
const response = await useFetch<APIResponse<ReconstructedDbForm>>(`/api/v1/forms/${ulid}`, {
	onResponseError({ response }) {
		console.log(response);
	},
}).then(({ data }) => data.value?.body);

const submitData = reactive({
	name: response!.meta.formName,
	description: response?.meta.formDescription,
	allowGroups: response?.meta.allowGroups || false,
	form: {
		pages: response?.pages || {},
		stores: response?.stores || {},
	},
	payment: {
		amount: response?.meta.price_individual,
		group_amount: response?.meta.price_group,
		group_limit: response?.meta.group_member_count,
		group_message: response?.meta.group_invite_message || "",
	},
	requireMerch: response?.meta.requireMerch || false,
});

async function submit(data: any) {
	const res = await $fetch<APIResponse>(`/api/v1/forms/${response?.meta.ulid}/update`, {
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

	if (res?.statusCode < 299) {
		alert("Form updated successfully");
		await navigateTo("/forms");
	} else {
		alert(res.body);
	}
}
</script>

<template>
	<Title>Build Form</Title>
	<FormCreator :starter="submitData" @submit="submit" />
</template>

<style scoped></style>
