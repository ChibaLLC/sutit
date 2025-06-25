<template>
	<div class="w-full flex justify-center items-center relative text-dark z-10">
		<nav
			class="flex w-10/12 max-sm:w-11/12 justify-between items-center border-sky border text-lg px-3 max-sm:px-2 py-1 mt-4 bg-white rounded isolate relative navbar"
		>
			<!-- Logo -->
			<div>
				<svg class="h-12 max-sm:h-9" viewBox="0 0 65 60" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path
						d="M0 5C0 2.23858 2.23858 0 5 0H35C51.5685 0 65 13.4315 65 30C65 46.5685 51.5685 60 35 60H5C2.23858 60 0 57.7614 0 55V5Z"
						fill="#3D5A80"
					/>
				</svg>
			</div>

			<!-- Desktop Navigation -->
			<ul class="hidden md:flex justify-center w-full font-serif gap-x-20 items-center text-xl -z-10 absolute">
				<li class="hover:text-sky transition-colors">
					<NuxtLink to="/">Home</NuxtLink>
				</li>
				<li class="hover:text-sky transition-colors">
					<NuxtLink to="/about">About</NuxtLink>
				</li>
				<li>
					<NuxtLink to="/">
						<span class="uppercase text-3xl">sutit.</span>
					</NuxtLink>
				</li>
				<li class="hover:text-sky transition-colors">
					<NuxtLink to="/pricing">Pricing</NuxtLink>
				</li>
				<li class="hover:text-sky transition-colors">
					<NuxtLink to="/contact">Contact</NuxtLink>
				</li>
			</ul>

			<!-- Mobile Logo -->
			<div class="md:hidden flex justify-center w-full absolute">
				<NuxtLink to="/">
					<span class="uppercase text-2xl font-serif">Sutit.</span>
				</NuxtLink>
			</div>

			<!-- Right side actions -->
			<div class="isolate z-20">
				<div>
					<div v-if="!userIsAuthenticated()">
						<!-- Login button (desktop) -->
						<NuxtLink
							class="hidden md:block bg-navy px-8 py-2 rounded-sm text-white font-bold transition-colors hover:bg-navy/90"
							to="/auth/login"
						>
							<span>Login</span>
						</NuxtLink>
						<!-- Mobile menu toggle -->
						<div class="md:hidden bg-navy p-2 rounded text-white cursor-pointer" @click="toggleMobileMenu">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="currentColor"
								class="w-6 h-5"
							>
								<path d="M3 4H21V6H3V4ZM3 11H21V13H3V11ZM3 18H21V20H3V18Z"></path>
							</svg>
						</div>
					</div>
					<!-- Authenticated user -->
					<div
						class="rounded-xl max-sm:rounded-lg p-[6px] text-white font-bold bg-white border-2 border-navy relative overflow-hidden cursor-pointer"
						v-else
						@click="toggleDropdown"
					>
						<img
							:src="pp"
							alt="Profile Picture"
							class="object-cover h-8 max-sm:h-6 w-10 max-sm:w-8 aspect-square opacity-80 grayscale"
						/>
						<div
							class="absolute w-full h-full bg-navy/15 top-0 left-0 hover:bg-transparent transition-colors"
						></div>
					</div>
				</div>

				<!-- User dropdown menu -->
				<ul
					ref="dropdown"
					class="absolute border px-10 py-1 dropdown text-white bg-navy/80 mt-1 -mr-0.5 rounded-b-md backdrop-blur-lg"
				>
					<li class="hover:text-sky w-full transition-colors py-1 initial" @click="toggleDropdown">
						<button @click="logout" v-if="userIsAuthenticated()">Log Out</button>
					</li>
				</ul>
			</div>
		</nav>

		<!-- Mobile Navigation Menu -->
		<div
			ref="mobileMenu"
			class="mobile-menu fixed top-0 left-0 w-full h-full bg-navy/95 backdrop-blur-md z-50 flex flex-col justify-center items-center transform translate-x-full transition-transform duration-300"
		>
			<button
				@click="toggleMobileMenu"
				class="absolute top-6 right-6 text-white hover:text-sky transition-colors"
			>
				<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
					<path
						d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"
					></path>
				</svg>
			</button>

			<ul class="flex flex-col gap-y-6 font-serif items-center text-white text-2xl">
				<li class="hover:text-sky transition-colors">
					<NuxtLink to="/" @click="toggleMobileMenu">Home</NuxtLink>
				</li>
				<li class="hover:text-sky transition-colors">
					<NuxtLink to="/about" @click="toggleMobileMenu">About</NuxtLink>
				</li>
				<li class="hover:text-sky transition-colors">
					<NuxtLink to="/pricing" @click="toggleMobileMenu">Pricing</NuxtLink>
				</li>
				<li class="hover:text-sky transition-colors">
					<NuxtLink to="/contact" @click="toggleMobileMenu">Contact</NuxtLink>
				</li>
				<li class="mt-6">
					<NuxtLink
						to="/auth/login"
						class="bg-white px-12 py-3 rounded-sm text-navy font-bold"
						@click="toggleMobileMenu"
					>
						Login
					</NuxtLink>
				</li>
			</ul>
		</div>
	</div>
</template>

<script setup lang="ts">
const dropdown = ref<HTMLElement | null>(null);
const mobileMenu = ref<HTMLElement | null>(null);
const isMobileMenuOpen = ref(false);
const pp = "/images/profile.png";

function toggleDropdown() {
	if (!dropdown.value) return console.warn("Dropdown not found");
	dropdown.value.classList.toggle("active");
}

function toggleMobileMenu() {
	if (!mobileMenu.value) return console.warn("Mobile menu not found");
	isMobileMenuOpen.value = !isMobileMenuOpen.value;

	if (isMobileMenuOpen.value) {
		mobileMenu.value.classList.remove("translate-x-full");
		document.body.style.overflow = "hidden";
	} else {
		mobileMenu.value.classList.add("translate-x-full");
		document.body.style.overflow = "";
	}
}

// Close mobile menu on window resize if open
function handleWindowResize() {
	if (window.innerWidth >= 768 && isMobileMenuOpen.value) {
		toggleMobileMenu();
	}
}

onMounted(() => {
	window.addEventListener("resize", handleWindowResize);
});

onBeforeUnmount(() => {
	window.removeEventListener("resize", handleWindowResize);
});
</script>

<style scoped lang="scss">
.navbar {
	filter: drop-shadow(0px 10px 10px rgba(90, 169, 230, 0.1));
	height: 65px;

	@media screen and (max-width: 768px) {
		height: 50px;
	}
}

.dropdown {
	transform: translateY(-100%);
	right: 0;
	top: 3.8rem;
	opacity: 0;
	transition:
		transform 0.3s,
		opacity 0.3s;
	pointer-events: none;

	@media screen and (max-width: 768px) {
		top: 2.8rem !important;
	}

	&.active {
		transform: translateY(0);
		opacity: 1;
		pointer-events: all;
	}
}

.mobile-menu {
	opacity: 0.98;

	&.translate-x-full {
		opacity: 0;
	}
}
</style>
