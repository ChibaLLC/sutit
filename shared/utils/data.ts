import consola from "consola";

export function Boolish(val: any) {
    if (typeof val !== "string") return val
    switch (true) {
        case val === "":
        case val === "null":
            return null
        case val === "true":
            return true
        case val === "false":
            return false
        case val === "undefined":
            return undefined
        default:
            return val
    }
}

export function hasOwnProperties<T = any>(obj: T, properties: (keyof T)[], allowNullish = true) {
    if (typeof obj !== "object") return false
    return properties.every((property) => {
        if (allowNullish) return obj?.hasOwnProperty(property)
        return obj?.hasOwnProperty(property) && Boolish(obj[property]) !== null && Boolish(obj[property]) !== undefined
    })
}

// export function parseData(data: any): {
//     data: SocketTemplate,
//     type: "json" | "string" | string
// } {
//     let _data = data
//     if (typeof data === "string") {
//         try {
//             _data = JSON.parse(data)
//         } catch (_) {
//             console.warn("Invalid JSON", data)
//             _data = data
//         }
//     }
//
//     if (hasRawData(_data)) {
//         const decoder = new TextDecoder()
//         try {
//             _data = JSON.parse(decoder.decode(new Uint8Array(_data.rawData)))
//         } catch (_) {
//             console.warn("Invalid JSON")
//         }
//     }
//
//     return _data
// }

export function parseData(data: any): SocketTemplate {
    if (typeof data === "string") {
        try {
            data = JSON.parse(data)
            if (hasRawData(data)) {
                const decoder = new TextDecoder()
                try {
                    data = JSON.parse(decoder.decode(new Uint8Array(data.rawData.data)))
                } catch (_) {
                    console.warn("Invalid JSON", data)
                }
            }

            return data as unknown as SocketTemplate
        } catch (error) {
            consola.error("Error parsing data", error)
            return data as unknown as SocketTemplate
        }
    } else {
        return data
    }
}

export function hasRawData(data: any): data is { rawData: { data: number[], type: string }, type: string } {
    return (data)?.rawData?.data !== undefined
}

export function createChannelName(...args: string[]) {
    return args.sort().join(":")
}