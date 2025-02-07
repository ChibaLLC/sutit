<script lang="ts" setup>
const seoMeta = ref({
	title: "Contact | Sutit.org",
	description: "Sutit.org is a platform that helps you automate your business processes",
});
// Seo Meta
useSeoMeta({
	title: seoMeta.value.title,
	description: seoMeta.value.description,
	ogTitle: seoMeta.value.title,
	ogDescription: seoMeta.value.description,
	ogImage: "/favico.jpeg",
	ogUrl: "[og:url]",
	twitterTitle: seoMeta.value.title,
	twitterDescription: seoMeta.value.description,
	twitterImage: "/favico.jpeg",
	twitterCard: "summary",
});
useHead({
	title: seoMeta.value.title,
});
</script>
<template>
	<div class="w-10/12 m-auto flex flex-col max-sm:w-full">
		<Title>Sutit | Contact</Title>
		<div class="wrapper"></div>
		<div
			class="w-6/12 border border-sky bg-light/20 rounded-2xl max-sm:rounded max-w-[90vw] m-auto mt-20 p-10 shadow-md shadow-sky max-sm:mt-10 max-sm:p-5 max-sm:w-full"
		>
			<h2 class="text-lg uppercase font-serif ml-2">Sutit</h2>
			<h1 class="font-sans font-bold text-6xl text-left max-sm:mt-6 text-dark max-sm:text-5xl ml-2">
				Contact <span class="text-peach">Us</span>
			</h1>
			<p class="p-2 mt-4">
				Hey there! Always happy to hear from you. If you have any questions, or feedback or just want to say hi,
				feel free to reach out. Go ahead book a meeting using the button below.
			</p>
			<ContactBooker class="m-auto mt-4" />
		</div>
	</div>
</template>
<style scoped>
.wrapper {
	z-index: -1;
	position: absolute;
	top: 0;
	left: 0;
	padding-top: 5rem;
	min-width: 100vw;
	min-height: 100vh;
	background: radial-gradient(100.76% 179.14% at -2.4% -2.78%, #ffffff 25.3%, #e0fbfc 100%);
}
.shadow-md.shadow-sky {
	box-shadow: 2px 4px 10px rgba(152, 193, 217, 0.25);
	backdrop-filter: blur(10px);
}
</style>
