import { fileTypeFromBuffer, type MimeType } from "file-type";
import { extension } from "mime-types";

export function useCapitalize(str: string) {
	return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export async function bufferToBlob(buffer: Buffer, mimeType?: MimeType) {
	if (!mimeType) {
		var result = await fileTypeFromBuffer(buffer);
		var detectedType = mimeType || result?.mime || "application/octet-stream";
	} else {
		detectedType = mimeType;
	}
	const blob = new Blob([buffer], { type: detectedType });
	return {
		blob,
		mimeType: detectedType,
		extension: result?.ext || extension(detectedType) || "bin",
	};
}
