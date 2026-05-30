import { auth } from "~~/server/lib/auth";
import { deleteEvent, getEventById } from "~~/server/services/event.service";
import { getFormById } from "~~/server/services/form.service";
import db from "~~/server/db";

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({ headers: event.headers });
  if (!session?.user) {
    throw createError({ statusCode: 401, message: "Authentication required" });
  }

  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({ statusCode: 400, message: "Event ID is required" });
  }

  const existingEvent = await getEventById(id);
  if (!existingEvent) {
    throw createError({ statusCode: 404, message: "Event not found" });
  }

  const form = await getFormById(existingEvent.formId);
  if (!form || form.createdBy !== session.user.id) {
    throw createError({ statusCode: 403, message: "You do not have permission to delete this event" });
  }

  const deleted = await deleteEvent(id, db);

  if (!deleted) {
    throw createError({ statusCode: 404, message: "Event not found" });
  }

  return { message: "Event deleted successfully" };
});
