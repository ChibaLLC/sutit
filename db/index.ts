import {credentials} from '../drizzle.config'
import postgres from 'postgres'
import {drizzle} from "drizzle-orm/postgres-js"

const connection = postgres(credentials)

export default drizzle(connection)