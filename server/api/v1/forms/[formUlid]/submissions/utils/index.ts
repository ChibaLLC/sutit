import type { Drizzle } from "~~/server/db/types";
import { getFormResponses } from "./queries";
import excel from "exceljs";

function replaceSpecialChars(input: string): string {
	return input.replace(/[*?:\\/\[\]]/g, "_");
}

export async function constructExcel(
	{ form, form_responses, group_responses, store_response }: Awaited<ReturnType<typeof getFormResponses>>,
	user: Drizzle.User.select
) {
	const workbook = new excel.Workbook();
	workbook.creator = "Sutit Investment Limited";
	workbook.lastModifiedBy = user.name || "Unknown";
	workbook.created = new Date();

	const _hasPayment = hasPayment(form);
	const worksheet = workbook.addWorksheet(replaceSpecialChars(form.meta.formName));
	const titles = [];
	const fields = collectFields(form);
	fields.forEach(field => {
		titles.push(field.label)
	})
	if (_hasPayment) titles.push("Price");
	worksheet.addRow(titles).font = { bold: true };

	for (const [_, response] of getData(form_responses)) {
		const values: string[] = [];
		for (const field of getResponseFields(response, fields)) {
			if (Array.isArray(field.value)) {
				field.value = Object.values(field.value || {})
					.map((d) => useCapitalize(d as string))
					.join(", ");
			}
			values.push(field.value);
		}
		if (_hasPayment) {
			values.push(bubblePrice(group_responses, response.at(0)));
		}
		worksheet.addRow(values);
	}

	return workbook.xlsx;
}
