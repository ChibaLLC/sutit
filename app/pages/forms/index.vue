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

// Reactive data
const dropdownOpen = ref(null);
const searchQuery = ref("");

// Computed properties
const filteredForms = computed(() => {
	if (!searchQuery.value) return meta.value;

	return meta.value?.filter(
		(form) =>
			form.formName?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
			form.formDescription?.toLowerCase().includes(searchQuery.value.toLowerCase()),
	);
});

const paidFormsCount = computed(() => {
	return meta.value?.filter((form) => hasPayment(form)).length || 0;
});

const thisMonthCount = computed(() => {
	const now = new Date();
	const thisMonth = now.getMonth();
	const thisYear = now.getFullYear();

	return (
		meta.value?.filter((form) => {
			const formDate = new Date(form.createdAt);
			return formDate.getMonth() === thisMonth && formDate.getFullYear() === thisYear;
		}).length || 0
	);
});

// Methods
const toggleDropdown = (ulid) => {
	dropdownOpen.value = dropdownOpen.value === ulid ? null : ulid;
};

const hasPayment = (item) => {
	return !!(item.price_individual || item.price_group);
};

const formatDate = (dateString) => {
	return new Date(dateString).toLocaleDateString("en-US", {
		year: "numeric",
		month: "short",
		day: "numeric",
	});
};

const getRelativeTime = (dateString) => {
	const date = new Date(dateString);
	const now = new Date();
	const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

	if (diffInDays === 0) return "Today";
	if (diffInDays === 1) return "Yesterday";
	if (diffInDays < 7) return `${diffInDays} days ago`;
	if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
	return `${Math.floor(diffInDays / 30)} months ago`;
};

const closeDropdown = (ulid) => {
	if (dropdownOpen.value === ulid) {
		dropdownOpen.value = null;
	}
};
const handleShareLink = (ulid) => {
	getShareableLink(ulid);
	closeDropdown(ulid);
};

const handleQrCode = (ulid) => {
	openQrCodeModal(ulid);
	closeDropdown(ulid);
};

const handleDelete = (ulid) => {
	deleteForm(ulid);
	closeDropdown(ulid);
};

