export default defineNuxtRouteMiddleware(async (from, to) =>{
    if(await userIsAuthenticated()) return
    return await navigateTo(`/auth/login?redirect=${from.path}`)
})