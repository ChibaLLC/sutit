import {H3Event, defineEventHandler} from 'h3'

const router = createRouter()

router.get('/login', defineEventHandler((event: H3Event) => {
    return {
        statusCode: 200,
        body: {
            message: 'Login success'
        }
    }
}))

export default router.handler