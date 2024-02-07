import type {H3Event} from "h3";
import {getUserByToken} from "~/mvc/v1/users/queries";
import {type APIResponse, Status} from "~/types";

export async function useAuth(event: H3Event) {
    const auth = readAuthToken(event)
    if (!auth) return useHttpEnd(event, {
        statusCode: Status.unauthorized,
        body: "No bearer token provided"
    }, Status.unauthorized)

    const [bearer, token] = auth.split(" ")
    if (bearer !== "Bearer") return useHttpEnd(event, {
        statusCode: Status.unauthorized,
        body: "Invalid bearer token"
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

    return {bearer, token, user}
}

export function readAuthToken(event: H3Event){
    let auth = event.headers.get("Authorization") || null
    if (!auth) auth = getCookie(event, "Authorization") || null
    if (!auth) return null

    let [bearer, token] = auth.split(" ")
    if (bearer !== "Bearer") return null

    token = token.trim()
    if (!token || token === '') return null

    return token
}