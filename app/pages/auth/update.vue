<script setup lang="ts">
const url = useRoute();
const redirect = useRedirect();
const email = url.query?.email;
const token = url.query?.token;
const loading = ref(false);
const details = reactive({
	password: "",
});
const password = ref<HTMLInputElement | null>(null);
const errors = ref(new Set<string>());

function clearErrors() {
	if (errors.value.size === 0) return;
	errors.value = new Set();
}

async function submit() {
	if (loading.value) return;
	loading.value = true;

	const response = await $fetch(`/api/auth/reset?email=${email}&token=${token}`, {
		method: "POST",
		body: { password: details.password },
		onResponseError({ response }) {
			loading.value = false;
			errors.value.add(response._data.body || "An unknown error occurred");
		},
		onRequestError({ error }) {
			loading.value = false;
			errors.value.add(error.message || "An unknown error occurred");
		},
	});

	loading.value = false;

	if (response) {
		alert("Password reset successfully");
		setAuthCookie(response);
		const {user} = await useUser();
		user.value.token = response;
		await navigateTo("/");

		if (redirect) {
			await navigateTo(redirect);
		} else {
			await navigateTo("/");
		}
	}
}

watch(password, () => {
	if (password.value === null) return;
	if (password.value?.value.length < 8) {
		errors.value.add("Password must be at least 8 characters long");
	}
	if (password.value?.value.length > 100) {
		errors.value.add("Password must be less than 100 characters long");
	}
	if (password.value?.value.match(/(?=.*[a-z])(?=.*[A-Z])/) === null) {
		errors.value.add("Password must contain at least one uppercase and one lowercase letter");
	}
	if (password.value?.value.match(/(?=.*\d)/) === null) {
		errors.value.add("Password must contain at least one number");
	}
	if (password.value.value !== details.password) {
		errors.value.add("Passwords do not match");
	}
});
</script>
<template>
	<section class="absolute w-full" style="margin-top: 100px">
		<Title>New Password</Title>
		<div class="container mx-auto px-4 h-full">
			<div class="flex content-center items-center justify-center h-full">
				<div class="w-full lg:w-4/12 px-4">
					<div
						class="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-gray-300 border-0"
					>
						<div class="rounded-t mb-0 px-6 py-6">
							<div class="text-center mb-3">
								<h6 class="text-gray-600 text-sm font-bold">Enter your new password</h6>
							</div>
							<form>
								<div class="text-red-500" v-if="errors.size > 0">
									<ul>
										<li v-for="error in errors" :key="error">
											<small>{{ error }}</small>
										</li>
									</ul>
								</div>
								<div class="relative w-full mb-3">
									<label
										class="block uppercase text-gray-700 text-xs font-bold mb-2"
										for="grid-password"
										>Password</label
									>
									<input
										type="password"
										class="border-0 px-3 py-3 placeholder-gray-400 text-gray-700 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full"
										ref="password"
										v-on:focus="clearErrors"
										autocomplete="new-password"
										style="transition: all 0.15s ease 0s"
									/>
								</div>
								<div class="relative w-full mb-3">
									<label
										class="block uppercase text-gray-700 text-xs font-bold mb-2"
										for="grid-password"
										>Password Again</label
									>
									<input
										type="password"
										class="border-0 px-3 py-3 placeholder-gray-400 text-gray-700 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full"
										v-model="details.password"
										v-on:focus="clearErrors"
										autocomplete="new-password"
										style="transition: all 0.15s ease 0s"
									/>
								</div>
								<div class="text-center mt-6">
									<button
										class="bg-gray-900 text-white active:bg-gray-700 text-sm font-bold uppercase px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 w-full"
										type="button"
										@click="submit"
										style="transition: all 0.15s ease 0s"
									>
										<span v-if="!loading">Reset</span>
										<span
											:class="{ loading: loading }"
											class="w-full grid place-items-center"
											v-else
										>
											<svg
												xmlns="http://www.w3.org/2000/svg"
												viewBox="0 0 24 24"
												fill="currentColor"
												class="w-5 h-5"
											>
												<path
													d="M18.364 5.63604L16.9497 7.05025C15.683 5.7835 13.933 5 12 5C8.13401 5 5 8.13401 5 12C5 15.866 8.13401 19 12 19C15.866 19 19 15.866 19 12H21C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C14.4853 3 16.7353 4.00736 18.364 5.63604Z"
												></path>
											</svg>
										</span>
									</button>
								</div>
							</form>
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>
</template>
<style scoped>
.loading {
	@apply animate-spin;
}
</style>
