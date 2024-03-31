import type {Drizzle} from "~/db/types";
import db from "~/db";
import {sessions, users} from "~/db/drizzle/schema";
import {and, eq} from "drizzle-orm";
import type {MySqlRawQueryResult} from "drizzle-orm/mysql2";

export async function getUserByToken(token: string): Promise<Drizzle.User.select | null> {
    if(!token) return null
    const tokenUser = await db.select()
        .from(sessions)
        .where(and(eq(sessions.token, token), eq(sessions.isValid, true)))
        .catch((err) => {
            console.error(err)
            throw new Error('Unable to verify token')
        })

    if (tokenUser.length === 0) return null
    const rows = await db.select()
        .from(users)
        .where(eq(users.id, tokenUser.at(0)!.userId))
        .catch((err) => {
            console.error(err)
            throw new Error('Unable to get users')
        })
    return rows.at(0) || null
}

export async function getUserByEmail(email: string): Promise<Drizzle.User.select | null> {
    const rows = await db.select()
        .from(users)
        .where(and(eq(users.email, email)))
        .catch((err) => {
            console.error(err)
            throw new Error('Unable to get users')
        })

    return rows.at(0) || null
}

export async function createUser(data: {
    name: string,
    email: string,
    password: string
}) {
    const auth = useHashPassword(data.password)
    const values = {
        name: data.name,
        email: data.email,
        password: auth.hash,
        salt: auth.salt,
    } satisfies Drizzle.User.insert

    return db.insert(users).values(values).catch((err) => {
        log.error(err.message || err, {type: err?.code === 'ER_DUP_ENTRY' ? 'error' : 'fatal'})
        throw err
    })
}

export async function deleteUser(id: number){
    await db.update(users).set({
        isDeleted: true
    }).where(eq(users.id, id))
}