import {Status, type APIResponse, type UserState} from "~/types";
import type {NitroFetchRequest} from "nitropack";
import {ulid} from "ulid";

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
    const response = await fetch(url, {
        ...rest,
        headers: {
            ...headers,
            'Authorization': `Bearer ${getAuthToken()}`,
            'Content-Type': 'application/json'
        } as HeadersInit
    } satisfies RequestInit).catch(console.error)

    if (!response) return {
        statusCode: Status.internalServerError,
        body: "Failed to fetch"
    }

    const data = await response.json()
        .catch(async () => await response.text()
            .catch(async () => await response.blob()
                .catch(async () => await response.arrayBuffer()
                    .catch(() => response))))
    if (typeof data === "string") return {statusCode: response.status, body: data} as APIResponse
    if (isAPIResponse(data)) return data as APIResponse
    return {statusCode: response.status, body: data} as APIResponse
}

/**
 * This is a useAsyncData wrapper, that uses useAuthStream to retrieve data.
 *
 * @param url
 * @param key
 *
 * @see useAuthStream
 */
export async function useData(url: string | URL | Ref<string | URL>, key?: string) {
    if (!key) {
        return useAsyncData(() => useAuthFetch((typeof url === "string" || url instanceof URL) ? url : url.value), {
            watch: (typeof url === "string" || url instanceof URL) ? undefined : [url]
        })
    } else {
        return useAsyncData(key, () => useAuthFetch((typeof url === "string" || url instanceof URL) ? url : url.value), {
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
export async function useAuthStream(url: NitroFetchRequest, options?: RequestInit) {
    if(!process.client) return null
    let response: any;
    const {headers, ...withoutHeaders} = options || {} as any
    let {body, ...withoutHeadersAndBody} = withoutHeaders

    body = body ? JSON.parse(body) : undefined
    if (body) {
        const {identity, ...restBody} = body
        const {method, ...restHeaders} = headers || {}
        response = await $fetch(url, {
            ...withoutHeadersAndBody,
            headers: {
                "Authorization": `Bearer ${getAuthToken()}`,
                "Content-Type": "application/json",
                method: method || "POST",
                ...restHeaders
            },
            body: {
                ...restBody,
                identity: identity || getAuthToken() || ulid()
            },
            responseType: "stream"
        });
    } else {
        response = await $fetch(url, {
            ...withoutHeadersAndBody,
            headers: {
                "Authorization": `Bearer ${getAuthToken()}`,
                "Content-Type": "application/json",
                ...headers
            },
            responseType: "stream"
        })
    }

    if (!response || !response?.getReader) return null

    const e = new Emitter()
    readTextStream(response.getReader(), (data: APIResponse) => {
        e.emit("data", data)
    }, (text: string) => {
        e.emit("text", text)
    }, () => {
        e.emit("end", null)
    }).then()

    return e
}

/**
 * This function reads data from a stream and calls the callback function returned from the useAuthStream function
 * to get and store the data, this data is then resolved when the stream ends as an array of all the data from the stream
 *
 * @param authStream the function returned from the useAuthStream function
 * @returns an array of all the data from the stream
 *
 * @example
 * const authStream = await useAuthStream("https://example.com/api")
 * const data = await getAuthStreamData(authStream)
 *
 * console.log(data)
 */
export async function getAuthStreamData<T>(authStream: Emitter): Promise<Array<T>> {
    const data: Array<T> = []
    if (!authStream) return Promise.resolve(data)
    return new Promise((resolve, reject) => {
        authStream.on("data", (d: T) => {
            data.push(d)
        })
        authStream.on("text", (text: string) => {
            data.push(text as unknown as T)
        })
        authStream.on("end", () => {
            resolve(data)
        })
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