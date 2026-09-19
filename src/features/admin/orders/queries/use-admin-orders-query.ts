import {
    keepPreviousData,
    useQuery,
} from "@tanstack/react-query";

import {
    getAdminOrders,
    type GetAdminOrdersParams,
} from "@/services/orders.service";

import {
    adminOrdersQueryKeys,
} from "@/features/admin/orders/queries/admin-orders.query-keys";

/*
 * هدف:
 * مدیریت دریافت لیست سفارش‌های Admin توسط React Query.
 *
 * محل استفاده:
 * صفحه Admin Orders و هر بخش دیگری که در آینده به همان لیست سفارش‌ها نیاز داشته باشد.
 *
 * نحوه کار:
 * پارامترهای Pagination و Filter داخل Query Key قرار می‌گیرند.
 * با تغییر آن‌ها React Query درخواست مناسب را ارسال و نتیجه را Cache می‌کند.
 *
 * placeholderData باعث می‌شود هنگام تغییر صفحه،
 * داده صفحه قبلی تا رسیدن پاسخ جدید باقی بماند و Table چشمک نزند.
 */
export function useAdminOrdersQuery(
    params: GetAdminOrdersParams,
) {
    return useQuery({
        queryKey:
            adminOrdersQueryKeys.list(
                params,
            ),

        queryFn: ({ signal }) => getAdminOrders(params, signal),

        placeholderData:
            keepPreviousData,
    });
}