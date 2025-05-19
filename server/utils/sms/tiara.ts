import type { TiaraSmsResponse } from "../types";

const TIARA_SMS_ENDPOINT = process.env.TIARA_API_ENDPOINT;
const TIARA_SMS_API_ENDPOINT = `${TIARA_SMS_ENDPOINT}/messaging/sendsms`;
const TIARA_SENDER_ID = process.env.TIARA_SENDER_ID;
const TIARA_BEARER_TOKEN = process.env.TIARA_SMS_API_KEY;

export const sendTextSmsTiara = async (data: { phone: string; message: string }) => {
	console.log("Phone Number: " + data.phone);
	console.log("Beare Token: " + TIARA_BEARER_TOKEN);
	const response = await $fetch<TiaraSmsResponse>(TIARA_SMS_API_ENDPOINT, {
		body: {
			from: TIARA_SENDER_ID,
			to: data.phone,
			message: data.message,
		},
		method: "POST",
		headers: {
			Authorization: `Bearer ${TIARA_BEARER_TOKEN}`,
		},
	});

	return response;
};
