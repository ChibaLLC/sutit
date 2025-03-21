import type { getFormResponses } from "~~/server/api/forms/[formUlid]/submissions/utils/queries";

export function bubblePrice(
	group_responses: Awaited<ReturnType<typeof getFormResponses>>["group_responses"],
	response: Awaited<ReturnType<typeof getFormResponses>>["form_responses"][number] | undefined,
) {
	if (!response) return "UNKNOWN";
	const group = group_responses.find((group_response) => group_response.responseUlid === response.responseUlid);
	if (group) {
		return `Via group ${group.groupName}`;
	} else {
		return `${response.pricePaid}`;
	}
}

export function collectFields(form: Awaited<ReturnType<typeof getFormResponses>>["form"]) {
	const map = new Map<string, (typeof form.pages)[number][number]>();
	for (const key in form.pages) {
		const page = form.pages[key];
		if (page) {
			page.forEach((element) => {
				map.set(element.fieldUlid!, element);
			});
		}
	}

	return map;
}

export function getData(form_responses: Awaited<ReturnType<typeof getFormResponses>>["form_responses"]) {
	if (!form_responses) return [];
	const rows = new Map<string, (typeof form_responses)[number][]>();
	form_responses.forEach((response) => {
		const row = rows.get(response.responseUlid);
		if (row) {
			row.push(response);
		} else {
			rows.set(response.responseUlid, [response]);
		}
	});
	return rows;
}

export function* getResponseFields(
	data: Awaited<ReturnType<typeof getFormResponses>>["form_responses"],
	fields: ReturnType<typeof collectFields>,
) {
	for (const datum of data) {
		const field = fields.get(datum.fieldUlid);
		let result = {};
		if (field) {
			result = {
				...datum,
				...field,
			};
		} else {
			console.warn(datum.fieldUlid, "Reply with this fieldUlid not found in the created form fields");
		}
		yield result as typeof field & typeof datum;
	}
}

export function hasPayment(form: Awaited<ReturnType<typeof getFormResponses>>["form"]) {
	return (
		form.meta.price_individual !== 0 ||
		Object.values(form.stores || {}).some((store) => store.some((item) => item.price !== 0)) ||
		form.meta.price_group !== 0
	);
}

export function groupByResponseId(responses: Awaited<ReturnType<typeof getFormResponses>>["form_responses"]) {
	const responsesIds: string[] = [];
	responses.forEach((r) => {
		// Find unique repnse Ids
		if (!responsesIds.includes(r.responseUlid)) {
			responsesIds.push(r.responseUlid);
		}
	});
	// Group the responses using the response Ids
	const formResponses: Awaited<ReturnType<typeof getFormResponses>>["form_responses"][] = [];

	responsesIds.forEach((id) => {
		let group: any[] = [];
		responses.forEach((r) => {
			if (id == r.responseUlid) {
				console.log(id, r.responseUlid);
				group.push(r);
			}
		});
		formResponses.push(group);
	});
	return formResponses;
}
