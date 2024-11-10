export default defineNuxtPlugin(async () => {
    const token = getAuthCookie()
    if (!token) return

    const user = await useUser()
    if (
        user.value &&
        user.value?.token === token
    ) return

    const { data } = await useFetch<APIResponse<any>>(`/api/v1/users/me`, {
        headers: {
            Authorization: `Bearer ${token}`
        },
        async onResponseError({ response }) {
            const res = response._data
            if (res.statusCode === Status.success) return user.value = res.body
            setAuthCookie(undefined)
            (await useUser()).value = {}
        }
    }).catch((e) => {
        log.error(e)
        return { data: null }
    })

    const res = data?.value
    if (res?.statusCode === Status.success) {
        user.value = res.body
    } else {
        setAuthCookie(undefined)
        (await useUser()).value = {} as UserState
    }
})