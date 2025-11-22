import { auth } from "~~/server/lib/auth";
import { getUserForms } from "~~/server/services/form.service";

export default defineEventHandler(async (event) => {
  try {
    const session = await auth.api.getSession({
      headers: event.headers,
    });
    if (!session) {
      throw createError({
        statusCode: 401,
        message: "Unauthenticated",
      });
    }
    const query = getQuery(event);
    const options = {
      limit: query.limit ? parseInt(query.limit as string, 10) : 10,
      offset: query.offset ? parseInt(query.offset as string, 10) : 0,
      search: query.search as string,
      isPublished: query.isPublished ? query.isPublished === "true" : undefined,
      from: query.from as string,
      to: query.to as string,
      sort: (query.sort as string) || "createdAt",
      order: (query.order as "asc" | "desc") || "desc",
    };
    const forms = await getUserForms(session.user.id, options);
    return {
      message: "Success",
      data: forms,
    };
  } catch (e) {
    throw createError({
      statusCode: 500,
      message: "An error occurred",
    });
  }
});
