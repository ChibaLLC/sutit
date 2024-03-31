import type {NitroApp} from "nitropack";
import {Logger} from "~/server/utils/logger";

export default defineNitroPlugin((app: NitroApp) => {
    Object.defineProperty(global, 'log', {
        value: new Logger(app).logger,
        writable: false,
        enumerable: true,
        configurable: false
    })
})