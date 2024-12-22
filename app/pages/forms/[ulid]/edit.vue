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
	name: response!.form_meta.formName,
	description: response?.form_meta.formDescription,
	allowGroups: response?.form_meta.allowGroups || false,
	form: {
		pages: response?.pages || {},
		stores: response?.stores || {},
	},
	payment: {
		amount: response?.form_meta.price_individual,
		group_amount: response?.form_meta.price_group,
		group_limit: response?.form_meta.group_member_count,
		group_message: response?.form_meta.group_invite_message || "",
	},
	requireMerch: response?.form_meta.requireMerch || false,
});

async function submit(data: any) {
	const res = await $fetch<APIResponse>(`/api/v1/forms/${response?.form_meta.ulid}/update`, {
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
