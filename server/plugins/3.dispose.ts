import {type NitroApp} from "nitropack";

export default defineNitroPlugin((app: NitroApp) => {
    app.hooks.hookOnce("close", () => {
        log.warn("Server is shutting down...")
    })
})