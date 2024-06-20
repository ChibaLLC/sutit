import { Status, type APIResponse, type UserState } from "~/types"
import { getAuthCookie } from "~/utils/auth"

export default defineNuxtPlugin(async () => {
    const token = getAuthCookie()
    if (!token) return

    const user = useUser()
    if (
        user.value &&
        user.value?.token === token
    ) return

    console.log("Fetching user data")
    console.log("Current user: ", user.value)

    const { data } = await useFetch<APIResponse>(`/api/v1/users/me`, {
        headers: {
            Authorization: `Bearer ${token}`
        },
        onResponseError({ response }): Promise<void> | void {
            const res = response._data
            if (res.statusCode === Status.success) return user.value = res.body
            setAuthCookie("", 0)
            useUser().value = {} as UserState
        }
    }).catch((e) => {
        log.error
        return { data: null }
    })

    const res = data?.value
    if (res?.statusCode === Status.success) {
        user.value = res.body
    } else {
        setAuthCookie("", 0)
        useUser().value = {} as UserState
    }
})