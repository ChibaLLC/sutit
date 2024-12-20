import db from "~~/server/db";
import {
	formResponses,
	stores,
	groupFormResponses,
	prepaidForms,
	forms,
} from "~~/server/db/schema/schema";
import { desc, eq } from "drizzle-orm";
import { getFormByUlid } from "../../../utils/queries";

export async function getFormResponses(formUlId: string) {
    const form = await getFormByUlid(formUlId)
    if (!form) throw new Error("Form Not Found")
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
        group_responses,
        form
    }
}