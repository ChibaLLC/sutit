<script setup lang="ts">
const url = useRoute();
const redirect = useRedirect();
const loading = ref(false);
const details = reactive({
	email: "",
	password1: "",
	password2: "",
});

const mismatch = computed(() => {
	return details.email && details.password1 && details.password1 !== details.password2;
});

async function submit() {
	loading.value = true;

	const token = await $fetch("/api/auth/signup", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			email: details.email,
			password: details.password1,
		}),
		onResponseError(response) {
			window.alertError(unWrapFetchError(response), { timeout: "never" });
		},
	});

	if (token) {
		setAuthCookie(token);
		const { user } = await useUser();
		user.value.token = token;
		const _redirect = collapseString(redirect);
		if (_redirect) {
			await navigateTo(_redirect);
		} else {
			await navigateTo("/");
		}
	}
}

const config = useRuntimeConfig();

const loadingGithub = ref(false);
async function loginWithGithub() {
	loadingGithub.value = true;
	await navigateTo(`https://github.com/login/oauth/authorize?client_id=${config.public.githubClientId}`, {
		external: true,
	});
}

const loadingGoogle = ref(true);

const googleButton = ref<HTMLDivElement | null>(null);
function clickGoogleBtn() {
	loadingGoogle.value = true;
	if (!googleButton.value) return console.warn("Google Button Not Found");
	(googleButton.value.querySelector("[role='button']") as HTMLDivElement).click();
}

async function onSignIn(googleCredential: GoogleCredential) {
	const token = await $fetch("/api/auth/callbacks/google", {
		method: "POST",
		body: googleCredential,
		onResponseError(response) {
			window.alertError(unWrapFetchError(response));
		},
	});
	loadingGoogle.value = false;
	if (token) {
		const { user } = await useUser();
		user.value.token = token;
		navigateTo("/");
	}
}

onMounted(() => {
	const script = document.createElement("script");
	script.src = "https://accounts.google.com/gsi/client";
	script.async = true;
	script.defer = true;

	document.body.appendChild(script);
	if (!(window as any)?.onSignIn) {
		Object.defineProperty(window, "onSignIn", { value: onSignIn });
	}
	loadingGoogle.value = false;
});
</script>

