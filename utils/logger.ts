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
                        $FileLogger.log(logObj)
                    } catch (e) {
                        consola.error(e)
                    }
                }
            },
            {
                log: (logObj: LogObject) => {
                    if (options && options.type && options.type in Object.keys(consola)) {
                        consola[options.type](logObj.args.join(' '))
                    } else {
                        consola.log(options?.type, "is not a valid consola log type")
                        consola.log(logObj)
                    }
                }
            }
        ]
    })

    logger[options.type]?.(message)
}