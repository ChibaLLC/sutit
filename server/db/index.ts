import {credentials} from "~~/drizzle.config";
import postgres from "postgres";
import * as schema from "./schema";
import {drizzle} from "drizzle-orm/postgres-js";

export * from "./types"

const connection = postgres({...credentials, ssl: isDevelopment ? false : "prefer"});
export default drizzle(connection, {schema});
