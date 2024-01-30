import {NitroApp} from "nitropack";
import {spawn} from "node:child_process";
import {isBun, isDevelopment, isDebug} from "std-env";
import { useFileLogger } from "~/utils/logger";

export default defineNitroPlugin((app: NitroApp) => {
    app.hooks.hook("error", (error, context) => {
        useFileLogger(error, {type: 'fatal'})
        useFileLogger(context, {type: 'debug'})
        useFileLogger("Restarting server in 5 seconds...", {type: 'info'})
        setTimeout(() => {
            if(isBun) {
                useFileLogger("Restarting server with Bun...", {type: 'info'})
                if(isDebug || isDevelopment) {
                    spawn("bun", ["run", "dev"])
                } else {
                    spawn("bun", ["run", "start"])
                }
            } else {
                useFileLogger("Restarting server with NPM...", {type: 'info'})
                if(isDevelopment || isDebug) {
                    spawn("npm", ["run", "dev"])
                } else {
                    spawn("npm", ["run", "start"])
                }
            }
        }, 5000)

        // TODO: send an email to the developer
    })
})