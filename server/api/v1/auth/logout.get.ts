import {revokeAuthToken} from "~~/server/api/v1/auth/utils";

export default defineEventHandler(async event => {
    revokeAuthToken(event)
    return "OK"
})