import {
    useQuery,
} from "@tanstack/react-query";

import {
    adminProductsQueryKeys,
} from "@/features/admin/products/queries/admin-products.query-keys";

import {
    getCategories,
} from "@/services/categories.service";

/*
 * هدف:
 * مدیریت دریافت دسته‌بندی‌های محصولات با React Query.
 *
 * محل استفاده:
 * Select گروه محصول در صفحه Admin Products.
 *
 * نحوه کار:
 * getCategories فقط یک بار برای Query Key مربوط به Categories اجرا می‌شود
 * و نتیجه آن توسط React Query Cache می‌شود.
 */
export function useAdminCategoriesQuery() {
    return useQuery({
        queryKey:
            adminProductsQueryKeys.categories(),

        queryFn:
            getCategories,
    });
}