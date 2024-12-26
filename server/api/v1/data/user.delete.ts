export default defineEventHandler(async event => {
    const {user} = await useAuth(event)

    // TODO: Implement data deletion

    return "OK"
})