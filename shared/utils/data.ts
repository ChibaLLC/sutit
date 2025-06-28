import type { Item, Stores } from "@chiballc/nuxt-form-builder";
import { fileTypeFromBuffer } from "file-type";
import mimeDb from "mime-db";

export function parseData(data: any): {
	data: SocketTemplate;
	type: "json" | "string" | string;
} {
	let _data = data;
	if (typeof data === "string") {
		try {
			_data = JSON.parse(data);
		} catch (_) {
			console.warn("Invalid JSON", data);
			_data = data;
		}
	}

	if (hasRawData(_data)) {
		const decoder = new TextDecoder();
		try {
			_data = JSON.parse(decoder.decode(new Uint8Array(_data.rawData)));
		} catch (_) {
			console.warn("Invalid JSON");
		}
	}

	if (isSocketTemplate(data)) {
		return {
			data: data,
			type: "json",
		};
	}

	return _data;
}

export function hasRawData(data: any): data is { rawData: number[]; type: string } {
	return data?.rawData !== undefined;
}

export function createChannelName(...args: string[]) {
	return args.sort().join(":");
}

function isSocketTemplate(data: any): data is SocketTemplate {
	return hasOwnProperties<SocketTemplate>(data, ["type"]);
}

export function hasBoughtMerch(stores?: Stores | ReconstructedDbForm["stores"]) {
	if (!stores) return false;
	for (const key in stores) {
		for (const item of stores[key] || []) {
			if ((item as Item).carted) return true;
		}
	}
	return false;
}

export function assert<T>(value: T, message?: string): NonNullable<T> {
	if (!value) {
		message = message || "Expected a value but nullish found";
		// TODO: solve server dependancy
		if (createError) {
			throw createError({
				statusCode: 400,
				message,
			});
		} else {
			throw new Error(message);
		}
	}
	return value;
}

export function getEnv(key: keyof typeof process.env) {
	return assert(process.env[key], `Env variable ${key} not found. Please include it with a non-empty value`);
}

/**
 * Use sparingly
 * @param size
 */
export function* range(size: number) {
	for (let i = 0; i < size; i++) {
		yield i;
	}
}

function mergeUint8Arrays(arrays: Uint8Array[]): Uint8Array {
	const totalLength = arrays.reduce((sum, array) => sum + array.length, 0);
	const mergedArray = new Uint8Array(totalLength);
	let offset = 0;
	for (const array of arrays) {
		mergedArray.set(array, offset);
		offset += array.length;
	}
	return mergedArray;
}

export function inferFileExtentionFromMime(mimeType: string) {
	mimeType = mimeType.toLowerCase();
	for (const [key, value] of Object.entries(mimeDb)) {
		if (key === mimeType && value.extensions) {
			return value.extensions[0];
		}
	}
	return null;
}

export function getMimeType(extension: string) {
	const parts = extension.split(".");
	if (parts.length > 1) extension = parts[2]!;
	for (const [key, value] of Object.entries(mimeDb)) {
		if (value.extensions && value.extensions.includes(extension)) {
			return key;
		}
	}
	return null;
}

/**
 * Converts a Base64-encoded string to a Blob.
 * Automatically infers the MIME type if not provided.
 * @param base64String - The Base64-encoded string (data URI excluded).
 * @param mimeType - Optional MIME type to use (will infer if not provided).
 * @returns A promise resolving to an object containing the Blob and the inferred MIME type.
 */
export async function parseBase64Data(base64String: string | undefined, mimeType?: MimeType) {
	if (!base64String) {
		return {
			blob: undefined,
			mimeType: undefined,
			extension: undefined,
		};
	}
	const sliceSize = 512;
	const byteCharacters = atob(base64String);
	const byteArrays = [];

	for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
		const slice = byteCharacters.slice(offset, offset + sliceSize);
		const byteNumbers = new Array(slice.length);

		for (let i = 0; i < slice.length; i++) {
			byteNumbers[i] = slice.charCodeAt(i);
		}

		const byteArray = new Uint8Array(byteNumbers);
		byteArrays.push(byteArray);
	}

	if (!mimeType) {
		var result = await fileTypeFromBuffer(mergeUint8Arrays(byteArrays));
	}
	const detectedType = mimeType || result?.mime || "application/octet-stream";
	const blob = new Blob(byteArrays, { type: mimeType });

	return {
		blob,
		mimeType: detectedType,
		extension: result?.ext || inferFileExtentionFromMime(detectedType) || "bin",
	};
}

export function base64ToBlob(base64Data: string) {
	const base64 = base64Data.split(",");
	let mimeType = undefined;
	if (isBase64DataEncodedString(base64[0])) {
		const [prefix, encodingFormat] = base64[0].split(";");
		mimeType = prefix?.replace(/^data:/, "") as MimeType;
	}
	return parseBase64Data(base64[1] || base64[0], mimeType);
}

export type Base64EncodedDataString = `data:${string};base64,`;
export function isBase64DataEncodedString(input?: string): input is Base64EncodedDataString {
	if (!input) return false;
	const regex = /^data:[a-zA-Z0-9.-]+\/[a-zA-Z0-9.+-]+;base64,/;
	return regex.test(input);
}

