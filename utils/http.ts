const decoder = new TextDecoder()

export async function readStream<T>(reader: ReadableStreamDefaultReader | null, callback: (data: T[]) => void, fallback?: (text: string) => void) {
    if (!reader) throw new Error('Reader is not defined')
    const { done, value } = await reader.read()

    if (done) return

    const text = decoder.decode(value)

    try {
        const data = text
            .replace(/\n/g, '')
            .replace(/}{/g, '}\n{')
            .split('\n')
            .filter(line => line.trim() !== '')
            .map(line => JSON.parse(line))
        callback(data)
    } catch (e) {
        console.warn(e)
        if (fallback) fallback(text)
    }

    return readStream(reader, callback)
}