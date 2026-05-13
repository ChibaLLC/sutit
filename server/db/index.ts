import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";

import * as schema from "./schema";
const db = drizzle({
  connection: {
    connectionString: process.env.DATABASE_URL!,
    ssl: false,
  },
  schema: schema,
});
export default db;
