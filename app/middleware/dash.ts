export default defineNuxtRouteMiddleware(async (from, to) => {
    if (await userIsAuthenticated() && from.path === "/") {
        return await navigateTo("/dashboard")
    }
})