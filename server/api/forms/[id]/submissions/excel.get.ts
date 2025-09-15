import { auth } from "~~/server/lib/auth";
import { getFormById } from "~~/server/services/form.service";
import { getFormSubmissions } from "~~/server/services/submissions.service";
import { exportToExcel } from "~~/server/utils/excel";

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
    const buffer = exportToExcel(submissions);
    const form = await getFormById(formId);

    setHeader(
      event,
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    setHeader(
      event,
      "Content-Disposition",
      `attachment; filename=${form.title}.xlsx`,
    );

    return buffer;
  } catch (e: any) {
    throw createError({
      statusCode: 500,
      message: e.message || "Un error Occurred",
    });
  }
});
