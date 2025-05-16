import type { Drizzle } from "~~/server/db/types";
import { getFormResponses } from "./queries";
import excel from "exceljs";

function replaceSpecialChars(input: string): string {
	return input.replace(/[*?:\\/\[\]]/g, "_");
}
const getFieldValue = (response: any, fieldlabel: string) => {
	let res = response.find(
		(r: any) => r.field.label.trim().toLowerCase().toString() == fieldlabel.trim().toLowerCase().toString(),
	);
	if (!res) return "";
	if (res.value == "[object Object]") {
		return Object.values(res.field.value)[0] || "";
	}
	return res.value;
};
export async function constructExcel(
	{ form, form_responses, group_responses, store_response }: Awaited<ReturnType<typeof getFormResponses>>,
	user: Drizzle.User.select,
) {
	const workbook = new excel.Workbook();
	workbook.creator = "Sutit Investment Limited";
	workbook.lastModifiedBy = user.name || "Unknown";
	workbook.created = new Date();
	const _hasPayment = hasPayment(form);

	// Create a summary worksheet
	const summarySheet = workbook.addWorksheet("Summary");

	// Create main response worksheet
	const worksheet = workbook.addWorksheet(replaceSpecialChars(form.meta.formName));

	// Set up columns and formatting
	const fields = collectFields(form);

	const titles = [];
	fields.forEach((field) => {
		titles.push(field.label);
	});
	if (group_responses.length > 0) titles.push("Group Name");
	if (_hasPayment) titles.push("Price");

	// Define column widths and formatting
	worksheet.columns = titles.map((title, index) => {
		return {
			header: title,
			key: `col${index}`,
			width: Math.max(15, title.length * 1.2), // Adjust width based on title length
		};
	});

	// Style the header row
	const headerRow = worksheet.getRow(1);
	headerRow.font = { bold: true, color: { argb: "FFFFFF" } };
	headerRow.fill = {
		type: "pattern",
		pattern: "solid",
		fgColor: { argb: "4472C4" }, // Blue header
	};
	headerRow.alignment = { vertical: "middle", horizontal: "center" };

	// Add data rows with alternating colors
	const rows = groupByResponseIdAsObjects(form_responses, group_responses);
	rows.forEach((row, rowIndex) => {
		let values = [];
		fields.forEach((field) => {
			let rowValue = getFieldValue(row.responses, field.label);
			values.push(rowValue);
		});
		if (group_responses.length > 0) {
			values.push(row.groupName);
		}
		if (_hasPayment) {
			values.push(bubblePrice(group_responses, row.responses.at(0)));
		}

		const excelRow = worksheet.addRow(values);

		// Add alternating row colors
		if (rowIndex % 2 === 1) {
			excelRow.fill = {
				type: "pattern",
				pattern: "solid",
				fgColor: { argb: "F2F2F2" }, // Light gray for alternating rows
			};
		}
	});

	// Add autofilter to allow sorting and filtering
	worksheet.autoFilter = {
		from: { row: 1, column: 1 },
		to: { row: 1, column: titles.length },
	};

	// Freeze the header row
	worksheet.views = [{ state: "frozen", xSplit: 0, ySplit: 1, activeCell: "A2" }];

	// Store Purchases worksheet
	let storeWorksheet;
	let totalPurchases = 0;
	let totalPurchaseAmount = 0;
	let purchasesByItem = {};

	let groupWorksheet;
	if (group_responses.length > 0) {
		groupWorksheet = workbook.addWorksheet("Group Invites");
		const groupInvitesTitles = [
			{ header: "Group Name", key: "groupName", width: 30 },
			{ header: "Email / Number", key: "invitee" },
		];
		const headerRow = groupWorksheet.getRow(1);
		headerRow.font = { bold: true, color: { argb: "FFFFFF" } };
		headerRow.fill = {
			type: "pattern",
			pattern: "solid",
			fgColor: { argb: "4472C4" }, // Blue header background
		};
		headerRow.alignment = { vertical: "middle", horizontal: "center" };

		groupWorksheet.columns = groupInvitesTitles;
		rows.forEach((group) => {
			if (!group.invites || group.invites.length === 0) return;
			group.invites.forEach((invite) => {
				groupWorksheet.addRow({
					groupName: group.groupName || "N/A",
					invitee: invite.email || invite.phoneNumber || "N/A",
				});
			});
			groupWorksheet.addRow({});
		});
		groupWorksheet.views = [{ state: "frozen", xSplit: 0, ySplit: 1 }];
	}

	if (store_response && store_response.length > 0) {
		storeWorksheet = workbook.addWorksheet("Store Purchases");

		// Define columns for store worksheet with better formatting
		const storeColumns = [
			{ header: "User", key: "user", width: 30 },
			{ header: "Quantity", key: "qtty", width: 10 },
			{ header: "Item Name", key: "value", width: 30 },
			{ header: "Price Paid", key: "pricePaid", width: 15 },
			{ header: "Date", key: "date", width: 20 },
		];

		storeWorksheet.columns = storeColumns;

		// Style the header row
		const storeHeaderRow = storeWorksheet.getRow(1);
		storeHeaderRow.font = { bold: true, color: { argb: "FFFFFF" } };
		storeHeaderRow.fill = {
			type: "pattern",
			pattern: "solid",
			fgColor: { argb: "7030A0" }, // Purple header for store sheet
		};
		storeHeaderRow.alignment = { vertical: "middle", horizontal: "center" };

		// Process each response to find associated store purchases
		rows.forEach((row, rowIndex) => {
			if (true) {
				if (!row.responseUlid) return;
				const responseId = row.responseUlid;

				// Get store responses for this form response
				const storeItems = getFormStoreResponses(responseId, store_response);

				// Add each store item as a row
				storeItems.forEach((item, itemIndex) => {
					const { value } = findUserResponseName(form, rows, item.formResponseUlid);
					const storeRow = storeWorksheet.addRow({
						user: value,
						qtty: item.qtty,
						value: item.value,
						pricePaid: item.pricePaid,
						date: item.date,
					});

					// Add alternating row colors
					if ((rowIndex + itemIndex) % 2 === 1) {
						storeRow.fill = {
							type: "pattern",
							pattern: "solid",
							fgColor: { argb: "F2F2F2" }, // Light gray for alternating rows
						};
					}

					// Format currency cell
					storeRow.getCell("pricePaid").numFmt = '"KES "#,##0.00';

					// Add to summary data
					totalPurchases += item.qtty;
					totalPurchaseAmount += item.pricePaid;

					// Track purchases by item for the summary
					if (!purchasesByItem[item.value]) {
						purchasesByItem[item.value] = {
							count: 0,
							total: 0,
						};
					}
					purchasesByItem[item.value].count += item.qtty;
					purchasesByItem[item.value].total += item.pricePaid;
				});
			}
		});

		// Add a summary at the bottom with formatting
		if (store_response.length > 0) {
			// Add a gap before the summary
			storeWorksheet.addRow([]);

			// Add the summary header
			const summaryHeaderRow = storeWorksheet.addRow(["SUMMARY", "", "", "", "", "", ""]);
			summaryHeaderRow.font = { bold: true, color: { argb: "FFFFFF" } };
			summaryHeaderRow.fill = {
				type: "pattern",
				pattern: "solid",
				fgColor: { argb: "44546A" }, // Dark blue header for summary
			};
			storeWorksheet.mergeCells(`A${summaryHeaderRow.number}:G${summaryHeaderRow.number}`);
			summaryHeaderRow.alignment = { horizontal: "center" };

			// Add the total row
			const totalRow = storeWorksheet.addRow([
				"Total Purchases",
				"",
				"",
				totalPurchases,
				"",
				totalPurchaseAmount,
				"",
			]);
			totalRow.font = { bold: true };
			totalRow.getCell("pricePaid").numFmt = '"KES "#,##0.00';

			// Add autofilter
			storeWorksheet.autoFilter = {
				from: { row: 1, column: 1 },
				to: { row: 1, column: 7 },
			};

			// Freeze the header row
			storeWorksheet.views = [{ state: "frozen", xSplit: 0, ySplit: 1, activeCell: "A2" }];
		}

		// Create a pivot table worksheet
		const pivotSheet = workbook.addWorksheet("Purchase Analysis");

		// Set up pivot table headers
		pivotSheet.columns = [
			{ header: "Item Name", key: "item", width: 30 },
			{ header: "Quantity Sold", key: "quantity", width: 15 },
			{ header: "Total Revenue", key: "revenue", width: 20 },
			{ header: "Average Price", key: "average", width: 15 },
		];

		// Style the pivot header row
		const pivotHeaderRow = pivotSheet.getRow(1);
		pivotHeaderRow.font = { bold: true, color: { argb: "FFFFFF" } };
		pivotHeaderRow.fill = {
			type: "pattern",
			pattern: "solid",
			fgColor: { argb: "548235" }, // Green header for pivot sheet
		};
		pivotHeaderRow.alignment = { vertical: "middle", horizontal: "center" };

		// Add pivot data
		let rowIndex = 2;
		for (const [item, data] of Object.entries(purchasesByItem)) {
			const avgPrice = data.total / data.count;
			const pivotRow = pivotSheet.addRow([item, data.count, data.total, avgPrice]);

			// Format currency cells
			pivotRow.getCell("revenue").numFmt = '"KES "#,##0.00';
			pivotRow.getCell("average").numFmt = '"KES "#,##0.00';

			// Add alternating row colors
			if (rowIndex % 2 === 0) {
				pivotRow.fill = {
					type: "pattern",
					pattern: "solid",
					fgColor: { argb: "E2F0D9" }, // Light green for alternating rows
				};
			}

			rowIndex++;
		}

		// Add a total row to the pivot table
		const pivotTotalRow = pivotSheet.addRow([
			"TOTAL",
			totalPurchases,
			totalPurchaseAmount,
			totalPurchaseAmount / totalPurchases,
		]);
		pivotTotalRow.font = { bold: true };
		pivotTotalRow.fill = {
			type: "pattern",
			pattern: "solid",
			fgColor: { argb: "C6E0B4" }, // Green for total row
		};
		pivotTotalRow.getCell("revenue").numFmt = '"KES "#,##0.00';
		pivotTotalRow.getCell("average").numFmt = '"KES "#,##0.00';
	}

	// Create a summary dashboard
	summarySheet.columns = [
		{ header: "Metric", key: "metric", width: 30 },
		{ header: "Value", key: "value", width: 20 },
	];

	// Style the summary header row
	const summaryHeaderRow = summarySheet.getRow(1);
	summaryHeaderRow.font = { bold: true, color: { argb: "FFFFFF" } };
	summaryHeaderRow.fill = {
		type: "pattern",
		pattern: "solid",
		fgColor: { argb: "2F5597" }, // Darker blue header for summary
	};
	summaryHeaderRow.alignment = { vertical: "middle", horizontal: "center" };

	// Add form information
	summarySheet.addRow(["Form Name", form.meta.formName]);
	summarySheet.addRow(["Total Submissions", rows.length]);

	if (_hasPayment) {
		const totalRevenue = rows.reduce((sum, row) => {
			return sum + Number(bubblePrice(group_responses, row.responses.at(0)) || 0);
		}, 0);

		summarySheet.addRow(["Total Form Revenue", totalRevenue]);
		summarySheet.getCell("B3").numFmt = '"KES "#,##0.00';
	}

	if (store_response && store_response.length > 0) {
		summarySheet.addRow(["Total Store Purchases", totalPurchases]);
		summarySheet.addRow(["Total Store Revenue", totalPurchaseAmount]);
		summarySheet.getCell("B5").numFmt = '"KES "#,##0.00';

		// Add a small gap
		summarySheet.addRow([]);

		// Add top 5 selling items
		const topItems = Object.entries(purchasesByItem)
			.sort((a, b) => b[1].total - a[1].total)
			.slice(0, 5);

		summarySheet.addRow(["Top 5 Items by Revenue", ""]);
		const topItemsHeaderRow = summarySheet.getRow(summarySheet.rowCount);
		topItemsHeaderRow.font = { bold: true };
		topItemsHeaderRow.fill = {
			type: "pattern",
			pattern: "solid",
			fgColor: { argb: "BDD7EE" }, // Light blue for section header
		};

		summarySheet.addRow(["Item", "Revenue"]);
		const subHeaderRow = summarySheet.getRow(summarySheet.rowCount);
		subHeaderRow.font = { italic: true };

		topItems.forEach(([item, data]) => {
			summarySheet.addRow([item, data.total]);
			summarySheet.getCell(`B${summarySheet.rowCount}`).numFmt = '"KES "#,##0.00';
		});

		// // Add a chart to the summary sheet
		// if (topItems.length > 0) {
		// 	const chart = workbook.addChart(excel.Charts.BAR);
		// 	chart.title = "Top 5 Items by Revenue";
		//
		// 	// Add the data series
		// 	const startRow = summarySheet.rowCount - topItems.length + 1;
		// 	const endRow = summarySheet.rowCount;
		//
		// 	chart.addSeries({
		// 		name: "Revenue",
		// 		categories: [`Summary!$A$${startRow}:$A$${endRow}`],
		// 		values: [`Summary!$B$${startRow}:$B$${endRow}`],
		// 	});
		//
		// 	// Customize the chart
		// 	chart.legend = { position: "right" };
		// 	chart.dataLabels = { showValue: true, position: "end" };
		// 	chart.chartArea = { border: { color: "transparent" } };
		//
		// 	// Add the chart to the worksheet
		// 	summarySheet.addRow([]);
		// 	summarySheet.addRow([]);
		// 	summarySheet.addImage(chart, {
		// 		tl: { col: 1, row: summarySheet.rowCount },
		// 		br: { col: 6, row: summarySheet.rowCount + 15 },
		// 	});
		// }
	}

	// Set summary as the active sheet when opening
	workbook.views = [{ firstSheet: 0, activeTab: 0, visibility: "visible" }];

	return workbook.xlsx;
}

const findUserResponseName = (
	form: Awaited<ReturnType<typeof getFormResponses>>["form"],
	formResponses: Awaited<ReturnType<typeof getFormResponses>>["form_responses"][],
	formResponseId: string,
) => {
	// Get Fields
	let fields = collectFields(form);
	// Filter Titles
	// Push Labels
	let title: any = null;
	fields.forEach((field) => {
		if (field.label) {
			const fieldLabel = field.label.toLowerCase().replace(/\s+/g, "");
			if (possibleInputNames.some((name) => fieldLabel.includes(name))) {
				if (!title) {
					title = field;
				}
			}
		}
	});

	const res = formResponses[0]?.find((r) => r.responseUlid == formResponseId);
	return {
		title: title.label,
		value: res?.value || null,
	};
};

// Posible Input Names(Labels) To Find User Details
const possibleInputNames = ["email", "name", "firstname", "lastname", "phonenumber", "fullname"];
