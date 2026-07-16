import { completeDisbursement } from "~~/server/services/disbursement.service";

/** Safaricom B2C ResultURL callback */
export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    console.log("B2C callback:", JSON.stringify(body));
    await completeDisbursement(body);
    return { ResultCode: 0, ResultDesc: "Accepted" };
  } catch (e: any) {
    console.error("B2C callback error", e?.message || e);
    return { ResultCode: 0, ResultDesc: "Accepted" };
  }
});
