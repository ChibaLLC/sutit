import { hashPassword, verifyPassword } from "../server/utils/hash";
import { test, expect } from 'vitest'

test('Testing Hash Password', () => {
    const password = 'password'
    const hash = hashPassword(password)
    const verify = verifyPassword(password, hash.salt, hash.hash)
    expect(verify).toBe(true)
})

test('Testing Invalid Password', () => {
    const password = 'password'
    const hash = hashPassword(password)
    const verify = verifyPassword('invalid', hash.salt, hash.hash)
    expect(verify).toBe(false)
})