<template>
	<div class="relative py-8 md:py-16 px-4 md:px-8 bg-gradient-to-b from-white to-blue-50">
		<h2 class="text-2xl md:text-3xl font-bold text-center text-gray-800 mb-8">Our Features</h2>

		<!-- Carousel Container -->
		<div
			class="w-full max-w-7xl mx-auto overflow-x-auto overflow-y-hidden relative scrollbar-hide"
			ref="carouselContainer"
		>
			<!-- Carousel Items -->
			<div
				class="flex items-stretch gap-4 md:gap-6 lg:gap-8 px-4 md:px-0 transition-transform duration-300 ease-in-out"
				id="carousel_items"
				:style="{ transform: `translateX(-${currentTranslate}px)` }"
			>
				<HighlightCard
					v-for="(card, index) in cards"
					:key="index"
					:to="card.to"
					class="flex-shrink-0 w-[280px] md:w-[320px] lg:w-[360px] h-auto min-h-[280px] transition-all duration-300 hover:shadow-lg"
					:class="[
						activeItemIndex === index ? 'scale-105 shadow-md' : 'scale-100',
						'rounded-xl shadow-sm border border-gray-100',
					]"
					@click="setActiveCard(index)"
				>
					<template #icon>
						<div
							class="flex justify-center items-center h-32 w-full transition-transform duration-300 hover:scale-110"
						>
							<component :is="card.icon" />
						</div>
					</template>
					<template #tagline>
						<div class="text-center">
							<h3 class="text-lg font-semibold text-gray-800 mb-2">{{ card.title }}</h3>
							<p class="text-gray-600">{{ card.tagline }}</p>
						</div>
					</template>
				</HighlightCard>
			</div>
		</div>

		<!-- Navigation Controls - Visible on all screen sizes with responsive styling -->
		<div class="flex justify-center items-center mt-8 gap-4">
			<!-- Dots Navigation -->
			<div class="flex gap-2 mx-auto">
				<button
					v-for="(_, index) in cards"
					:key="index"
					@click="scrollTo(index)"
					class="w-3 h-3 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
					:class="activeItemIndex === index ? 'bg-blue-600' : 'bg-gray-300 hover:bg-gray-400'"
					:aria-label="`Go to slide ${index + 1}`"
				></button>
			</div>
		</div>

		<!-- Arrow Navigation - Positioned on sides -->
		<button
			class="absolute top-1/2 left-2 md:left-4 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 z-10"
			@click="scrollLeft"
			aria-label="Previous slide"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-6 w-6 text-blue-600"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
			</svg>
		</button>

		<button
			class="absolute top-1/2 right-2 md:right-4 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 z-10"
			@click="scrollRight"
			aria-label="Next slide"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-6 w-6 text-blue-600"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
			</svg>
		</button>
	</div>
</template>

<script setup lang="ts">
import FormIcon from "../icons/FormIcon.vue";
import MarketPlaceIcon from "../icons/MarketPlaceIcon.vue";
import SalesIcon from "../icons/SalesIcon.vue";

// Card data
const cards = [
	{
		to: "/marketplace",
		title: "Marketplace",
		tagline: "Visit Our Marketplace",
		icon: MarketPlaceIcon,
	},
	{
		to: "/dashboard",
		title: "Paid Forms",
		tagline: "Create Paid Forms",
		icon: FormIcon,
	},
	{
		to: "/whatsapp",
		title: "Sales",
		tagline: "Make Sales",
		icon: SalesIcon,
	},
];

// Component refs and state
const carouselContainer = ref<HTMLElement | null>(null);
const activeItemIndex = ref(0);
const currentTranslate = ref(0);
const cardWidth = ref(320); // Default width, will be updated on mount
const containerWidth = ref(0);

// Calculate visible cards based on container width
const visibleCards = computed(() => {
	if (!containerWidth.value) return 1;
	return Math.floor(containerWidth.value / cardWidth.value);
});

// Set active card
function setActiveCard(index: number) {
	activeItemIndex.value = index;
	updateTranslate();
}

// Update translation value
function updateTranslate() {
	if (!carouselContainer.value) return;

	// Get actual card width including gap
	const cardElement = carouselContainer.value.querySelector("#carousel_items")?.children[0] as HTMLElement;
	if (!cardElement) return;

	const actualCardWidth = cardElement.offsetWidth;
	const gap = 16; // Approximate gap value

	// Calculate translation
	currentTranslate.value = activeItemIndex.value * (actualCardWidth + gap);
}

// Scroll to specific index
function scrollTo(index: number) {
	if (index < 0) {
		index = cards.length - 1;
	} else if (index >= cards.length) {
		index = 0;
	}

	activeItemIndex.value = index;
	updateTranslate();
}

// Scroll right
function scrollRight() {
	scrollTo(activeItemIndex.value + 1);
}

// Scroll left
function scrollLeft() {
	scrollTo(activeItemIndex.value - 1);
}

// Handle window resize
function handleResize() {
	if (!carouselContainer.value) return;
	containerWidth.value = carouselContainer.value.offsetWidth;
	updateTranslate();
}

// Watch for active index changes
watch(activeItemIndex, () => {
	updateTranslate();
});

// Component lifecycle
onMounted(() => {
	if (carouselContainer.value) {
		containerWidth.value = carouselContainer.value.offsetWidth;

		// Get actual card width
		const cardElement = carouselContainer.value.querySelector("#carousel_items")?.children[0] as HTMLElement;
		if (cardElement) {
			cardWidth.value = cardElement.offsetWidth;
		}

		// Initialize position
		updateTranslate();

		// Add resize listener
		window.addEventListener("resize", handleResize);
	}
});
</script>

<style scoped>
/* Hide scrollbar for Chrome, Safari and Opera */
.scrollbar-hide::-webkit-scrollbar {
	display: none;
}

/* Hide scrollbar for IE, Edge and Firefox */
.scrollbar-hide {
	-ms-overflow-style: none; /* IE and Edge */
	scrollbar-width: none; /* Firefox */
}

/* Animation for button press */
.squish {
	animation: squish 0.5s 1;
}

@keyframes squish {
	0% {
		transform: scale(1);
	}
	50% {
		transform: scale(0.85);
	}
	100% {
		transform: scale(1);
	}
}

/* Card hover effect */
.card-hover {
	transition: all 0.3s ease;
}

.card-hover:hover {
	transform: translateY(-5px);
	box-shadow:
		0 10px 25px -5px rgba(0, 0, 0, 0.1),
		0 10px 10px -5px rgba(0, 0, 0, 0.04);
}
</style>
