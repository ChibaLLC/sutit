import { withDrawals } from "~~/server/db/drizzle/schema";
import db from "../../db";
import type { Drizzle } from "~~/server/db/types";

export async function insertWithdrawal(amount: number, transactionCode: string) {
    if(!amount || !transactionCode) throw new Error("Amount and transaction code are required")
    return db.insert(withDrawals).values({
        amount,
        transactionCode
    } satisfies Drizzle.WithDrawals.insert)
}