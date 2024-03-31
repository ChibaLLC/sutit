import {type APIResponse, type UserState} from "~/types";
import type {NitroFetchOptions, NitroFetchRequest} from "nitropack";
import {ulid} from "ulid";

/**
 * This is a useAsyncData wrapper, that uses useAuthStream to retrieve data.
 *
 * @param url
 * @param key
 *
 * @see useAuthStream
 */
export async function useData(url: string | Ref<string>, key?: string) {
    if (!key) {
        return useAsyncData(() => $fetch((typeof url === "string") ? url : url.value), {
            watch: (typeof url === "string" || url instanceof URL) ? undefined : [url]
        })
    } else {
        return useAsyncData(key, () => $fetch((typeof url === "string") ? url : url.value), {
            watch: (typeof url === "string" || url instanceof URL) ? undefined : [url]
        })
    }
}

class Emitter {
    private readonly _events: Record<"data" | "text" | "end", Array<(data: APIResponse) => void>>;

    constructor() {
        this._events = {
            data: [],
            text: [],
            end: []
        }
    }

    on(event: "data" | "text" | "end", callback: (data: APIResponse) => void) {
        if (!this._events) return
        this._events[event].push(callback)
    }

    emit(event: "data" | "text" | "end", data: any) {
        this._events[event].forEach(callback => callback(data))
    }
}

/**
 * Function that returns an instance of the Emitter class that can be used to add event listeners to the stream
 *
 * @param url the destination url
 * @param options RequestInit object
 *
 * @returns a class instance that can be used to add event listeners to the stream
 *
 * @example
 * const stream = await useAuthStream("https://example.com/api")
 * stream.on("data", (data) => {
 *      console.log(data)
 *      // do something with the data
 *      // data will be normalised to an APIResponse object
 * })
 *
 * stream.on("text", (text) => {
 *      console.log(text)
 *      // do something with the text
 *      // text will be a string, which can not be normalised to an APIResponse object
 * })
 * stream.on("end", () => {
 *      console.log("Stream ended")
 *      // do something when the stream ends
 * })
 */
export async function useStream(url: NitroFetchRequest, options?: NitroFetchOptions<NitroFetchRequest>) {
    if (!process.client) return null
    const response = await $fetch(url, {
        ...options,
        headers: {
            ...options?.headers,
            "X-Request-ID": ulid()
        }
    }).catch(console.error)

    if (!response || !response?.getReader) return null

    const e = new Emitter()
    await readStream(response.getReader(), (data: APIResponse) => {
        e.emit("data", data)
    }, (text: string) => {
        e.emit("text", text)
    }, () => {
        e.emit("end", null)
    })

    return e
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


/**
 * Gets the user authentication cookie, labeled as `auth`
 *
 * @returns cookie
 */
export function getAuthCookie(): string | null {
    const cookie = useCookie<string>("auth").value?.trim()
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
        async onResponse({response}) {
            const res = response._data as APIResponse
            if (res.statusCode !== 200) {
                console.error(res)
                return alert("Failed to logout")
            }
            const state = useUser()
            state.value = {} as UserState
            setAuthCookie("", 0)
            await navigateTo("/login")
        }
    }).catch(console.error)
}