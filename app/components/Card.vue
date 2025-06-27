<template>
	<div :class="cardClasses" @click="handleClick">
		<div v-if="decorative" :class="decorativeClasses"></div>

		<div class="relative z-10">
			<!-- Header -->
			<div class="flex items-center justify-between mb-4" v-if="$slots.header || icon || badge">
				<div class="flex items-center space-x-3">
					<div v-if="icon" :class="iconWrapperClasses">
						<Icon :name="icon" :class="iconClasses" />
					</div>
					<slot name="header" />
				</div>
				<span v-if="badge" :class="badgeClasses">{{ badge }}</span>
			</div>

			<!-- Content -->
			<div class="space-y-3">
				<div v-if="title || value" class="space-y-1">
					<h3 v-if="value" :class="valueClasses">{{ formatValue(value) }}</h3>
					<p v-if="title" :class="titleClasses">{{ title }}</p>
				</div>

				<slot />

				<!-- Progress Bar -->
				<div v-if="progress !== undefined" class="space-y-2">
					<div class="w-full bg-gray-200 rounded-full h-2">
						<div :class="progressBarClasses" :style="{ width: `${Math.min(progress, 100)}%` }"></div>
					</div>
					<p v-if="progressLabel" class="text-xs text-gray-500">{{ progressLabel }}</p>
				</div>
			</div>

			<!-- Footer -->
			<div v-if="$slots.footer" class="mt-4 pt-4 border-t border-gray-100">
				<slot name="footer" />
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
interface Props {
	variant?: "primary" | "secondary" | "success" | "warning" | "info";
	size?: "sm" | "md" | "lg";
	hoverable?: boolean;
	clickable?: boolean;
	icon?: string;
	title?: string;
	value?: string | number;
	badge?: string;
	progress?: number;
	progressLabel?: string;
	decorative?: boolean;
	to?: string;
}

const props = withDefaults(defineProps<Props>(), {
	variant: "primary",
	size: "md",
	hoverable: false,
	clickable: false,
	decorative: true,
});

const emit = defineEmits<{
	click: [event: MouseEvent];
}>();

const formatValue = (value: string | number) => {
	if (typeof value === "number") {
		return value.toLocaleString();
	}
	return value;
};

const handleClick = (event: MouseEvent) => {
	if (props.clickable || props.to) {
		emit("click", event);
	}
};

const cardClasses = computed(() => [
	// Base styles
	"relative overflow-hidden rounded-2xl border transition-all duration-300",
	"bg-white backdrop-filter backdrop-blur-10px",

	// Size variants
	{
		"p-4": props.size === "sm",
		"p-6": props.size === "md",
		"p-8": props.size === "lg",
	},

	// Hover effects
	{
		"hover:scale-105 transform": props.hoverable,
		"shadow-md shadow-sky hover:shadow-lg hover:shadow-sky": props.hoverable,
		"cursor-pointer": props.clickable || props.to,
	},

	// Border and shadow
	"border-gray-100 shadow-md shadow-sky",
]);

const decorativeClasses = computed(() => {
	const baseClasses = "absolute rounded-full opacity-10";

	const variantClasses = {
		primary: "bg-gradient-to-br from-[#3D5A80] to-[#3D5A80] top-0 right-0 w-32 h-32 translate-x-16 -translate-y-16",
		secondary:
			"bg-gradient-to-br from-[#98C1D9] to-[#98C1D9] top-0 right-0 w-32 h-32 translate-x-16 -translate-y-16",
		success:
			"bg-gradient-to-br from-emerald-400 to-emerald-600 top-0 right-0 w-32 h-32 translate-x-16 -translate-y-16",
		warning: "bg-gradient-to-br from-[#F36A3E] to-[#F36A3E] top-0 right-0 w-32 h-32 translate-x-16 -translate-y-16",
		info: "bg-gradient-to-br from-[#98C1D9] to-[#3D5A80] top-0 right-0 w-32 h-32 translate-x-16 -translate-y-16",
	};

	return [baseClasses, variantClasses[props.variant]];
});

const iconWrapperClasses = computed(() => {
	const variantClasses = {
		primary: "bg-[#3D5A80]/10 text-[#3D5A80]",
		secondary: "bg-[#98C1D9]/20 text-[#3D5A80]",
		success: "bg-emerald-100 text-emerald-600",
		warning: "bg-[#F36A3E]/10 text-[#F36A3E]",
		info: "bg-[#98C1D9]/20 text-[#3D5A80]",
	};

	return ["p-3 rounded-xl transition-colors", variantClasses[props.variant]];
});

const iconClasses = computed(() => [
	"transition-colors",
	{
		"w-6 h-6": props.size === "sm",
		"w-7 h-7": props.size === "md",
		"w-8 h-8": props.size === "lg",
	},
]);

const badgeClasses = computed(() => {
	const variantClasses = {
		primary: "bg-[#3D5A80]/10 text-[#3D5A80]",
		secondary: "bg-[#98C1D9]/20 text-[#3D5A80]",
		success: "bg-emerald-50 text-emerald-600",
		warning: "bg-[#F36A3E]/10 text-[#F36A3E]",
		info: "bg-[#98C1D9]/20 text-[#3D5A80]",
	};

	return ["text-sm font-medium px-3 py-1 rounded-full", variantClasses[props.variant]];
});

const valueClasses = computed(() => [
	"font-bold text-gray-900",
	{
		"text-2xl": props.size === "sm",
		"text-3xl": props.size === "md",
		"text-4xl": props.size === "lg",
	},
]);

const titleClasses = "text-gray-600 font-medium";

const progressBarClasses = computed(() => {
	const variantClasses = {
		primary: "bg-gradient-to-r from-[#3D5A80] to-[#3D5A80]",
		secondary: "bg-gradient-to-r from-[#98C1D9] to-[#3D5A80]",
		success: "bg-gradient-to-r from-emerald-400 to-emerald-600",
		warning: "bg-gradient-to-r from-[#F36A3E] to-[#F36A3E]",
		info: "bg-gradient-to-r from-[#98C1D9] to-[#3D5A80]",
	};

	return ["h-2 rounded-full transition-all duration-500", variantClasses[props.variant]];
});
</script>
