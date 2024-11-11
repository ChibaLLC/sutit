export default defineNitroPlugin((app) => {
    app.hooks.hookOnce("close", () => {
        log.warn("Server is shutting down...")
    })
})