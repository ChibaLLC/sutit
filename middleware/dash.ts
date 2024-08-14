export default defineNuxtRouteMiddleware(async (from, to) => {
    if (userIsAuthenticated() && from.path === "/") {
        return await navigateTo("/dashboard")
    }
})