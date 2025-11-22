import { createTransport } from "nodemailer";

export const transporter = createTransport({
	host: process.env.NODEMAILER_HOST,
	port: parseInt(process.env.NODEMAILER_PORT || "587"),
	secure: false,
	auth: {
		user: process.env.NODEMAILER_EMAIL,
		pass: process.env.NODEMAILER_PASSWORD,
	},
});

export const sendMail = async (mailDetails: {
	to: string;
	subject: string;
	text?: string;
	html?: string;
}) => {
	try {
		return await transporter.sendMail({
			...mailDetails,
			from: process.env.NODEMAILER_EMAIL,
		});
	} catch (e: any) {
		throw e;
	}
};
