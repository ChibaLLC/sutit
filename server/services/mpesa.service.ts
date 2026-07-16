import { constants, publicEncrypt } from "crypto";

import { getProductionCert, getSandboxCert } from "../utils/mpesa-certs";
import { cache } from "../utils/redis";

const isProduction = process.env.ENV !== "dev" && process.env.NODE_ENV === "production";
const baseUrl = isProduction
  ? "https://api.safaricom.co.ke"
  : process.env.MPESA_ENV === "production"
    ? "https://api.safaricom.co.ke"
    : "https://api.safaricom.co.ke"; // production shortcode configured

const config = {
  consumerKey: process.env.MPESA_APP_CONSUMER_KEY!,
  consumerSecret: process.env.MPESA_APP_CONSUMER_SECRET!,
  initiatorPassword: process.env.MPESA_INITIATOR_PASSWORD!,
  initiatorName: process.env.MPESA_INITIATOR_NAME!,
  shortCode: process.env.MPESA_BUSINESS_SHORTCODE!,
  passkey: process.env.MPESA_LNM_PASSKEY!,
  securityCredential: process.env.MPESA_SECURITY_CREDENTIAL,
};

type AccessToken = {
  access_token: string;
  expires_in: number;
};

const fetchToken = async () => {
  try {
    const tk = await cache.get<string>("sutit:mpesa_token");
    if (tk) return tk;

    const pass = Buffer.from(config.consumerKey + ":" + config.consumerSecret).toString("base64");
    const res = await $fetch<AccessToken>(`${baseUrl}/oauth/v1/generate`, {
      method: "get",
      query: { grant_type: "client_credentials" },
      headers: { Authorization: `Basic ${pass}` },
    });
    await cache.set("sutit:mpesa_token", res.access_token, 3500);
    return res.access_token;
  } catch (e) {
    console.error("Failed to fetch M-Pesa token", e);
    throw e;
  }
};

/** RSA-encrypt initiator password with Safaricom cert → SecurityCredential */
const getSecurityCredential = () => {
  const certificate = process.env.MPESA_ENV === "sandbox" ? getSandboxCert() : getProductionCert();
  return publicEncrypt(
    { key: certificate, padding: constants.RSA_PKCS1_PADDING },
    Buffer.from(config.initiatorPassword),
  ).toString("base64");
};

const timestamp = () =>
  new Date()
    .toISOString()
    .replace(/[^0-9]/g, "")
    .slice(0, -3);

const password = () =>
  Buffer.from(config.shortCode + config.passkey + timestamp()).toString("base64");

const cleanText = (text: string, maxLen = 100) =>
  text
    .replace(/[\p{Extended_Pictographic}]/gu, "")
    .replace(/[\uFE0F\u200D]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLen);

export const normalizeMpesaPhone = (phone: string | number) => {
  const digits = String(phone).replace(/\D/g, "");
  return `254${digits.slice(-9)}`;
};

// ─── STK Push (C2B collection) ───────────────────────────────────────────────

interface StkPushResponse {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResponseCode: string;
  ResponseDescription: string;
  CustomerMessage: string;
}

export const callStkPush = async (
  phone_number: number,
  amount: number,
  description: string,
  accountNumber: string,
) => {
  try {
    const token = await fetchToken();
    const phone = normalizeMpesaPhone(phone_number);
    const payload = {
      BusinessShortCode: config.shortCode,
      Password: password(),
      Timestamp: timestamp(),
      TransactionType: "CustomerPayBillOnline",
      Amount: Math.round(amount),
      PartyA: phone,
      PartyB: config.shortCode,
      PhoneNumber: phone,
      CallBackURL: process.env.MPESA_STK_CALLBACK_URL!,
      AccountReference: cleanText(accountNumber, 12),
      TransactionDesc: cleanText(description, 13),
    };
    console.log("STK Payload:", { ...payload, Password: "[redacted]" });
    const res = await $fetch<StkPushResponse>(`${baseUrl}/mpesa/stkpush/v1/processrequest`, {
      method: "post",
      body: payload,
      headers: { Authorization: `Bearer ${token}` },
    });
    return res;
  } catch (e) {
    console.error("STK Push failed", e);
    return null;
  }
};

// ─── B2C (disburse to phone) ─────────────────────────────────────────────────

export interface MpesaAsyncResponse {
  ConversationID: string;
  OriginatorConversationID: string;
  ResponseCode: string;
  ResponseDescription: string;
}

