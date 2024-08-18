export function useCapitalize(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

export function collapseString(str: string | undefined | null | string[] | any): string | null {
    if (Array.isArray(str)) {
        return str.map(s => collapseString(s)).filter(Boolean).join(" ")
    }
    if (typeof str !== "string") {
        str = JSON.stringify(str)
    }
    if (!str) return null
    str = str.trim()
    if (str === "" || str === "undefined" || str === "null" || str === "false") return null
    return str
}