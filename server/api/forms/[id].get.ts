import { getFormById } from "~~/server/services/form.service";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const query = getQuery(event);
  const token = query.token as string;
  if (!id) {
    throw createError({
      status: 404,
      statusCode: 404,
      message: "Not Found",
    });
  }
  let data = await getFormById(id, token);
  return {
    ...data,
  };
});
