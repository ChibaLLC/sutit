import type { APIResponse } from "~/types";
import { type NitroFetchOptions, type NitroFetchRequest } from "nitropack";
import { ulid } from "ulid";
import { date } from "drizzle-orm/mysql-core";

const textDecoder = new TextDecoder()

export async function readStream<T>(
    reader: ReadableStreamDefaultReader | null,
    callback: (data: T) => void,
    fallback?: (text: string) => void,
    done?: () => void
): Promise<void> {
    if (!reader) throw new Error('Reader is not defined')
    const { done: none, value } = await reader.read()

    if (none) {
        if (done) done()
        return
    }

    const text = textDecoder.decode(value)

    try {
        text.replace(/\n/g, '')
            .replace(/}{/g, '}\n{')
            .split('\n')
            .filter(line => line.trim() !== '')
            .map(line => JSON.parse(line))
            .forEach((data) => {
                if (data) callback(data)
            })
    } catch (e) {
        if (fallback && text && text?.trim() !== "") fallback(text)
    }

    return readStream(reader, callback, fallback, done)
}

export function isAPIResponse(data: any): data is APIResponse {
    for (const key in data) {
        if (!["statusCode", "body"].includes(key)) log.warn(`Unexpected key ${key} in APIResponse object`)
    }
    return data?.statusCode || (data?.statusCode && data?.body)
}

/**
 * This function is a wrapper around useFetch, but decomposes it
 * 
 * @param url 
 * @param options 
 * @returns 
 */
export async function unFetch<T>(url: NitroFetchRequest, options?: NitroFetchOptions<NitroFetchRequest>) {
    const _options = { ...options, watch: false, immediate: false } as any
    const { execute } = await useFetch<T>(url, _options)

    return await execute()
}

/**
 * This is a useAsyncData wrapper, that uses useAuthStream to retrieve data.
 *
 * @param url
 * @param key
 *
 * @see unFetch
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


type Events = "data" | "text" | "end"
class Emitter {
    private readonly _events: Record<Events, Array<(data: APIResponse) => void>>;
    private _backpressure: Record<Events, any>

    constructor() {
        this._events = {
            data: [],
            text: [],
            end: []
        }
        this._backpressure = {
            data: [],
            text: [],
            end: []
        }
    }

    on(event: Events, callback: (data: APIResponse) => void) {
        this._backpressure[event].forEach(callback)
        this._events[event].push(callback)
    }

    emit(event: Events, data: any) {
        this._backpressure[event].push(data)
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
        },
        responseType: 'stream'
    }).catch(e => {
        log.error(e)
        return null
    })


    if (response instanceof ReadableStream) {
        const e = new Emitter()
        // DO NOT await
        readStream(response.getReader(), (data: APIResponse) => {
            e.emit("data", data)
        }, (text: string) => {
            e.emit("text", text)
        }, () => {
            e.emit("end", null)
        })

        return e
    } else {
        log.error(response)
        throw new Error(`Endpoint ${url} is not returning a readable steam`)
    }
}
