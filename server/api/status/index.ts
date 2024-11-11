export default defineEventHandler(async event => {
    const response = {} as APIResponse
    response.statusCode = Status.success
    response.body = "OK"
    return response
})