export const hasFiles = (form: any) => {
  const checkValue = (value: any) => {
    if (value instanceof File) return true;
    if (value instanceof FileList) return value.length > 0;
    if (Array.isArray(value)) {
      return value.some(
        (item) =>
          item instanceof File || (typeof item === "object" && item !== null && checkValue(item)),
      );
    }
    if (typeof value === "object" && value !== null) {
      return Object.values(value).some(checkValue);
    }
    return false;
  };

  return Object.values(form).some(checkValue);
};
export const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};
