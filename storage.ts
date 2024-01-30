import {isLinux} from "std-env";

const storage = isLinux ? useStorage("redis"): useStorage("file");

export default storage;