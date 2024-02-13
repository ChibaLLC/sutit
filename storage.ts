import {isLinux, isDevelopment} from "std-env";

const forceRedis = process.env.FORCE_REDIS?.toLowerCase() === "true";

const storage = ((isLinux && isDevelopment) || forceRedis ) ? useStorage("redis"): useStorage("file");

export default storage;