import fileStorage from "~~/storage/file";
import redisStorage from "~~/storage/redis";

const storage = {
	get file() {
		return fileStorage;
	},
	get redis() {
		return redisStorage;
	},
};

export default storage;
