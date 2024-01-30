/**
 * if this filename does not start with 1. an error is thrown; nuxt plugins are loaded in alphabetical order
 * and we want this to be loaded first because it populates global variables that are used throughout the app
 */
import path from 'path'
import {type LogObject} from "consola";
import {createWriteStream, existsSync, mkdirSync, readdirSync, type WriteStream} from "node:fs";
import {NitroApp} from "nitropack";

class LogFileWriter {
    private logs = new Set<string>([
        'log',
        'info',
        'success',
        'warn',
        'error',
        'fatal',
        'master'
    ])
    private streams: {
        [key: string]: WriteStream
    };

    set addLog(log: string) {
        this.logs.add(log)
        this.streams = this.makeStreams()
    }

    constructor() {
        if (!existsSync(path.join('./logs'))) {
            mkdirSync(path.join('./logs'))
        }
        this.streams = this.makeStreams()
        this.loadLogFiles()
    }

    private loadLogFiles() {
        const files = readdirSync(path.join('./logs'))
        for (const file of files) {
            const log = file.split('.')[0]
            this.logs.add(log)
        }
    }

    private makeStreams() {
        const streams = {} as typeof this.streams
        for (const log of this.logs) {
            streams[log] = createWriteStream(path.join(`./logs/${log}.log`), {flags: 'a'})
        }
        return streams
    }

    public log(logObj: LogObject | string) {
        if (typeof logObj === 'string') {
            this.streams.log.write(logObj) || this.streams.master.write(logObj) || console.log(logObj)
        } else {
            try {
                if (!(logObj.type in this.streams)) {
                    this.streams.master.write(this.stringifyLogObject(logObj))
                } else {
                    this.streams[logObj.type].write(this.stringifyLogObject(logObj))
                }
            } catch (e) {
                console.error(e)
                console.log(this.stringifyLogObject(logObj))
            }
        }
    }

    private stringifyLogObject(logObj: LogObject) {
        return `[${logObj.date}] ${logObj.tag?.toLocaleLowerCase()} ${logObj.type?.toUpperCase()}: ${
            logObj.args.map(arg => {
                if (typeof arg === 'object') {
                    return JSON.stringify(arg)
                } else {
                    return arg
                }
            }).join('\n')
        }\n${logObj?.message}\n`
    }

    public dispose() {
        for (const stream of Object.values(this.streams)) {
            stream.close()
        }
    }
}

export default defineNitroPlugin((app: NitroApp) => {
    Object.defineProperty(global, '$FileLogger', {
        value: new LogFileWriter(),
        writable: false,
        enumerable: true,
        configurable: false
    })
})