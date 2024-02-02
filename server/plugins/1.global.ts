import type {NitroApp} from "nitropack";

export default defineNitroPlugin((app: NitroApp) => {
    Object.defineProperty(global, '$FileLogger', {
        value: new LogFileWriter(),
        writable: false,
        enumerable: true,
        configurable: false
    })
})