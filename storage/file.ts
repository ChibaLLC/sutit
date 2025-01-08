import { createStorage, defineDriver } from "unstorage";
import { isDevelopment } from "~~/server/utils/env";
import ghDriver from "unstorage/drivers/github";
import { existsSync, watch } from "fs";
import { readFile, writeFile, rename, unlink, readdir, lstat, mkdir } from "fs/promises";
import { join, resolve, sep } from "pathe";
import { type Stream } from "node:stream";
import { mkdirSync, createReadStream } from "node:fs";
import glob from "fast-glob";
import { createInterface, type Interface } from "node:readline";
import { stat } from "node:fs/promises";
import type { MimeType } from "file-type";
import type { File as PersistentFile } from "formidable";
import type { StaticAssetMeta } from "h3";
import { isBase64DataEncodedString, getMimeType } from "~~/shared/utils/data";

export async function saveBlobToFile(blob: Blob, filePath: string) {
	const arrayBuffer = await blob.arrayBuffer();
	const buffer = Buffer.from(arrayBuffer);
	await writeFile(filePath, buffer);
}

type StorageItem = AllOrNothing<{
	readStream: NodeJS.ReadableStream;
	readableStream: ReadableStream;
	readLine: () => Interface;
	value: () => Promise<Buffer>;
	stats: { mime: MimeType } & MaybePromise<StaticAssetMeta | undefined>;
}>;
abstract class AbstractFileStorage {
	abstract location(destination: string): string;
	abstract hasItem(key: string): boolean;
	abstract getItem(key: string | undefined): Promise<StorageItem>;
	abstract setItem(
		key: string,
		value:
			| string
			| NodeJS.ArrayBufferView
			| Iterable<string | NodeJS.ArrayBufferView>
			| AsyncIterable<string | NodeJS.ArrayBufferView>
			| Stream
	): Promise<void>;
	abstract setItemRaw(key: string, value: PersistentFile | Blob | string): Promise<void>;
	abstract removeItem(key: string): Promise<void>;
	abstract getKeys(base: string): Promise<string[]>;
	abstract clear(base: string): Promise<void>;
	abstract dispose(): Promise<void>;
	abstract watch(callback: (event: "remove" | "update", filename: string) => void): MaybePromise<() => void>;
}

class LocalFileStorage implements AbstractFileStorage {
	protected root: string;
	constructor(options?: { root: string }) {
		if (!options || !options.root) {
			options = { root: "./" };
		}
		if (!existsSync(options.root)) {
			mkdirSync(options.root, { recursive: true });
		}
		this.root = options.root;
	}

	location(destination: string) {
		const basePath = join(this.root, destination).replace(/:/g, sep);
		return resolve(basePath);
	}

	hasItem(key: string) {
		return existsSync(this.location(key));
	}

