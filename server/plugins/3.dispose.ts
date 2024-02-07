import {type NitroApp} from "nitropack";

export default defineNitroPlugin((app: NitroApp) => {
    app.hooks.hookOnce("close", () => {
        useFileLogger("Server is shutting down...", {type: 'info'})
        $Logger.dispose()
    })
})