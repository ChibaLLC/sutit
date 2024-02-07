import { getAuthCookie } from "~/utils/auth"

export default defineNuxtPlugin(async (nuxtApp) => {
    const user = useUser()
    if(user.value) return

    const token = getAuthCookie()
    if(!token) return

    const response = await useAuthFetch("/api/v1/users/token/" + token).then(async response => {
        if(response.statusCode === 200) return response.body
        return null
    }).catch(() => null)
    if(!response) return console.error("Failed to fetch user")

    user.value = response
})