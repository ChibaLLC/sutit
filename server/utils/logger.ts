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
import { consola, createConsola, type LogObject, type LogType } from "consola";
import { execSync } from "node:child_process";
import type { NitroApp } from "nitropack/types";

export class Logger {
	private logs = new Set<string>(["log", "info", "success", "warn", "debug", "error", "fatal", "master"]);
	private streams: {
		[key: string]: WriteStream;
	};

	set addLog(log: string) {
		this.logs.add(log);
		this.streams = this.makeStreams();
	}

	constructor(app?: NitroApp) {
		app?.hooks.hookOnce("close", () => {
			this.dispose();
		});

		if (isVercel) {
			this.streams = {} as typeof this.streams;
			return;
		}

		this.loadLogFiles();
		this.streams = this.makeStreams();
	}

	private loadLogFiles() {
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
		if (import.meta.client) {
            // @ts-expect-error
            return consola[logObj.type](...logObj.args);
        };

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

			// Extract basic parts using regex
			const timestampMatch = logString.match(/\[(.*?)\]/);
			const tagTypeMatch = logString.match(/\] (.*?):(.*?)\n/);
			const argsMatch = logString.match(/Args:\n([\s\S]*?)\nMessage:/);
			const messageMatch = logString.match(/Message: (.*?)\n---\n/);

			if (!timestampMatch || !tagTypeMatch || !argsMatch) {
				throw new Error("Invalid log format");
			}

			if (!argsMatch[1] || !timestampMatch[1] || !tagTypeMatch[1] || !tagTypeMatch[2]) {
				throw new Error("Unable to parse logs");
			}
			// Parse arguments
			const argsString = argsMatch[1].trim();
			const args = argsString
				.split("\n")
				.map((line) => line.trim())
				.filter((line) => line.length > 0)
				.map(parseValue);

			return {
				date: new Date(timestampMatch[1]),
				tag: tagTypeMatch[1].trim(),
				type: tagTypeMatch[2].trim() as LogType,
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
				level: 1,
			};
		}
	}

	public dispose() {
		for (const stream of Object.values(this.streams)) {
			stream.close();
		}
	}

	public async *read(log: LogType): AsyncGenerator<LogObject> {
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
			yield this.parseLogString(currentLog);
		}

		stream.close();
	}

	public tail(log: LogType, lines: number): LogObject[] {
		if (!this.logs.has(log)) throw new Error(`Log ${log} does not exist`);
		const logs: LogObject[] = [];
		try {
			// Multiply lines by 6 because each log entry is approximately 6 lines
			const adjustedLines = lines * 6;
			const logString = execSync(`tail -n ${adjustedLines} ./logs/${log}.log`).toString();

			// Split by separator and process each log entry
			const logEntries = logString.split("---\n").filter((entry) => entry.trim().length > 0);

			// Take only the requested number of entries from the end
			const relevantEntries = logEntries.slice(-lines);

			for (const entry of relevantEntries) {
				logs.push(this.parseLogString(entry + "---\n"));
			}

			return logs;
		} catch (e) {
			consola.error(e);
			return logs;
		}
	}

	public grep(pattern: string, log: string): LogObject[] {
		if (!this.logs.has(log)) throw new Error(`Log ${log} does not exist`);
		const logs: LogObject[] = [];
		try {
			// Read the entire file content
			const fileContent = readFileSync(`./logs/${log}.log`, "utf-8");

			// Split the content into individual log entries
			const logEntries = fileContent.split("---\n").filter((entry) => entry.trim().length > 0);

			// Filter entries that match the pattern
			const matchingEntries = logEntries.filter((entry) => entry.toLowerCase().includes(pattern.toLowerCase()));

			// Parse matching entries
			for (const entry of matchingEntries) {
				logs.push(this.parseLogString(entry + "---\n"));
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

	public getLogsByDate(date: Date, log: string = "master"): LogObject[] | undefined {
		try {
			const dateString = date.toISOString().split("T")[0];
			if (!dateString) return undefined;
			return this.grep(dateString, log);
		} catch (e) {
			consola.error(e);
			return undefined;
		}
	}

	public getLogsByDateRange(start: Date, end: Date, log: string = "master"): LogObject[] | undefined {
		try {
			const startString = start.toISOString().split("T")[0];
			const endString = end.toISOString().split("T")[0];
			return this.grep(`${startString}.*${endString}`, log);
		} catch (e) {
			consola.error(e);
			return undefined;
		}
	}

	public getLogsByDateAndTime(date: Date, log: string = "master"): LogObject[] | undefined {
		try {
			const dateString = date.toISOString().split("T")[0];
			const timeString = date.toISOString().split("T")[1]?.split(".")[0];
			return this.grep(`${dateString}.*${timeString}`, log);
		} catch (e) {
			consola.error(e);
			return undefined;
		}
	}

	public getLogByTimestamp(timestamp: string, log: string = "master"): LogObject[] | undefined {
		try {
			return this.grep(timestamp, log);
		} catch (e) {
			consola.error(e);
			return undefined;
		}
	}

	public getLogsByMessage(message: string, log: string = "master"): LogObject[] | undefined {
		try {
			return this.grep(message, log);
		} catch (e) {
			consola.error(e);
			return undefined;
		}
	}

	public getLogsByTag(tag: string, log: string = "master"): LogObject[] | undefined {
		try {
			return this.grep(tag, log);
		} catch (e) {
			consola.error(e);
			return undefined;
		}
	}

	get logger() {
		return createConsola({
			level: +999,
			reporters: [
				{
					log: (logObj: LogObject) => {
						this.log(logObj)
					},
				},
				{
					log: (logObj: LogObject) => {
						const { type, ...rest } = logObj;
						const initial = consola.level;
						consola.level = rest.level;
						const log = rest.message ? [rest.message, ...rest.args] : rest.args;
						// @ts-expect-error
						consola[type](...log)
						consola.level = initial;
					},
				},
				// TODO: add a reporter that sends logs to a remote server or another safe place, and another that emails fatal logs to the developer
			],
		});
	}
}
