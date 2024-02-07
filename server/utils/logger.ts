import {type LogObject, type LogType, createConsola, consola} from "consola";

export function useFileLogger(message: any, options?: {
    type?: LogType,
    tag?: string
}) {
    if (!options) options = {}
    if (!options.type) options.type = 'log'
    if (!options.tag) options.tag = 'Default'

    const logger = createConsola({
        level: +999,
        reporters: [
            {
                log: (logObj: LogObject) => {
                    try {
                        $Logger.log(logObj)
                    } catch (e) {
                        consola.error(e)
                    }
                }
            },
            {
                log: (logObj: LogObject) => {
                    consola[options!.type!](logObj.args.join(' '))
                }
            }
        ]
    })

    logger[options.type]?.(message)
}