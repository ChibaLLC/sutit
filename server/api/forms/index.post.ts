import { auth } from "~~/server/lib/auth";
import { createForm } from "~~/server/services/form.service";
import { FormSchema } from "~~/shared/types";
import { formSchemaSchema } from "~~/shared/utils/form.schema";

export default defineEventHandler(async (event) => {
  try {
    const session = await auth.api.getSession({
      headers: event.headers,
    });
    if (!session) {
      throw createError({
        status: 401,
        statusCode: 401,
        message: "Authentication required",
        data: {
          type: "authentication_error",
          field: "session",
        },
      });
    }
    // const { data, error } = await readValidatedBody(
    //   event,
    //   formSchemaSchema.safeParse,
    // );
    // if (error) {
    //   const fieldErrors = error.issues.map((issue) => ({
    //     field: issue.path.join("."),
    //     message: issue.message,
    //     code: issue.code,
    //   }));
    //
    //   throw createError({
    //     statusCode: 422,
    //     message: "Validation failed",
    //     data: {
    //       type: "validation_error",
    //       errors: fieldErrors,
    //       details: "Please check the highlighted fields and try again.",
    //     },
    //   });
    // }

    const body = (await readBody(event)) as FormSchema;
    body.createdBy = session.user.id;
    const form = await createForm(body);
    return {
      data: form,
      message: "Form created successfully",
    };
  } catch (e: any) {
    // Handle specific error types
    if (e.message?.includes("slug") && e.message?.includes("already exists")) {
      throw createError({
        status: 409,
        statusCode: 409,
        message: e.message,
        data: {
          type: "slug_conflict",
          field: "slug",
          suggestion:
            "Try adding numbers or modifying the slug to make it unique.",
        },
      });
    }

    if (e.message?.includes("Failed to create")) {
      throw createError({
        status: 500,
        statusCode: 500,
        message: e.message,
        data: {
          type: "creation_error",
          details: "There was an issue creating your form. Please try again.",
        },
      });
    }

    // Generic server error
    throw createError({
      status: 500,
      statusCode: 500,
      message: "An unexpected error occurred while creating the form",
      data: {
        type: "server_error",
        details:
          "Please try again later or contact support if the issue persists.",
      },
    });
  }
});
