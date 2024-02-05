import { defineConfig } from 'drizzle-kit'

const configHasNullValues = (config: any) => {
    return Object.keys(config).some(key => config[key] == undefined)
}

const config = {
    host: process.env.MYSQL_HOST,
    port: parseInt(process.env.MYSQL_PORT!),
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
}

if (configHasNullValues(config)) throw new Error('Missing database credentials. Please check your .env file.')

export const credentials = config

export default defineConfig({
    schema: "./db/drizzle/schema/*",
    driver: 'mysql2',
    dbCredentials: {
        host: config.host!,
        port: config.port,
        user: config.user,
        password: config.password,
        database: config.database!,
    },
    verbose: true,
    strict: true,
    out: './db/drizzle',
})