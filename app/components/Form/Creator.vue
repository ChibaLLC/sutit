<script setup lang="ts">
import type { Form } from "@chiballc/nuxt-form-builder";

const emits = defineEmits<{
	submit: [SutitFormData];
}>();
const props = defineProps({
	starter: {
		type: Object as PropType<SutitFormData>,
		required: false,
	},
});

const showPriceModal = ref(false);
const showFormNameModal = ref(false);
const helpText = ref(false);

const defaultGroupMessage = () => {
	if (Boolish(data.value.payment.group_amount)) {
		return (
			"Hello, you have been invited to participate in the following survey. " +
			"This is a paid link that is unique to you, and can only be used once. " +
			"Follow it to submit your details:"
		);
	} else {
		return (
			"Hello, you have been invited to participate in the following survery. " +
			"Follow the link to submit your details:"
		);
	}
};

const data = ref<SutitFormData>(
	props.starter || {
		name: "",
		description: "" as string | null | undefined,
		allowGroups: false,
		requireMerch: false,
		form: {
			stores: {},
			pages: {},
		} satisfies Form,
		payment: {
			amount: 0 as number | null | undefined,
			group_amount: 0 as number | null | undefined,
			group_limit: 0 as number | null | undefined,
			group_message: "",
			group_invite_message: "",
		},
	},
);
const groupMessage = computed({
	get() {
		data.value.payment.group_message = props.starter?.payment.group_invite_message || defaultGroupMessage();
		return data.value.payment.group_message;
	},
	set(val) {
		if (val) {
			data.value.payment.group_message = val;
			data.value.payment.group_invite_message = val;
		} else {
			data.value.payment.group_message = props.starter?.payment.group_invite_message || defaultGroupMessage();
		}
	},
});

function addPaymentOption() {
	showPriceModal.value = true;
}

async function submit(form: Form) {
	data.value.form = form;
	if (!Object.entries(form.pages).length && !Object.entries(form.stores).length) {
		alert("Please add a form or a store");
	}

	if (!data.value.payment.group_message?.trim()) {
		data.value.payment.group_message = defaultGroupMessage();
	}

	await uploadStoreImages(data.value);
	emits("submit", data.value);
}

onMounted(() => {
	showFormNameModal.value = true;
});

function closeFormDetailsModal() {
	if (data.value.name.trim() === "") {
		helpText.value = true;
	} else {
		showFormNameModal.value = false;
	}
}
</script>

<template>
	<div>
		<Title>Build Form</Title>
		<LazyFormBuilder :styles="{ height: '100vh' }" @submit="submit" :starter="starter?.form">
			<template #footer>
				<LazyFormBuilderFooterItem>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="currentColor"
						class="w-7 h-7"
						@click="addPaymentOption"
					>
						<path
							d="M22.0049 6.99979H23.0049V16.9998H22.0049V19.9998C22.0049 20.5521 21.5572 20.9998 21.0049 20.9998H3.00488C2.4526 20.9998 2.00488 20.5521 2.00488 19.9998V3.99979C2.00488 3.4475 2.4526 2.99979 3.00488 2.99979H21.0049C21.5572 2.99979 22.0049 3.4475 22.0049 3.99979V6.99979ZM20.0049 16.9998H14.0049C11.2435 16.9998 9.00488 14.7612 9.00488 11.9998C9.00488 9.23836 11.2435 6.99979 14.0049 6.99979H20.0049V4.99979H4.00488V18.9998H20.0049V16.9998ZM21.0049 14.9998V8.99979H14.0049C12.348 8.99979 11.0049 10.3429 11.0049 11.9998C11.0049 13.6566 12.348 14.9998 14.0049 14.9998H21.0049ZM14.0049 10.9998H17.0049V12.9998H14.0049V10.9998Z"
						></path>
					</svg>
				</LazyFormBuilderFooterItem>
			</template>
		</LazyFormBuilder>
		<Modal
			:show="showPriceModal"
			@confirm="showPriceModal = false"
			@cancel="showPriceModal = false"
			title="Charge for a submission"
		>
			<div>
				<label for="payment-amount">Submission Amount Payable</label>
				<input
					type="number"
					id="payment-amount"
					class="border-1 border-solid px-3 py-3 placeholder-gray-400 text-gray-700 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full mt-2"
					placeholder="Amount to charge for the form"
					v-model="data.payment.amount"
				/>
			</div>
			<div class="mt-4">
				<div class="mt-2 flex gap-3 cursor-pointer flex-row-reverse justify-end -mb-2">
					<label for="groups">Require Merch?</label>
					<input type="checkbox" id="groups" v-model="data.requireMerch" />
				</div>
				<div class="flex flex-col justify-start mt-2">
					<small class="font-mulish">Require users to get something from the store before submitting?</small>
					<small
						class="text-red-500 font-mulish -mt-2"
						v-if="data.requireMerch && !Object.values(data.form.stores).at(0)?.length"
						>Be sure to add an item to the store section or form submission won't work</small
					>
				</div>
			</div>
			<div v-if="data.allowGroups" class="mt-4">
				<label for="group-payment-amount"
					>Group Amount Payable
					<input
						type="number"
						id="group-payment-amount"
						class="border-1 border-solid px-3 py-3 placeholder-gray-400 text-gray-700 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full my-2"
						placeholder="Amount to charge a group for the form"
						v-model="data.payment.group_amount"
					/>
				</label>
				<label for="group-member-limit">
					Group Member Number Limit
					<input
						type="number"
						v-model="data.payment.group_limit"
						id="group-member-limit"
						class="border-1 border-solid px-3 py-3 placeholder-gray-400 text-gray-700 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full mt-2"
					/>
					<small class="text-gray-700 font-mulish"
						>Restrict the maximum number of people that could be in a group. Zero means unrestricted</small
					>
				</label>
				<label for="group_message" class="flex flex-col">
					Information Prompt Message
					<textarea
						id="group_message"
						class="p-2 mt-1 bg-white rounded focus:ring-2 focus:outline-none font-sans"
						title="Change as needed"
						v-model="groupMessage"
					>
					</textarea>
					<small class="text-gray-700 font-mulish"
						>The individial message to be sent to a member after the group representative has filled in
						their details</small
					>
				</label>
			</div>
		</Modal>
		<Modal
			:show="showFormNameModal"
			@cancel="closeFormDetailsModal"
			@confirm="closeFormDetailsModal"
			title="New Form Details"
		>
			<div>
				<label for="form-name">Name</label>
				<input
					type="text"
					id="form-name"
					class="border-1 border-solid px-3 py-3 placeholder-gray-400 text-gray-700 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full mt-1"
					placeholder="Name of the form (Required)"
					v-model="data.name"
				/>
				<small class="text-gray-500">This will be the title of the form</small>
			</div>
			<div class="mt-4">
				<label for="form-description">Description</label>
				<textarea
					id="form-description"
					class="border-1 border-solid px-3 py-3 placeholder-gray-400 text-gray-700 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full mt-1"
					placeholder="Description of the form"
					v-model="data.description"
				></textarea>
			</div>
			<div class="mt-2 flex gap-3 cursor-pointer flex-row-reverse justify-end">
				<label for="groups">Allow grouped responses</label>
				<input type="checkbox" id="groups" v-model="data.allowGroups" />
			</div>
			<div v-if="helpText">
				<p class="text-red-500 text-sm">Please provide a name for the form</p>
			</div>
		</Modal>
	</div>
</template>

<style scoped></style>
