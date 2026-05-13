import ExcelJS from "exceljs";
import type { FormSubmission } from "~~/shared/types";

const STATUS_COLORS: Record<string, string> = {
  completed: "FFC6EFCE",
  pending: "FFFFEB9C",
  partial: "FFFFD580",
  abandoned: "FFFFC7CE",
  processing: "FFBDD7EE",
};

interface GroupData {
  id: string;
  groupName: string;
  leaderId?: string | null;
  currentMemberCount: number;
  maxMembers?: number | null;
  members: {
    submissionId?: string | null;
    userId?: string | null;
    inviteEmail?: string | null;
    invitePhone?: string | null;
    isInviteAccepted?: boolean | null;
  }[];
  leader?: { name?: string; email?: string } | null;
}

interface GroupMemberExportRow {
  memberEmail: string;
  memberPhone: string;
  displayStatus: string;
  submittedAt: string;
}

interface GroupHeaderExport {
  groupName: string;
  leaderName: string;
  leaderEmail: string;
  maxMembers: number | null;
}

interface GroupExportData {
  header: GroupHeaderExport;
  members: GroupMemberExportRow[];
}

export const exportToExcel = async (submissions: FormSubmission[], groups: GroupData[] = []) => {
  try {
    const activeSubmissions = submissions.filter((submission) => !submission.deletedAt);

    const submissionsById = new Map<string, FormSubmission>();
    const submissionsByUserId = new Map<string, FormSubmission>();
    const submissionsByEmail = new Map<string, FormSubmission>();
    activeSubmissions.forEach((sub) => {
      submissionsById.set(sub.id, sub);
      if (sub.submitter?.id) submissionsByUserId.set(sub.submitter.id, sub);
      if (sub.submitter?.email) {
        submissionsByEmail.set(sub.submitter.email.toLowerCase(), sub);
      }
    });

    const { groupData } = buildGroupData(
      groups,
      submissionsById,
      submissionsByUserId,
      submissionsByEmail,
    );

    const workbook = new ExcelJS.Workbook();

    // Sheet 1: Submissions
    const fieldSheet = workbook.addWorksheet("Submissions");
    const { fieldResponses, storeResponses } = formatFormData(activeSubmissions);
    if (fieldResponses.length) {
      fieldSheet.columns = Object.keys(fieldResponses[0]).map((key) => ({
        header: key,
        key,
        width: 22,
      }));
      fieldSheet.addRows(fieldResponses);
      applyStatusColors(fieldSheet, fieldResponses);
    }

    // Sheet 2: Status Summary
    const statusSheet = workbook.addWorksheet("Status Summary");
    const statusSummary = buildStatusSummary(activeSubmissions);
    statusSheet.columns = [
      { header: "Status", key: "status", width: 16 },
      { header: "Count", key: "count", width: 12 },
    ];
    statusSheet.addRows(statusSummary);

    // Sheet 3: Groups (group headers + member rows)
    if (groupData.length > 0) {
      const groupsSheet = workbook.addWorksheet("Groups");
      groupsSheet.columns = [
        { header: "Member Email", key: "memberEmail", width: 30 },
        { header: "Member Phone", key: "memberPhone", width: 18 },
        { header: "Status", key: "displayStatus", width: 18 },
        { header: "Submitted At", key: "submittedAt", width: 22 },
      ];

      let rowNum = 2;

      groupData.forEach((gd) => {
        const leaderInfo = gd.header.leaderName
          ? `${gd.header.leaderName}${gd.header.leaderEmail ? ` (${gd.header.leaderEmail})` : ""}`
          : gd.header.leaderEmail || "";
        const membersInfo = `${gd.members.length}${gd.header.maxMembers ? ` / ${gd.header.maxMembers}` : ""}`;
        const headerText = `Group: ${gd.header.groupName}  ·  Leader: ${leaderInfo}  ·  Members: ${membersInfo}`;

        const headerRow = groupsSheet.getRow(rowNum);
        headerRow.getCell(1).value = headerText;
        groupsSheet.mergeCells(`A${rowNum}:D${rowNum}`);
        headerRow.eachCell((cell) => {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FF4472C4" },
          };
          cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
        });
        headerRow.height = 26;
        rowNum++;

        gd.members.forEach((member) => {
          const dataRow = groupsSheet.getRow(rowNum);
          dataRow.getCell(1).value = member.memberEmail;
          dataRow.getCell(2).value = member.memberPhone;
          dataRow.getCell(3).value = member.displayStatus;
          dataRow.getCell(4).value = member.submittedAt;

          const isSubmitted = member.displayStatus.startsWith("✓");
          dataRow.eachCell((cell) => {
            cell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: isSubmitted ? "FFC6EFCE" : "FFFFC7CE" },
            };
          });
          rowNum++;
        });

        rowNum++;
      });
    }

    // Sheet 4: Product Purchases (if any)
    if (storeResponses.length) {
      const storeSheet = workbook.addWorksheet("Product Purchases");
      storeSheet.columns = Object.keys(storeResponses[0]).map((key) => ({
        header: key,
        key,
        width: 22,
      }));
      storeSheet.addRows(storeResponses);

      const summarySheet = workbook.addWorksheet("Purchase Summary");
      const summaryData = generatePurchaseSummary(storeResponses);
      if (summaryData.length) {
        summarySheet.columns = Object.keys(summaryData[0]).map((key) => ({
          header: key,
          key,
          width: 22,
        }));
        summarySheet.addRows(summaryData);
      }
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  } catch (e: any) {
    console.error("Excel export failed:", e);
    throw e;
  }
};

