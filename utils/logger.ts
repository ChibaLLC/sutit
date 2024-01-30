import {type LogObject, type LogType, createConsola} from "consola";

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
                    try{
                        // @ts-expect-error
                        $FileLogger.log(logObj)
                        console.log("Log written to file")
                    } catch (e) {
                        console.error(e)
                    }
                }
            },
            {
                log: (logObj: LogObject) => {
                    if(options && options.type && options.type in Object.keys(console)){
                        // @ts-expect-error
                        console[options.type](logObj)
                    } else {
                        console.log(logObj)
                    }
                }
            }
        ]
    })

    logger[options.type](message)
}