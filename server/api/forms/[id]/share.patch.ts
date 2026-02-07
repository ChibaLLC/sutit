import { auth } from "~~/server/lib/auth";
import { updateShareSettings } from "~~/server/services/form.service";

export default defineEventHandler(async (event) => {
  try {
    const formId = getRouterParam(event, "id");
    if (!formId) {
      throw createError({
        statusCode: 404,
        message: "Form ID is required",
      });
    }

    const session = await auth.api.getSession({
      headers: event.headers,
    });

    if (!session) {
      throw createError({
        statusCode: 401,
        message: "Unauthorized",
      });
    }

    const body = await readBody(event);

    if (!body) {
      throw createError({
        statusCode: 400,
        message: "Request body is required",
      });
    }

    const updatedForm = await updateShareSettings(formId, body);

    return {
      success: true,
      data: updatedForm,
      message: "Share settings updated successfully",
    };
  } catch (error: any) {
    console.error("Error updating share settings:", error);

    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || "Failed to update share settings",
    });
  }
});
