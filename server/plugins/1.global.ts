import type {NitroApp} from "nitropack";
import {Logger} from "~/server/utils/classes";

export default defineNitroPlugin((app: NitroApp) => {
    Object.defineProperty(global, '$Logger', {
        value: new Logger(),
        writable: false,
        enumerable: true,
        configurable: false
    })
})