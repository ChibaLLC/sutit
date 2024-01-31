import {H3Event, defineEventHandler} from 'h3'

const router = createRouter()

router.get('/pay', defineEventHandler((event: H3Event) => {
    return {
        statusCode: 200,
        body: {
            message: 'Pay success'
        }
    }
}))

export default router.handler