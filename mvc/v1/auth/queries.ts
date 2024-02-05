import {eq, and} from "drizzle-orm";
import db from '~/db/';
import {sessions, users} from "../../db/drizzle/schema";
import {v4} from "uuid";

export async function createUser(data: { name: string, email: string, password: string }) {
    const auth = useHashPassword(data.password)
    return db.insert(users).values({
        name: data.name,
        email: data.email,
        password: auth.hash,
        salt: auth.salt,
    }).catch((err) => {
        console.error(err)
        throw new Error('Unable to create user')
    })
}

export function getUserByEmail(email: string) {
    const rows = db.select()
        .from(users)
        .where(and(eq(users.email, email)))
        .catch((err) => {
            console.error(err)
            throw new Error('Unable to get user')
        })
    return rows[0]
}

export async function createToken(user: { userId: number, email: string }):Promise<string> {
    const uuid = v4()
    return await db.insert(sessions).values({
        userId: user.userId,
        token: uuid,
    }).then(() => uuid).catch((err) => {
        console.error(err)
        throw new Error('Unable to create token')
    })
}

export async function revokeToken(token: string) {
    return await db.update(sessions).set({
        isValid: 1,
    }).where(and(eq(sessions.token, token))).catch((err) => {
        console.error(err)
        throw new Error('Unable to revoke token')
    })
}

export async function revokeAllTokens(userId: number) {
    return await db.update(sessions).set({
        isValid: 1,
    }).where(eq(sessions.userId, userId)).catch((err) => {
        console.error(err)
        throw new Error('Unable to revoke token')
    })
}

export async function verifyToken(token: string) {
    const rows = await db.select()
        .from(sessions)
        .where(and(eq(sessions.token, token), eq(sessions.isValid, 1)))
        .catch((err) => {
            console.error(err)
            throw new Error('Unable to verify token')
        })
    return rows[0].isValid
}

export async function getUserByToken(token: string) {
    const rows = await db.select()
        .from(sessions)
        .where(and(eq(sessions.token, token), eq(sessions.isValid, 1)))
        .catch((err) => {
            console.error(err)
            throw new Error('Unable to verify token')
        })
    return rows[0]
}

export async function authenticate(data: { email: string, password: string }): Promise<string> {
    const user = await getUserByEmail(data.email)
    if (!user) throw new Error('User not found')

    const valid = useVerifyPassword(data.password, user.salt, user.password)
    if (!valid) throw new Error('Invalid password')

    return await createToken(user)
}