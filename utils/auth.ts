import { type APIResponse, type UserState } from "~/types";

/**
 * This function sets the auth cookie
 *
 * @param token the string value of the token
 * @param expiry the expiry time in seconds
 * @example
 * setAuthCookie("token", 3600)
 */
export function setAuthCookie(token: string, expiry?: number) {
    const expires = expiry ? new Date(Date.now() + expiry * 1000) : undefined
    const cookie = useCookie<string>("auth", {
        expires: expires
    })
    cookie.value = token
}


/**
 * Gets the user authentication cookie, labeled as `auth`
 *
 * @returns cookie
 */
export function getAuthCookie(): string | null {
    const cookie = useCookie<string>("auth").value
    if (
        !cookie ||
        cookie === "undefined" ||
        cookie === "null" ||
        cookie === "false" ||
        cookie === ""
    ) return null

    return cookie
}

export function getAuthToken() {
    const state = useUser().value?.token?.trim()
    const cookie = getAuthCookie()

    if (
        !state ||
        state === "undefined" ||
        state === "null" ||
        state === "false" ||
        state === ""
    ) return cookie
    return state
}

export function userIsAuthenticated() {
    return !!getAuthToken()
}

export async function logout() {
    await unFetch("/api/v1/auth/logout", {
        async onResponse({ response }) {
            const res = response._data as APIResponse<any>
            if (res.statusCode !== 200) {
                console.error(res)
                return alert("Failed to logout")
            }
            const state = useUser()
            state.value = {} as UserState
            setAuthCookie("", 0)
            await navigateTo("/auth/login")
        }
    }).catch(console.error)
}