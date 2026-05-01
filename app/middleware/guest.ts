export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore();
  if (authStore.isAuthenticated) {
    navigateTo("/dashboard");
  }
});
