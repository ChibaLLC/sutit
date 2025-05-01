<script setup lang="ts">
import type { Form, Pages, Store, Stores } from "@chiballc/nuxt-form-builder";

const loading = ref(false);
const route = useRoute();
const token = route.query?.token;
const ulid = route.params?.ulid;
const rerender = ref(false);
const complete = ref(false);

const { data } = await useFetch<ReconstructedDbForm>(`/api/forms/${ulid}`, {
	onResponseError({ response }) {
		console.log(response);
	},
});
const seoMetaData = ref({
	description: data.value?.meta.formDescription,
	title: data.value?.meta.formName,
});

useSeoMeta({
	description: seoMetaData.value.description,
	ogTitle: seoMetaData.value.title,
	ogDescription: seoMetaData.value.description,
	ogImage: "/favico.jpeg",
	ogUrl: "[og:url]",
	twitterTitle: seoMetaData.value.title,
	twitterDescription: seoMetaData.value.description,
	twitterImage: "/favico.jpeg",
	twitterCard: "summary",
});
const paymentModal = ref(false);
const payment_details = ref<{ phone: string; token?: string }>({
	phone: "",
	token: token?.toString().trim(),
});

function hasPrice(form?: ReconstructedDbForm): boolean {
	return !!form?.meta.price_individual;
}

function hasPhone() {
	return payment_details.value.token || payment_details.value.phone.length >= 10;
}

async function processForm() {
	paymentModal.value = false;
	if (group.self && data.value?.meta.requireMerch && !hasBoughtMerch(data.value.stores)) {
		return window.alertError("You need to get something from the store section of this form!");
	}
	if (data.value?.meta?.allowGroups && !group.self) {
		return processInvites();
	}

	if (hasPrice(data.value) && !hasPhone()) {
		paymentModal.value = true;
	} else if (hasPrice(data.value) && hasPhone()) {
		log.info("Submitting paid form", completedForm);
		await submit();
	} else if (!hasPrice(data.value)) {
		log.info("Submitting unpaid form", completedForm);
		await submit();
	}
}

let completedForm: Form | undefined = undefined;

const convertIntoArray = () => {};

