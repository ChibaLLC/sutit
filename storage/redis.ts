import { Boolish } from "~~/shared/utils/data";
import { createStorage } from "unstorage";
import redisDriver from "unstorage/drivers/redis";

function createRedisStorage() {
	return createStorage({
		driver: redisDriver({
			base: "unstorage",
			host: process.env.REDIS_HOST ?? "localhost",
			port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379,
			password: process.env.REDIS_PASSWORD,
		}),
	});
}
const storage = Boolish(process.env.USE_REDIS) ? createRedisStorage() : useStorage();
export default storage;
