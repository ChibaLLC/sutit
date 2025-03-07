import {randomBytes, pbkdf2Sync} from 'node:crypto'
export function hashPassword(password: string): { salt: string, hash: string } {
    const salt = randomBytes(16).toString('hex')
    const hash = pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex')

    return {salt, hash}
}

export function verifyPassword(password: string, salt: string, hash: string): boolean {
    const verify = pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex')
    return verify === hash
}
