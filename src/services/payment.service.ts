import { apiClient } from "@/services/api/api-client";
import { endpoints } from "@/config/api";
import type { PaymentSummary } from "@/types/order";
import type { PaymentFields } from "../../shared/payment-validation";

/** لینک تصادفی فقط به خلاصهٔ همین سفارش دسترسی می‌دهد؛ API ادمین برای مشتری باز نمی‌شود. */
export async function getPayment(id: string, token: string, signal?: AbortSignal) {
  return (await apiClient.get<PaymentSummary>(endpoints.payment(id), { params: { token }, signal })).data;
}
/** mutation درگاه آزمایشی از این مسیر استفاده می‌کند تا نتیجه و کاهش موجودی با هم در سرور ثبت شوند. */
export async function completePayment({ id, token, outcome, fields }: { id: string; token: string; outcome: "paid" | "failed"; fields?: PaymentFields }) {
  return (await apiClient.post<PaymentSummary>(endpoints.completePayment(id), { outcome, fields }, { params: { token } })).data;
}
/** دریافت رمز و تعویض کد امنیتی mutation مستقل‌اند تا loading و خطایشان از استعلام نتیجه جدا باشد. */
export async function requestPaymentCode({ id, token, kind }: { id: string; token: string; kind: "captcha" | "pin" }) {
  return (await apiClient.post<{code: string; expiresAt: number}>(endpoints.paymentCode(id), {kind}, {params: {token}})).data;
}
