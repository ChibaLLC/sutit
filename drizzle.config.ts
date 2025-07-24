import { defineConfig } from "drizzle-kit";
import { assert } from "console";

function getDBCredentials() {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  assert(process.env.DB_HOST, "DB_HOST is not set");
  assert(process.env.DB_PASSWORD, "DB_PASSWORD is not set");
  assert(process.env.DB_USER, "DB_USER is not set");
  assert(process.env.DB_PORT, "DB_PORT is not set");
  assert(process.env.DB_DATABASE, "DB_DATABASE is not set");

  return `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`;
}

export const credentials = new URL(getDBCredentials());
export default defineConfig({
  schema: "./server/db/schema/index.ts",
  dbCredentials: {
    url: credentials.href,
  },
  verbose: true,
  strict: false,
  out: "./server/db/drizzle",
  dialect: "postgresql",
});
