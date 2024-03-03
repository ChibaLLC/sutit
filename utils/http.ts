import type {APIResponse} from "~/types";

const textDecoder = new TextDecoder()

export async function readTextStream<T>(
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

    return readTextStream(reader, callback, fallback, done)
}

export function isAPIResponse(data: any): data is APIResponse {
    return data?.statusCode || (data?.statusCode && data?.body)
}