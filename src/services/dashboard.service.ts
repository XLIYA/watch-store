import { apiClient } from "@/services/api/api-client";
import { endpoints } from "@/config/api";
import type { OrderStatus } from "@/types/order";

export interface DashboardSummary {
  days: number;
  generatedAt: number;
  revenue: number;
  paidOrders: number;
  orderCount: number;
  productCount: number;
  stockCount: number;
  lowStockCount: number;
  daily: { date: string; amount: number; count: number }[];
  statuses: { status: OrderStatus; count: number }[];
  lowStock: { id: number; name: string; quantity: number }[];
  topProducts: { id: number; name: string; quantity: number }[];
}
/** فقط گزارش خلاصهٔ سرور دریافت می‌شود؛ محاسبه روی یک صفحهٔ محدود سفارش‌ها گزارش ناقص می‌سازد. */
export async function getDashboard(days: number, signal?: AbortSignal) {
  return (
    await apiClient.get<DashboardSummary>(endpoints.dashboard, {
      params: { days },
      requiresAuth: true,
      signal,
    })
  ).data;
}
