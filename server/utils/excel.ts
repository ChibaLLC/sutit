import ExcelJS from "exceljs";
import { FormSchema, FormSubmission } from "~~/shared/types";

export const exportToExcel = async (submissions: FormSubmission[]) => {
  try {
    const { fieldResponses, storeResponses } = formatFormData(submissions);

    const workbook = new ExcelJS.Workbook();

    // Sheet 1: Field Submissions
    const fieldSheet = workbook.addWorksheet("Submissions");
    if (fieldResponses.length) {
      fieldSheet.columns = Object.keys(fieldResponses[0]).map((key) => ({
        header: key,
        key,
        width: 20,
      }));
      fieldSheet.addRows(fieldResponses);
    }

    // Sheet 2: Store Submissions
    const storeSheet = workbook.addWorksheet("Store Submissions");
    if (storeResponses.length) {
      storeSheet.columns = Object.keys(storeResponses[0]).map((key) => ({
        header: key,
        key,
        width: 20,
      }));
      storeSheet.addRows(storeResponses);
    }

    // Return as buffer (Node / Nitro server context)
    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  } catch (e: any) {
    console.error("Excel export failed:", e);
    throw e;
  }
};

const formatFormData = (submissions: FormSubmission[]) => {
  const fieldResponses: Record<string, any>[] = [];
  const storeResponses: Record<string, any>[] = [];

  // Collect all unique field labels
  const allFieldLabels = new Set<string>();
  submissions.forEach((sub) => {
    sub.responses.forEach((field) => {
      allFieldLabels.add(field.field.label);
    });
  });

  submissions.forEach((sub) => {
    const baseRow: Record<string, any> = {
      "Submitter Name": sub.submitter?.name,
      "Submitter Email": sub.submitter?.email,
      "Submitted At": sub.submittedAt,
    };

    // Field Responses
    const fieldRow = { ...baseRow };
    allFieldLabels.forEach((label) => {
      const response = sub.responses.find((f) => f.field.label === label);
      fieldRow[label] = response ? response.value : "";
    });
    fieldResponses.push(fieldRow);

    // Store Responses
    sub.storeResponses.forEach((item) => {
      storeResponses.push({
        ...baseRow,
        name: item.item.name,
        quantity: item.quantity,
        "Total Price": item.price,
      });
    });
  });

  return { fieldResponses, storeResponses };
};
