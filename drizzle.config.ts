import { defineConfig } from 'drizzle-kit'

const configHasNullValues = (config: any) => {
    return Object.keys(config).some(key => config[key] == undefined)
}

const dbUrlString: string | undefined = process.env.DATABASE_URL;
let dbUrl: URL | undefined = undefined
try {
    dbUrl = new URL(dbUrlString || "")
} catch (e) {
    console.error('Invalid database URL or missing DATABASE_URL environment variable; this isn\'t always a problem.')
}

const config = {
    host: dbUrl?.hostname || process.env.DB_HOST,
    port: parseInt(dbUrl?.port || "0") || parseInt(process.env.DB_PORT || "0"),
    user: dbUrl?.username || process.env.DB_USER,
    password: dbUrl?.password || process.env.DB_PASSWORD,
    database: dbUrl?.pathname.replace('/', '') || process.env.DB_DATABASE
}

console.log(config)

if (configHasNullValues(config)) throw new Error('Missing database credentials. Please check your .env file.')

export const credentials = config

export default defineConfig({
    schema: "./db/drizzle/schema.ts",
    driver: 'pg',
    dbCredentials: {
        host: config.host!,
        port: config.port,
        user: config.user,
        password: config.password,
        database: config.database!
    },
    verbose: true,
    strict: true,
    out: './db/drizzle',
})