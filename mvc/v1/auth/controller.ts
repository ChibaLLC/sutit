import { H3Event, defineEventHandler } from 'h3'
import type {APIResponse} from "~/types";

const router = createRouter()

router.post('/login', defineEventHandler((event: H3Event) => {
    return {
        statusCode: 200,
        body: "key"
    } as APIResponse
}))

export default useController("auth", router)