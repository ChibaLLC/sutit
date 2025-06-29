import { type TableConfig, type SQL, type Table, getTableColumns, sql } from "drizzle-orm";
import db from "../db";
import type { PgTable } from "drizzle-orm/pg-core";
import type { SQLiteTable } from "drizzle-orm/sqlite-core";

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