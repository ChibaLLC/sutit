import type {Drizzle} from "~~/server/db/types";
import db from "../../db";
import {sessions, users} from "~~/server/db/drizzle/schema";
import {and, eq} from "drizzle-orm";
import {ulid} from "ulid";
import { getRecentForms as _getRecentForms } from "../../api/v1/forms/utils/queries";

export async function getUserByToken(token: string): Promise<Drizzle.User.select | null> {
    if (!token) return null
    const rows = await db.select()
        .from(sessions)
        .where(and(eq(sessions.token, token), eq(sessions.isValid, true)))
        .innerJoin(users, eq(users.ulid, sessions.userUlid))
        .catch((err) => {
            console.error(err)
            throw new Error('Unable to get users')
        })
    return rows.at(0)?.users || null
}

export async function getUserByEmail(email: string): Promise<Drizzle.User.select | null> {
    const rows = await db.select()
        .from(users)
        .where(and(eq(users.email, email.toLowerCase())))
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
    const auth = hashPassword(data.password)
    const values = {
        name: data.name,
        email: data.email.toLowerCase(),
        password: auth.hash,
        salt: auth.salt,
        ulid: ulid()
    } satisfies Drizzle.User.insert

    return db.insert(users).values(values).catch((err) => {
        log.error(err.message || err, {type: err?.code === '23505' ? 'error' : 'fatal'})
        return Promise.reject(err)
    })
}

export async function deleteUser(ulid: string) {
    await db.update(users).set({
        isDeleted: true
    }).where(eq(users.ulid, ulid))
}

export async function getUserByUlId(ulid: string) {
    return (await db.select().from(users)
        .where(eq(users.ulid, ulid))
        .catch(e => {
            log.error(e)
            return []
        })).at(0) || null
}


export async function getRecentForms(userUlid: string) {
    return await _getRecentForms(userUlid)
}