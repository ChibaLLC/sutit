import type {H3Event} from "h3";
import {revokeToken, verifyToken} from "./queries";
import type { Drizzle } from "~/db/types";
import { updatePassword } from "./queries";

export async function revokeAuthToken(event: H3Event){
    const token = readAuthToken(event)
    if(!token) return true

    await revokeToken(token)
    return true
}

export async function resetPassword(data: {
    user: Drizzle.User.select,
    token: string,
    password: string
}) {
    const token = await verifyToken(data.token)
    if (!token) throw new Error('Invalid token')
    await updatePassword(data.user, data.password)
    await revokeToken(data.token)
}