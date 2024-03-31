import {type NitroApp} from "nitropack";

export default defineNitroPlugin((app: NitroApp) => {
    app.hooks.hook("error", (error, context) => {
        log.error(error)
        log.debug(context)
        // TODO: send an email to the developer
    })
})