<script setup lang="ts">
import { ref, watch } from "vue";
import { useQRCode } from "@vueuse/integrations/useQRCode";

const props = defineProps<{
	open: boolean;
	qrcode: string;
}>();
const emit = defineEmits(["update:open"]);

const text = ref(props.qrcode);
const qrcodeImage = useQRCode(text);

watch(
	() => props.qrcode,
	(newVal) => {
		text.value = newVal;
		qrcodeImage.value = useQRCode(newVal).value;
	},
	{ immediate: true },
);

const closeModal = () => {
	emit("update:open", false);
};

const downloadQRCode = () => {
	const link = document.createElement("a");
	link.href = qrcodeImage.value;
	link.download = "qrcode.png";
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
};
</script>

<template>
	<transition name="fade">
		<div v-if="props.open" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
			<div class="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm text-center">
				<h2 class="text-xl font-semibold mb-4">Scan the QR Code</h2>
				<div v-if="qrcodeImage" class="p-4 bg-gray-100 rounded-lg flex justify-center items-center">
					<img :src="qrcodeImage" alt="QR Code" class="w-60 h-60" />
				</div>
				<div v-else class="text-gray-500">Generating QR Code...</div>
				<div class="mt-4 flex justify-between gap-2">
					<button class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600" @click="downloadQRCode">
						Download QR
					</button>
					<button class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600" @click="closeModal">
						Close
					</button>
				</div>
			</div>
		</div>
	</transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
	transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
	opacity: 0;
}
</style>
