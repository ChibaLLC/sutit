import { auth } from "~~/server/lib/auth";
import { createEvent } from "~~/server/services/event.service";
import { eventSchemaSchema } from "~~/shared/utils/form.schema";
import { getFormById } from "~~/server/services/form.service";
import db from "~~/server/db";

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({ headers: event.headers });
  if (!session?.user) {
    throw createError({ statusCode: 401, message: "Authentication required" });
  }

  const body = await readBody(event);

  if (!body.formId) {
    throw createError({ statusCode: 400, message: "formId is required" });
  }

  const form = await getFormById(body.formId);
  if (!form || form.createdBy !== session.user.id) {
    throw createError({ statusCode: 403, message: "You do not have permission to create an event for this form" });
  }

  const validationResult = eventSchemaSchema.safeParse(body);

  if (!validationResult.success) {
    throw createError({
      statusCode: 422,
      message: "Validation failed",
      data: { errors: validationResult.error.issues },
    });
  }

  const eventData = validationResult.data;
  const newEvent = await createEvent(
    {
      ...eventData,
      formId: body.formId,
    } as any,
    db,
  );

  return { data: newEvent, message: "Event created successfully" };
});
