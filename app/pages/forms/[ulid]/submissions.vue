<script setup lang="ts">
import type { getFormResponses } from "~~/server/api/forms/[formUlid]/submissions/utils/queries";

definePageMeta({
	middleware: "auth",
});

const ulid = useRoute().params.ulid;
if (!ulid) navigateTo("/forms");

const { form, form_responses, group_responses, store_response } = await useFetch(`/api/forms/${ulid}/submissions`, {
	headers: {
		Authorization: `Bearer ${getAuthToken()}`,
	},
	onResponseError({ response }) {
		console.log(response);
	},
}).then(({ data }) => data.value!);

const loadingExcel = ref(false);
async function downloadExcel() {
	loadingExcel.value = true;
	const res = await $fetch<Blob>(`/api/forms/${ulid}/submissions/excel`, {
		headers: {
			Authorization: `Bearer ${getAuthToken()}`,
			"Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
		},
		onResponseError({ response }) {
			console.error(response);
			window.alertError(unWrapFetchError(response));
			loadingExcel.value = false;
		},
	});

	if (!res) return;
	const url = URL.createObjectURL(res);
	const a = document.createElement("a");
	a.href = url;
	a.download = `${form?.meta.formName}.xlsx`;
	a.click();
	URL.revokeObjectURL(url);
	loadingExcel.value = false;
	a.remove();
}

const { data: total } = useFetch(`/api/forms/${ulid}/submissions/total`, {
	headers: {
		Authorization: `Bearer ${getAuthToken()}`,
	},
	onResponseError({ response }) {
		console.log(response);
	},
});

const loadingCheckout = ref(false);
const phone = ref("");
const con_phone = ref("");
const helpText = ref(false);
const noMatch = ref(false);

const checkoutMethod = ref<CreditMethod | null>(null);

