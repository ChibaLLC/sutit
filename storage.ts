import {isLinux} from "std-env";

const forceRedis = process.env.FORCE_REDIS?.toLowerCase() === "true";

const storage = (isLinux || forceRedis) ? useStorage("redis"): useStorage("file");

export default storage;