export default defineNuxtRouteMiddleware((to, from) => {
	const authStore = useAuthStore();
	if (!authStore.isAuthenticated) {
		const router = useRouter();
		router.push(`/auth/login?redirect=${from.path}`);
	}
});
