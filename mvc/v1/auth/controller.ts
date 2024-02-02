import { H3Event, defineEventHandler } from 'h3'
import type {APIResponse} from "~/types";
import {useFileLogger} from "~/utils/logger";
import {useHttpEnd} from "~/utils/http";

const router = createRouter()

router.post('/login', defineEventHandler((event: H3Event) => {
    return {
        statusCode: 200,
        body: "key"
    } as APIResponse
}))

router.use('/*', defineEventHandler((event: H3Event) => {
    // Make sure this is the last route defined in the file
    useFileLogger(`Unknown route: [${event.method}] ${event.path} was attempted to be accessed`, {type: 'debug'})
    return useHttpEnd(event, null, 404)
}))

export default useBase("/auth", router.handler)