/** Safaricom B2B QueueTimeOutURL */
export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    console.error("B2B timeout:", JSON.stringify(body));
  } catch (e: any) {
    console.error("B2B timeout handler error", e?.message || e);
  }
  return { ResultCode: 0, ResultDesc: "Accepted" };
});
