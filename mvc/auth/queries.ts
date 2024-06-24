import {eq, and} from "drizzle-orm";
import db from '~/db';
import {sessions} from "~/db/drizzle/schema";
import {v4} from "uuid";
import type {Drizzle} from "~/db/types";
import {getUserByEmail} from "~/mvc/users/queries";


export async function createToken(user: { userUlid: string, email: string }): Promise<string> {
    const uuid = v4()
    const values = {
        ulid: uuid,
        token: uuid,
        userUlid: user.userUlid,
    } satisfies Drizzle.Session.insert
    return await db.insert(sessions).values(values).then(() => uuid)
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

export async function revokeAllTokens(userUlid: string) {
    return await db.update(sessions).set({
        isValid: false,
    }).where(eq(sessions.userUlid, userUlid))
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


    return await createToken({userUlid: user.ulid, email: user.email})
}