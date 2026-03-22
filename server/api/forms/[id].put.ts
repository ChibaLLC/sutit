import { auth } from "~~/server/lib/auth";
import { updateForm } from "~~/server/services/form.service";

export default defineEventHandler(async (event) => {
  const formId = getRouterParam(event, "id");
  if (!formId) {
    throw createError({ statusCode: 400, message: "Form ID is required" });
  }

  const session = await auth.api.getSession({ headers: event.headers });
  if (!session) {
    throw createError({ statusCode: 401, message: "Authentication required" });
  }

  const body = await readBody(event);
  if (!body) {
    throw createError({ statusCode: 400, message: "Request body is required" });
  }

  try {
    const updatedForm = await updateForm(formId, body);
    return { data: updatedForm, message: "Form updated successfully" };
  } catch (e: any) {
    console.error("Error updating form:", e);

    if (e.message?.includes("not found")) {
      throw createError({ statusCode: 404, message: e.message });
    }

    throw createError({
      statusCode: 500,
      message: e.message || "Failed to update form",
    });
  }
});
