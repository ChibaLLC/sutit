import { withDrawals } from "~~/server/db/schema/schema";
import db from "~~/server/db";
import type { Drizzle } from "~~/server/db/types";

export async function insertWithdrawal(amount: number, transactionCode: string) {
	if (!amount || !transactionCode) throw new Error("Amount and transaction code are required");
	return db
		.insert(withDrawals)
		.values({
			amount,
			transactionCode,
		} satisfies Drizzle.WithDrawals.insert)
		.execute();
}
