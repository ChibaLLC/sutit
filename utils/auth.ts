import type {APIResponse, UserState} from "~/types";
import {responses} from "~/db/drizzle/schema";

/**
 * This function appends the auth token to the headers of the fetch request
 * @param url destination url
 * @param options RequestInit object
 * @returns the response object
 * @example
 * const response = await useAuthFetch("https://example.com/api", {
 *    method: "GET"
 * })
 */
export async function useAuthFetch(url: string | URL | Request, options?: RequestInit): Promise<APIResponse> {
    const {headers, ...rest} = options || {}
    return fetch(url, {
        ...rest,
        headers: {
            ...headers,
            'Authorization': `Bearer ${getAuthToken()}`,
            'Content-Type': 'application/json'
        } as HeadersInit
    } satisfies RequestInit)
        .then(async response => {
            const data = await response.json()
                .catch(() => response.text()
                    .catch(() => response.blob()
                        .catch(() => response.arrayBuffer()
                            .catch(() => response))))
            if (typeof data === "string") return {statusCode: response.status, body: data} as APIResponse
            return data as APIResponse
        }).catch(err => {
            return {statusCode: err.statusCode ?? 500, body: err.message} as APIResponse
        })
}

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


export function getAuthCookie(): string | null {
    const cookie = useCookie<string>("auth").value?.trim()
    if (
        !cookie ||
        cookie === "undefined" ||
        cookie === "null" ||
        cookie === "false" ||
        cookie === ""
    ) return null

    return useCookie<string>("auth").value
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
    return useAuthFetch("/api/v1/auth/logout")
        .then(async (res) => {
            if (res.statusCode !== 200) {
                console.error(res)
                return alert("Failed to logout")
            }
            const state = useUser()
            state.value = {} as UserState
            setAuthCookie("", 0)
            await navigateTo("/login")
        }).catch(console.error)
}