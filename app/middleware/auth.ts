export default defineNuxtRouteMiddleware(async (from, to) => {
  const user = await getCurrentUser();
  if (user) return;
  return navigateTo(`/auth/login?redirect=${from.path}`);
});
