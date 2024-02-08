import {
    createReadStream,
    createWriteStream,
    existsSync,
    mkdirSync,
    readdirSync,
    readFileSync,
    type WriteStream
} from "node:fs";
import path from "node:path";
import { createInterface } from "node:readline";
import { consola, type LogObject, type LogType } from "consola";
import { execSync } from "node:child_process";
import { isDevelopment } from "std-env";

export class Logger {
    private logs = new Set<string>([
        'log',
        'info',
        'success',
        'warn',
        'debug',
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
        if (!isDevelopment) {
            this.streams = {} as typeof this.streams
            return
        }
        if (process.server !== undefined && !process.server) throw new Error('LogFileWriter can only be used on the server')
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
            streams[log] = createWriteStream(path.join(`./logs/${log}.log`), { flags: 'a' })
        }
        return streams
    }

    public async logString(logString: string, log?: LogType): Promise<void> {
        const logObject = {} as LogObject
        logObject.date = new Date()
        logObject.tag = 'Default'
        logObject.type = log || 'log'
        logObject.args = [logString]
        logObject.message = undefined
        return this.log(logObject)
    }

    private logProduction(logObj: LogObject): void {
        consola[logObj.type](logObj.args.join(' '))
    }

    public async log(logObj: LogObject): Promise<void> {
        try {
            this.streams.master.write(this.stringifyLogObject(logObj))
            return new Promise((resolve, reject) => {
                this.streams[logObj.type].write(this.stringifyLogObject(logObj), (err) => {
                    if (err) {
                        reject(err)
                    } else {
                        resolve()
                    }
                })
            })
        } catch (e) {
            console.error(e)
            consola.box(this.stringifyLogObject(logObj))
            throw e
        }
    }

    public stringifyLogObject(logObj: LogObject): string {
        return `[${logObj.date.toISOString()}]\t` +
            `(${`${logObj.tag.toLocaleLowerCase()} ${logObj.type}`.trim()})\t` +
            `${logObj.args.map(arg => {
                if (typeof arg === 'object') {
                    return JSON.stringify(arg)
                } else {
                    arg.replace('\t', '\\t')
                    return arg
                }
            }).join(' ')}\t` +
            `${logObj?.message ? logObj.message : ""}\n`
    }

    private parseLogString(logString: string): LogObject {
        try {
            if (logString.trim().length === 0) return {} as LogObject
            const logArray = logString.split('\t')
            const logObject = {} as LogObject
            const tag_type = logArray[1]?.replace('(', '').replace(')', '').split(' ')
            logObject.date = new Date(logArray[0]?.replace('[', '').replace(']', ''))
            logObject.tag = tag_type[0]
            logObject.type = tag_type[1] as LogType
            try {
                logObject.args = JSON.parse(logArray[2])
            } catch (e) {
                logObject.args = logArray[2].replace('\\t', '\t').split(' ')
            }
            logObject.message = logArray[3]
            return logObject
        } catch (e) {
            consola.error(e)
            return {} as LogObject
        }
    }

    public dispose() {
        for (const stream of Object.values(this.streams)) {
            stream.close()
        }
    }

    public async* read(log: LogType): AsyncGenerator<LogObject> {
        if (!this.logs.has(log)) throw new Error(`Log ${log} does not exist`)
        const stream = createReadStream(path.join(`./logs/${log}.log`))
        const rl = createInterface({
            input: stream,
            crlfDelay: Infinity
        })

        for await (const line of rl) {
            yield this.parseLogString(line)
        }

        stream.close()
    }

    public tail(log: LogType, lines: number): LogObject[] {
        if (!this.logs.has(log)) throw new Error(`Log ${log} does not exist`)
        const logs: LogObject[] = []
        try {
            const logString = execSync(`tail -n ${lines} ./logs/${log}.log`).toString()
            const logArray = logString.split('\n')
            for (const log of logArray) {
                if (log.trim().length > 0) {
                    logs.push(this.parseLogString(log))
                }
            }
            return logs
        } catch (e) {
            consola.error(e)
            return logs
        }
    }

    public grep(pattern: string, log: string): LogObject[] {
        if (!this.logs.has(log)) throw new Error(`Log ${log} does not exist`)
        const logs: LogObject[] = []
        try {
            const logString = execSync(`grep ${pattern} ./logs/${log}.log`).toString()
            const logArray = logString.split('\n')
            for (const log of logArray) {
                if (log.trim().length > 0) {
                    logs.push(this.parseLogString(log))
                }
            }
            return logs
        } catch (e) {
            consola.error(e)
            return logs
        }
    }

    public readSync(log: LogType): LogObject[] {
        if (!this.logs.has(log)) throw new Error(`Log ${log} does not exist`)
        const logs: LogObject[] = []
        const logString = readFileSync(path.join(`./logs/${log}.log`)).toString()
        const logArray = logString.split('\n')
        for (const log of logArray) {
            if (log.length > 0) {
                logs.push(this.parseLogString(log))
            }
        }
        return logs
    }

    public getLogsByDate(date: Date, log: string = 'master'): LogObject[] | undefined {
        try {
            const dateString = date.toISOString().split('T')[0]
            return this.grep(dateString, log)
        } catch (e) {
            consola.error(e)
            return undefined
        }
    }

    public getLogsByDateRange(start: Date, end: Date, log: string = 'master'): LogObject[] | undefined {
        try {
            const startString = start.toISOString().split('T')[0]
            const endString = end.toISOString().split('T')[0]
            return this.grep(`${startString}.*${endString}`, log)
        } catch (e) {
            consola.error(e)
            return undefined
        }
    }

    public getLogsByDateAndTime(date: Date, log: string = 'master'): LogObject[] | undefined {
        try {
            const dateString = date.toISOString().split('T')[0]
            const timeString = date.toISOString().split('T')[1].split('.')[0]
            return this.grep(`${dateString}.*${timeString}`, log)
        } catch (e) {
            consola.error(e)
            return undefined
        }
    }

    public getLogByTimestamp(timestamp: string, log: string = 'master'): LogObject[] | undefined {
        try {
            return this.grep(timestamp, log)
        } catch (e) {
            consola.error(e)
            return undefined
        }
    }

    public getLogsByMessage(message: string, log: string = 'master'): LogObject[] | undefined {
        try {
            return this.grep(message, log)
        } catch (e) {
            consola.error(e)
            return undefined
        }
    }

    public getLogsByTag(tag: string, log: string = 'master'): LogObject[] | undefined {
        try {
            return this.grep(tag, log)
        } catch (e) {
            consola.error(e)
            return undefined
        }
    }
}