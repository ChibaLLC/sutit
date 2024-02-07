import type { APIResponse } from "~/types";

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
export async function useAuthFetch(url: string, options?: RequestInit): Promise<APIResponse> {
    const authCookie = useCookie<string>("auth")
    const { headers, ...rest } = options || {}
    return await fetch(url, {
        ...rest,
        headers: {
            ...headers,
            'Authorization': `Bearer ${authCookie.value}`,
            'Content-Type': 'application/json'
        } as HeadersInit
    } satisfies RequestInit)
        .then(async response => {
            const data = await response.json()
                .catch(() => response.text()
                    .catch(() => response.blob()
                        .catch(() => response.arrayBuffer()
                            .catch(() => response))))
            if (typeof data === "string") return { statusCode: response.status, body: data } as APIResponse
            return data as APIResponse
        }).catch(err => {
            return { statusCode: err.statusCode ?? 500, body: err.message } as APIResponse
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
    if(
        !cookie ||
        cookie === "undefined" ||
        cookie === "null" ||
        cookie === "false" ||
        cookie === ""
    ) return null

    return useCookie<string>("auth").value
}