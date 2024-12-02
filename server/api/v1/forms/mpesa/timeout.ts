export default defineEventHandler(async event => {
    log.error("Withdrawal timed out", await readBody(event))
})