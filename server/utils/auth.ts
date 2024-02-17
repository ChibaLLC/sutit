import type {H3Event} from "h3";
import {getUserByToken} from "~/mvc/v1/users/queries";
import {type APIResponse, Status} from "~/types";

export async function useAuth(event: H3Event) {
    const token = readAuthToken(event)
    if (!token) return useHttpEnd(event, {
        statusCode: Status.unauthorized,
        body: "No bearer token provided"
    }, Status.unauthorized)

    const user = await getUserByToken(token).catch(err => {
        useHttpEnd(event, {
            statusCode: Status.internalServerError,
            body: err.message || "Unknown error while verifying token"
        } as APIResponse, Status.internalServerError)
    })

    if (!user) return useHttpEnd(event, {
        statusCode: Status.unauthorized,
        body: "No user found"
    }, Status.unauthorized)

    return {token, user}
}

export async function useDbUser(event: H3Event) {
    const token = readAuthToken(event)
    if (!token) return null
    const user = await getUserByToken(token).catch(() => null)
    return {token, user}
}

export function readAuthToken(event: H3Event) {
    let auth = event.headers.get("Authorization") || null
    if (!auth) auth = getCookie(event, "Authorization") || null
    if (!auth) return null

    let [bearer, token] = auth.split(" ")
    if (bearer !== "Bearer") return null

    token = token.trim()
    if (
        !token ||
        token === "undefined" ||
        token === "null" ||
        token === "false" ||
        token === ""
    ) return null

    return token
}