<template>
	<div class="fixed top-0 left-0 right-0 w-full flex justify-center items-center text-white z-50 px-4 py-4">
		<!-- Animated background gradient -->

		<nav
			class="flex w-full max-w-7xl justify-between items-center border border-white/20 text-lg px-6 max-sm:px-4 py-3 bg-white/10 backdrop-blur-xl rounded-2xl isolate relative navbar group hover:bg-white/15 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-[#3D5A80]/20"
		>
			<!-- Logo with hover animation -->
			<div class="relative group/logo">
				<div
					class="absolute inset-0 bg-gradient-to-r from-[#3D5A80] to-[#98C1D9] rounded-xl opacity-0 group-hover/logo:opacity-20 transition-all duration-300 blur-lg"
				></div>
				<svg
					class="h-14 max-sm:h-10 relative z-10 drop-shadow-lg group-hover/logo:scale-110 transition-transform duration-300"
					viewBox="0 0 65 60"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<defs>
						<linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
							<stop offset="0%" style="stop-color: #3d5a80; stop-opacity: 1" />
							<stop offset="50%" style="stop-color: #98c1d9; stop-opacity: 1" />
							<stop offset="100%" style="stop-color: #f36a3e; stop-opacity: 1" />
						</linearGradient>
					</defs>
					<path
						d="M0 5C0 2.23858 2.23858 0 5 0H35C51.5685 0 65 13.4315 65 30C65 46.5685 51.5685 60 35 60H5C2.23858 60 0 57.7614 0 55V5Z"
						fill="url(#logoGradient)"
						class="group-hover/logo:animate-pulse"
					/>
				</svg>
			</div>

			<!-- Desktop Navigation with floating effect -->
			<ul
				class="hidden lg:flex justify-center w-full font-serif gap-x-16 items-center text-xl absolute left-0 right-0"
			>
				<li class="nav-item group/item">
					<NuxtLink
						to="/"
						class="relative px-4 py-2 rounded-lg transition-all duration-300 hover:bg-white/10 hover:backdrop-blur-sm text-black"
					>
						<span class="relative z-10 font-medium">Home</span>
						<div
							class="absolute inset-0 bg-gradient-to-r from-[#3D5A80]/20 to-[#98C1D9]/20 rounded-lg opacity-0 group-hover/item:opacity-100 transition-all duration-300"
						></div>
					</NuxtLink>
				</li>
				<li class="nav-item group/item">
					<NuxtLink
						to="/about"
						class="relative px-4 py-2 rounded-lg transition-all duration-300 hover:bg-white/10 hover:backdrop-blur-sm text-black"
					>
						<span class="relative z-10 font-medium">About</span>
						<div
							class="absolute inset-0 bg-gradient-to-r from-[#3D5A80]/20 to-[#98C1D9]/20 rounded-lg opacity-0 group-hover/item:opacity-100 transition-all duration-300"
						></div>
					</NuxtLink>
				</li>
				<li class="brand-center group/brand">
					<NuxtLink to="/" class="relative">
						<span
							class="uppercase text-4xl font-bold bg-gradient-to-r from-white via-[#98C1D9] to-[#F36A3E] bg-clip-text text-transparent group-hover/brand:animate-pulse transition-all duration-300 drop-shadow-lg"
						>
							sutit.
						</span>
						<div
							class="absolute inset-0 bg-gradient-to-r from-[#3D5A80]/10 via-[#98C1D9]/10 to-[#F36A3E]/10 blur-xl opacity-0 group-hover/brand:opacity-100 transition-opacity duration-500"
						></div>
					</NuxtLink>
				</li>
				<li class="nav-item group/item">
					<NuxtLink
						to="/pricing"
						class="relative px-4 py-2 rounded-lg transition-all duration-300 hover:bg-white/10 hover:backdrop-blur-sm text-black"
					>
						<span class="relative z-10 font-medium">Pricing</span>
						<div
							class="absolute inset-0 bg-gradient-to-r from-[#3D5A80]/20 to-[#98C1D9]/20 rounded-lg opacity-0 group-hover/item:opacity-100 transition-all duration-300"
						></div>
					</NuxtLink>
				</li>
				<li class="nav-item group/item">
					<NuxtLink
						to="/contact"
						class="relative px-4 py-2 rounded-lg transition-all duration-300 hover:bg-white/10 hover:backdrop-blur-sm text-black"
					>
						<span class="relative z-10 font-medium">Contact</span>
						<div
							class="absolute inset-0 bg-gradient-to-r from-[#3D5A80]/20 to-[#98C1D9]/20 rounded-lg opacity-0 group-hover/item:opacity-100 transition-all duration-300"
						></div>
					</NuxtLink>
				</li>
			</ul>

			<!-- Mobile Logo with gradient -->
			<div class="lg:hidden flex justify-center w-full absolute left-0 right-0">
				<NuxtLink to="/" class="group/mobile-brand">
					<span
						class="uppercase text-2xl max-sm:text-xl font-bold bg-gradient-to-r from-white via-[#98C1D9] to-[#F36A3E] bg-clip-text text-transparent group-hover/mobile-brand:animate-pulse transition-all duration-300"
					>
						Sutit.
					</span>
				</NuxtLink>
			</div>

			<!-- Right side actions with enhanced styling -->
			<div class="isolate z-20">
				<div v-if="!userIsAuthenticated()">
					<!-- Sexy login button (desktop) -->
					<NuxtLink
						class="hidden lg:block relative bg-gradient-to-r from-[#3D5A80] to-[#98C1D9] px-10 py-3 rounded-xl text-white font-bold transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-[#3D5A80]/30 group/login overflow-hidden"
						to="/auth/login"
					>
						<div
							class="absolute inset-0 bg-gradient-to-r from-[#F36A3E] to-[#98C1D9] opacity-0 group-hover/login:opacity-100 transition-opacity duration-300"
						></div>
						<span class="relative z-10 flex items-center gap-2">
							Login
							<Icon
								name="heroicons:arrow-right-20-solid"
								class="w-4 h-4 group-hover/login:translate-x-1 transition-transform duration-300"
							/>
						</span>
					</NuxtLink>

					<!-- Mobile menu toggle with animation -->
					<div
						class="lg:hidden bg-gradient-to-r from-[#3D5A80] to-[#98C1D9] p-3 rounded-xl text-white cursor-pointer transition-all duration-300 hover:scale-110 hover:shadow-lg group/mobile-toggle"
						@click="toggleMobileMenu"
					>
						<Icon
							:name="isMobileMenuOpen ? 'heroicons:x-mark-20-solid' : 'heroicons:bars-3-20-solid'"
							class="w-6 h-6 transition-all duration-300 group-hover/mobile-toggle:rotate-90"
						/>
					</div>
				</div>

				<!-- Authenticated user with glassmorphism -->
				<div
					class="rounded-2xl p-1 text-white font-bold bg-white/10 backdrop-blur-md border border-white/20 relative overflow-hidden cursor-pointer group/profile transition-all duration-300 hover:bg-white/20 hover:scale-105"
					v-else
					@click="toggleDropdown"
				>
					<div
						class="absolute inset-0 bg-gradient-to-r from-[#3D5A80]/20 to-[#98C1D9]/20 opacity-0 group-hover/profile:opacity-100 transition-opacity duration-300"
					></div>
					<img
						:src="pp"
						alt="Profile Picture"
						class="object-cover h-10 max-sm:h-8 w-12 max-sm:w-10 aspect-square rounded-xl border border-white/20 relative z-10 transition-all duration-300 group-hover/profile:scale-110"
					/>
				</div>

				<!-- Enhanced dropdown menu -->
				<ul
					ref="dropdown"
					class="absolute border border-white/20 px-8 py-3 dropdown text-white bg-black/20 backdrop-blur-xl mt-2 -mr-1 rounded-2xl shadow-2xl shadow-[#3D5A80]/20"
				>
					<li
						class="hover:bg-white/10 w-full transition-all duration-300 py-2 rounded-lg px-2 group/dropdown-item"
						@click="toggleDropdown"
					>
						<button @click="logout" v-if="userIsAuthenticated()" class="flex items-center gap-2 w-full">
							<Icon name="heroicons:arrow-right-on-rectangle-20-solid" class="w-4 h-4" />
							Log Out
						</button>
					</li>
				</ul>
			</div>
		</nav>

		<!-- Sexy Mobile Navigation Menu -->
		<div
			ref="mobileMenu"
			class="mobile-menu fixed top-0 left-0 w-full h-full bg-gradient-to-br from-[#3D5A80]/95 via-[#98C1D9]/90 to-[#F36A3E]/95 backdrop-blur-2xl z-50 flex flex-col justify-center items-center transform translate-x-full transition-all duration-500"
		>
			<!-- Animated background elements -->
			<div
				class="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(61,90,128,0.3),transparent_70%)]"
			></div>
			<div
				class="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(152,193,217,0.3),transparent_70%)]"
			></div>
			<div
				class="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(243,106,62,0.2),transparent_70%)]"
			></div>

			<!-- Close button -->
			<button
				@click="toggleMobileMenu"
				class="absolute top-8 right-8 text-white hover:text-[#F36A3E] transition-all duration-300 p-2 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 hover:scale-110 group/close"
			>
				<Icon
					name="heroicons:x-mark-20-solid"
					class="h-8 w-8 group-hover/close:rotate-90 transition-transform duration-300"
				/>
			</button>

			<!-- Mobile menu items -->
			<ul class="flex flex-col gap-y-8 font-serif items-center text-white text-3xl relative z-10">
				<li class="mobile-menu-item group/mobile-item">
					<NuxtLink
						to="/"
						@click="toggleMobileMenu"
						class="relative px-8 py-4 rounded-2xl transition-all duration-300 hover:bg-white/10 hover:backdrop-blur-sm block"
					>
						<span class="relative z-10">Home</span>
						<div
							class="absolute inset-0 bg-gradient-to-r from-[#3D5A80]/20 to-[#98C1D9]/20 rounded-2xl opacity-0 group-hover/mobile-item:opacity-100 transition-all duration-300 blur-sm"
						></div>
					</NuxtLink>
				</li>
				<li class="mobile-menu-item group/mobile-item">
					<NuxtLink
						to="/about"
						@click="toggleMobileMenu"
						class="relative px-8 py-4 rounded-2xl transition-all duration-300 hover:bg-white/10 hover:backdrop-blur-sm block"
					>
						<span class="relative z-10">About</span>
						<div
							class="absolute inset-0 bg-gradient-to-r from-[#3D5A80]/20 to-[#98C1D9]/20 rounded-2xl opacity-0 group-hover/mobile-item:opacity-100 transition-all duration-300 blur-sm"
						></div>
					</NuxtLink>
				</li>
				<li class="mobile-menu-item group/mobile-item">
					<NuxtLink
						to="/pricing"
						@click="toggleMobileMenu"
						class="relative px-8 py-4 rounded-2xl transition-all duration-300 hover:bg-white/10 hover:backdrop-blur-sm block"
					>
						<span class="relative z-10">Pricing</span>
						<div
							class="absolute inset-0 bg-gradient-to-r from-[#3D5A80]/20 to-[#98C1D9]/20 rounded-2xl opacity-0 group-hover/mobile-item:opacity-100 transition-all duration-300 blur-sm"
						></div>
					</NuxtLink>
				</li>
				<li class="mobile-menu-item group/mobile-item">
					<NuxtLink
						to="/contact"
						@click="toggleMobileMenu"
						class="relative px-8 py-4 rounded-2xl transition-all duration-300 hover:bg-white/10 hover:backdrop-blur-sm block"
					>
						<span class="relative z-10">Contact</span>
						<div
							class="absolute inset-0 bg-gradient-to-r from-[#3D5A80]/20 to-[#98C1D9]/20 rounded-2xl opacity-0 group-hover/mobile-item:opacity-100 transition-all duration-300 blur-sm"
						></div>
					</NuxtLink>
				</li>
				<li class="mt-8">
					<NuxtLink
						to="/auth/login"
						class="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#F36A3E] to-[#98C1D9] px-12 py-4 rounded-2xl text-white font-bold transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-[#F36A3E]/30 relative group/mobile-login overflow-hidden"
						@click="toggleMobileMenu"
					>
						<div
							class="absolute inset-0 bg-gradient-to-r from-[#3D5A80] to-[#98C1D9] opacity-0 group-hover/mobile-login:opacity-100 transition-opacity duration-300"
						></div>
						<span class="relative z-10">Login</span>
						<Icon
							name="heroicons:arrow-right-20-solid"
							class="w-5 h-5 relative z-10 group-hover/mobile-login:translate-x-1 transition-transform duration-300"
						/>
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
	if (window.innerWidth >= 1024 && isMobileMenuOpen.value) {
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
@keyframes gradient-x {
	0%,
	100% {
		transform: translateX(0%);
	}
	50% {
		transform: translateX(-100%);
	}
}

.animate-gradient-x {
	animation: gradient-x 15s ease infinite;
	background-size: 200% 200%;
}

.navbar {
	filter: drop-shadow(0px 20px 25px rgba(61, 90, 128, 0.15));
	height: 70px;
	backdrop-filter: blur(20px);

	@media screen and (max-width: 1024px) {
		height: 60px;
	}

	@media screen and (max-width: 640px) {
		height: 55px;
	}
}

.nav-item {
	position: relative;
	color: black;
	&:hover {
		transform: translateY(-2px);
	}
}

.brand-center {
	transform: scale(1);
	transition: transform 0.3s ease;

	&:hover {
		transform: scale(1.1);
	}
}

.dropdown {
	transform: translateY(-100%);
	right: 0;
	top: 4.5rem;
	opacity: 0;
	transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
	pointer-events: none;
	backdrop-filter: blur(20px);

	@media screen and (max-width: 1024px) {
		top: 3.5rem !important;
	}

	&.active {
		transform: translateY(0);
		opacity: 1;
		pointer-events: all;
	}
}

.mobile-menu {
	opacity: 0;
	backdrop-filter: blur(30px);

	&:not(.translate-x-full) {
		opacity: 1;
	}
}

.mobile-menu-item {
	animation: slideInFromRight 0.6s ease-out forwards;
	opacity: 0;
	transform: translateX(50px);

	@for $i from 1 through 5 {
		&:nth-child(#{$i}) {
			animation-delay: #{$i * 0.1}s;
		}
	}
}

@keyframes slideInFromRight {
	to {
		opacity: 1;
		transform: translateX(0);
	}
}

// Enhance glassmorphism effect
.bg-white\/10 {
	backdrop-filter: blur(10px);
}

.bg-white\/15 {
	backdrop-filter: blur(15px);
}

.bg-white\/20 {
	backdrop-filter: blur(20px);
}
</style>
