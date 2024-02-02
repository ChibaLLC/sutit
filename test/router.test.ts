import {test, expect} from 'vitest'
import type {APIResponse} from "../types";

test('Testing known api test route', async () => {
    const response = await fetch('http://localhost:3000/api/v1/status')
    expect(response.status).toBe(200)
    const res = await response.json() as APIResponse
    expect(res.body).toEqual('OK')
})

test('Testing unknown api test route', async () => {
    const response = await fetch('http://localhost:3000/api/v1/unknown')
    expect(response.status).toBe(404)
})