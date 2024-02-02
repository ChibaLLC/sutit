import {type NitroApp} from "nitropack";
import {useFileLogger} from "~/utils/logger";

export default defineNitroPlugin((app: NitroApp) => {
    app.hooks.hookOnce("close", () => {
        useFileLogger("Server is shutting down...", {type: 'info'})
        $FileLogger.dispose()
    })
})