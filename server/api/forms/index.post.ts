import { auth } from "~~/server/lib/auth";
import { createForm } from "~~/server/services/form.service";
import type { FormSchema } from "~~/shared/types";
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

    // Read and validate the body
    const body = await readBody(event);
    const validationResult = formSchemaSchema.safeParse(body);

    if (!validationResult.success) {
      // Format validation errors for better client-side display
      const fieldErrors = validationResult.error.issues.map((issue: any) => {
        const path = issue.path.join(".");
        let fieldName = path;

        // Map technical paths to user-friendly names
        if (path === "title") fieldName = "Form Title";
        else if (path === "slug") fieldName = "URL Slug";
        else if (path === "status") fieldName = "Form Status";
        else if (path.startsWith("pages")) {
          const match = path.match(/pages\.(\d+)/);
          if (match) {
            const pageNum = parseInt(match[1]) + 1;
            fieldName = `Page ${pageNum}`;
            if (path.includes("title")) fieldName += " Title";
            else if (path.includes("fields")) fieldName += " Fields";
          }
        } else if (path.startsWith("stores")) {
          const match = path.match(/stores\.(\d+)/);
          if (match) {
            const storeNum = parseInt(match[1]) + 1;
            fieldName = `Store ${storeNum}`;
            if (path.includes("items")) fieldName += " Products";
          }
        }

        return {
          field: fieldName,
          path: path,
          message: issue.message,
          code: issue.code,
        };
      });

      throw createError({
        statusCode: 422,
        statusMessage: "Validation failed",
        data: {
          type: "validation_error",
          errors: fieldErrors,
          summary: `Found ${fieldErrors.length} validation error${fieldErrors.length > 1 ? "s" : ""}`,
        },
      });
    }

    const formData = validationResult.data as FormSchema;
    formData.createdBy = session.user.id;
    const form = await createForm(formData);

    return {
      data: form,
      message: "Form created successfully",
    };
  } catch (e: any) {
    // If it's already a formatted error (validation error), pass it through
    if (e.statusCode === 422 && e.data?.type === "validation_error") {
      throw e;
    }

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
      message:
        e?.message || "An unexpected error occurred while creating the form",
      data: {
        type: "server_error",
        details:
          "Please try again later or contact support if the issue persists.",
      },
    });
  }
});