<template>
	<div>
		<Title>Sign Up</Title>
	<div class="wrapper"></div>
	<div
		class="border border-sky bg-light/20 rounded-2xl max-sm:rounded w-[600px] max-w-[90vw] m-auto mt-20 p-10 shadow-md shadow-sky max-sm:mt-10"
	>
		<form @submit.prevent="submit" class="flex flex-col gap-8 max-sm:gap-4">
			<div>
				<h2 class="text-lg uppercase font-serif">Sutit.</h2>
				<h1 class="text-4xl font-sans font-bold">Sign Up</h1>
			</div>
			<div class="flex flex-col gap-1">
				<label for="email" class="font-mono text-lg">Email</label>
				<input
					type="email"
					id="email"
					placeholder="username@mail.com"
					v-model="details.email"
					class="rounded-md px-3 py-2 focus:ring-1 outline-none focus:ring-sky focus:ring-opacity-50 border border-[#bdc6d7]"
					autocomplete="email"
				/>
			</div>
			<div class="flex flex-col gap-1">
				<label for="password">Password</label>
				<input
					type="password"
					id="password1"
					autocomplete="new-password"
					v-model="details.password1"
					class="rounded-md px-3 py-2 focus:ring-1 outline-none focus:ring-sky focus:ring-opacity-50 border border-[#bdc6d7]"
				/>
			</div>
			<div class="flex flex-col gap-1 -mt-4">
				<label for="password">Confirm Password</label>
				<input
					type="password"
					id="password2"
					autocomplete="new-password"
					v-model="details.password2"
					class="rounded-md px-3 py-2 focus:ring-1 outline-none focus:ring-sky focus:ring-opacity-50 border border-[#bdc6d7]"
				/>
				<small v-if="mismatch" class="text-xs font-mulish text-red-500">Passwords do not match</small>
			</div>
			<div>
				<button
					type="submit"
					:disabled="mismatch || loading"
					class="bg-peach w-full text-white rounded-md px-3 py-2 disabled:cursor-not-allowed hover:bg-peach/90 transition-colors duration-300 ease-in-out"
				>
					Sign Up
				</button>
			</div>
			<p class="text-center text-sm font-mono capitalize">or continue with</p>
			<div class="flex justify-center gap-x-6 items-center w-full -mt-2">
				<button
					type="button"
					:disabled="loadingGoogle"
					@click="clickGoogleBtn"
					class="bg-white rounded-md px-4 py-2 border border-[#bdc6d7] hover:bg-[#e8f0fe] transition-colors"
				>
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
						<g clip-path="url(#clip0_22_4029)">
							<path
								d="M23.7662 9.64963H22.7996V9.59983H11.9998V14.3998H18.7815C17.7921 17.1939 15.1335 19.1997 11.9998 19.1997C8.02366 19.1997 4.79992 15.9759 4.79992 11.9998C4.79992 8.02366 8.02366 4.79992 11.9998 4.79992C13.8352 4.79992 15.5049 5.4923 16.7763 6.62329L20.1705 3.22914C18.0273 1.23178 15.1605 0 11.9998 0C5.37291 0 0 5.37291 0 11.9998C0 18.6267 5.37291 23.9996 11.9998 23.9996C18.6267 23.9996 23.9996 18.6267 23.9996 11.9998C23.9996 11.1952 23.9168 10.4098 23.7662 9.64963Z"
								fill="#FFC107"
							/>
							<path
								d="M1.38281 6.41449L5.32534 9.30584C6.39213 6.66468 8.97568 4.79992 11.999 4.79992C13.8344 4.79992 15.5042 5.4923 16.7755 6.62328L20.1697 3.22914C18.0265 1.23178 15.1598 0 11.999 0C7.38991 0 3.39278 2.60215 1.38281 6.41449Z"
								fill="#FF3D00"
							/>
							<path
								d="M12 24C15.0995 24 17.9159 22.8138 20.0452 20.8848L16.3313 17.7421C15.086 18.6891 13.5644 19.2013 12 19.2001C8.87881 19.2001 6.22865 17.2099 5.23027 14.4326L1.31714 17.4475C3.3031 21.3336 7.33623 24 12 24Z"
								fill="#4CAF50"
							/>
							<path
								d="M23.7662 9.64964H22.7996V9.59984H11.9998V14.3998H18.7814C18.3082 15.7296 17.4557 16.8916 16.3293 17.7423L16.3311 17.7411L20.045 20.8838C19.7822 21.1226 23.9996 17.9997 23.9996 11.9998C23.9996 11.1952 23.9168 10.4098 23.7662 9.64964Z"
								fill="#1976D2"
							/>
						</g>
						<defs>
							<clipPath id="clip0_22_4029">
								<rect width="24" height="24" rx="12" fill="white" />
							</clipPath>
						</defs>
					</svg>
					<ClientOnly>
						<div class="g_id_signin hidden" data-type="standard" ref="googleButton"></div>
						<div
							id="g_id_onload"
							:data-client_id="config.public.googleClientId"
							data-ux_mode="popup"
							data-callback="onSignIn"
						></div>
					</ClientOnly>
				</button>
				<button
					type="button"
					@click="loginWithGithub"
					:disabled="loadingGithub"
					class="bg-white rounded-md px-4 py-2 border border-[#bdc6d7] hover:bg-[#e8f0fe] transition-colors"
				>
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
						<g clip-path="url(#clip0_22_4037)">
							<path
								fill-rule="evenodd"
								clip-rule="evenodd"
								d="M12 0C5.37 0 0 5.37 0 12C0 17.31 3.435 21.795 8.205 23.385C8.805 23.49 9.03 23.13 9.03 22.815C9.03 22.53 9.015 21.585 9.015 20.58C6 21.135 5.22 19.845 4.98 19.17C4.845 18.825 4.26 17.76 3.75 17.475C3.33 17.25 2.73 16.695 3.735 16.68C4.68 16.665 5.355 17.55 5.58 17.91C6.66 19.725 8.385 19.215 9.075 18.9C9.18 18.12 9.495 17.595 9.84 17.295C7.17 16.995 4.38 15.96 4.38 11.37C4.38 10.065 4.845 8.985 5.61 8.145C5.49 7.845 5.07 6.615 5.73 4.965C5.73 4.965 6.735 4.65 9.03 6.195C9.99 5.925 11.01 5.79 12.03 5.79C13.05 5.79 14.07 5.925 15.03 6.195C17.325 4.635 18.33 4.965 18.33 4.965C18.99 6.615 18.57 7.845 18.45 8.145C19.215 8.985 19.68 10.05 19.68 11.37C19.68 15.975 16.875 16.995 14.205 17.295C14.64 17.67 15.015 18.39 15.015 19.515C15.015 21.12 15 22.41 15 22.815C15 23.13 15.225 23.505 15.825 23.385C18.2072 22.5807 20.2772 21.0497 21.7437 19.0074C23.2101 16.965 23.9993 14.5143 24 12C24 5.37 18.63 0 12 0Z"
								fill="black"
							/>
						</g>
						<defs>
							<clipPath id="clip0_22_4037">
								<rect width="24" height="24" rx="12" fill="white" />
							</clipPath>
						</defs>
					</svg>
				</button>
			</div>
			<p class="text-center text-sm font-mono mt-1">
				Already have an account?
				<NuxtLink to="/auth/login" class="text-dark font-bold hover:underline">Login</NuxtLink>
			</p>
		</form>
	</div>
	</div>
</template>

<style scoped>
.loading {
	@apply animate-spin;
}

button[disabled] {
	@apply cursor-not-allowed;
	@apply pointer-events-none;
	@apply opacity-50;
}
</style>
