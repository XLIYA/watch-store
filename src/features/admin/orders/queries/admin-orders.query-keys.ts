import type { GetAdminOrdersParams } from "@/services/orders.service";

/*
 * هدف:
 * تعریف Query Keyهای استاندارد مربوط به سفارش‌های Admin.
 *
 * محل استفاده:
 * در Queryهای مربوط به لیست سفارش‌ها و در آینده برای invalidate یا prefetch.
 *
 * نحوه کار:
 * تمام پارامترهای مؤثر روی نتیجه API داخل Query Key قرار می‌گیرند.
 * بنابراین با تغییر page یا filter، React Query آن را به‌عنوان Query متفاوت تشخیص می‌دهد.
 */
export const adminOrdersQueryKeys = {
    all: ["admin", "orders"] as const,

    lists: () =>
        [...adminOrdersQueryKeys.all, "list"] as const,

    list: (params: GetAdminOrdersParams) =>
        [...adminOrdersQueryKeys.lists(), params] as const,
};