async function submit() {
	if (loading.value) return window.alertInfo("Please wait for the previous submission to be processed");
	try {
		loading.value = true;
		const response = await $fetch(`/api/forms/${ulid}/submit`, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${getAuthToken()}`,
			},
			body: {
				form: {
					meta: data.value?.meta,
					pages: Object.values(data.value?.pages || {}).flat(),
					stores: Object.entries(data.value?.stores || {}).reduce((acc, [index, store]) => {
						store.forEach((item) => {
							if (!item.carted) return;
							const key = item.itemUlid;
							if (!key) return window.alertError("An unknown error occurred");
							// @ts-expect-error
							acc[key] = {
								name: item.name,
								qtty: item.qtty,
								liked: item.liked,
								carted: item.carted,
								stock: item.stock,
								price: item.price,
							};
						});
						return acc;
					}, {}),
				},
				phone: payment_details.value.phone,
				token: payment_details.value.token,
			},
			onResponseError({ response }) {
				log.error(response);
				window.alertError(unWrapFetchError(response));
			},
		});
		if (hasChannelData(response)) {
			ResolveMpesaPayment(response, loading, rerender, complete);
		} else {
			let message = "Form submitted successfully.";
			if (
				hasOwnProperties(
					response as {
						formMail: string;
						formResponse: string;
					},
					["formMail"],
				)
			) {
				message +=
					" An confirmation email has been sent to " +
					(
						response as {
							formMail: string;
							formResponse: string;
						}
					).formMail;
			}
			window.alertSuccess(message, { timeout: "never" });
			loading.value = false;
			await navigateTo("/");
		}
	} catch (e) {
		console.error(e);
		loading.value = false;
	}
}

const charge = computed({
	get() {
		if (!data.value) return 0;
		return data.value.meta.price_individual;
	},
	set(value) {
		if (!data.value) return console.error("No data found.");
		if (data.value.meta.price_individual) {
			data.value.meta.price_individual += value;
		} else {
			data.value.meta.price_individual = value;
		}
	},
});

function restart() {
	loading.value = false;
	rerender.value = !rerender.value;
	complete.value = false;
}

function back() {
	if (data.value?.meta?.allowGroups && group.chosen) {
		group.chosen = false;
		group.self = false;
		rerender.value = true;
		complete.value = false;
	}
}

function completeForm(form: Form) {
	complete.value = true;
	completedForm = form;
}

class Invite<T extends { email: string } | { phone: string } = any> extends Set<T> {
	override has(value: T | string) {
		return !!this.get(value);
	}

	get(value: T | string) {
		let email: string | undefined = undefined;
		let phone: string | undefined = undefined;

		if (typeof value === "string") {
			if (isEmail(value) || !isPhone(value)) {
				email = value.trim();
				if (!email.includes("@")) {
					email = `${email}@gmail.com`;
				}
			} else {
				phone = value.trim();
			}
		} else {
			email = (value as { email?: string })?.email;
			phone = (value as { phone?: string })?.phone;
		}

		for (const item of this) {
			if (email && (item as { email?: string })?.email) {
				if (email === (item as { email?: string })?.email) return item;
			} else if (phone && (item as { phone?: string })?.phone) {
				if (phone === (item as { phone?: string })?.phone) {
					return item;
				}
			}
		}

		return undefined;
	}

	override delete(value: T | string): boolean {
		const item = this.get(value);
		if (item) {
			return super.delete(item);
		}

		return false;
	}
}
const invites = ref<Invite>(new Invite());

// TODO: Rewrite
// start
const _member_count = ref(0);
const member_count = computed({
	get: () => _member_count.value || invites.value.size,
	set: (value: number) => {
		_member_count.value = value;
	},
});
const group = reactive({
	chosen: false,
	self: false,
	invites: invites,
	count: member_count,
	name: "",
});
if (token) {
	group.chosen = true;
	group.self = true;
}
// end

function chooseSelfOrGroup(e: Event) {
	if ((e.target as HTMLElement).id === "for_me") {
		group.self = true;
	} else {
		group.self = false;
	}
	group.chosen = true;
}

function validator(part: string) {
	let text = part.trim();
	if (!text) return;
	if (isEmail(text) || !isPhone(text)) {
		if (!text.includes("@")) {
			text = `${text}@gmail.com`;
		}
		return text;
	} else if (isPhone(text)) {
		// invites.value.add({ phone: text })
		window.alertError("Sorry, SMS is not yet supported");
		return undefined;
	} else {
		console.warn("Illegal Text Input Found: ", text);
		return undefined;
	}
}

async function processInvites() {
	loading.value = true;
	if (!hasPhone()) {
		paymentModal.value = true;
		return;
	}
	const response = await $fetch(`/api/forms/${ulid}/invite`, {
		method: "POST",
		body: {
			invites: Array.from(invites.value),
			phone: payment_details.value.phone,
			origin: window.location.origin,
			group_name: group.name,
		},
		onResponseError({ response }) {
			const data = response._data;
			window.alertError(unWrapFetchError(data));
		},
	}).catch(() => undefined);
	if (hasChannelData(response)) {
		ResolveMpesaPayment(response, loading, rerender, complete);
	}
	loading.value = false;
}
</script>

<template>
	<div class="flex min-h-screen" v-if="data">
		<Title>Form | {{ data.meta?.formName }}</Title>
		<div class="flex flex-col p-2 w-full max-w-[820px] ml-auto mr-auto shadow-2xl h-fit mt-4 rounded-md">
			<div class="header">
				<h1 class="text-2xl p-2 font-bold flex items-center content-center">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="24"
						height="24"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						class="h-8 w-8"
					>
						<path d="M17 6.1H3"></path>
						<path d="M21 12.1H3"></path>
						<path d="M15.1 18H3"></path>
					</svg>
					<span class="ml-2">{{ data.meta.formName }}</span>
				</h1>
				<p class="bg-slate-700 w-full px-4 py-2 pl-12 rounded" v-if="data.meta.formDescription">
					{{ data.meta.formDescription }}
				</p>
			</div>
			<form class="pb-4 mt-2 min-h-max" @submit.prevent v-if="!data?.meta?.allowGroups || group.self">
				<FormViewer
					:data="
						reactive({
							pages: data.pages as Pages,
							stores: data.stores as Stores,
						})
					"
					@submit="completeForm"
					:re-render="rerender"
					@price="charge = $event"
					@back="back"
					:show-spinner="loading"
				/>
				<div class="flex w-full px-4 ml-0.5 relative justify-between flex-wrap gap-2 mt-2">
					<small class="text-gray-500 w-fit" v-if="data.meta.price_individual > 0 && !token">
						This form requires payment for submission of <br />
						<span class="text-red-400">Amount Due: {{ data.meta.price_individual }}</span>
						KES
					</small>
					<div v-if="complete" class="flex justify-between w-full">
						<button v-if="complete" @click="restart" class="bg-slate-700 text-white rounded px-4 py-2 mr-2">
							Back
						</button>
						<button
							v-if="complete"
							@click="processForm()"
							class="bg-emerald-700 text-white rounded px-4 py-2"
						>
							Submit
						</button>
					</div>
				</div>
			</form>
			<form
				@submit.prevent
				v-if="data?.meta?.allowGroups && !group.chosen"
				class="w-full grid place-items-center"
			>
				<div class="flex flex-wrap">
					<label
						for="for_me"
						@click="
							group.self = true;
							group.chosen = true;
						"
						class="flex text-xl font-bold items-center m-2 gap-2 px-4 py-2 hover:bg-gray-200 cursor-pointer rounded"
					>
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-8 h-8">
							<path
								d="M4 22C4 17.5817 7.58172 14 12 14C16.4183 14 20 17.5817 20 22H18C18 18.6863 15.3137 16 12 16C8.68629 16 6 18.6863 6 22H4ZM12 13C8.685 13 6 10.315 6 7C6 3.685 8.685 1 12 1C15.315 1 18 3.685 18 7C18 10.315 15.315 13 12 13ZM12 11C14.21 11 16 9.21 16 7C16 4.79 14.21 3 12 3C9.79 3 8 4.79 8 7C8 9.21 9.79 11 12 11Z"
							></path>
						</svg>
						Continue For Me
						<input type="radio" id="for_me" name="fill_for" class="hidden" @change="chooseSelfOrGroup" />
					</label>
					<label
						for="for_group"
						@click="
							group.self = false;
							group.chosen = true;
						"
						class="flex text-xl font-bold items-center m-2 gap-2 px-4 py-2 hover:bg-gray-200 rounded cursor-pointer"
					>
						<input type="radio" id="for_group" name="fill_for" class="hidden" @change="chooseSelfOrGroup" />
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-8 h-8">
							<path
								d="M2 22C2 17.5817 5.58172 14 10 14C14.4183 14 18 17.5817 18 22H16C16 18.6863 13.3137 16 10 16C6.68629 16 4 18.6863 4 22H2ZM10 13C6.685 13 4 10.315 4 7C4 3.685 6.685 1 10 1C13.315 1 16 3.685 16 7C16 10.315 13.315 13 10 13ZM10 11C12.21 11 14 9.21 14 7C14 4.79 12.21 3 10 3C7.79 3 6 4.79 6 7C6 9.21 7.79 11 10 11ZM18.2837 14.7028C21.0644 15.9561 23 18.752 23 22H21C21 19.564 19.5483 17.4671 17.4628 16.5271L18.2837 14.7028ZM17.5962 3.41321C19.5944 4.23703 21 6.20361 21 8.5C21 11.3702 18.8042 13.7252 16 13.9776V11.9646C17.6967 11.7222 19 10.264 19 8.5C19 7.11935 18.2016 5.92603 17.041 5.35635L17.5962 3.41321Z"
							></path>
						</svg>
						Continue For Group
					</label>
				</div>
			</form>
			<form @submit.prevent v-if="group.chosen && !group.self" class="mt-6 px-4">
				<div class="flex flex-col">
					<label for="group_name" class="font-semibold">Group Name</label>
					<input
						id="group_name"
						type="text"
						required
						class="p-2 mt-1 ring-1 rounded focus:ring-2 focus:outline-none"
						v-model="group.name"
						placeholder="Some rad name"
					/>
				</div>
				<div class="mt-4">
					<label for="members" class="font-semibold">Phone or Email</label>
					<br />
					<small class="ml-0.5">Add the phone numbers or emails for your members.</small>
					<TextArea
						id="members"
						:placeholder="`Example: allan@gmail.com, 0712345678, +254712345678, boni@mail.com, etc. <br /> Don't forget yourself. 😀`"
						:delimiters="[',', 'Enter']"
						:separator="','"
						:transformer="validator"
						@part="invites.add({ email: $event })"
						@delete="invites.delete($event)"
					/>
				</div>
				<div class="flex flex-col mt-4">
					<label for="group_number" class="font-semibold">Member count</label>
					<input
						id="group_number"
						type="number"
						required
						disabled
						class="p-2 mt-1 ring-1 rounded focus:ring-2 focus:outline-none"
						title="Change as needed"
						v-model="group.count"
					/>
				</div>
				<div class="mt-4 flex w-full justify-between">
					<button type="button" @click="group.chosen = false" class="px-4 py-2 bg-gray-200 rounded">
						Back
					</button>
					<button
						type="submit"
						class="px-4 py-2 bg-emerald-700 text-white rounded disabled:cursor-not-allowed"
						@click="processInvites"
						:disabled="loading"
					>
						<span v-if="!loading"> Next </span>
						<span :class="{ 'animate-spin': loading }" class="w-full grid place-items-center" v-else>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="currentColor"
								class="w-5 h-5"
							>
								<path
									d="M18.364 5.63604L16.9497 7.05025C15.683 5.7835 13.933 5 12 5C8.13401 5 5 8.13401 5 12C5 15.866 8.13401 19 12 19C15.866 19 19 15.866 19 12H21C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C14.4853 3 16.7353 4.00736 18.364 5.63604Z"
								></path>
							</svg>
						</span>
					</button>
				</div>
				<div class="flex w-full px-4 ml-0.5 relative justify-between flex-wrap gap-2 mt-2">
					<small class="text-gray-500 w-fit" v-if="data.meta.price_group > 0">
						This form requires payment for submission of <br />
						<span class="text-red-400">Amount Due: {{ data.meta.price_group }}</span>
						KES
					</small>
				</div>
			</form>
			<Modal
				:show="paymentModal"
				title="Your MPESA phone number"
				@confirm="processForm()"
				@cancel="
					payment_details = { phone: '' };
					paymentModal = false;
					loading = false;
				"
			>
				<div class="flex flex-col">
					<input
						type="tel"
						class="input focus:outline-none focus:ring-1"
						placeholder="MPESA Phone Number"
						v-model="payment_details.phone"
					/>
				</div>
			</Modal>
		</div>
	</div>
</template>

<style scoped>
code {
	background-color: rgba(255, 0, 0, 0.1);
	border-radius: 4px;
	padding: 2px 4px;
	font-size: smaller;
	color: rgb(54, 0, 0);
}

.header {
	@apply bg-slate-600;
	@apply rounded-md;
	@apply text-white;
}

.input {
	@apply w-full;
	@apply h-10;
	@apply px-3;
	@apply py-2;
	@apply text-sm;
	@apply rounded-md;
	@apply border;
	@apply mb-4;
}
</style>
