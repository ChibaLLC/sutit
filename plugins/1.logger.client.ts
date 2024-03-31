import {Logger} from "~/server/utils/logger";
import {createConsola} from "consola";

export default defineNuxtPlugin((app) => {
    if(!window.log) {
        Object.defineProperty(window, 'log', {
            value: createConsola(),
            writable: false,
            enumerable: true,
            configurable: false
        })
    }
})