import { completeDisbursement } from "~~/server/services/disbursement.service";

/** Safaricom B2B ResultURL callback */
export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    console.log("B2B callback:", JSON.stringify(body));
    await completeDisbursement(body);
    return { ResultCode: 0, ResultDesc: "Accepted" };
  } catch (e: any) {
    console.error("B2B callback error", e?.message || e);
    return { ResultCode: 0, ResultDesc: "Accepted" };
  }
});
