/** Safaricom B2C QueueTimeOutURL */
export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    console.error("B2C timeout:", JSON.stringify(body));
  } catch (e: any) {
    console.error("B2C timeout handler error", e?.message || e);
  }
  return { ResultCode: 0, ResultDesc: "Accepted" };
});
