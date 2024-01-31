/**
 * if this filename does not start with 1. an error is thrown; nuxt plugins are loaded in alphabetical order
 * and we want this to be loaded first because it populates global variables that are used throughout the app
 */
import type {NitroApp} from "nitropack";
import {LogFileWriter} from "~/utils/classes";

export default defineNitroPlugin((app: NitroApp) => {
    Object.defineProperty(global, '$FileLogger', {
        value: new LogFileWriter(),
        writable: false,
        enumerable: true,
        configurable: false
    })
})