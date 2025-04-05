<script setup lang="ts">
const props = defineProps<{
	title: string;
	count?: number | number;
	icon: string;
	description?: string;
}>();
</script>
<template>
	<div class="p-6 ring-1 ring-sky rounded shadow bg-gradient-to-r from-blue-100 to-blue-300">
		<div class="flex items-center justify-between">
			<div>
				<p class="font-bold text-xl uppercase">{{ title }}</p>
				<h3 class="text-2xl font-bold text-gray-900 mt-1">{{ count ?? 0 }}</h3>
			</div>
			<div class="rounded-full p-3 transition-colors">
				<Icon :name="icon" class="w-6 h-6" />
			</div>
		</div>
		<div v-if="description" class="mt-4 flex items-center text-sm text-black/90">
			{{ description }}
		</div>
	</div>
</template>
