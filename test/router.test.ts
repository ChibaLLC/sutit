import {test, expect} from 'vitest'

test('Testing known api test route', async () => {
    const response = await fetch('http://localhost:3000/api/v1/status')
    expect(response.status).toBe(200)
    const res = await response.json()
    expect(res).toEqual('OK')
})

test('Testing unknown api test route', async () => {
    const response = await fetch('http://localhost:3000/api/v1/unknown')
    expect(response.status).toBe(404)
})