export default defineNuxtRouteMiddleware(async (from) => {
  const { user } = await userStore();
  if (user && from.path === "/") {
    return navigateTo("/dashboard");
  }
});