export const callB2c = async (data: {
  originatorConversationID: string;
  phone_number: string;
  reason: string;
  amount: number;
  remarks?: string;
}) => {
  try {
    const token = await fetchToken();
    const phone = normalizeMpesaPhone(data.phone_number);
    const payload = {
      OriginatorConversationID: data.originatorConversationID,
      InitiatorName: config.initiatorName,
      SecurityCredential: config.securityCredential,
      CommandID: "BusinessPayment",
      Amount: Math.round(data.amount),
      PartyA: config.shortCode,
      PartyB: phone,
      Remarks: cleanText(data.remarks || data.reason),
      QueueTimeOutURL: process.env.MPESA_B2C_TIMEOUT_URL!,
      ResultURL: process.env.MPESA_B2C_CALLBACK_URL!,
      Occasion: cleanText(data.reason),
    };
    console.log("B2C Payload:", { ...payload, SecurityCredential: "[redacted]" });
    const res = await $fetch<MpesaAsyncResponse>(`${baseUrl}/mpesa/b2c/v1/paymentrequest`, {
      method: "post",
      body: payload,
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ResponseCode !== "0") {
      console.error("B2C rejected:", res);
      return null;
    }
    return res;
  } catch (e) {
    console.error("B2C failed", e);
    return null;
  }
};

// ─── B2B (disburse to till / paybill) ────────────────────────────────────────

/** Pay to a business paybill number */
export const callB2bPayBill = async (payload: {
  amount: number;
  paybill: string;
  accountNumber: string;
  remarks?: string;
}) => {
  try {
    const token = await fetchToken();
    const body = {
      Initiator: config.initiatorName,
      SecurityCredential: getSecurityCredential(),
      CommandID: "BusinessPayBill",
      SenderIdentifierType: "4",
      RecieverIdentifierType: "4",
      Amount: Math.round(payload.amount),
      PartyA: config.shortCode,
      PartyB: payload.paybill,
      AccountReference: cleanText(payload.accountNumber, 13),
      Remarks: cleanText(payload.remarks || "Form payout", 100),
      QueueTimeOutURL: process.env.MPESA_B2B_TIMEOUT_URL!,
      ResultURL: process.env.MPESA_B2B_CALLBACK_URL!,
    };
    console.log("B2B PayBill Payload:", { ...body, SecurityCredential: "[redacted]" });
    const res = await $fetch<MpesaAsyncResponse>(`${baseUrl}/mpesa/b2b/v1/paymentrequest`, {
      method: "post",
      body,
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ResponseCode !== "0") {
      console.error("B2B PayBill rejected:", res);
      return null;
    }
    return res;
  } catch (e) {
    console.error("B2B PayBill failed", e);
    return null;
  }
};

/** Pay to a buy-goods till number */
export const callB2bBuyGoods = async (payload: {
  amount: number;
  till: string;
  remarks?: string;
}) => {
  try {
    const token = await fetchToken();
    const body = {
      Initiator: config.initiatorName,
      SecurityCredential: getSecurityCredential(),
      CommandID: "BusinessBuyGoods",
      SenderIdentifierType: "4",
      RecieverIdentifierType: "2",
      Amount: Math.round(payload.amount),
      PartyA: config.shortCode,
      PartyB: payload.till,
      AccountReference: cleanText(payload.remarks || "Form payout"),
      Remarks: cleanText(payload.remarks || "Form payout"),
      QueueTimeOutURL: process.env.MPESA_B2B_TIMEOUT_URL!,
      ResultURL: process.env.MPESA_B2B_CALLBACK_URL!,
    };
    console.log("B2B BuyGoods Payload:", { ...body, SecurityCredential: "[redacted]" });
    const res = await $fetch<MpesaAsyncResponse>(`${baseUrl}/mpesa/b2b/v1/paymentrequest`, {
      method: "post",
      body,
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ResponseCode !== "0") {
      console.error("B2B BuyGoods rejected:", res);
      return null;
    }
    return res;
  } catch (e) {
    console.error("B2B BuyGoods failed", e);
    return null;
  }
};

export async function callB2b(data: {
  paybill?: { business_no: string; account_no: string };
  till_number?: string;
  amount: number;
  remarks?: string;
}) {
  if (data.paybill) {
    return callB2bPayBill({
      amount: data.amount,
      paybill: data.paybill.business_no,
      accountNumber: data.paybill.account_no,
      remarks: data.remarks,
    });
  }
  if (data.till_number) {
    return callB2bBuyGoods({
      amount: data.amount,
      till: data.till_number,
      remarks: data.remarks,
    });
  }
  throw new Error("Either paybill or till_number is required for B2B");
}
