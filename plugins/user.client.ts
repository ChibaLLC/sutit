import { getAuthCookie } from "~/utils/auth"

export default defineNuxtPlugin(async (nuxtApp) => {
    const token = getAuthCookie()
    if(!token) return

    const user = useUser()
    if(
        user.value &&
        user.value?.token === token
    ) return

    const response = await useAuthFetch(`/api/v1/users/me`)
        .then(async response => {
        if(response.statusCode === 200) return response.body
        console.error(response)
        return null
    }).catch(() => null)
    if(!response) return

    user.value = response
})