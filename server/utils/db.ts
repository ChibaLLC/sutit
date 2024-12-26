import { type TableConfig, type SQL, type Table, getTableColumns, sql } from "drizzle-orm";
import db from "../db";
import type { PgTable } from "drizzle-orm/pg-core";
import type { SQLiteTable } from "drizzle-orm/sqlite-core";

type TypeFromLiteral<T> = T extends "string"
	? string
	: T extends "number"
	? number
	: T extends "boolean"
	? boolean
	: T extends "bigint"
	? bigint
	: T extends "float"
	? number
	: T extends "double"
	? number
	: T extends "real"
	? number
	: T extends "date"
	? Date
	: T extends "datetime"
	? Date
	: T extends "timestamp"
	? Date
	: T extends "blob"
	? Buffer
	: T extends "buffer"
	? Buffer
	: T extends "json"
	? any
	: T extends "jsonb"
	? any
	: T extends "array"
	? any[]
	: T extends "object"
	? Record<string, any>
	: never;

type TableWithColumns<T extends TableConfig> = Table<T> & {
	[Key in keyof T["columns"]]: T["columns"][Key];
};

export async function getFirstOr404<T extends TableConfig>(table: TableWithColumns<T>, conditions?: SQL) {
	const data = await db.select().from(table).where(conditions);

	if (!data?.length)
		throw createError({
			statusCode: 404,
			message: "Requested resource not found",
		});
	return data.at(0)!;
}


export const updateConflictedColumns = <T extends PgTable | SQLiteTable, Q extends keyof T["_"]["columns"]>(
	table: T,
	columns: Q[]
) => {
	const cls = getTableColumns(table);
	return columns.reduce((acc, column) => {
		const colName = assert(cls[column]?.name);
		acc[column] = sql.raw(`excluded.${colName}`);
		return acc;
	}, {} as Record<Q, SQL>);
};