async function credit() {
	loadingCheckout.value = true;
	showCreditMethodsModal.value = false;
	await $fetch(`/api/forms/${ulid}/credit`, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${getAuthToken()}`,
		},
		body: checkoutMethod.value,
		onResponseError({ response }) {
			alert(response._data.body || "Failed to credit, an error occurred");
			loadingCheckout.value = false;
		},
		onRequestError({ error }) {
			console.log(error);
			loadingCheckout.value = false;
		},
	});
	loadingCheckout.value = false;
}

const showPhoneModal = ref(false);
const showCreditMethodsModal = ref(false);
function addPhone() {
	if (!phone.value.trim() || !con_phone.value.trim() || phone.value !== con_phone.value) {
		helpText.value = true;
	} else {
		helpText.value = false;
		showPhoneModal.value = false;
		checkoutMethod.value = { phone: phone.value } satisfies CreditMethod;
		credit();
	}
}

const paybillData = reactive({
	paybill_no: "",
	account_no: "",
});
const showPaybillModal = ref(false);
function addPayBill() {
	if (!paybillData.paybill_no.trim() || !paybillData.account_no.trim()) {
		helpText.value = true;
	} else {
		helpText.value = false;
		showPaybillModal.value = false;
		checkoutMethod.value = paybillData satisfies CreditMethod;
		credit();
	}
}

const buyGoodsData = reactive({
	till_no: "",
	till_no_confirm: "",
});
const showBuyGoodsModal = ref(false);
function addBuyGoods() {
	if (
		!buyGoodsData.till_no.trim() ||
		!buyGoodsData.till_no_confirm.trim() ||
		buyGoodsData.till_no !== buyGoodsData.till_no_confirm
	) {
		helpText.value = true;
	} else {
		helpText.value = false;
		showBuyGoodsModal.value = false;
		checkoutMethod.value = buyGoodsData satisfies CreditMethod;
		credit();
	}
}

watch([phone, con_phone], () => {
	noMatch.value = !!(con_phone.value && con_phone.value !== phone.value);
});

const fields = collectFields(form as any);
const hasPay = hasPayment(form as any);

const rows = groupByResponseId(form_responses);
{
	{
		rows;
	}
}

// Card Data
interface CardData {
	count: string | number;
	title: string;
	description?: string;
	icon: string;
}
const cardData = reactive<CardData[]>([]);
// Add Card Data
cardData.push({
	count: rows.length,
	title: `Total Submissions`,
	icon: `mdi:book`,
});
// if (hasPay) {
// 	cardData.push({
// 		count: total.value ?? 0,
// 		title: "Total Cash",
// 		icon: "mdi:dollar",
// 	});
// }

// Add interface for purchase response
interface PurchaseResponse {
	responseUlid: string;
	itemUlid: string;
	formUlid: string;
	qtty: number;
	value: string;
	pricePaid: number;
	date: string;
}

// Add reactive state for purchases
const purchaseResponses = ref<Awaited<ReturnType<typeof getFormResponses>>["store_response"]>([]);
const showPurchasesModal = ref(false);

// Add function to handle purchases
function showStoreResponses(responseUlid: string) {
	purchaseResponses.value = getFormStoreResponses(responseUlid, store_response);
	showPurchasesModal.value = true;
}

const groupedResponses = computed(() => groupByResponseId(form_responses));

const getFieldValue = (response: any, fieldlabel: string) => {
	let res = response.find(
		(r: any) => r.field.label.trim().toLowerCase().toString() == fieldlabel.trim().toLowerCase().toString(),
	);
	if (!res) return "";
	if (res.value == "[object Object]") {
		return Object.values(res.field.value)[0] || "";
	}
	return res.value;
};
// Add search functionality
const searchQuery = ref("");

// Filter responses based on search query
const filteredResponses = computed(() => {
	if (!searchQuery.value.trim()) {
		return groupedResponses;
	}

	const query = searchQuery.value.toLowerCase();
	return groupedResponses.filter((row) => {
		// Search through all fields
		return fields.some(([_, field]) => {
			if (field.ulid) {
				const value = getFieldValue(row, field.label);
				return value && String(value).toLowerCase().includes(query);
			}
			return false;
		});
	});
});

// Calculate the colspan for empty state
const calculateColspan = () => {
	let count = 1; // Start with 1 for the # column
	count += fields.length;
	if (hasPay) count += 1;
	if (store_response.length > 0) count += 1;
	return count;
};
</script>

<template>
	<div class="flex min-h-screen w-full bg-gray-50">
		<Title>Submissions | {{ form.meta.formName }}</Title>
		<main class="w-full flex flex-col items-center max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-10 py-6">
			<!-- Header Section -->
			<div class="w-full flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
				<span class="font-bold text-left uppercase text-slate-800 text-xl md:text-2xl">
					Submissions for {{ form?.meta.formName }}
				</span>

				<!-- Action Buttons -->
				<div class="flex flex-wrap gap-2">
					<button
						class="flex items-center gap-2 px-3 py-2 bg-slate-800 rounded-lg text-white hover:bg-slate-600 transition-colors shadow-sm"
						@click="downloadExcel"
						:class="{ 'opacity-75': loadingExcel }"
						:disabled="loadingExcel"
					>
						<span>Excel</span>
						<Icon v-if="!loadingExcel" name="mdi:file-excel" class="w-4 h-4" />
						<Icon v-else name="prime:spinner" class="w-4 h-4 animate-spin" />
					</button>
					<button
						v-if="hasPay"
						class="flex items-center gap-2 px-3 py-2 bg-slate-900 rounded-lg text-white hover:bg-slate-700 transition-colors shadow-sm"
						@click="showCreditMethodsModal = true"
						:class="{ 'opacity-75': loadingCheckout }"
						:disabled="loadingCheckout"
					>
						<span>Credit</span>
						<Icon v-if="!loadingCheckout" name="mdi:dollar" class="w-4 h-4" />
						<Icon v-else name="prime:spinner" class="w-4 h-4 animate-spin" />
					</button>
					<div
						v-if="hasPay"
						class="flex items-center px-3 py-2 bg-white rounded-lg shadow-sm border border-slate-200"
					>
						<span class="text-slate-600 mr-2">Total:</span>
						<span class="text-slate-900 font-bold font-mono">KES {{ total }}</span>
					</div>
				</div>
			</div>

			<!-- Summary Cards -->
			<div class="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
				<CardSummaryCard
					v-for="dt in cardData"
					:key="dt.title"
					:count="dt.count"
					:title="dt.title"
					:description="dt.description"
					:icon="dt.icon"
					class="shadow-sm"
				/>
			</div>

			<!-- Submissions Table -->
			<div class="w-full relative overflow-x-auto rounded-lg shadow-sm border border-slate-200">
				<div class="max-h-[70vh] overflow-auto">
					<table class="w-full text-sm text-left bg-white text-slate-700">
						<thead class="text-xs text-slate-700 uppercase bg-slate-100 sticky top-0 z-10">
							<tr>
								<th class="px-4 py-3">#</th>
								<th v-for="[_, field] of fields" :key="field.label" class="px-4 py-3 whitespace-nowrap">
									{{ field.label }}
								</th>
								<th v-if="hasPay" class="px-4 py-3">Payment</th>
								<th v-if="store_response.length > 0" class="px-4 py-3">Store</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-slate-200">
							<tr
								v-for="(row, index) in groupedResponses"
								:key="index"
								class="hover:bg-slate-50 transition-colors"
							>
								<td class="px-4 py-3 font-medium">{{ index + 1 }}</td>
								<td v-for="[_, field] in fields" :key="`${index}-${field.label}`" class="px-4 py-3">
									<div v-if="field.ulid" class="max-w-xs overflow-hidden text-ellipsis">
										<div class="hover:overflow-visible hover:whitespace-normal whitespace-nowrap">
											{{ getFieldValue(row, field.label) }}
										</div>
									</div>
								</td>
								<td v-if="hasPay" class="px-4 py-3 font-mono">
									KES {{ bubblePrice(group_responses, row.at(0)) }}
								</td>
								<td v-if="row[index]?.responseUlid && store_response.length > 0" class="px-4 py-3">
									<button
										@click="showStoreResponses(row[index].responseUlid)"
										class="px-3 py-1.5 bg-green-600 rounded-md text-white hover:bg-green-500 transition-colors text-xs font-medium"
									>
										Show Purchases
									</button>
								</td>
							</tr>
							<!-- <tr v-if="filteredResponses.length === 0"> -->
							<!-- 	<td :colspan="calculateColspan()" class="px-4 py-8 text-center text-slate-500"> -->
							<!-- 		No matching submissions found -->
							<!-- 	</td> -->
							<!-- </tr> -->
						</tbody>
					</table>
				</div>
			</div>

			<Modal
				title="Choose a Credit Method"
				:show="showCreditMethodsModal"
				@confirm="showCreditMethodsModal = false"
				@cancel="showCreditMethodsModal = false"
			>
				<div class="flex flex-col gap-2">
					<button
						@click="showPhoneModal = true"
						class="flex items-center justify-between space-x-2 gap-2 px-3 py-1 bg-navy rounded text-white"
					>
						<span>Your Phone Number</span>
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-8 h-8">
							<path
								d="M7 4V20H17V4H7ZM6 2H18C18.5523 2 19 2.44772 19 3V21C19 21.5523 18.5523 22 18 22H6C5.44772 22 5 21.5523 5 21V3C5 2.44772 5.44772 2 6 2ZM12 17C12.5523 17 13 17.4477 13 18C13 18.5523 12.5523 19 12 19C11.4477 19 11 18.5523 11 18C11 17.4477 11.4477 17 12 17Z"
							></path>
						</svg>
					</button>
					<button
						@click="showBuyGoodsModal = true"
						class="flex items-center justify-between space-x-2 gap-2 px-3 py-1 bg-navy rounded text-white"
					>
						<span>Your Till Number</span>
						<svg fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" class="w-8 h-8">
							<path
								fill-rule="evenodd"
								d="M16,6 L20,6 C21.1045695,6 22,6.8954305 22,8 L22,16 C22,17.1045695 21.1045695,18 20,18 L16,18 L16,19.9411765 C16,21.0658573 15.1177541,22 14,22 L4,22 C2.88224586,22 2,21.0658573 2,19.9411765 L2,4.05882353 C2,2.93414267 2.88224586,2 4,2 L14,2 C15.1177541,2 16,2.93414267 16,4.05882353 L16,6 Z M20,11 L16,11 L16,16 L20,16 L20,11 Z M14,19.9411765 L14,4.05882353 C14,4.01396021 13.9868154,4 14,4 L4,4 C4.01318464,4 4,4.01396021 4,4.05882353 L4,19.9411765 C4,19.9860398 4.01318464,20 4,20 L14,20 C13.9868154,20 14,19.9860398 14,19.9411765 Z M5,19 L5,17 L7,17 L7,19 L5,19 Z M8,19 L8,17 L10,17 L10,19 L8,19 Z M11,19 L11,17 L13,17 L13,19 L11,19 Z M5,16 L5,14 L7,14 L7,16 L5,16 Z M8,16 L8,14 L10,14 L10,16 L8,16 Z M11,16 L11,14 L13,14 L13,16 L11,16 Z M13,5 L13,13 L5,13 L5,5 L13,5 Z M7,7 L7,11 L11,11 L11,7 L7,7 Z M20,9 L20,8 L16,8 L16,9 L20,9 Z"
							/>
						</svg>
					</button>
					<button
						@click="showPaybillModal = true"
						class="flex items-center space-x-2 justify-between gap-2 px-3 py-1 bg-navy rounded text-white"
					>
						<span>Send To Paybill</span>
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-8 h-8">
							<path
								d="M20 9V5H4V9H20ZM20 11H4V19H20V11ZM3 3H21C21.5523 3 22 3.44772 22 4V20C22 20.5523 21.5523 21 21 21H3C2.44772 21 2 20.5523 2 20V4C2 3.44772 2.44772 3 3 3ZM5 12H8V17H5V12ZM5 6H7V8H5V6ZM9 6H11V8H9V6Z"
							></path>
						</svg>
					</button>
				</div>
			</Modal>

			<Modal title="Enter Phone Number" @close="addPhone" @cancel="showPhoneModal = false" :show="showPhoneModal">
				<div>
					<label for="phone">Phone Number</label>
					<input
						type="tel"
						id="phone"
						class="border-1 border-solid px-3 py-3 placeholder-gray-400 text-gray-700 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full mt-1"
						placeholder="Phone number"
						v-model="phone"
					/>
					<small class="text-gray-500">This is where the funds will be sent</small>
				</div>
				<div class="mt-2">
					<label for="phone">Phone Number Again</label>
					<input
						type="tel"
						id="phone_confirm"
						class="border-1 border-solid px-3 py-3 placeholder-gray-400 text-gray-700 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full mt-1"
						placeholder="Phone number"
						v-model="con_phone"
					/>
					<small class="text-gray-500">Just to make sure we have the right one</small>
				</div>
				<div v-if="helpText">
					<p class="text-red-500 text-sm">Please provide a phone number</p>
				</div>
				<div v-if="noMatch">
					<p class="text-red-500 text-sm">Phone numbers do not match</p>
				</div>
			</Modal>

			<Modal
				title="Enter Till Number"
				@close="addBuyGoods()"
				@cancel="showBuyGoodsModal = false"
				:show="showBuyGoodsModal"
			>
				<div>
					<label for="till_no">Till Number</label>
					<input
						type="tel"
						id="till_no"
						class="border-1 border-solid px-3 py-3 placeholder-gray-400 text-gray-700 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full mt-1"
						placeholder="Till number"
						v-model="buyGoodsData.till_no"
					/>
					<small class="text-gray-500">This is where the funds will be paid to</small>
				</div>
				<div>
					<label for="till_no_confirm">Till Number Again</label>
					<input
						type="tel"
						id="till_no_confirm"
						class="border-1 border-solid px-3 py-3 placeholder-gray-400 text-gray-700 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full mt-1"
						placeholder="Till number"
						v-model="buyGoodsData.till_no_confirm"
					/>
					<small class="text-gray-500">Just to make sure we have the right one</small>
				</div>
				<div v-if="helpText">
					<p class="text-red-500 text-sm">Please provide a till number</p>
				</div>
			</Modal>

			<Modal
				title="Enter Paybill Details"
				@close="addPayBill()"
				@cancel="showPaybillModal = false"
				:show="showPaybillModal"
			>
				<div>
					<label for="paybill_no">Paybill Number</label>
					<input
						type="tel"
						id="paybill_no"
						class="border-1 border-solid px-3 py-3 placeholder-gray-400 text-gray-700 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full mt-1"
						placeholder="Paybill number"
						v-model="paybillData.paybill_no"
					/>
					<small class="text-gray-500">This is the paybill number</small>
				</div>
				<div class="mt-2">
					<label for="account_no">Account Number</label>
					<input
						type="tel"
						id="account_no"
						class="border-1 border-solid px-3 py-3 placeholder-gray-400 text-gray-700 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full mt-1"
						placeholder="Account number"
						v-model="paybillData.account_no"
					/>
					<small class="text-gray-500">This is the account number</small>
				</div>
				<div v-if="helpText">
					<p class="text-red-500 text-sm">Please provide a paybill number</p>
				</div>
			</Modal>

			<!-- Add new modal for purchase history -->
			<Modal
				title="Purchase History"
				:show="showPurchasesModal"
				@confirm="showPurchasesModal = false"
				@cancel="showPurchasesModal = false"
			>
				<div class="w-full">
					<table class="w-full text-sm text-left bg-white text-slate-700 rounded">
						<thead class="text-xs text-slate-900 uppercase bg-slate-100">
							<tr>
								<th class="px-4 py-2">Item</th>
								<th class="px-4 py-2">Quantity</th>
								<th class="px-4 py-2">Price</th>
								<th class="px-4 py-2">Date</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-slate-200">
							<tr v-for="(purchase, index) in purchaseResponses" :key="index" class="hover:bg-slate-50">
								<td class="px-4 py-2">{{ purchase.value }}</td>
								<td class="px-4 py-2">{{ purchase.qtty }}</td>
								<td class="px-4 py-2">KES {{ purchase.pricePaid }}</td>
								<td class="px-4 py-2">{{ new Date(purchase.date).toLocaleString() }}</td>
							</tr>
							<tr v-if="purchaseResponses.length === 0">
								<td colspan="4" class="px-4 py-2 text-center">No purchases recorded yet</td>
							</tr>
						</tbody>
					</table>
				</div>
			</Modal>
		</main>
	</div>
</template>

<style scoped></style>
