import { auth } from "~~/server/lib/auth";
import { getBatchesByFormId } from "~~/server/services/dispatch.service";

export default defineEventHandler(async (event) => {
  const formId = getRouterParam(event, "id");
  if (!formId) throw createError({ statusCode: 400, message: "Form ID required" });

  const session = await auth.api.getSession({ headers: event.headers });
  if (!session) throw createError({ statusCode: 401, message: "Unauthenticated" });

  try {
    const batches = await getBatchesByFormId(formId);
    return { data: batches };
  } catch (e: any) {
    throw createError({ statusCode: 500, message: e.message });
  }
});
