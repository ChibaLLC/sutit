export default defineNuxtRouteMiddleware((from, to) =>{
    if(userIsAuthenticated()) return
    return navigateTo(`/auth/login?redirect=${from.path}`)
})