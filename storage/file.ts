/// no-auto-imports
import { createStorage, type Storage, type Unwatch, type WatchEvent } from "unstorage";
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
import githubDriver from "unstorage/drivers/github";

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
	abstract hasItem(key: string): MaybePromise<boolean>;
	abstract getItem(key: string | undefined): Promise<StorageItem>;
	abstract setItem(
		key: string,
		value:
			| string
			| NodeJS.ArrayBufferView
			| Iterable<string | NodeJS.ArrayBufferView>
			| AsyncIterable<string | NodeJS.ArrayBufferView>
			| Stream
	): Promise<boolean>;
	abstract setItemRaw(key: string, value: PersistentFile | Blob | Base64EncodedDataString): Promise<void>;
	abstract removeItem(key: string): Promise<void>;
	abstract getKeys(base: string): Promise<string[]>;
	abstract clear(base: string): Promise<void>;
	abstract dispose(): Promise<void>;
	abstract watch(callback: (event: "remove" | "update", filename: string) => void): MaybePromise<() => void>;
}

class GitHubStorage implements AbstractFileStorage {
	protected githubStore: Storage;
	constructor(options: { repo: string; branch: string; dir: string; token: string }) {
		this.githubStore = createStorage({
			driver: githubDriver({
				repo: options.repo,
				branch: options.branch,
				dir: options.dir,
				token: options.token,
			}),
		});
	}

	hasItem(key: string): MaybePromise<boolean> {
		return this.githubStore.hasItem(key);
	}

	async getItem(key: string | undefined): Promise<StorageItem> {
		if (!key)
			return {
				readStream: undefined,
				readLine: undefined,
				value: undefined,
				stats: undefined,
				readableStream: undefined,
			};
		let item = await this.githubStore.getItem(key);
		if (item == null) {
			return {
				readStream: undefined,
				readLine: undefined,
				value: undefined,
				stats: undefined,
				readableStream: undefined,
			};
		}

		const readStream = createReadStream(<string>item);
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
			value: () => readFile(<string>item),
			stats: {
				...(await stat(<string>item)),
				mime: (getMimeType(<string>item) || "bin") as MimeType,
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
	): Promise<boolean> {
		try {
			await this.githubStore.setItem(key, value);
			return true;
		} catch (e: any) {
			console.log(e);
			return false;
		}
	}

	async setItemRaw(key: string, value: PersistentFile | Blob | Base64EncodedDataString): Promise<void> {
		try {
			await this.githubStore.setItemRaw(key, value);
		} catch (e: any) {
			console.log(e);
		}
	}

	async removeItem(key: string): Promise<void> {
		try {
			await this.githubStore.removeItem(key);
		} catch (e: any) {}
	}

	async getKeys(base: string): Promise<string[]> {
		try {
			const keys = await this.githubStore.getKeys(base);
			return keys;
		} catch (e: any) {
			console.log(e);
			return [] as string[];
		}
	}

	async clear(base: string): Promise<void> {
		try {
			await this.githubStore.clear(base);
		} catch (e: any) {
			console.log(e);
		}
	}

	async dispose(): Promise<void> {
		try {
			await this.githubStore.dispose();
		} catch (e: any) {
			console.log(e);
		}
	}

	watch(callback: (event: WatchEvent, key: string) => void) {
		return this.githubStore.watch(callback);
	}
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

	private location(destination: string) {
		const basePath = join(this.root, destination).replace(/:/g, sep);
		return resolve(basePath);
	}

	hasItem(key: string) {
		try {
			return existsSync(this.location(key));
		} catch (e) {
			console.error(e);
			return false;
		}
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
		try {
			const target = this.location(key);
			const folder = target.split(sep).slice(0, -1).join(sep);
			if (!existsSync(folder)) {
				await mkdir(folder, { recursive: true });
			}
			await writeFile(target, value);
			return true;
		} catch (e) {
			console.error(e);
			return false;
		}
	}
	async setItemRaw(key: string, value: PersistentFile | Blob | Base64EncodedDataString) {
		try {
			const fileLocation = this.location(key);
			const folder = fileLocation.split(sep).slice(0, -1).join(sep);
			if (!existsSync(folder)) {
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
		} catch (e) {
			console.error(e);
		}
	}
	async removeItem(key: string) {
		return await unlink(this.location(key)).catch(console.error);
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
				const stats = await lstat(file).catch((e) => {
					console.error(e);
					return null;
				});
				if (stats?.isDirectory()) {
					deleteFiles(file);
				}

				unlink(file).catch(console.error);
			}
		}

		return await deleteFiles(this.location(base));
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

// const storage = isDevelopment
// 	? new LocalFileStorage({
// 			root: "./filestore",
// 	  })
// 	: new GitHubStorage({
// 			repo: "YallanYati/images",
// 			branch: "main",
// 			dir: "/images",
// 			token: getEnv("GITHUB_API_TOKEN"),
// 	  });

const storage = new LocalFileStorage({
	root: "./filestore",
});
export default storage;
