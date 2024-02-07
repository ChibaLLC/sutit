import { useHashPassword, useVerifyPassword } from "../server/utils/hash";
import { test, expect } from 'vitest'

test('Testing Hash Password', () => {
    const password = 'password'
    const hash = useHashPassword(password)
    const verify = useVerifyPassword(password, hash.salt, hash.hash)
    expect(verify).toBe(true)
})

test('Testing Invalid Password', () => {
    const password = 'password'
    const hash = useHashPassword(password)
    const verify = useVerifyPassword('invalid', hash.salt, hash.hash)
    expect(verify).toBe(false)
})