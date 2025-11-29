import { auth } from "~~/server/lib/auth";
import { getFormSubmissions } from "~~/server/services/submissions.service";

export default defineEventHandler(async (event) => {
  try {
    const formId = getRouterParam(event, "id");
    if (!formId) {
      throw createError({
        statusCode: 404,
        message: "Not Found",
      });
    }
    const session = auth.api.getSession({
      headers: event.headers,
    });
    if (!session) {
      throw createError({
        statusCode: 401,
        message: "Unauthenticated",
      });
    }
    const submissions = await getFormSubmissions(formId);
    return {
      data: submissions,
      success: true,
    };
  } catch (e) {
    throw createError({
      message: e.message || "An error occurred",
      statusCode: 500,
    });
  }
});
