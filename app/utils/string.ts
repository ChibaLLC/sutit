export function useCapitalize(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

export function collapseString(str: string | undefined | null | string[] | any): string | null {
    return Boolish(str)
}