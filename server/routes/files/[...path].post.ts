import { readFiles } from "h3-formidable";
import {joinURL} from "ufo"
import { ulid } from "ulid";

export default defineEventHandler(async (event) => {
	await useAuth(event);
	
	let folder = event.context.params?.path;
	if (!folder) folder = "/";
	const { files } = await readFiles(event);
	const paths = [];
	for (const key in files) {
		const items = files[key];
		for (const item of items || []) {
			const path = joinURL(folder, item.originalFilename || ulid())
			$storage.file.setItemRaw(path, item);
			paths.push(path);
		}
	}

	return paths.map((path) => {
		return `/files/${path}`;
	});
});
