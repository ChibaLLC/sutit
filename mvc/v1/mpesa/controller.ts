import {callBackIpWhitelist as whitelist} from "~/types"

const router = createRouter()

router.use("/callback", defineEventHandler((event) => {
    const ip = getRequestIP(event)
    if (!ip) return useHttpEnd(event, {statusCode: 400, body: "No IP found"}, 400)
    if (!whitelist.includes(ip)) return useHttpEnd(event, {statusCode: 403, body: "Forbidden"}, 403)
    return useHttpEnd(event, {statusCode: 200, body: "OK"}, 200)
}))

export default useController("v1", "mpesa", router)