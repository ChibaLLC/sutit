import { auth } from "~~/server/lib/auth";
import { createGroup } from "~~/server/services/group.service";
import { CreateGroupRequest } from "~~/shared/types";

export default defineEventHandler(async (event) => {
	try {
		const formId = getRouterParam(event, "id");
		if (!formId) {
			throw createError({
				statusCode: 404,
				message: "Form not found",
			});
		}
		const session = await auth.api.getSession({
			headers: event.headers,
		});
		if (!session) {
			throw createError({
				statusCode: 401,
				message: "Authentication required",
			});
		}
		const body = (await readBody(event)) as CreateGroupRequest;
		const { groupName, members } = body;
		if (!groupName || !groupName.trim()) {
			throw createError({
				statusCode: 400,
				message: "Group name is required",
			});
		}

		if (!members || !Array.isArray(members) || members.length === 0) {
			throw createError({
				statusCode: 400,
				message: "At least one member is required",
			});
		}
		const groupData = await createGroup(formId, body, session.user);
		return {
			data: groupData,
			success: true,
		};
	} catch (e: any) {
		console.error("Group creation error:", e);
		throw createError({
			statusCode: e.statusCode || 500,
			message: e.message || "An error occurred",
		});
	}
});
