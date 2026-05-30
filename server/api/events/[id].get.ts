import { getEventBySlug, getEventById } from "~~/server/services/event.service";

export default defineEventHandler(async (event) => {
  const idOrSlug = getRouterParam(event, "id");

  if (!idOrSlug) {
    throw createError({
      statusCode: 400,
      message: "Event ID or slug is required",
    });
  }

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const isUUID = uuidRegex.test(idOrSlug);

  const eventData = isUUID
    ? await getEventById(idOrSlug)
    : await getEventBySlug(idOrSlug);

  if (!eventData) {
    throw createError({
      statusCode: 404,
      message: "Event not found",
    });
  }

  return { data: eventData };
});
