import { credentials } from "../../drizzle.config";
import postgres from "postgres";
import * as schema from "./schema";
import { drizzle } from "drizzle-orm/postgres-js";

export * from "./types";

const connection = postgres({
  ssl: isDevelopment ? false : "prefer",
  host: credentials.host,
  database: credentials.pathname.replace("/", ""),
  password: credentials.password,
  port: parseInt(credentials.port),
  username: credentials.username,
});
export default drizzle(connection, { schema });
