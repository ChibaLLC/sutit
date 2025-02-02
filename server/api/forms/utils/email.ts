import path from "path";
import fs from "fs";
export const sendUserReceipt = async (
	email: string,
	templateData: Record<string, string | number | any | any[]>,
	template: string,
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
	let newContent = "";
	Object.keys(templateData).forEach((key) => {
		newContent = content.replace(new RegExp(`{{${key}}}`, "g"), templateData[key]);
	});
	return newContent;
};
