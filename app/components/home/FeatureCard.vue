<script setup lang="ts">
const props = defineProps<{
	title: string;
	content: string;
}>();
</script>
<template>
	<div class="bg-white p-6 rounded-lg shadow-sm border">
		<div class="flex items-start mb-2">
			<div class="rounded-full p-2 mr-3">
				<Icon name="mdi:information-outline" class="h-6 w-6 text-black" />
			</div>
			<h3 class="text-lg font-semibold text-red-500">{{ title }}</h3>
		</div>
		<p class="text-gray-700 text-sm">
			{{ content }}
		</p>
	</div>
</template>
