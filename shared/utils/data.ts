import type { Stores } from "@chiballc/nuxt-form-builder"

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

export function parseData(data: any): {
    data: SocketTemplate,
    type: "json" | "string" | string
} {
    let _data = data
    if (typeof data === "string") {
        try {
            _data = JSON.parse(data)
        } catch (_) {
            console.warn("Invalid JSON", data)
            _data = data
        }
    }

    if (hasRawData(_data)) {
        const decoder = new TextDecoder()
        try {
            _data = JSON.parse(decoder.decode(new Uint8Array(_data.rawData)))
        } catch (_) {
            console.warn("Invalid JSON")
        }
    }

    if (isSocketTemplate(data)) {
        return {
            data: data,
            type: "json"
        }
    }

    return _data
}

export function hasRawData(data: any): data is { rawData: number[], type: string } {
    return (data)?.rawData !== undefined
}

export function createChannelName(...args: string[]) {
    return args.sort().join(":")
}

function isSocketTemplate(data: any): data is SocketTemplate {
    return hasOwnProperties<SocketTemplate>(data, ["type"])
}

export function hasBoughtMerch(stores?: Stores) {
    if (!stores) return false
    for (const key in stores) {
        for (const item of stores[key] || []) {
            if (item.carted) return true
        }
    }
    return false
}