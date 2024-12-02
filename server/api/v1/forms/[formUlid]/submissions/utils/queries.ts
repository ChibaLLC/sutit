import db from "~~/server/db";
import {formResponses, stores} from "~~/server/db/drizzle/schema";
import {desc, eq} from "drizzle-orm";

export async function getFormResponses(formUlId: string) {
    return db.select().from(formResponses)
        .where(eq(formResponses.formUlid, formUlId))
        .leftJoin(stores, eq(stores.formUlid, formResponses.formUlid))
        .orderBy(desc(formResponses.createdAt))
}