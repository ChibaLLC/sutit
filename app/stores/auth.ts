import type { User } from "better-auth";
import { toast } from "vue-sonner";
import { authClient } from "~/lib/auth-client";

export const useAuthStore = defineStore(
	"auth",
	() => {
		const user = ref<User | null>(null);
		const token = ref<string | null>(null);
		const loading = ref({
			signIn: false,
			signUp: false,
		});
		const isAuthenticated = computed(() => !!(user.value && token.value));
		const router = useRouter();

		const signInWithEmail = async (form: {
			email: string;
			password: string;
		}) => {
			// loading.value.signIn = true;
			try {
				const { data, error } = await authClient.signIn.email(form);
				if (error && error.message) {
					toast.error(error.message);
					return;
				}
				if (data) {
					user.value = data.user;
					token.value = data.token;
					const route = useRoute();

					let redirect = route.query.redirect;
					await router.push(redirect ? `${redirect}` : "/dashboard");

					toast.success("Login successfully");
				}
			} catch (error) {
				console.error("Email sign-in failed:", error);
			} finally {
				// loading.value.signIn = false;
			}
		};

		const signUpWithEmail = async (form: {
			name: string;
			email: string;
			password: string;
		}) => {
			loading.value.signUp = true;
			try {
				const { error, data } = await authClient.signUp.email(form, {
					onSuccess(context) {
						toast.success("User created successfully");
					},
					onError(context) {
						toast.error(context.error.message);
					},
				});
				if (data) {
					user.value = data.user;
					token.value = data.token;
					await navigateTo("/dashboard");
				}
			} catch (error) {
				console.log("Email sign-in failed:", error);
			} finally {
				loading.value.signUp = false;
			}
		};
		const logout = async () => {
			try {
				await authClient
					.signOut({
						fetchOptions: {
							onSuccess(context) {
								navigateTo("/auth/login");
							},
						},
					})
					.finally(() => {
						user.value = null;
						token.value = null;
					});
			} catch (e) {}
		};
		const setAuthUser = (usr: User, tk: string) => {
			user.value = usr;
			token.value = tk;
		};

		const signinWithGoogle = async () => {
			try {
				const { data } = await authClient.signIn.social({
					provider: "google",
				});
			} catch (e: any) {}
		};

		return {
			user,
			token,
			loading,
			isAuthenticated,

			signUpWithEmail,
			signInWithEmail,
			logout,
			setAuthUser,
			signinWithGoogle,
		};
	},
	{
		persist: true,
	},
);
