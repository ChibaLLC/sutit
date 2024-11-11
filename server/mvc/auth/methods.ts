import type { H3Event } from "h3";
import { createToken, revokeToken, verifyToken } from "./queries";
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

export async function googleAuth(data: GoogleCredential) {
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET)
    const ticket = await client.verifyIdToken({ idToken: data.credential, audience: process.env.GOOGLE_CLIENT_ID })
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
    const response = await $fetch<Blob>(`https://github.com/login/oauth/access_token?client_id=${process.env.GITHUB_CLIENT_ID}&client_secret=${process.env.GITHUB_CLIENT_SECRET}&code=${code}`)
    const data = new URLSearchParams(await response.text())
    const token = data.get('access_token')
    if (!token) throw new Error('Invalid token')
    const _user = await $fetch<{ login: string, email: string }>('https://api.github.com/user', {
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json'
        }
    })
    
    if (!_user.email && !_user.login) throw new Error('Invalid user')
    const user = await getUserByEmail(_user.email)
    if (!user) {
        await createUser({
            email: _user.email || _user.login + '@github.com',
            name: _user.login || _user.email.split('@').at(0)!,
            password: Math.random().toString(36).slice(-8)
        })
    }
    return createToken({ email: _user.email })
}

