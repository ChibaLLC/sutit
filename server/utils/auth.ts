import type {H3Event} from "h3";
import {getUserByToken} from "~~/server/api/v1/users/utils/queries";

export async function useAuth(event: H3Event): Promise<[{
    token: string,
    user: Drizzle.User.select
} | null, string | null]> {
    const token = readAuthToken(event)
    if (!token) return [null, "No bearer token provided"]
    const user = await getUserByToken(token).catch((e) => e as Error)

    if (!user || user instanceof Error) {
        return [null, user?.message || "Unknown error while verifying token"]
    }

    return [{token: token as string, user: user as Drizzle.User.select}, null]
}

export function readAuthToken(event: H3Event) {
    let auth = getHeader(event, "Authorization") || null
    if (!auth) auth = getCookie(event, "Authorization") || null
    if (!auth) return null

    let [bearer, token] = auth.split(" ")
    if (bearer?.toLowerCase() !== "bearer") return null

    if (!Boolish(token)) return null

    return token
}