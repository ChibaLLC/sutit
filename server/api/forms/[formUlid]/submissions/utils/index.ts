import type { Drizzle } from "~~/server/db/types";
import { getFormResponses } from "./queries";
import excel from "exceljs";

function replaceSpecialChars(input: string): string {
	return input.replace(/[*?:\\/\[\]]/g, "_");
}

export async function constructExcel(
	{ form, form_responses, group_responses, store_response }: Awaited<ReturnType<typeof getFormResponses>>,
	user: Drizzle.User.select,
) {
	const workbook = new excel.Workbook();
	workbook.creator = "Sutit Investment Limited";
	workbook.lastModifiedBy = user.name || "Unknown";
	workbook.created = new Date();

	const _hasPayment = hasPayment(form);
	const worksheet = workbook.addWorksheet(replaceSpecialChars(form.meta.formName));
	const titles = [];
	const fields = collectFields(form);
	const rows = groupByResponseId(form_responses);
	fields.forEach((field) => {
		titles.push(field.label);
	});
	if (_hasPayment) titles.push("Price");
	worksheet.addRow(titles).font = { bold: true };

	// Grouup data
	rows.forEach((row) => {
		let values: string[] = [];
		fields.forEach((field) => {
			let rowValue = row.find((r) => r.fieldUlid == field.fieldUlid);
			if (rowValue) {
				values.push(rowValue.value ?? "");
			}
		});
		if (_hasPayment) {
			values.push(bubblePrice(group_responses, row.at(0)));
		}
		worksheet.addRow(values);
	});

	return workbook.xlsx;
}
