import type {APIResponse} from "~/types";
import {type NitroFetchOptions, type NitroFetchRequest} from "nitropack";

const textDecoder = new TextDecoder()

export async function readStream<T>(
    reader: ReadableStreamDefaultReader | null,
    callback: (data: T) => void,
    fallback?: (text: string) => void,
    done?: () => void
): Promise<void> {
    if (!reader) throw new Error('Reader is not defined')
    const {done: none, value} = await reader.read()

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
            .forEach(callback)
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

export async function unFetch<T>(url: string | URL, options?: NitroFetchOptions<NitroFetchRequest>) {
    return await $fetch<T>(url.toString(), options)
}