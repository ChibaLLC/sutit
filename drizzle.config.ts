import { defineConfig } from "drizzle-kit";
import { assertEnv } from "./shared/utils/data";

var url = new URL(assertEnv(process.env.DATABASE_URL, "DATABASE_URL"));
export const credentials = url;
export default defineConfig({
	schema: "./server/db/schema/index.ts",
	dbCredentials: {
		url: url.href,
	},
	verbose: true,
	strict: false,
	out: "./server/db/drizzle",
	dialect: "postgresql",
});
