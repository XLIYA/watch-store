"use client";
import { useMutation } from "@tanstack/react-query";
import { completePayment } from "@/services/payment.service";

/** عملیات نوشتن مستقل از GET است؛ درگاه فقط پس از پاسخ موفق به URL رسید منتقل می‌شود. */
export function usePaymentMutation() { return useMutation({ mutationFn: completePayment }); }
