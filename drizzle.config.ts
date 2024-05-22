import { defineConfig } from 'drizzle-kit'

const configHasNullValues = (config: any) => {
    return Object.keys(config).some(key => config[key] == undefined)
}

const config = {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '0'),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
}

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