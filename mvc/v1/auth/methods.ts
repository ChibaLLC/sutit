import type {H3Event} from "h3";
import {revokeToken} from "./queries";

export async function revokeAuthToken(event: H3Event){
    const token = readAuthToken(event)
    if(!token) return true

    await revokeToken(token)
    return true
}