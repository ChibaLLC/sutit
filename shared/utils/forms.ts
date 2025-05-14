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

	// Iterate over form.pages to map the fields
	for (const key in form.pages) {
		const page = form.pages[key];
		if (page) {
			// For each field in the page, we are mapping by 'ulid'
			page.forEach((element) => {
				// Use 'ulid' as the unique identifier for the map key
				if (element.ulid) {
					map.set(element.ulid, element); // Map the element by its 'ulid'
				}
			});
		}
	}
	console.log(map);

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
				group.push(r);
			}
		});
		formResponses.push(group);
	});
	return formResponses;
}
export function groupByResponseIdAsObjects(
	responses: Awaited<ReturnType<typeof getFormResponses>>["form_responses"],
	groupResponses: any[] = [],
) {
	// Extract unique response IDs
	const responseIds = [...new Set(responses.map((r) => r.responseUlid))];

	// Create a map of responseUlid -> groupName for quick lookup
	const groupNameMap = new Map();
	groupResponses.forEach((group) => {
		groupNameMap.set(group.responseUlid, {
			groupName: group.groupName || null,
			formGroupUlid: group.formGroupUlid || null,
			invites: group.invites || [],
		});
	});

	// Group the responses and add groupName information
	const formResponses = responseIds.map((id) => {
		// Find all responses with this ID
		const responsess = responses.filter((r) => r.responseUlid === id);

		// Get group info if it exists
		const groupInfo = groupNameMap.get(id) || { groupName: null, formGroupUlid: null, invites: [] };

		// Return an object with both the responses and group information
		return {
			responseUlid: id,
			groupName: groupInfo.groupName,
			formGroupUlid: groupInfo.formGroupUlid,
			invites: groupInfo.invites,
			responses: responsess,
		};
	});

	return formResponses;
}

export function getFormStoreResponses(
	responseUlid: string,
	storeResponses: Awaited<ReturnType<typeof getFormResponses>>["store_response"],
) {
	const formStoreResponses: Awaited<ReturnType<typeof getFormResponses>>["store_response"] = [];
	storeResponses.forEach((res) => {
		if (res.formResponseUlid == responseUlid) {
			formStoreResponses.push(res);
		}
	});
	return formStoreResponses;
}
