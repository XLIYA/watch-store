"use client";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/services/api/api-client";
import { endpoints } from "@/config/api";
export interface DeliveryAvailability { unavailable: Record<string, string[]>; fullyBookedDates: string[] }
/** تقویم و ساعت یک پاسخ مشترک دارند؛ polling و بازگشت به تب، رزرو کاربران دیگر را تازه می‌کنند. */
export function useDeliveryAvailability() {
  return useQuery({
    queryKey: ["delivery", "availability"],
    queryFn: async ({ signal }) => (await apiClient.get<DeliveryAvailability>(endpoints.deliveryAvailability, { signal })).data,
    staleTime: 0, refetchInterval: 15000, retry: false,
  });
}
