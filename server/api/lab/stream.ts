export default defineEventHandler(async event => {
    const stream = await useSSE(event)
    let count = 0;
    const interval = setInterval(() => {
        stream.send({statusCode: 200, body: count})
        count++;
    }, 500)

    setTimeout(() => {
        stream.end()
        clearInterval(interval)
    }, 5000)
})