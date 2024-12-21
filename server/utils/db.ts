import { type TableConfig, type SQL, type Table, and, eq, or } from "drizzle-orm";
import db from "../db";

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

type TableWithFields<T extends TableConfig> = {
	[Key in keyof T["columns"]]: TypeFromLiteral<T["columns"][Key]["dataType"]> | null;
};

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
