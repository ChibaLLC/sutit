import { getStats } from "../utils";

export default defineEventHandler(async (event) => {
	const { user } = await useAuth(event);

	const stats = await getStats(user.ulid).catch((err) => err as Error);
	if (stats instanceof Error) {
		throw createError({
            statusCode: 500,
            message: stats.message
        })
	}
	return stats;
});
