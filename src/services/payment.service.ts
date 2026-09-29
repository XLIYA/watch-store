import { apiClient } from "@/services/api/api-client";
import { endpoints } from "@/config/api";
import type { PaymentSummary } from "@/types/order";

/** لینک تصادفی فقط به خلاصهٔ همین سفارش دسترسی می‌دهد؛ API ادمین برای مشتری باز نمی‌شود. */
export async function getPayment(id: string, token: string, signal?: AbortSignal) {
  return (await apiClient.get<PaymentSummary>(endpoints.payment(id), { params: { token }, signal })).data;
}
/** mutation درگاه آزمایشی از این مسیر استفاده می‌کند تا نتیجه و کاهش موجودی با هم در سرور ثبت شوند. */
export async function completePayment({ id, token, outcome }: { id: string; token: string; outcome: "paid" | "failed" }) {
  return (await apiClient.post<PaymentSummary>(endpoints.completePayment(id), { outcome }, { params: { token } })).data;
}
