import db from "~~/server/db";
import {
	formFieldResponses,
	formGroupResponses,
	formGroups,
	formResponses,
	formResponsesView,
	storeResponsesView,
} from "~~/server/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import { getFormByUlid } from "../../../utils/queries";

export async function getFormResponses(formUlId: string) {
	const form = await getFormByUlid(formUlId);
	if (!form) {
		throw createError({
			statusCode: 404,
			message: "Form Not Found",
		});
	}
	const form_responses_promise = db
		.select({
			responseUlid: formResponses.ulid,
			formUlid: formFieldResponses.formUlid,
			value: formFieldResponses.value,
			pricePaid: formResponses.pricePaid,
			field: formFieldResponses.field,
			date: formResponses.createdAt,
		})
		.from(formResponses)
		.leftJoin(formFieldResponses, eq(formResponses.ulid, formFieldResponses.formResponseUlid))
		.where(eq(formFieldResponses.formUlid, formUlId)) // 👈 filter by formUlId
		.orderBy(desc(formResponses.createdAt));

	const store_response_promise = db
		.select()
		.from(storeResponsesView)
		.where(eq(storeResponsesView.formUlid, formUlId))
		.orderBy(desc(storeResponsesView.date));
	const group_responses_promise = db
		.select({
			responseUlid: formGroupResponses.responseUlid,
			groupName: formGroups.groupName,
			invites: formGroups.invites,
			paymentUlid: formGroups.paymentUlid,
			formGroupUlid: formGroups.ulid,
			// Adding response information
			responseCreatedAt: formResponses.createdAt,
			responsePricePaid: formResponses.pricePaid,
			// We'll get the field responses as an array of related records
			fieldResponses: sql<any>`
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            'ulid', ffr.ulid,
            'field', ffr.field,
            'fieldUlid', ffr.field_ulid,
            'value', ffr.value
          )
        )
        FROM ${formFieldResponses} AS ffr
        WHERE ffr.form_response_ulid = ${formGroupResponses.responseUlid}
      )
    `,
		})
		.from(formGroupResponses)
		.where(eq(formGroupResponses.formUlid, formUlId))
		.innerJoin(formGroups, eq(formGroupResponses.formGroupUlid, formGroups.ulid))
		.leftJoin(formResponses, eq(formGroupResponses.responseUlid, formResponses.ulid));

	const [form_responses, store_response, group_responses] = await Promise.all([
		form_responses_promise,
		store_response_promise,
		group_responses_promise,
	]);

	return {
		form_responses,
		store_response,
		group_responses,
		form,
	};
}
