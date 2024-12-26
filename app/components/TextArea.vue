<template>
	<div class="relative">
		<div
			ref="input"
			@focusin="hidePlaceholder = true"
			contenteditable="true"
			class="block w-full text-sm text-gray-900 bg-gray-50 rounded border border-gray-300 focus:outline-none focus:ring-navy focus:border-navy textarea has-placeholder"
		>
			<span class="placeholder" v-if="!hidePlaceholder">
				<span v-html="placeholder || 'Write your text here...'"></span>
			</span>
			<br v-if="items.length" />
			<div>
				<div v-for="item of items" class="bg-navy text-white rounded p-0.5 invite mt-1" :key="item">
				<slot>
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4">
						<path
							d="M21.7267 2.95694L16.2734 22.0432C16.1225 22.5716 15.7979 22.5956 15.5563 22.1126L11 13L1.9229 9.36919C1.41322 9.16532 1.41953 8.86022 1.95695 8.68108L21.0432 2.31901C21.5716 2.14285 21.8747 2.43866 21.7267 2.95694ZM19.0353 5.09647L6.81221 9.17085L12.4488 11.4255L15.4895 17.5068L19.0353 5.09647Z"
						></path>
					</svg>
				</slot>
				<p class="mx-0.5">
					{{ item }}
				</p>
				<button type="button" @click="deleteArrayItems(items, item); emits('delete', item)" class="hover:text-red-500">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-3 h-3">
						<path
							d="M11.9997 10.5865L16.9495 5.63672L18.3637 7.05093L13.4139 12.0007L18.3637 16.9504L16.9495 18.3646L11.9997 13.4149L7.04996 18.3646L5.63574 16.9504L10.5855 12.0007L5.63574 7.05093L7.04996 5.63672L11.9997 10.5865Z"
						></path>
					</svg>
				</button>
			</div>
			</div>
		</div>
		<small class="help has-text-grey">Press <code>Enter</code> or <code>,</code> to add a contact</small>
	</div>
</template>
<script setup lang="ts">
const input = ref<HTMLDivElement | undefined>();
const props = defineProps<{
	placeholder?: string;
	delimiters: Array<string>;
	separator: string;
	transformer?: (input: string) => string | undefined;
}>();

const accumulation = ref("");
const items = reactive<string[]>([]);
function clearText() {
	const element = input.value;
	if (!element) return console.warn("No input element found");
	for (const node of element.childNodes) {
		if (node.nodeType === Node.TEXT_NODE) {
			node.remove();
		}
	}
}

function getText() {
	const element = input.value;
	if (!element) {
		console.warn("Element not found");
		return "";
	}
	let textAcc = "";
	for (let i = 0; i < element.childNodes.length; i++) {
		const node = element.childNodes[i];
		if (!node) continue;
		if (node.nodeType === Node.TEXT_NODE) {
			textAcc += node.textContent;
		}
	}
	return textAcc.trim();
}

const hidePlaceholder = ref(false);
watch(accumulation, (val) => {
	if (val.length) {
		hidePlaceholder.value = true;
	}
});

const emits = defineEmits<{
	part: [string];
	input: [string];
	delete: [string]
}>();
onMounted(() => {
	input.value?.addEventListener("keydown", (e) => {
		if (props.delimiters.includes(e.key)) {
			let text: string | undefined = getText();
			if (props.transformer) {
				text = props.transformer(text);
			}
			if (text) {
				emits("part", text);
				items.push(text);
			}
			clearText();
			accumulation.value = "";
			e.preventDefault()
		} else {
			accumulation.value += e.key;
			emits("input", accumulation.value);
		}
	});
});
</script>
<style>
.has-placeholder {
	--padding: calc(0.75em - 1px);
}

.textarea {
	height: fit-content;
	min-height: 100px;
	font-size: 0.9rem;
	padding: var(--padding);
}

.has-placeholder .placeholder {
	position: absolute;
	font-size: 0.9rem;
	color: #a0aec0;
	pointer-events: none;
	top: 0;
	padding-top: var(--padding);
}

.invite {
	display: flex;
	width: fit-content;
	max-width: 100%;
	justify-content: start;
	align-items: center;
	cursor: pointer;
	font-size: medium;
}

.invite p {
	max-width: 90%;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.invite button {
	margin-top: 2px;
}

.invite p:hover {
	max-width: unset;
	overflow: visible;
	white-space: normal;
}

.invite:has(p:hover) {
	max-width: unset;
	width: fit-content;
}
</style>
