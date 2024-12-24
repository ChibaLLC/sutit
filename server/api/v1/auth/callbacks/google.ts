import { googleAuth } from "~~/server/api/v1/auth/utils";

export default defineEventHandler(async (event) => {
	const data = await readBody(event);
	return await googleAuth(data);
});
