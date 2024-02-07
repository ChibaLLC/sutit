import {randomBytes, pbkdf2Sync} from 'crypto'
export function useHashPassword(password: string): { salt: string, hash: string } {
    const salt = randomBytes(16).toString('hex')
    const hash = pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex')

    return {salt, hash}
}

export function useVerifyPassword(password: string, salt: string, hash: string): boolean {
    const verify = pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex')
    console.log(verify, '\n', hash)
    return verify === hash
}
