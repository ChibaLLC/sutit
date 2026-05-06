import { Mpesa } from "daraja.js";

const app = new Mpesa(
  {
    consumerKey: process.env.MPESA_APP_CONSUMER_KEY!,
    consumerSecret: process.env.MPESA_APP_CONSUMER_SECRET!,
    initiatorPassword: process.env.MPESA_PASSKEY!,
    organizationShortCode: +process.env.MPESA_BUSINESS_SHORTCODE!,
  },
  "production",
);
const config = {
  consumerKey: process.env.MPESA_APP_CONSUMER_KEY!,
  consumerSecret: process.env.MPESA_APP_CONSUMER_SECRET!,
  initiatorPassword: process.env.MPESA_PASSKEY!,
  organizationShortCode: +process.env.MPESA_BUSINESS_SHORTCODE!,
  shortCode: process.env.MPESA_BUSINESS_SHORTCODE!,
  passkey: process.env.MPESA_LNM_PASSKEY!,
};
type AccessToken = {
  access_token: string;
  expires_in: number;
};
const baseUrl = "https://api.safaricom.co.ke";
const cacheToken = defineCachedFunction(async () => await fetchToken(), {
  maxAge: 3500,
});
const fetchToken = async () => {
  try {
    let pass = Buffer.from(config.consumerKey + ":" + config.consumerSecret).toString("base64");
    const res = await $fetch<AccessToken>(`${baseUrl}/oauth/v1/generate`, {
      method: "get",
      query: {
        grant_type: "client_credentials",
      },
      headers: {
        Authorization: `Basic ${pass}`,
      },
    });
    return res.access_token;
  } catch (e) {
    console.log(e);
  }
};
interface StkPushResponse {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResponseCode: string;
  ResponseDescription: string;
  CustomerMessage: string;
}
const timestamp = () => {
  return new Date()
    .toISOString()
    .replace(/[^0-9]/g, "")
    .slice(0, -3);
};
const password = () => {
  return Buffer.from(config.shortCode + config.passkey + timestamp()).toString("base64");
};

export const callStkPush = async (
  phone_number: number,
  amount: number,
  description: string,
  accountNumber: string,
) => {
  try {
    const token = await cacheToken();
    const phone = `254${phone_number.toString().slice(-9)}`;
    const payload = {
      BusinessShortCode: config.shortCode,
      Password: password(),
      Timestamp: timestamp(),
      TransactionType: "CustomerPayBillOnline",
      Amount: amount,
      PartyA: phone,
      PartyB: config.shortCode,
      PhoneNumber: phone,
      CallBackURL: process.env.MPESA_STK_CALLBACK_URL!,
      AccountReference: accountNumber,
      TransactionDesc: description,
    };
    const res = await $fetch<StkPushResponse>(`${baseUrl}/mpesa/stkpush/v1/processrequest`, {
      method: "post",
      body: payload,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res;
  } catch (e) {
    console.log(e);
  }
};
export async function callStkPushL(
  phone_number: number,
  amount: number,
  description: string,
  accountNumber: string,
) {
  const phone = `254${phone_number.toString().slice(-9)}`;
  const res = await $fetch(``);
  const response = await app
    .stkPush()
    .amount(amount)
    .phoneNumber(parseInt(phone))
    .description(description)
    .shortCode(process.env.MPESA_BUSINESS_SHORTCODE!)
    .accountNumber(accountNumber)
    .callbackURL(process.env.MPESA_STK_CALLBACK_URL!)
    .lipaNaMpesaPassKey(process.env.MPESA_LNM_PASSKEY!)
    .send()
    .catch((err) => {
      console.error(err);
      return null;
    });

  if (!response || !response.isOkay()) {
    console.error("STK PUSH FAILED: " + response);
    return null;
  }
  console.log(response);
  return response.data;
}

export async function callB2c(data: { phone_number: string; reason: string; amount: number }) {
  const phone = +`254${data.phone_number.slice(-9)}`;
  const response = await app
    .b2c()
    .amount(data.amount)
    .phoneNumber(phone)
    .occassion(data.reason)
    .resultURL(process.env.MPESA_B2C_CALLBACK_URL!)
    .shortCode(process.env.MPESA_BUSINESS_SHORTCODE!)
    .initiatorName(process.env.MPESA_INITIATOR_NAME!)
    .transactionType("BusinessPayment")
    .timeoutURL(process.env.MPESA_B2C_TIMEOUT_URL!)
    .send();

  if (!response || !response.isOkay()) {
    console.error(response);
    return null;
  }

  return response.data;
}

async function businessPayBill(payload: {
  amount: number;
  accountNumber: string;
  paybill: string;
}) {
  const response = await app
    .b2b()
    .amount(payload.amount)
    .accountNumber(payload.accountNumber)
    .shortCode(process.env.MPESA_BUSINESS_SHORTCODE!)
    .resultURL(process.env.MPESA_B2B_CALLBACK_URL!)
    .timeoutURL(process.env.MPESA_B2B_TIMEOUT_URL!)
    .initiatorName(process.env.MPESA_INITIATOR_NAME!)
    .transactionType("BusinessPayBill")
    .payBill(payload.paybill)
    .send();

  if (!response || !response.isOkay()) {
    console.error(response);
    return null;
  }

  return response.data;
}

async function businessBuyGoods(payload: { amount: number; till: string; requester?: string }) {
  const response = await app
    .b2b()
    .amount(payload.amount)
    .shortCode(process.env.MPESA_BUSINESS_SHORTCODE!)
    .resultURL(process.env.MPESA_B2B_CALLBACK_URL!)
    .timeoutURL(process.env.MPESA_B2B_TIMEOUT_URL!)
    .initiatorName(process.env.MPESA_INITIATOR_NAME!)
    .transactionType("BusinessBuyGoods")
    .senderType("PAYBILL")
    .tillNumber(payload.till)
    .requester(payload.requester)
    .send();

  if (!response || !response.isOkay()) {
    console.error(response);
    return null;
  }

  return response.data;
}

export async function callB2b(data: {
  paybill?: {
    business_no: string;
    account_no: string;
  };
  till_number?: string;
  amount: number;
  requester?: string;
}) {
  if (data.paybill) {
    return businessPayBill({
      amount: data.amount,
      accountNumber: data.paybill.account_no,
      paybill: data.paybill.business_no,
    });
  } else if (data.till_number) {
    return businessBuyGoods({
      amount: data.amount,
      till: data.till_number,
      requester: data.requester,
    });
  } else {
    throw new Error("Both Paybill and Till Number cannot be empty for B2B transactions");
  }
}