const vClickOutside = {
	beforeMount(el, binding) {
		el.clickOutsideEvent = (event) => {
			if (!(el === event.target || el.contains(event.target))) {
				binding.value();
			}
		};
		document.addEventListener("click", el.clickOutsideEvent);
	},
	unmounted(el) {
		document.removeEventListener("click", el.clickOutsideEvent);
	},
};
</script>
<template>
	<div class="min-h-screen bg-gray-50">
		<Title>Forms Dashboard</Title>

		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
			<div class="mb-8">
				<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
					<div>
						<h1 class="text-3xl font-bold text-gray-900">Forms Dashboard</h1>
						<p class="mt-2 text-gray-600">Manage and track all your forms in one place</p>
					</div>

					<div class="flex flex-col sm:flex-row gap-3">
						<NuxtLink
							to="/forms/create"
							class="inline-flex items-center justify-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium shadow-sm"
						>
							<Icon name="mdi:plus" class="w-4 h-4" />
							Create New Form
						</NuxtLink>
					</div>
				</div>
			</div>

			<!-- Stats Cards -->
			<div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
				<div class="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
					<div class="flex items-center">
						<div class="p-2 bg-blue-100 rounded-lg">
							<Icon name="mdi:file-document-outline" class="w-6 h-6 text-blue-600" />
						</div>
						<div class="ml-4">
							<p class="text-sm font-medium text-gray-600">Total Forms</p>
							<p class="text-2xl font-bold text-gray-900">{{ meta?.length || 0 }}</p>
						</div>
					</div>
				</div>

				<div class="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
					<div class="flex items-center">
						<div class="p-2 bg-green-100 rounded-lg">
							<Icon name="mdi:currency-usd" class="w-6 h-6 text-green-600" />
						</div>
						<div class="ml-4">
							<p class="text-sm font-medium text-gray-600">Paid Forms</p>
							<p class="text-2xl font-bold text-gray-900">{{ paidFormsCount }}</p>
						</div>
					</div>
				</div>

				<div class="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
					<div class="flex items-center">
						<div class="p-2 bg-purple-100 rounded-lg">
							<Icon name="mdi:eye" class="w-6 h-6 text-purple-600" />
						</div>
						<div class="ml-4">
							<p class="text-sm font-medium text-gray-600">Active Forms</p>
							<p class="text-2xl font-bold text-gray-900">{{ meta?.length || 0 }}</p>
						</div>
					</div>
				</div>

				<div class="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
					<div class="flex items-center">
						<div class="p-2 bg-orange-100 rounded-lg">
							<Icon name="mdi:calendar" class="w-6 h-6 text-orange-600" />
						</div>
						<div class="ml-4">
							<p class="text-sm font-medium text-gray-600">This Month</p>
							<p class="text-2xl font-bold text-gray-900">{{ thisMonthCount }}</p>
						</div>
					</div>
				</div>
			</div>

			<!-- Forms Table/Grid -->
			<div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
				<!-- Table Header -->
				<div class="px-6 py-4 border-b border-gray-200 bg-gray-50">
					<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
						<h2 class="text-lg font-semibold text-gray-900">Your Forms</h2>

						<!-- Search and Filters -->
						<div class="flex flex-col sm:flex-row gap-3">
							<div class="relative">
								<Icon
									name="mdi:magnify"
									class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
								/>
								<input
									type="text"
									placeholder="Search forms..."
									class="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 w-full sm:w-64"
									v-model="searchQuery"
								/>
							</div>
							<select
								class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
							>
								<option>All Forms</option>
								<option>With Payment</option>
								<option>Free Forms</option>
							</select>
						</div>
					</div>
				</div>

				<div class="overflow-x-auto overflow-y-auto min-h-screen">
					<table class="w-full overflow-auto" v-if="filteredForms?.length">
						<thead class="bg-gray-50 border-b border-gray-200">
							<tr>
								<th
									class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
								>
									Form Details
								</th>
								<th
									class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
								>
									Status
								</th>
								<th
									class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
								>
									Created
								</th>
								<th
									class="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
								>
									Actions
								</th>
							</tr>
						</thead>

						<tbody class="divide-y divide-gray-200">
							<tr
								v-for="(item, index) in filteredForms"
								:key="item.ulid"
								class="group hover:bg-gray-50 transition-colors duration-150"
							>
								<!-- Form Details -->
								<td class="px-6 py-6">
									<div class="flex items-start space-x-4">
										<div class="flex-shrink-0">
											<div
												class="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center text-white font-bold"
											>
												{{ index + 1 }}
											</div>
										</div>
										<div class="flex-1 min-w-0">
											<NuxtLink
												:to="`/forms/${item.ulid}/submissions`"
												class="text-left block w-full group-hover:text-emerald-600 transition-colors"
											>
												<h3
													class="text-sm font-semibold text-gray-900 truncate group-hover:text-emerald-600"
												>
													{{ item.formName }}
												</h3>
												<p class="text-sm text-gray-500 mt-1 line-clamp-2">
													{{ item.formDescription || "No description provided" }}
												</p>
											</NuxtLink>
										</div>
									</div>
								</td>

								<!-- Status -->
								<td class="px-6 py-6">
									<div class="flex flex-col gap-2">
										<span
											:class="
												hasPayment(item)
													? 'bg-green-100 text-green-800 border-green-200'
													: 'bg-gray-100 text-gray-600 border-gray-200'
											"
											class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border"
										>
											<div
												:class="hasPayment(item) ? 'bg-green-400' : 'bg-gray-400'"
												class="w-1.5 h-1.5 rounded-full mr-1.5"
											></div>
											{{ hasPayment(item) ? "Paid" : "Free" }}
										</span>
										<span
											class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200"
										>
											<Icon name="mdi:check-circle" class="w-3 h-3 mr-1" />
											Active
										</span>
									</div>
								</td>

								<!-- Created Date -->
								<td class="px-6 py-6">
									<div class="text-sm text-gray-900">
										{{ formatDate(item.createdAt) }}
									</div>
									<div class="text-xs text-gray-500 mt-1">
										{{ getRelativeTime(item.createdAt) }}
									</div>
								</td>

								<!-- Actions -->
								<td class="px-6 py-6">
									<div class="flex justify-center">
										<div class="relative" v-click-outside="() => closeDropdown(item.ulid)">
											<div class="flex items-center gap-1 transition-opacity duration-200">
												<NuxtLink
													:to="`/forms/${item.ulid}`"
													class="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
													title="View Form"
												>
													<Icon name="mdi:eye-outline" class="w-4 h-4" />
												</NuxtLink>
												<NuxtLink
													:to="`/forms/${item.ulid}/edit`"
													class="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
													title="Edit Form"
												>
													<Icon name="mdi:edit-box-outline" class="w-4 h-4" />
												</NuxtLink>

												<button
													@click.stop="toggleDropdown(item.ulid)"
													class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
													:class="{ 'bg-gray-100 text-gray-600': dropdownOpen === item.ulid }"
												>
													<Icon name="mdi:dots-horizontal" class="w-4 h-4" />
												</button>
											</div>

											<!-- Dropdown Menu -->
											<Transition
												enter-active-class="transition ease-out duration-100"
												enter-from-class="transform opacity-0 scale-95"
												enter-to-class="transform opacity-100 scale-100"
												leave-active-class="transition ease-in duration-75"
												leave-from-class="transform opacity-100 scale-100"
												leave-to-class="transform opacity-0 scale-95"
											>
												<div
													v-if="dropdownOpen === item.ulid"
													:class="[
														'absolute right-0 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-50',
														index > 2 ? 'bottom-full mb-2' : 'top-full mt-2',
													]"
												>
													<div class="py-2">
														<!-- View Submissions -->
														<NuxtLink
															:to="`/forms/${item.ulid}/submissions`"
															class="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
															@click="closeDropdown(item.ulid)"
														>
															<Icon
																name="mdi:file-document-outline"
																class="w-4 h-4 text-green-500"
															/>
															<span>View Submissions</span>
														</NuxtLink>

														<div class="border-t border-gray-100 my-1"></div>

														<button
															@click="handleShareLink(item.ulid)"
															class="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
														>
															<Icon
																name="mdi:share-variant-outline"
																class="w-4 h-4 text-purple-500"
															/>
															<span>Share Link</span>
														</button>

														<button
															@click="handleQrCode(item.ulid)"
															class="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
														>
															<Icon name="mdi:qrcode" class="w-4 h-4 text-indigo-500" />
															<span>Generate QR Code</span>
														</button>

														<div class="border-t border-gray-100 my-1"></div>

														<button
															@click="handleDelete(item.ulid)"
															class="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
														>
															<Icon name="mdi:trash-can-outline" class="w-4 h-4" />
															<span>Delete Form</span>
														</button>
													</div>
												</div>
											</Transition>
										</div>
									</div>
								</td>
							</tr>
						</tbody>
					</table>

					<!-- Empty State -->
					<div v-else class="text-center py-16">
						<div class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
							<Icon name="mdi:file-document-plus-outline" class="w-12 h-12 text-gray-400" />
						</div>
						<h3 class="text-lg font-medium text-gray-900 mb-2">No forms found</h3>
						<p class="text-gray-500 mb-6">Get started by creating your first form</p>
						<NuxtLink
							to="/forms/create"
							class="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
						>
							<Icon name="mdi:plus" class="w-4 h-4" />
							Create Your First Form
						</NuxtLink>
					</div>
				</div>
			</div>
		</div>

		<!-- QR Code Modal -->
		<FormQRCodeGenerator :qrcode="selectedQRCode" :open="isQrcodeOpen" @update:open="closeQrCodeModal" />
	</div>
</template>
<style scoped></style>
