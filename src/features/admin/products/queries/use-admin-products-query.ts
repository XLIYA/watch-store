import {
    keepPreviousData,
    useQuery,
} from "@tanstack/react-query";

import {
    adminProductsQueryKeys,
} from "@/features/admin/products/queries/admin-products.query-keys";

import {
    getProducts,
} from "@/services/products.service";

type AdminProductsQueryParams =
    NonNullable<
        Parameters<
            typeof getProducts
        >[0]
    >;

/*
 * هدف:
 * مدیریت دریافت لیست محصولات Admin با React Query.
 *
 * محل استفاده:
 * صفحات Admin Products و Admin Inventory.
 *
 * نحوه کار:
 * پارامترهای Pagination، Search، Category و Sort دریافت می‌شوند
 * و هم داخل Query Key و هم در getProducts استفاده می‌شوند.
 * keepPreviousData باعث می‌شود هنگام تغییر صفحه یا فیلتر،
 * داده قبلی تا زمان دریافت Response جدید روی صفحه باقی بماند.
 */
export function useAdminProductsQuery(
    params: AdminProductsQueryParams,
) {
    return useQuery({
        queryKey:
            adminProductsQueryKeys.list(
                params,
            ),

        queryFn: ({ signal }) => getProducts(params, signal),

        placeholderData:
            keepPreviousData,
    });
}