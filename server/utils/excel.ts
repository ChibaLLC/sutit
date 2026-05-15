import ExcelJS from "exceljs";
import type { FormSubmission } from "~~/shared/types";

const STATUS_COLORS: Record<string, string> = {
  completed: "FFC6EFCE",
  pending: "FFFFEB9C",
  partial: "FFFFD580",
  abandoned: "FFFFC7CE",
  processing: "FFBDD7EE",
};

const STATUS_ORDER = ["completed", "pending", "partial", "processing", "abandoned"];

interface GroupData {
  id: string;
  groupName: string;
  leaderId?: string | null;
  currentMemberCount: number;
  maxMembers?: number | null;
  members: {
    id?: string;
    submissionId?: string | null;
    userId?: string | null;
    inviteEmail?: string | null;
    invitePhone?: string | null;
    isInviteAccepted?: boolean | null;
  }[];
  leader?: { name?: string; email?: string } | null;
  payment?: { receiptNumber?: string | null } | null;
  memberPayments?: Array<{ memberId: string; payment?: { receiptNumber?: string | null } | null }>;
}

interface GroupMemberExportRow {
  memberEmail: string;
  memberPhone: string;
  displayStatus: string;
  submittedAt: string;
  paymentRefCode: string;
}

interface GroupHeaderExport {
  groupName: string;
  leaderName: string;
  leaderEmail: string;
  maxMembers: number | null;
  paymentRefCode: string;
}

interface GroupExportData {
  header: GroupHeaderExport;
  members: GroupMemberExportRow[];
}

