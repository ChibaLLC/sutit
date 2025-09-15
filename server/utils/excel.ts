import * as XLSX from "xlsx";
import { FormSchema, FormSubmission } from "~~/shared/types";

export const exportToExcel = (submissions: FormSubmission[]) => {
  try {
    const { fieldResponses, storeResponses } = formatFormData(submissions);
    const workbook = XLSX.utils.book_new();
    const fieldWorksheet = XLSX.utils.json_to_sheet(fieldResponses);
    const storeWorksheet = XLSX.utils.json_to_sheet(storeResponses);

    XLSX.utils.book_append_sheet(workbook, fieldWorksheet, "Submissions");
    XLSX.utils.book_append_sheet(workbook, storeWorksheet, "Store Submissions");
    return XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
    });
  } catch (e: any) {
    console.log(e);
    throw e;
  }
};

const formatFormData = (submissions: FormSubmission[]) => {
  const fieldResponses: Record<string, any>[] = [];
  const storeResponses: Record<string, any>[] = [];
  const rows = submissions.forEach((sub) => {
    const row: Record<string, any> = {
      "Submitter Name": sub.submitter.name,
      "Submitter Email": sub.submitter.email,
    };
    const storeRow = { ...row };
    sub.responses.forEach((field) => {
      row[field.field.label] = field.value;
    });
    row["Submitted At"] = sub.submittedAt;

    sub.storeResponses.forEach((item) => {
      storeRow["name"] = item.item.name;
      storeRow["quantity"] = item.quantity;
      storeRow["Total Price"] = item.price;
    });
    fieldResponses.push(row);
    storeResponses.push(storeRow);
  });
  return {
    fieldResponses: fieldResponses,
    storeResponses,
  };
};
