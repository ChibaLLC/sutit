import { insertPayment } from "../forms/queries";
export async function insertAnonymousPayment(data: { amount: number, referenceCode: string, phone: string }) {
    await insertPayment(data.amount, data.referenceCode, data.phone)
}