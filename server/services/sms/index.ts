import type { SMSPayload, SMSQuickPayloadMultiple, SMSQuickPayloadSingle } from "../../utils/types";
import { SMS_PORTAL_SEND_SMS } from "./endpoints";

function assert(sth?: any, message?: string): sth is string {
  if (Boolish(sth)) return true;
  throw new Error(message || "Unexpected Nullish string found");
}

interface SendSMSAPIResponse {
  status: string;
  mobile: string;
  invalidMobile: string;
  transactionId: string;
  statusCode: string | "200";
  reason: string;
}

function fqPhone(num: string) {}

export async function sendTextSMS(text: string, phones: string[] | string) {
  const userId = process.env.SMS_PORTAL_USER_ID as string;
  const password = process.env.SMS_PORTAL_PASSWORD as string;
  const senderId = process.env.SMS_PORTAL_SENDER_ID as string;
  const apiKey = process.env.SMS_PORTAL_API_KEY as string;

  assert(userId, "env variable SMS_PORTAL_USER_ID not set");
  assert(senderId, "env variable SMS_PORTAL_SENDER_ID not set");
  if (!Boolish(apiKey) && !Boolish(password)) {
    throw new Error("Either of env variables: SMS_PORTAL_API_KEY or SMS_PORTAL_PASSWORD is required");
  }

  let data;
  if (Array.isArray(phones)) {
    data = {
      sms: phones.map((number) => ({
        mobile: [number],
        msg: text,
      })),
    } satisfies SMSQuickPayloadMultiple;
  } else {
    data = {
      mobile: phones,
      msg: text,
    } satisfies SMSQuickPayloadSingle;
  }

  const payload = {
    userid: userId,
    duplicatecheck: "false",
    msgType: "text",
    sendMethod: "quick",
    password: password,
    senderid: senderId,
    output: "json",
    ...data,
  } satisfies SMSPayload;
  const response = await $fetch<SendSMSAPIResponse>(SMS_PORTAL_SEND_SMS, {
    method: "POST",
    body: payload,
  });
  return Number(response?.statusCode) === 200;
}