const buildGroupData = (
  groups: GroupData[],
  submissionsById: Map<string, FormSubmission>,
  submissionsByUserId: Map<string, FormSubmission>,
  submissionsByEmail: Map<string, FormSubmission>,
) => {
  const groupData: GroupExportData[] = [];

  groups.forEach((g) => {
    const members = g.members || [];
    const exportMembers: GroupMemberExportRow[] = [];

    members.forEach((m) => {
      let submission: FormSubmission | undefined;
      if (m.submissionId) submission = submissionsById.get(m.submissionId);
      if (!submission && m.userId) submission = submissionsByUserId.get(m.userId);
      if (!submission && m.inviteEmail) submission = submissionsByEmail.get(m.inviteEmail.toLowerCase());

      const hasSubmitted = !!submission;
      exportMembers.push({
        memberEmail: m.inviteEmail || submission?.submitter?.email || "",
        memberPhone: m.invitePhone || "",
        displayStatus: hasSubmitted ? "✓ Submitted" : "✗ Pending",
        submittedAt: submission?.submittedAt || "",
      });
    });

    groupData.push({
      header: {
        groupName: g.groupName,
        leaderName: g.leader?.name || "",
        leaderEmail: g.leader?.email || "",
        maxMembers: g.maxMembers ?? null,
      },
      members: exportMembers,
    });
  });

  return { groupData };
};

const formatFormData = (submissions: FormSubmission[]) => {
  const fieldResponses: Record<string, any>[] = [];
  const storeResponses: Record<string, any>[] = [];

  const allFieldLabels = new Set<string>();
  submissions.forEach((sub) => {
    sub.responses.forEach((field) => {
      allFieldLabels.add(field.field.label);
    });
  });

  submissions.forEach((sub) => {
    const emailFromResponse = sub.responses.find(
      (response) => response.field.type == "email",
    )?.value;

    const baseRow: Record<string, any> = {
      "Submitter Name": sub.submitter?.name,
      "Submitter Email": sub.submitter?.email || emailFromResponse || "",
      Status: sub.status,
      "Submitted At": sub.submittedAt,
      "Price Paid": sub.pricePaid || 0,
    };
    if (sub.payments?.payment) {
      baseRow["Payment Status"] = sub.payments.payment.status;
      baseRow["Receipt Number"] = sub.payments.payment.receiptNumber;
    }

    const fieldRow = { ...baseRow };
    allFieldLabels.forEach((label) => {
      const response = sub.responses.find((f) => f.field.label === label);
      fieldRow[label] = response ? response.value : "";
    });
    fieldResponses.push(fieldRow);

    sub.storeResponses.forEach((item) => {
      storeResponses.push({
        ...baseRow,
        "Product Name": item.item.name,
        Quantity: item.quantity,
        "Unit Price": item.price,
        "Total Price": item.total,
      });
    });
  });

  return { fieldResponses, storeResponses };
};

const buildStatusSummary = (submissions: FormSubmission[]) => {
  const counts: Record<string, number> = {};
  submissions.forEach((sub) => {
    const status = sub.status || "unknown";
    counts[status] = (counts[status] || 0) + 1;
  });

  const statusOrder = ["completed", "pending", "partial", "processing", "abandoned"];
  return statusOrder
    .filter((s) => counts[s])
    .map((s) => ({ status: s, count: counts[s] }))
    .concat(
      Object.entries(counts)
        .filter(([s]) => !statusOrder.includes(s))
        .map(([status, count]) => ({ status, count })),
    );
};

const applyStatusColors = (sheet: ExcelJS.Worksheet, rows: Record<string, any>[]) => {
  const statusColIndex = Object.keys(rows[0] || {}).indexOf("Status") + 1;
  if (statusColIndex === 0) return;

  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const statusCell = row.getCell(statusColIndex);
    const status = String(statusCell.value || "").toLowerCase();
    const color = STATUS_COLORS[status];
    if (color) {
      row.eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: color },
        };
      });
    }
  });
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
