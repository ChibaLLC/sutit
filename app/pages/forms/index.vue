<script setup lang="ts">
import { QrCodeIcon } from "lucide-vue-next";

definePageMeta({
	middleware: ["auth"],
});

// Added Seo Settings
useSeoMeta({
	description: "All your created forms ",
	ogTitle: "All user Forms",
	ogDescription: "All user created forms",
	ogImage: "/favico.jpeg",
	twitterTitle: "All Forms",
	ogUrl: "[og:url]",
	twitterDescription: "All user created forms",
	twitterImage: "/favico.jpeg",
	twitterCard: "summary",
});

const { data: meta } = await useFetch("/api/forms/me", {
	headers: {
		Authorization: `Bearer ${getAuthToken()}`,
	},
	onResponseError({ response }) {
		console.error(response);
	},
});

// Variables
const isQrcodeOpen = ref(false);
const selectedQRCode = ref("");

// Functions
const openQrCodeModal = (formUuid: string) => {
	selectedQRCode.value = `${window.location.origin}/forms/${formUuid}`;
	isQrcodeOpen.value = true;
};

const closeQrCodeModal = () => {
	selectedQRCode.value = "";
	isQrcodeOpen.value = false;
};

function getShareableLink(formUuid: string) {
	const link = `${window.location.origin}/forms/${formUuid}`;
	navigator?.clipboard?.writeText(link);
	if (navigator.share) {
		navigator.share({ url: link });
	}
	// Use Toast
	window.alertSuccess("Form Link Copied Successfully");
}

function navigateIfTarget(event: MouseEvent, location: string) {
	if ((event.target as HTMLElement)?.tagName?.toLowerCase() !== "td") return;
	navigateTo(location);
}

function deleteForm(ulid: string) {
	const form = meta.value?.find((fs) => fs.ulid === ulid);
	meta.value = meta.value?.filter((fs) => fs.ulid !== ulid);
	$fetch(`/api/forms/${ulid}/delete`, {
		method: "DELETE",
		headers: {
			Authorization: `Bearer ${getAuthToken()}`,
		},
		onResponse({ response }) {
			if (response.ok) return;
			meta.value?.push(form as any);
		},
		onResponseError({ error }) {
			log.error(error);
		},
	});
}
</script>
<template>
	<div class="flex min-h-screen w-full">
		<Title>Forms</Title>
		<main class="w-full max-w-[1200px] mx-auto flex flex-col items-center">
			<div class="w-full px-8 mt-5 relative overflow-x-auto rounded-t">
				<div class="py-2 flex justify-between items-center">
					<span class="font-bold text-left text-lg">All your forms so far</span>
					<NuxtLink
						to="/forms/create"
						class="p-2 text-center bg-emerald-700 text-white rounded hover:bg-emerald-600 transition-colors w-40 font-semibold uppercase"
					>
						Create A Form</NuxtLink
					>
				</div>
				<table
					class="w-full text-sm text-left rtl:text-righ rounded bg-gradient-to-br from-white to-slate-100 text-slate-900 mt-1"
					v-if="meta?.length"
				>
					<thead class="text-xs uppercase rounded-t bg-slate-200">
						<tr class="text-left border-b border-gray-200">
							<th class="px-6 py-3 w-5">#</th>
							<th class="px-6 py-3">Name</th>
							<th class="px-6 py-3">Description</th>
							<th class="px-6 py-3">Created</th>
							<th class="px-6 py-3 w-40">Has Payment?</th>
							<th class="px-6 py-3 w-5">Action</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-gray-200 border-b">
						<tr
							v-for="(item, index) in meta"
							:key="item.ulid"
							class="text-sm cursor-pointer hover:bg-slate-200"
							@click="navigateIfTarget($event, `/forms/${item.ulid}/submissions`)"
						>
							<td class="px-6 py-4 border-r border-gray-100">
								{{ index + 1 }}
							</td>
							<td class="px-6 py-4">
								{{ item.formName }}
							</td>
							<td class="px-6 py-4">
								{{ item.formDescription }}
							</td>
							<td class="px-6 py-4">
								{{ new Date(item.createdAt).toLocaleString() }}
							</td>
							<td class="px-6 py-4">
								{{ item.price_individual || item.price_group ? "Yes" : "No" }}
							</td>
							<td class="px-6 py-4">
								<div class="flex justify-center gap-1 items-center h-full">
									<NuxtLink :to="`/forms/${item.ulid}`" title="View Form">
										<Icon
											class="w-5 h-5 hover:text-blue-500 transition-colors"
											name="mdi:eye-outline"
										/>
									</NuxtLink>
									<span
										class="rounded"
										@click.prevent="getShareableLink(item.ulid)"
										title="Share Form Link"
									>
										<Icon name="mdi:share-variant-outline" class="w-5 h-5" />
									</span>
									<NuxtLink :to="`/forms/${item.ulid}/edit`" title="edit">
										<Icon
											name="mdi:edit-box-outline"
											class="w-5 h-5 hover:text-orange-500 transition-colors"
										/>
									</NuxtLink>
									<span @click="deleteForm(item.ulid)">
										<Icon
											name="mdi:trash-can-outline"
											class="w-5 h-5 hover:text-red-500 transition-colors"
										/>
									</span>
									<NuxtLink :to="`/forms/${item.ulid}/submissions`" title="All Form Submissions">
										<Icon
											name="mdi:page-next-outline"
											class="h-5 w-5 hover:text-green-600 transition-colors"
										/>
									</NuxtLink>

									<div class="relative group">
										<button
											@click.prevent="openQrCodeModal(item.ulid)"
											class="p-2 bg-gray-200 rounded hover:bg-gray-300"
										>
											<QrCodeIcon />
										</button>
										<span
											class="absolute -top-8 left-1/2 -translate-x-1/2 scale-0 group-hover:scale-100 transition bg-black text-white text-xs rounded py-1 px-2"
										>
											Generate QR Code
										</span>
									</div>
								</div>
							</td>
						</tr>
					</tbody>
				</table>
				<div class="flex justify-center items-center p-4" v-else>
					<p class="text-slate-700">No forms found</p>
				</div>
			</div>
		</main>
		<FormQRCodeGenerator :qrcode="selectedQRCode" :open="isQrcodeOpen" @update:open="closeQrCodeModal" />
	</div>
</template>
<style scoped></style>
