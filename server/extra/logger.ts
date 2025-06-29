import {
  createReadStream,
  createWriteStream,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  type WriteStream,
} from "node:fs";
import path from "node:path";
import { createInterface } from "node:readline";
import { consola, type LogObject, type LogType } from "consola";
import { execSync } from "node:child_process";
import type { NitroApp } from "nitropack/types";
import { isVercel } from "#build/types/nitro-imports";
import { getCommand } from "@@/server/utils/platform";

export class Logger {
  private logs = new Set<string>(["log", "info", "success", "warn", "debug", "error", "fatal", "master"]);
  private environment: string;
  private streams: {
    [key: string]: WriteStream;
  };

  constructor(
    app?: NitroApp,
    options?: {
      environment?: "client" | "server";
    }
  ) {
    app?.hooks.hookOnce("close", () => {
      this.dispose();
    });

    if (!options?.environment) {
      if (import.meta.client) {
        this.environment = "client";
      } else {
        this.environment = "server";
      }
    } else {
      this.environment = options.environment;
    }

    this.loadLogFiles();
    this.streams = this.makeStreams();
  }

  private loadLogFiles() {
    if (this.environment === "client" || isVercel) {
      this.streams = {} as typeof this.streams;
      return;
    }
    if (!existsSync(path.join("./logs"))) {
      mkdirSync(path.join("./logs"));
    }
    const files = readdirSync(path.join("./logs"));
    for (const file of files) {
      const log = file.split(".")[0];
      if (!log) continue;
      this.logs.add(log);
    }
  }

  private makeStreams() {
    const streams = {} as typeof this.streams;
    for (const log of this.logs) {
      streams[log] = createWriteStream(path.join(`./logs/${log}.log`), { flags: "a" });
    }
    return streams;
  }

  public async logString(logString: string, log?: LogType): Promise<void> {
    const logObject = {} as LogObject;
    logObject.date = new Date();
    logObject.tag = "Default";
    logObject.type = log || "log";
    logObject.args = [logString];
    logObject.message = undefined;
    return this.log(logObject);
  }