export const exportToExcel = async (submissions: FormSubmission[], groups: GroupData[] = []) => {
  try {
    const activeSubmissions = submissions.filter((s) => !s.deletedAt);

    const submissionsById = new Map<string, FormSubmission>();
    const submissionsByUserId = new Map<string, FormSubmission>();
    const submissionsByEmail = new Map<string, FormSubmission>();
    const submissionsByResponseEmail = new Map<string, FormSubmission>();

    activeSubmissions.forEach((sub) => {
      submissionsById.set(sub.id, sub);
      if (sub.submitter?.id) submissionsByUserId.set(sub.submitter.id, sub);
      if (sub.submitter?.email) {
        submissionsByEmail.set(sub.submitter.email.toLowerCase(), sub);
      }
      sub.responses.forEach((r) => {
        if (r.field.type === "email" && r.value && typeof r.value === "string") {
          const key = r.value.toLowerCase().trim();
          if (!submissionsByResponseEmail.has(key)) {
            submissionsByResponseEmail.set(key, sub);
          }
        }
      });
    });

    const { groupData } = buildGroupData(
      groups,
      submissionsById,
      submissionsByUserId,
      submissionsByEmail,
      submissionsByResponseEmail,
    );

    const workbook = new ExcelJS.Workbook();

    // Sheet 1: Submissions (grouped by status)
    const fieldSheet = workbook.addWorksheet("Submissions");
    const { fieldResponses, storeResponses } = formatFormData(activeSubmissions);

    if (fieldResponses.length) {
      const columns = Object.keys(fieldResponses[0]);
      fieldSheet.columns = columns.map((key) => ({ header: key, key, width: 22 }));

      const grouped: Record<string, Record<string, any>[]> = {};
      fieldResponses.forEach((row) => {
        const status = row["Status"] || "unknown";
        if (!grouped[status]) grouped[status] = [];
        grouped[status].push(row);
      });

      const statusKeys = [
        ...STATUS_ORDER.filter((s) => grouped[s]),
        ...Object.keys(grouped).filter((s) => !STATUS_ORDER.includes(s)),
      ];

      let rowNum = 2;
      const lastCol = columnLetter(columns.length);

      statusKeys.forEach((status) => {
        const rows = grouped[status];
        const color = STATUS_COLORS[status];

        const headerRow = fieldSheet.getRow(rowNum);
        headerRow.getCell(1).value = `${status.toUpperCase()} (${rows.length})`;
        fieldSheet.mergeCells(`A${rowNum}:${lastCol}${rowNum}`);
        headerRow.eachCell((cell) => {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: color || "FFD9E1F2" },
          };
          cell.font = { bold: true, size: 11, color: { argb: "FF000000" } };
        });
        headerRow.height = 24;
        rowNum++;

        rows.forEach((row) => {
          const dataRow = fieldSheet.getRow(rowNum);
          columns.forEach((key, idx) => {
            dataRow.getCell(idx + 1).value = row[key] ?? "";
          });
          if (color) {
            dataRow.eachCell((cell) => {
              cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: color },
              };
            });
          }
          rowNum++;
        });

        rowNum++;
      });
    }

    // Sheet 2: Status Summary
    const statusSheet = workbook.addWorksheet("Status Summary");
    statusSheet.columns = [
      { header: "Status", key: "status", width: 16 },
      { header: "Count", key: "count", width: 12 },
    ];
    buildStatusSummary(activeSubmissions).forEach((row, idx) => {
      const r = statusSheet.getRow(idx + 2);
      r.getCell(1).value = row.status;
      r.getCell(2).value = row.count;
      const color = STATUS_COLORS[row.status];
      if (color) {
        r.eachCell((cell) => {
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: color } };
        });
      }
    });

    // Sheet 3: Groups
    if (groupData.length > 0) {
      console.log(groupData);
      const groupsSheet = workbook.addWorksheet("Groups");
      groupsSheet.columns = [
        { header: "Member Email", key: "memberEmail", width: 30 },
        { header: "Member Phone", key: "memberPhone", width: 18 },
        { header: "Status", key: "displayStatus", width: 18 },
        { header: "Submitted At", key: "submittedAt", width: 22 },
        { header: "Payment Reference", key: "paymentRefCode", width: 22 },
      ];

      let rowNum = 2;

      groupData.forEach((gd) => {
        const leaderInfo = gd.header.leaderName
          ? `${gd.header.leaderName}${gd.header.leaderEmail ? ` (${gd.header.leaderEmail})` : ""}`
          : gd.header.leaderEmail || "";
        const membersInfo = `${gd.members.length}${gd.header.maxMembers ? ` / ${gd.header.maxMembers}` : ""}`;
        const refInfo = gd.header.paymentRefCode
          ? `  ·  Payment Ref: ${gd.header.paymentRefCode}`
          : "";
        const headerText = `Group: ${gd.header.groupName}  ·  Leader: ${leaderInfo}  ·  Members: ${membersInfo}${refInfo}`;

        const headerRow = groupsSheet.getRow(rowNum);
        headerRow.getCell(1).value = headerText;
        groupsSheet.mergeCells(`A${rowNum}:E${rowNum}`);
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
          dataRow.getCell(5).value = member.paymentRefCode;

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

    // Sheet 4: Product Purchases
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

    return await workbook.xlsx.writeBuffer();
  } catch (e: any) {
    console.error("Excel export failed:", e);
    throw e;
  }
};

const columnLetter = (n: number): string => {
  let s = "";
  while (n > 0) {
    n--;
    s = String.fromCharCode(65 + (n % 26)) + s;
    n = Math.floor(n / 26);
  }
  return s;
};

const buildGroupData = (
  groups: GroupData[],
  submissionsById: Map<string, FormSubmission>,
  submissionsByUserId: Map<string, FormSubmission>,
  submissionsByEmail: Map<string, FormSubmission>,
  submissionsByResponseEmail: Map<string, FormSubmission>,
) => {
  const groupData: GroupExportData[] = [];

  groups.forEach((g) => {
    const members = g.members || [];
    const exportMembers: GroupMemberExportRow[] = [];

    members.forEach((m) => {
      let submission: FormSubmission | undefined;
      if (m.submissionId) submission = submissionsById.get(m.submissionId);
      if (!submission && m.userId) submission = submissionsByUserId.get(m.userId);
      if (!submission && m.inviteEmail) {
        submission = submissionsByEmail.get(m.inviteEmail.toLowerCase());
      }
      if (!submission && m.inviteEmail) {
        submission = submissionsByResponseEmail.get(m.inviteEmail.toLowerCase());
      }

      let paymentRefCode = "";
      if (g.memberPayments && m.id) {
        const mp = g.memberPayments.find((p) => p.memberId === m.id);
        paymentRefCode = mp?.payment?.receiptNumber || "";
      }

      exportMembers.push({
        memberEmail: m.inviteEmail || submission?.submitter?.email || "",
        memberPhone: m.invitePhone || "",
        displayStatus: submission ? "✓ Submitted" : "✗ Pending",
        submittedAt: submission?.submittedAt || "",
        paymentRefCode,
      });
    });

    groupData.push({
      header: {
        groupName: g.groupName,
        leaderName: g.leader?.name || "",
        leaderEmail: g.leader?.email || "",
        maxMembers: g.maxMembers ?? null,
        paymentRefCode: g.payment?.receiptNumber || "",
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
    const emailFromResponse = sub.responses.find((r) => r.field.type === "email")?.value;

    const paymentRecord = sub.payments?.find((fp) => fp.payment?.status === "completed")?.payment;
    const baseRow: Record<string, any> = {
      "Submitter Name": sub.submitter?.name,
      "Submitter Email": sub.submitter?.email || emailFromResponse || "",
      Status: sub.status,
      "Submitted At": sub.submittedAt,
      "Price Paid": sub.pricePaid || 0,
      "Payment Status": paymentRecord?.status || "",
      "Receipt Number": paymentRecord?.receiptNumber || "",
    };

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

  return STATUS_ORDER.filter((s) => counts[s])
    .map((s) => ({ status: s, count: counts[s] }))
    .concat(
      Object.entries(counts)
        .filter(([s]) => !STATUS_ORDER.includes(s))
        .map(([status, count]) => ({ status, count })),
    );
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
