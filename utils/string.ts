export function useCapitalize(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

export function collapseString(str: string | undefined | null | string[]) : string | string[] | null {
    if(!str) return null
    if(Array.isArray(str)) {
        return str.map(s => collapseString(s)).filter(Boolean) as string[]
    }
    str = str.trim()
    if (str === "" || str === "undefined" || str === "null" || str === "false") return null
    return str
}