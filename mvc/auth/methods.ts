import type {H3Event} from "h3";
import {createToken, revokeToken, verifyToken} from "./queries";
import type { Drizzle } from "~/db/types";
import { updatePassword } from "./queries";
import { createUser, getUserByEmail } from "../users/queries";

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

export async function googleAuth(data: {
    email: string,
    name?: string,
    password: string
}) {
    const user = await getUserByEmail(data.email)
    if (!user) {
        return createUser({
            email: data.email,
            name: data.name || data.email.split('@').at(0)!,
            password: data.password
        })
    }
    return createToken({ email: data.email })
}