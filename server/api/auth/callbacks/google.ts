import { googleAuth } from "~~/server/api/auth/utils";

export default defineEventHandler(async (event) => {
	const data = await readBody(event);
	return googleAuth(data);
});
