"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deliverOrder } from "@/services/orders.service";
import { adminOrdersQueryKeys } from "./queries/admin-orders.query-keys";
/** جزئیات و لیست بعد از تحویل موفق با سرور همگام می‌شوند؛ خطا دادهٔ قبلی را تغییر نمی‌دهد. */
export function useDeliverOrderMutation() {
  const client = useQueryClient();
  return useMutation({ mutationFn: deliverOrder, onSuccess: async () => {
    await client.invalidateQueries({ queryKey: adminOrdersQueryKeys.all });
  } });
}
