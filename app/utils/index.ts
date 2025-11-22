export const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
};

/**
 * Convert form object to FormData, handling nested objects and arrays
 * @param {object} form - The form object
 * @returns {FormData} - FormData object
 */
export const createFormData = (form: object) => {
  const formData = new FormData();

  const appendToFormData = (key, value, parentKey = "") => {
    const fullKey = parentKey ? `${parentKey}[${key}]` : key;

    if (value instanceof File) {
      formData.append(fullKey, value);
    } else if (value instanceof FileList) {
      Array.from(value).forEach((file, index) => {
        formData.append(`${fullKey}[${index}]`, file);
      });
    } else if (Array.isArray(value)) {
      value.forEach((item, index) => {
        if (item instanceof File) {
          formData.append(`${fullKey}[${index}]`, item);
        } else if (typeof item === "object" && item !== null) {
          Object.entries(item).forEach(([subKey, subValue]) => {
            appendToFormData(subKey, subValue, `${fullKey}[${index}]`);
          });
        } else {
          formData.append(`${fullKey}[${index}]`, String(item));
        }
      });
    } else if (typeof value === "object" && value !== null) {
      Object.entries(value).forEach(([subKey, subValue]) => {
        appendToFormData(subKey, subValue, fullKey);
      });
    } else if (value !== undefined && value !== null) {
      formData.append(fullKey, String(value));
    }
  };

  Object.entries(form).forEach(([key, value]) => {
    appendToFormData(key, value);
  });

  return formData;
};
