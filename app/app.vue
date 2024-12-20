<template>
	<NuxtLayout>
		<NuxtLoadingIndicator
			:color="`repeating-linear-gradient(to right, #ee6c4d, red`"
			:height="4"
		/>
		<NuxtPage />
	</NuxtLayout>
</template>
<style>
.page-enter-active,
.page-leave-active {
	transition: opacity 0.5s ease, transform 0.5s ease;
	will-change: opacity, transform;
}

.page-enter-from,
.page-leave-to {
	opacity: 0;
	transform: translateY(20px);
}

#__nuxt {
	max-width: 100vw;
	max-width: 100dvw;
	overflow-x: hidden;
	min-height: 100vh;
	min-height: 100dvh;
}

::-webkit-scrollbar {
	@apply bg-dark;
	width: 5px;
	height: 5px;
}

::-webkit-scrollbar-thumb {
	@apply bg-sky;
}
</style>
