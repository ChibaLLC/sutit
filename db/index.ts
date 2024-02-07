import {credentials} from '../drizzle.config'
import mysql2 from 'mysql2/promise'
import {drizzle} from "drizzle-orm/mysql2"

const connection = mysql2.createPool({
    ...credentials,
    waitForConnections: true,
    connectionLimit: 10,
    ssl: undefined
})

export default drizzle(connection)