import {test, expect} from "vitest";

test('Testing for authentication', async () => {
    const response = await fetch('http://localhost:3000/api/v1/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: 'test',
            password: 'test'
        })
    })
    expect(response.status).toBe(403)
    const res = await response.json()
    expect(res).toBe('key')
})