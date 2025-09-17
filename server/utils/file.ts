import { handleSingleFileUpload } from "../services/upload.service";

function isFileField(fieldName, formSchema) {
  for (const page of formSchema.pages) {
    for (const field of page.fields) {
      if (
        field.id === fieldName &&
        (field.type === "file" || field.type === "image")
      ) {
        return field;
      }
    }
  }
  return null;
}

/**
 * Process form data and handle file uploads
 */
export const processFormData = async (
  formSchema,
  rawData,
  isMultipart = false,
) => {
  let formData = {};
  let fileUploads = [];

  if (isMultipart) {
    // Handle multipart form data
    const multipartData = rawData;

    // Get form schema to identify file fields

    for (const item of multipartData) {
      if (item.filename) {
        // This is a file
        const fieldName = item.id;
        const fileField = isFileField(fieldName, formSchema);

        if (fileField) {
          try {
            const uploadResult = await handleSingleFileUpload(item);

            // Store file info based on field configuration
            if (fileField.type === "file" && fileField.multiple) {
              // Multiple files - store as array
              if (!formData[fieldName]) {
                formData[fieldName] = [];
              }
              formData[fieldName].push(uploadResult);
            } else {
              // Single file - store the URL directly or full object
              formData[fieldName] = uploadResult.url; // or uploadResult for full info
            }

            fileUploads.push({
              fieldName,
              ...uploadResult,
            });
          } catch (error) {
            console.error(
              `Failed to upload file for field ${fieldName}:`,
              error,
            );
            throw createError({
              statusCode: 400,
              message: `Failed to upload file for ${fieldName}: ${error.message}`,
            });
          }
        }
      } else {
        // Regular form field
        const fieldName = item.name;
        const fieldValue = item.data.toString();

        // Handle array fields (like checkboxes)
        if (fieldName.includes("[") && fieldName.includes("]")) {
          const baseFieldName = fieldName.split("[")[0];
          if (!formData[baseFieldName]) {
            formData[baseFieldName] = [];
          }
          formData[baseFieldName].push(fieldValue);
        } else {
          formData[fieldName] = fieldValue;
        }
      }
    }
  } else {
    // Handle regular JSON data (no files)
    formData = rawData.formData;
  }

  return {
    formData,
    paymentData: rawData?.paymentData,
    selectedProducts: rawData?.selectedProducts,
    schema: rawData.schema,
    fileUploads,
  };
};
