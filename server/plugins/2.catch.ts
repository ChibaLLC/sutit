import {type NitroApp} from "nitropack";
import { useFileLogger } from "~/utils/logger";

export default defineNitroPlugin((app: NitroApp) => {
    app.hooks.hook("error", (error, context) => {
        useFileLogger(error, {type: 'fatal'})
        useFileLogger(context, {type: 'debug'})
        // TODO: send an email to the developer
    })
})