import type {ConsolaInstance} from "consola";

declare global {
    namespace NodeJS {
        interface Global {
            log: ConsolaInstance
        }
    }

    var log: ConsolaInstance
    var alert: (message: string, onClose: string, icon: string) => void
}