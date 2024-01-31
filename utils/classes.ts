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
import {createInterface} from "node:readline";
import {consola, type LogObject, type LogType} from "consola";
import {execSync} from "node:child_process";

export class LogFileWriter {
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
            streams[log] = createWriteStream(path.join(`./logs/${log}.log`), {flags: 'a'})
        }
        return streams
    }

    public async logString(logString: string): Promise<void> {
        const logObject = {} as LogObject
        logObject.date = new Date()
        logObject.tag = 'Default'
        logObject.type = 'log'
        logObject.args = [logString]
        logObject.message = undefined
        return this.log(logObject)
    }

    public async log(logObj: LogObject): Promise<void> {
        if(typeof logObj !== 'object') throw new Error('argument logObj must be a Log Object')
        try {
            this.streams.master.write(this.stringifyLogObject(logObj))
            if ((logObj.type in this.streams)) {
                return new Promise((resolve, reject) => {
                    this.streams[logObj.type].write(this.stringifyLogObject(logObj), (err) => {
                        if (err) {
                            reject(err)
                        } else {
                            resolve()
                        }
                    })
                })
            } else {
                throw new Error(`Log ${logObj.type} does not exist`)
            }
        } catch (e) {
            consola.error(e)
            consola.box(this.stringifyLogObject(logObj))
            throw e
        }
    }

    public stringifyLogObject(logObj: LogObject): string {
        return `[${logObj.date.toISOString()}]\t(${logObj.tag.toLocaleLowerCase()} ${logObj.type})\t${logObj.args.map(arg => {
            if (typeof arg === 'object') {
                return JSON.stringify(arg)
            } else {
                arg.replace('\t', ' ')
                return arg
            }
        }).join(' ')
        }\t${logObj?.message ? logObj.message : ""}\n`
    }

    private parseLogString(logString: string): LogObject {
        const logArray = logString.split('\t')
        const logObject = {} as LogObject
        const tag_type = logArray[1].replace('(', '').replace(')', '').split(' ')
        logObject.date = new Date(logArray[0].replace('[', '').replace(']', ''))
        logObject.tag = tag_type[0]
        logObject.type = tag_type[1] as LogType
        logObject.args = logArray[2].split(' ')
        logObject.message = logArray[3]
        return logObject
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
}