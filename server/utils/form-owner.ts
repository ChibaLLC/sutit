import type { H3Event } from "h3";

import { eq } from "drizzle-orm";
import db from "~~/server/db";
import { forms } from "~~/server/db/schema";
import { auth } from "~~/server/lib/auth";

/** Ensures the request is from a logged-in user who owns the form. Returns the session and form. */
export const requireFormOwner = async (event: H3Event, formId: string | undefined) => {
  if (!formId) {
    throw createError({ statusCode: 400, statusMessage: "Form ID required" });
  }

  const session = await auth.api.getSession({ headers: event.headers });
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized - Authentication required" });
  }

  const form = await db.query.forms.findFirst({ where: eq(forms.id, formId) });
  if (!form) {
    throw createError({ statusCode: 404, statusMessage: "Form not found" });
  }

  if (form.createdBy !== session.user.id) {
    throw createError({ statusCode: 403, statusMessage: "Forbidden - Only the form owner can do this" });
  }

  return { session, form };
};
