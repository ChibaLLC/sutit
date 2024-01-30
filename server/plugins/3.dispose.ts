import {NitroApp} from "nitropack";
import {useFileLogger} from "~/utils/logger";

export default defineNitroPlugin((app: NitroApp) => {
    app.hooks.hook("close", () => {
        useFileLogger("Server is shutting down...", {type: 'info'})
        // @ts-expect-error
        $FileLogger.dispose()
    })
})