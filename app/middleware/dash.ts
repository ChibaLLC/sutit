export default defineNuxtRouteMiddleware((from, to) => {
    if (userIsAuthenticated() && from.path === "/") {
        return navigateTo("/dashboard")
    }
})