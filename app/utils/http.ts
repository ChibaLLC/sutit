export function isAPIResponse(data: any): data is APIResponse {
    for (const key in data) {
        if (!["statusCode", "body"].includes(key)) log.warn(`Unexpected key ${key} in APIResponse object`)
    }
    return data?.statusCode || (data?.statusCode && data?.body)
}
