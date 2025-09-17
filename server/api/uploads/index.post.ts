import { th } from "zod/v4/locales";
import { handleFileUpload } from "~~/server/services/upload.service";

export default defineEventHandler(async (event) => {
  try {
    const data = await handleFileUpload(event, { multiple: false });
    if (!data) {
      throw createError({
        message: "Unable to upload file",
        statusCode: 500,
      });
    }
    return {
      success: true,
      data: data[0],
    };
  } catch (e: any) {
    throw createError({
      statusCode: e.statusCode || 500,
      message: e.message || "An error occurred",
    });
  }
});
