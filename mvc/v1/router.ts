import authController from "./auth/controller"
import type {H3Event} from "h3";
import type {APIResponse} from "~/types";
import {useHttpEnd} from "~/utils/http";
import {useFileLogger} from "~/utils/logger";

const router = createRouter()

router.use("/status", defineEventHandler((event: H3Event) => {
    const response = {} as APIResponse
    response.statusCode = 200
    response.body = "OK"
    return response
}))

router.use("/auth/*", authController)

router.use("/*", defineEventHandler((event: H3Event) => {
    // Make sure this is the last route defined in the file
    useFileLogger(`Unknown route: [${event.method}] ${event.path} was attempted to be accessed`, {type: 'debug'})
    return useHttpEnd(event, null, 404)
}))

export default useBase("/api/v1", router.handler)