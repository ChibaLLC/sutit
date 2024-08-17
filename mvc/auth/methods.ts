import type { H3Event } from "h3";
import { createToken, revokeToken, verifyToken } from "./queries";
import type { Drizzle } from "~/db/types";
import { updatePassword } from "./queries";
import { createUser, getUserByEmail } from "../users/queries";
import { OAuth2Client } from "google-auth-library"

export async function revokeAuthToken(event: H3Event) {
    const token = readAuthToken(event)
    if (!token) return true

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

export async function googleAuth(token: string) {
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET)
    const ticket = await client.verifyIdToken({ idToken: token, audience: process.env.GOOGLE_CLIENT_ID })
    const payload = ticket.getPayload()
    if (!payload) throw new Error('Invalid token')
    const email = payload.email
    if (!email) throw new Error('Your email is not verified')
    const user = await getUserByEmail(email)
    const name = payload.name
    if (!user) {
        await createUser({
            email: email,
            name: name || email.split('@').at(0)!,
            password: Math.random().toString(36).slice(-8)
        })
    }
    return createToken({ email: email })
}


export async function githubAuth(code: string) {
    const response = await $fetch<
        { access_token: string, token_type: string, scope: string }
    >(`https://github.com/login/oauth/access_token?client_id=${process.env.GITHUB_CLIENT_ID}&client_secret=${process.env.GITHUB_CLIENT_SECRET}&code=${code}`)
    const data = new URLSearchParams(response)
    const token = data.get('access_token')
    if (!token) throw new Error('Invalid token')
    const user = await $fetch<{ login: string }>('https://api.github.com/user', {
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json'
        }
    })
    if (!user.login) throw new Error('Invalid user')
    return createToken({ email: user.login })
}