import path from "path";
import fs from "fs";
export const sendUserReceipt = async (
	email: string,
	templateData: Record<string, string | number | any | any[]>,
	template: string
) => {
	// Read content
	let templateContent = readTemplate(template);
	// Replace content
	let newContent = replaceTemplateData(templateContent, templateData);
	await sendMail({
		to: email,
		subject: "[Update] Receipt",
		html: newContent,
	});
};

// Email templates in server emails
const readTemplate = (template: string) => {
	const templatePath = path.resolve(`server/emails/${template}.html`);
	let emailTemplate = fs.existsSync(templatePath) ? fs.readFileSync(templatePath, "utf8") : "";
	return emailTemplate;
};

const replaceTemplateData = (content: string, templateData: Record<string, string | number | any | any[]>) => {
	let newContent = content;
	Object.keys(templateData).forEach((key) => {
		newContent = newContent.replace(new RegExp(`{{${key}}}`, "g"), templateData[key]);
	});
	return newContent;
};

type Item = {
	name: string;
	qtty: string | "infinity" | number;
	liked: boolean;
	carted: boolean;
	stock: string | number;
	price: string | number;
};
export const generateStoreTable = (stores?: Record<string | number, Item>) => {
	if (!stores) return "";

	let table = /*html*/ `
				<table>
					<tr>
						<th>Product</th>
						<th>@</th>
						<th>Quantity</th>
						<th>Total</th>
					</tr>`;

	let total = 0;
	let parsed: Item[];
	if (Array.isArray(stores)) {
		parsed = stores;
	} else {
		parsed = Object.values(stores);
	}

	parsed.forEach((item) => {
		total += +item.qtty * +item.price;
		table += /*html*/ `
				<tr>
					<td>${item.name}</td>
					<td>${item.price}</td>
					<td>${item.qtty}</td>
					<td>${+item.qtty * +item.price}</td>
				</tr>`;
	});

	table += /*html*/ `
			<tr>
				<th colspan="3">TOTAL</th>
				<th>${total}</th>
			</tr>`;

	return table;
};
