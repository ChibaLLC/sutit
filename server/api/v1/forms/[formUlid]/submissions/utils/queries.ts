import db from "~~/server/db";
import { formResponses, stores, groupFormResponses, prepaidForms } from "~~/server/db/drizzle/schema";
import { desc, eq } from "drizzle-orm";

export async function getFormResponses(formUlId: string) {
    const form_responses = await db.select().from(formResponses)
        .where(eq(formResponses.formUlid, formUlId))
        .leftJoin(stores, eq(stores.formUlid, formResponses.formUlid))
        .orderBy(desc(formResponses.createdAt))
    const group_responses = await db.select()
        .from(prepaidForms)
        .where(eq(prepaidForms.formUlid, formUlId))
        .leftJoin(groupFormResponses, eq(prepaidForms.groupFormResponseId, groupFormResponses.id))
    return {
        form_responses,
        group_responses
    }
}