	async getItem(key: string | undefined): Promise<StorageItem> {
		if (!key || !this.hasItem(key)) {
			return {
				readStream: undefined,
				readLine: undefined,
				value: undefined,
				stats: undefined,
				readableStream: undefined,
			};
		}

		const target = this.location(key);
		const readStream = createReadStream(target);
		const readableStream = new ReadableStream({
			start(controller) {
				readStream.on("data", (chunk) => {
					controller.enqueue(chunk);
				});

				readStream.on("end", () => {
					controller.close();
				});

				readStream.on("error", (err) => {
					controller.error(err);
				});
			},
			cancel() {
				readStream.destroy();
			},
		});

		return {
			readStream,
			readableStream,
			readLine: () =>
				createInterface({
					input: readStream,
					crlfDelay: Infinity,
				}),
			value: () => readFile(target),
			stats: {
				...(await stat(target)),
				mime: (getMimeType(target) || "bin") as MimeType,
			},
		};
	}
	async setItem(
		key: string,
		value:
			| string
			| NodeJS.ArrayBufferView
			| Iterable<string | NodeJS.ArrayBufferView>
			| AsyncIterable<string | NodeJS.ArrayBufferView>
			| Stream
	) {
		const target = this.location(key);
		const folder = target.split(sep).slice(0, -1).join(sep);
		if (!existsSync(folder)) {
			await mkdir(folder, { recursive: true });
		}
		return await writeFile(target, value);
	}
	async setItemRaw(key: string, value: PersistentFile | Blob | string) {
		const fileLocation = this.location(key);
		if (!existsSync(fileLocation)) {
			const folder = fileLocation.split(sep).slice(0, -1).join(sep);
			await mkdir(folder, { recursive: true });
		}

		if (hasOwnProperties(value, ["filepath"])) {
			await rename(value.filepath, fileLocation);
		} else if (value instanceof Blob) {
			await saveBlobToFile(value, fileLocation);
		} else if (isBase64DataEncodedString(value)) {
			const { blob } = await base64ToBlob(value);
			if (!blob) return log.error("Unable to convert data to blob: ", value.slice(0, 100));
			await saveBlobToFile(blob, fileLocation);
		} else {
			await writeFile(fileLocation, value);
		}
	}
	async removeItem(key: string) {
		return await unlink(this.location(key));
	}
	async getKeys(base: string) {
		try {
			const fullBasePath = this.location(base);
			const files = await glob("**/*", {
				cwd: fullBasePath,
				absolute: false,
				onlyFiles: true,
			});

			return files.map((file) => this.location(join(base, file)));
		} catch (e) {
			console.error("Error getting keys:", e);
			return [];
		}
	}
	async clear(base: string) {
		async function deleteFiles(directory: string) {
			if (!existsSync(directory)) return;

			const files = await readdir(directory);

			for (const file of files) {
				const stats = await lstat(file).catch((e) => null);
				if (stats?.isDirectory()) {
					deleteFiles(file);
				}

				unlink(file);
			}
		}

		return await deleteFiles(this.root);
	}
	async dispose() {}
	async watch(callback: (event: "remove" | "update", filename: string) => void) {
		const watcher = watch(this.root, { recursive: true }, (eventType, filename) => {
			if (!filename) return;
			const event = eventType === "rename" ? "remove" : "update";
			callback(event, filename);
		});

		return () => watcher.close();
	}
}

class GitHubStorage implements AbstractFileStorage {
	constructor(options: { repo: string; branch: string; dir: string; token?: string }) {}
	location(destination: string): string {
		throw new Error("Method not implemented.");
	}
	hasItem(key: string): boolean {
		throw new Error("Method not implemented.");
	}
	getItem(key: string | undefined): Promise<StorageItem> {
		throw new Error("Method not implemented.");
	}
	setItem(
		key: string,
		value:
			| string
			| NodeJS.ArrayBufferView
			| Iterable<string | NodeJS.ArrayBufferView>
			| AsyncIterable<string | NodeJS.ArrayBufferView>
			| Stream
	): Promise<void> {
		throw new Error("Method not implemented.");
	}
	setItemRaw(key: string, value: PersistentFile | Blob | string): Promise<void> {
		throw new Error("Method not implemented.");
	}
	removeItem(key: string): Promise<void> {
		throw new Error("Method not implemented.");
	}
	getKeys(base: string): Promise<string[]> {
		throw new Error("Method not implemented.");
	}
	clear(base: string): Promise<void> {
		throw new Error("Method not implemented.");
	}
	dispose(): Promise<void> {
		throw new Error("Method not implemented.");
	}
	watch(callback: (event: "remove" | "update", filename: string) => void): MaybePromise<() => void> {
		throw new Error("Method not implemented.");
	}
}
const storage = isDevelopment
	? new LocalFileStorage({
			root: "./filestore",
	  })
	: new GitHubStorage({
			repo: "YallanYati/images",
			branch: "main",
			dir: "/images",
			token: process.env.GITHUB_API_TOKEN,
	  });

export default storage;
