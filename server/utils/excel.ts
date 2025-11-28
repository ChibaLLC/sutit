import ExcelJS from "exceljs";
import { FormSchema, FormSubmission } from "~~/shared/types";

export const exportToExcel = async (submissions: FormSubmission[]) => {
  try {
    // Filter out deleted submissions
    const activeSubmissions = submissions.filter(submission => !submission.deletedAt);
    const { fieldResponses, storeResponses } = formatFormData(activeSubmissions);

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
    const storeSheet = workbook.addWorksheet("Product Purchases");
    if (storeResponses.length) {
      storeSheet.columns = Object.keys(storeResponses[0]).map((key) => ({
        header: key,
        key,
        width: 20,
      }));
      storeSheet.addRows(storeResponses);

      // Add summary sheet
      const summarySheet = workbook.addWorksheet("Purchase Summary");
      const summaryData = generatePurchaseSummary(storeResponses);
      summarySheet.columns = Object.keys(summaryData[0] || {}).map((key) => ({
        header: key,
        key,
        width: 20,
      }));
      summarySheet.addRows(summaryData);
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
    // Extract email from form responses if submitter email is not available
    const emailFromResponse = sub.responses.find(
      (response) => response.field.type === "email",
    )?.value;

    const baseRow: Record<string, any> = {
      "Submitter Name": sub.submitter?.name,
      "Submitter Email": sub.submitter?.email || emailFromResponse || "",
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
        "Product Name": item.item.name,
        "Product ID": item.item.id,
        Quantity: item.quantity,
        "Unit Price": item.price / item.quantity,
        "Total Price": item.price,
      });
    });
  });

  return { fieldResponses, storeResponses };
};

const generatePurchaseSummary = (storeResponses: Record<string, any>[]) => {
  const summary: Record<string, any> = {};

  storeResponses.forEach((purchase) => {
    const email = purchase["Submitter Email"] || "No Email";
    const name = purchase["Submitter Name"] || "Unknown";
    const key = `${name} (${email})`;

    if (!summary[key]) {
      summary[key] = {
        Customer: name,
        Email: email,
        "Products Purchased": "",
        "Total Quantity": 0,
        "Total Amount": 0,
        "Purchase Date": purchase["Submitted At"],
      };
    }

    summary[key]["Products Purchased"] +=
      (summary[key]["Products Purchased"] ? ", " : "") +
      `${purchase["Product Name"]} (${purchase.Quantity})`;
    summary[key]["Total Quantity"] += purchase.Quantity;
    summary[key]["Total Amount"] += purchase["Total Price"];
  });

  return Object.values(summary);
};
