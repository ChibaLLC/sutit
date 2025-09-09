import { createAuthClient } from "better-auth/vue";
export const authClient = createAuthClient({});
export const authHeaders = async () => {
	let authStore = useAuthStore();
	return {
		Authorization: `Bearer ${authStore.token}`,
	};
};
