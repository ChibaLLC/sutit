export default defineNitroPlugin((app) => {
    app.hooks.hook("error", (error, context) => {
        log.error(error)
        log.debug(context)
        // TODO: send an email to the developer
    })
})