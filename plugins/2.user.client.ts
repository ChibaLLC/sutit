import {Status, type UserState} from "~/types"
import {getAuthCookie} from "~/utils/auth"

export default defineNuxtPlugin(async (nuxtApp) => {
    const token = getAuthCookie()
    if (!token) return

    const user = useUser()
    if (
        user.value &&
        user.value?.token === token
    ) return

    await unFetch(`/api/v1/users/me`, {
        headers: {
            Authorization: `Bearer ${token}`
        },
        onResponse({response}): Promise<void> | void {
            const res = response._data
            if (res.statusCode === Status.success) return user.value = res.body
            setAuthCookie("", 0)
            useUser().value = {} as UserState
        },
        onResponseError({response}): Promise<void> | void {
            const res = response._data
            if (res.statusCode === Status.success) return user.value = res.body
            setAuthCookie("", 0)
            useUser().value = {} as UserState
        }
    }).catch(log.error)
})