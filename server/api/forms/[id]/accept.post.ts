import { acceptResponse } from "~~/server/services/form.service";

export default defineEventHandler(async (event) => {
  const formId = getRouterParam(event, "id");
  if (!formId) {
    throw createError({
      message: "Form Id is needed",
      status: 404,
    });
  }
  try {
    await acceptResponse(formId);
    return {
      message: "Successfully changed status",
    };
  } catch (e: any) {
    throw createError({
      message: "An error occurred",
      status: 500,
    });
  }
});
