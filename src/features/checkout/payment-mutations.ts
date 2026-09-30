"use client";
import { useMutation } from "@tanstack/react-query";
import { completePayment, requestPaymentCode } from "@/services/payment.service";

/** عملیات نوشتن مستقل از GET است؛ درگاه فقط پس از پاسخ موفق به URL رسید منتقل می‌شود. */
export function usePaymentMutation() { return useMutation({ mutationFn: completePayment, retry: false, networkMode: "always" }); }
/** درخواست آفلاین در صف نمی‌ماند تا پس از اتصال بدون اقدام دوبارهٔ کاربر اجرا نشود. */
export function usePaymentCodeMutation() { return useMutation({ mutationFn: requestPaymentCode, retry: false, networkMode: "always" }); }
