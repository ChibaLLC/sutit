export default defineNuxtRouteMiddleware(async (from, to) =>{
    if(userIsAuthenticated()) return
    return await navigateTo(`/auth/login?redirect=${from.path}`)
})