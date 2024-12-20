import type {H3Event} from "h3";
import {getUserByToken} from "~~/server/api/v1/users/utils/queries";

export type AuthData = {
    token: string,
    user: Drizzle.User.select
}
export async function useAuth(event: H3Event, throwError?: false): Promise<AuthData>;
export async function useAuth(event: H3Event, throwError: true): Promise<[AuthData, null] | [null, string]>;
export async function useAuth(event: H3Event, throwError: boolean = true) {
    const token = readAuthToken(event)
    if (!token) {
        if (throwError) {
            throw createError({
                status: 401,
                message: "Bad Authentication",
                data: token
            })
        } else {
            return [null, "Unable to get auth token"]
        }
    }

    const user = await getUserByToken(token).catch((e) => e as Error)
    if (!user || user instanceof Error) {
        if (throwError) throw createError({
            status: 500,
            message: "Internal Server Error: Reading user from db",
            data: user || "User not found"
        })
        return [null, user?.message || "Unknown error while verifying token"]
    }

    const data = {token, user}
    if (throwError) {
        return [data, null]
    } else {
        return data
    }
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