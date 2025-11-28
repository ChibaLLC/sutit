import { getDeletedFormSubmissions } from "~~/server/services/submissions.service";

export default defineEventHandler(async (event) => {
  const formId = getRouterParam(event, "id");

  if (!formId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Form ID is required",
    });
  }

  try {
    const submissions = await getDeletedFormSubmissions(formId);

    return {
      success: true,
      data: submissions,
    };
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch deleted submissions",
    });
  }
});
