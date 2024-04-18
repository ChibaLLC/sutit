import {eq, and} from "drizzle-orm";
import db from '~/db';
import {sessions} from "~/db/drizzle/schema";
import {v4} from "uuid";
import type {Drizzle} from "~/db/types";
import {getUserByEmail} from "~/mvc/users/queries";


export async function createToken(user: { userId: number, email: string }): Promise<string> {
    const uuid = v4()
    const values = {
        userId: user.userId,
        token: uuid,
        id: undefined
    } satisfies Drizzle.Session.insert
    return await db.insert(sessions).values(values).then(() => uuid)
        .catch((err) => {
            console.error(err)
            throw new Error('Unable to create token')
        })
}

export async function revokeToken(token: string) {
    return await db.update(sessions).set({
        isValid: false,
    }).where(and(eq(sessions.token, token)))
        .catch((err) => {
            console.error(err)
            throw new Error('Unable to revoke token')
        })
}

export async function revokeAllTokens(userId: number) {
    return await db.update(sessions).set({
        isValid: false,
    }).where(eq(sessions.userId, userId))
        .catch((err) => {
            console.error(err)
            throw new Error('Unable to revoke token')
        })
}

export async function verifyToken(token: string): Promise<boolean> {
    const rows = await db.select()
        .from(sessions)
        .where(and(eq(sessions.token, token), eq(sessions.isValid, true)))
        .catch((err) => {
            console.error(err)
            throw new Error('Unable to verify token')
        })
    return Boolean(rows.at(0)?.isValid) || false
}


export async function authenticate(data: { email: string, password: string }): Promise<string> {
    const user = await getUserByEmail(data.email)
    if (!user) throw new Error('User not found')

    const valid = verifyPassword(data.password, user.salt, user.password)
    if (!valid) throw new Error('Invalid password')


    return await createToken({userId: user.id, email: user.email})
}