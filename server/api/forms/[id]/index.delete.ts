import { auth } from "~~/server/lib/auth";
import { deleteForm } from "~~/server/services/form.service";

export default defineEventHandler(async (event) => {
  try {
    const formId = getRouterParam(event, "id");
    if (!formId) {
      throw createError({
        message: "Form ID is required",
        statusCode: 400,
      });
    }

    const session = await auth.api.getSession({
      headers: event.headers,
    });

    if (!session?.user?.id) {
      throw createError({
        message: "Unauthorized",
        statusCode: 401,
      });
    }

    const result = await deleteForm(formId, session.user.id);

    return {
      success: true,
      message: result.message,
    };
  } catch (e: any) {
    console.error("Error deleting form:", e);
    throw createError({
      statusCode: e.statusCode || 500,
      message: e.message || "An error occurred while deleting the form",
    });
  }
});
