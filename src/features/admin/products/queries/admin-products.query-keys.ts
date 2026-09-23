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
 * تعریف Query Keyهای مربوط به محصولات Admin به‌صورت متمرکز.
 *
 * محل استفاده:
 * useAdminProductsQuery و هر Mutation یا Invalidation مربوط به محصولات.
 *
 * نحوه کار:
 * پارامترهای Pagination، Search، Category و Sort داخل Query Key قرار می‌گیرند
 * تا React Query برای هر ترکیب از فیلترها Cache مستقل داشته باشد.
 */
export const adminProductsQueryKeys = {
    all: [
        "admin",
        "products",
    ] as const,

    lists: () =>
        [
            ...adminProductsQueryKeys.all,
            "list",
        ] as const,

    list: (
        params: AdminProductsQueryParams,
    ) =>
        [
            ...adminProductsQueryKeys.lists(),
            params,
        ] as const,

    /*
     * هدف:
     * تعریف Query Key دسته‌بندی‌های مورد استفاده در صفحه Products.
     *
     * محل استفاده:
     * useAdminCategoriesQuery.
     *
     * نحوه کار:
     * Categories یک Cache مستقل از لیست محصولات دارد
     * و تغییر Pagination یا Search محصولات باعث دریافت مجدد آن نمی‌شود.
     */
    categories: () =>
        [
            ...adminProductsQueryKeys.all,
            "categories",
        ] as const,
};