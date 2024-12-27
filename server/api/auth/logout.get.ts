import {revokeAuthToken} from "~~/server/api/auth/utils";

export default defineEventHandler(async event => {
    revokeAuthToken(event)
    return "OK"
})