  public async log(logObj: LogObject): Promise<void> {
    if (this.environment === "client" || isVercel) {
      return;
    }

    try {
      const string = this.stringifyLogObject(logObj);
      this.streams.master?.write(string);
      return new Promise((resolve, reject) => {
        this.streams[logObj.type]?.write(string, (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    } catch (e) {
      console.error(e);
    }
  }

  public stringifyLogObject(logObj: LogObject): string {
    const formatValue = (value: any): string => {
      if (value === undefined) return "undefined";
      if (value === null) return "null";
      if (typeof value === "function") return value.toString();
      if (typeof value === "object") {
        try {
          return JSON.stringify(value, null, 2)
            .split("\n")
            .map((line) => "  " + line) // Indent for readability
            .join("\n");
        } catch (e) {
          return "[Circular Structure]";
        }
      }
      return String(value);
    };

    const timestamp = logObj.date.toISOString();
    const tag = logObj.tag.toLowerCase();
    const args = logObj.args.map(formatValue).join("\n");
    const message = logObj.message || "";

    return `[${timestamp}] ${tag}:${logObj.type}\n` + `Args:\n${args}\n` + `Message: ${message}\n` + `---\n`; // Separator for multiple logs
  }

  public parseLogString(logString: string): LogObject {
    try {
      const parseValue = (value: string): any => {
        if (value === "undefined") return undefined;
        if (value === "null") return null;
        try {
          return JSON.parse(value);
        } catch (e) {
          return value;
        }
      };

      if (!logString.endsWith("---\n")) {
        logString += "---\n";
      }

      // Extract basic parts using regex
      const timestampMatch = logString.match(/\[(.*?)\]/)?.[1];
      const tagTypeMatch = logString.match(/\]\s:(.*?)\r?\n/)?.[0]?.split(":");
      const argsMatch = logString.match(/Args:\r?\n([\s\S]*?)\r?\nMessage:/)?.[1];
      const messageMatch = logString.match(/Message: (.*?)\r?\n---\r?\n/)?.[1];

      if (!timestampMatch || !tagTypeMatch || !argsMatch) {
        console.log(logString);
        throw new Error("Invalid log format");
      }

      const args = argsMatch
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
        .map(parseValue);

      return {
        date: new Date(timestampMatch),
        tag: tagTypeMatch[0]?.split("]")[1]?.trim() as string,
        type: tagTypeMatch[1]?.trim() as LogType,
        args: args,
        message: messageMatch ? messageMatch[1]?.trim() : "",
        level: 1,
      };
    } catch (e) {
      console.error("Failed to parse log string:", e);
      return {
        date: new Date(),
        tag: "ERROR",
        type: "error" as LogType,
        args: ["Parse Error"],
        message: "Failed to parse log string",
      } as LogObject;
    }
  }

  public dispose() {
    for (const stream of Object.values(this.streams)) {
      stream.close();
    }
  }

  public read(log: LogType | "master", parse: true): AsyncGenerator<LogObject>;
  public read(log: LogType | "master", parse: false): AsyncGenerator<string>;
  public async *read(log: LogType | "master", parse: boolean = true): AsyncGenerator<LogObject | string> {
    if (!this.logs.has(log)) throw new Error(`Log ${log} does not exist`);

    const stream = createReadStream(path.join(`./logs/${log}.log`));
    const rl = createInterface({
      input: stream,
      crlfDelay: Infinity,
    });

    let currentLog = "";

    for await (const line of rl) {
      if (line.trim() === "---") {
        if (currentLog.trim().length > 0) {
          yield this.parseLogString(currentLog);
        }
        currentLog = "";
      } else {
        currentLog += line + "\n";
      }
    }

    // Handle the last log if exists
    if (currentLog.trim().length > 0) {
      if (parse) {
        yield this.parseLogString(currentLog);
      } else {
        yield currentLog;
      }
    }

    stream.close();
  }

  public async clear(log?: LogType | "master"): Promise<void> {
    const clearLog = async (logName: string) => {
      if (!this.logs.has(logName)) throw new Error(`Log ${logName} does not exist`);
      return new Promise<void>((resolve, reject) => {
        this.streams[logName]?.close();
        // Overwrite file by opening with 'w' flag
        const stream = createWriteStream(path.join(`./logs/${logName}.log`), { flags: "w" });
        stream.on("open", () => {
          this.streams[logName] = stream;
          resolve();
        });
        stream.on("error", reject);
      });
    };

    if (log) {
      await clearLog(log);
    } else {
      await Promise.all(Array.from(this.logs).map((logName) => clearLog(logName)));
    }
  }

  public tail(log: LogType, lines: number): LogObject[] {
    if (!this.logs.has(log)) throw new Error(`Log ${log} does not exist`);
    const logs: LogObject[] = [];
    try {
      // Multiply lines by 6 because each log entry is approximately 6 lines
      const adjustedLines = (lines + 1) * 6;
      const logString = execSync(getCommand("tail", adjustedLines, log)).toString();

      const logEntries = logString.split(/---\r?\n/).filter((entry) => entry.trim().length > 0);

      for (const entry of logEntries) {
        logs.push(this.parseLogString(entry));
      }

      return logs;
    } catch (e) {
      consola.error(e);
      return logs;
    }
  }

  public async grep(pattern: string, log: LogType | "master"): Promise<LogObject[]> {
    if (!this.logs.has(log)) throw new Error(`Log ${log} does not exist`);
    const logs: LogObject[] = [];
    try {
      const lines = this.read(log, false);
      // Parse matching entries
      for await (const entry of lines) {
        if (entry.includes(pattern)) {
          logs.push(this.parseLogString(entry + "---\n"));
        }
      }

      return logs;
    } catch (e) {
      consola.error(e);
      return logs;
    }
  }

  // Optional: Add a utility method for better grep functionality
  public advancedGrep(options: {
    pattern: string;
    log: string;
    caseSensitive?: boolean;
    field?: "message" | "args" | "tag" | "type";
  }): LogObject[] {
    if (!this.logs.has(options.log)) {
      throw new Error(`Log ${options.log} does not exist`);
    }

    const logs: LogObject[] = [];
    try {
      const fileContent = readFileSync(`./logs/${options.log}.log`, "utf-8");
      const logEntries = fileContent.split("---\n").filter((entry) => entry.trim().length > 0);

      for (const entry of logEntries) {
        const logObject = this.parseLogString(entry + "---\n");
        let matches = false;

        if (options.field) {
          const fieldValue =
            options.field === "args" ? JSON.stringify(logObject.args) : String(logObject[options.field]);

          matches = options.caseSensitive
            ? fieldValue.includes(options.pattern)
            : fieldValue.toLowerCase().includes(options.pattern.toLowerCase());
        } else {
          const fullText = entry + "---\n";
          matches = options.caseSensitive
            ? fullText.includes(options.pattern)
            : fullText.toLowerCase().includes(options.pattern.toLowerCase());
        }

        if (matches) {
          logs.push(logObject);
        }
      }

      return logs;
    } catch (e) {
      consola.error(e);
      return logs;
    }
  }

  public getLogsByDate(date: Date, log: LogType | "master") {
    try {
      const dateString = date.toISOString().split("T")[0];
      if (!dateString) return undefined;
      return this.grep(dateString, log);
    } catch (e) {
      consola.error(e);
      return undefined;
    }
  }

  public getLogsByDateRange(start: Date, end: Date, log: LogType | "master" = "master") {
    try {
      const startString = start.toISOString().split("T")[0];
      const endString = end.toISOString().split("T")[0];
      return this.grep(`${startString}.*${endString}`, log);
    } catch (e) {
      consola.error(e);
      return undefined;
    }
  }

  public getLogsByDateAndTime(date: Date, log: LogType | "master" = "master") {
    try {
      const dateString = date.toISOString().split("T")[0];
      const timeString = date.toISOString().split("T")[1]?.split(".")[0];
      return this.grep(`${dateString}.*${timeString}`, log);
    } catch (e) {
      consola.error(e);
      return undefined;
    }
  }

  public getLogByTimestamp(timestamp: string, log: LogType | "master" = "master") {
    try {
      return this.grep(timestamp, log);
    } catch (e) {
      consola.error(e);
      return undefined;
    }
  }

  public getLogsByMessage(message: string, log: LogType | "master" = "master") {
    try {
      return this.grep(message, log);
    } catch (e) {
      consola.error(e);
      return undefined;
    }
  }

  public getLogsByTag(tag: string, log: LogType | "master" = "master") {
    try {
      return this.grep(tag, log);
    } catch (e) {
      consola.error(e);
      return undefined;
    }
  }
}
