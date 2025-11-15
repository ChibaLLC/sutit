import { auth } from "~~/server/lib/auth";
import { processFormPayment } from "~~/server/services/payment.service";
import { submitForm } from "~~/server/services/submissions.service";

export default defineEventHandler(async (event) => {
  try {
    const formId = getRouterParam(event, "id");
    if (!formId) {
      throw createError({
        message: "Not Found",
        statusCode: 404,
      });
    }
    const session = await auth.api.getSession({
      headers: event.headers,
    });
    const body = await readBody(event);
    let submission = await submitForm(formId, body, session?.user.id);
    return {
      data: {
        ...submission,
        ...submission.pay,
      },
      message: submission.message,
    };
  } catch (e) {
    throw createError({
      statusCode: 500,
      message: e.message || "An error occurred!!",
    });
  }
});
