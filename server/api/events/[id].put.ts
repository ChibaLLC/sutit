import { auth } from "~~/server/lib/auth";
import { updateEvent, getEventById } from "~~/server/services/event.service";
import { eventSchemaSchema } from "~~/shared/utils/form.schema";
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
    throw createError({ statusCode: 403, message: "You do not have permission to update this event" });
  }

  const body = await readBody(event);
  const validationResult = eventSchemaSchema.partial().safeParse(body);

  if (!validationResult.success) {
    throw createError({
      statusCode: 422,
      message: "Validation failed",
      data: { errors: validationResult.error.issues },
    });
  }

  const updated = await updateEvent(id, validationResult.data as any, db);

  if (!updated) {
    throw createError({ statusCode: 404, message: "Event not found" });
  }

  return { data: updated, message: "Event updated successfully" };
});
