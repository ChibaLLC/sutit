/**
 * This function sets the auth cookie
 *
 * @param token the string value of the token
 * @param expiry the expiry time in seconds
 * @example
 * setAuthCookie("token", 3600)
 */
export function setAuthCookie(token: string | undefined | null, expiry?: number) {
    if(Boolish(token)){
        const expires = expiry ? new Date(Date.now() + expiry * 1000) : undefined
        const cookie = useCookie<string>("auth", {
            expires: expires
        })
        cookie.value = token!
    } else {
        useCookie('auth').value = undefined
    }
}


/**
 * Gets the user authentication cookie, labeled as `auth`
 *
 * @returns cookie
 */
export function getAuthCookie(): string | null {
    const cookie = useCookie<string>("auth").value
    if (!Boolish(cookie)) return null
    return cookie
}

export function getAuthToken() {
    const state = useUser().value?.token?.trim()
    const cookie = getAuthCookie()

    if (Boolish(state)) return cookie
    return state
}

export function userIsAuthenticated() {
    return !!getAuthToken()
}

export async function logout() {
    await $fetch("/api/v1/auth/logout", {
        async onResponse({response}) {
            const res = response._data as APIResponse<any>
            if (res.statusCode !== 200) {
                console.error(res)
                return alert("Failed to logout")
            }
            const state = await useUser()
            state.value = {} as UserState
            setAuthCookie("", 0)
            await navigateTo("/auth/login")
        }
    }).catch(console.error)
}