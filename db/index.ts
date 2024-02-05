import {credentials} from '../drizzle.config'
import mysql2 from 'mysql2/promise'
import {drizzle, MySql2Database} from "drizzle-orm/mysql2"

const pool = mysql2.createPool({
    ...credentials,
    waitForConnections: true,
    connectionLimit: 10,
    ssl: {
        rejectUnauthorized: false
    }
})

export default drizzle(pool)