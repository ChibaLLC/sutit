import type { User } from "better-auth";
import { toast } from "vue-sonner";
import { authClient } from "~/lib/auth-client";

export const useAuthStore = defineStore("auth", () => {
	const user = ref<User | null>(null);
	const token = ref<string | null>(null);
	const loading = ref({
		signIn: false,
		signUp: false,
	});
	const signInWithEmail = async (form: { email: string; password: string }) => {
		loading.value.signIn = true;
		try {
			const { data, error } = await authClient.signIn.email(form);
			if (error && error.message) {
				toast.error(error.message);
				return;
			}
			if (data) {
				user.value = data.user;
				token.value = data.token;
				toast.success("Login successfully");
			}
		} catch (error) {
			console.error("Email sign-in failed:", error);
		} finally {
			loading.value.signIn = false;
		}
	};

	const signUpWithEmail = async (form: {
		name: string;
		email: string;
		password: string;
	}) => {
		loading.value.signUp = true;
		try {
			const { error, data } = await authClient.signUp.email(form, {});
			if (error && error?.message) {
				toast.error(error.message);
			}
			if (data) {
				toast.success("User created successfully");
			}
		} catch (error) {
			console.log("Email sign-in failed:", error);
		} finally {
			loading.value.signUp = false;
		}
	};

	return {
		user,
		token,
		loading,

		signUpWithEmail,
		signInWithEmail,
	};
});
