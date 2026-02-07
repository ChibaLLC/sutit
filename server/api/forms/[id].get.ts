import { getFormById } from "~~/server/services/form.service";
import { auth } from "~~/server/lib/auth";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const query = getQuery(event);
  const token = query.token as string;
  const password = query.password as string;

  if (!id) {
    throw createError({
      status: 404,
      statusCode: 404,
      message: "Not Found",
    });
  }

  const form = await getFormById(id, token);

  if (!form) {
    throw createError({
      status: 404,
      statusCode: 404,
      message: "Form not found",
    });
  }

  // Get current user session
  const session = await auth.api.getSession({
    headers: event.headers,
  });

  const isOwner = session?.user?.id === form.createdBy;

  // Check if form has expired
  if (form.expiresAt) {
    const expirationDate = new Date(form.expiresAt);
    const now = new Date();

    if (now > expirationDate) {
      throw createError({
        status: 403,
        statusCode: 403,
        message: "This form has expired and is no longer accepting responses",
      });
    }
  }

  // Check if form is public (allow owners to access their private forms)
  if (!form.isPublic && !isOwner) {
    throw createError({
      status: 403,
      statusCode: 403,
      message: "This form is private and not accessible to the public",
    });
  }

  // Check if form requires password (skip for owners)
  if (form.requirePassword && !isOwner) {
    if (!password) {
      throw createError({
        status: 401,
        statusCode: 401,
        message: "Password required",
      });
    }

    if (password !== form.password) {
      throw createError({
        status: 403,
        statusCode: 403,
        message: "Invalid password",
      });
    }
  }

  // Remove sensitive fields from response
  const { password: _, ...safeForm } = form;

  return {
    ...safeForm,
  };
});
