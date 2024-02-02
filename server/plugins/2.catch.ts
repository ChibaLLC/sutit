import {type NitroApp} from "nitropack";

export default defineNitroPlugin((app: NitroApp) => {
    app.hooks.hook("error", (error, context) => {
        useFileLogger(error, {type: 'fatal'})
        useFileLogger(context, {type: 'debug'})
        // TODO: send an email to the developer
    })
})