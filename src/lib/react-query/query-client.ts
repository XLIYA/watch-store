import { QueryClient } from "@tanstack/react-query";
import { shouldRetryQuery } from "@/services/api/api-error";

/*
 * هدف:
 * ساخت QueryClient مرکزی پروژه با تنظیمات پیش‌فرض مشخص.
 *
 * محل استفاده:
 * توسط QueryProvider برای مدیریت تمام Queryها و Mutationهای React Query.
 *
 * نحوه کار:
 * هر Query می‌تواند تنظیمات اختصاصی خودش را داشته باشد،
 * اما اگر تنظیم خاصی تعریف نشود این مقادیر به‌عنوان Default استفاده می‌شوند.
 */
export function createQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {
                /*
                 * داده دریافت‌شده تا 30 ثانیه Fresh در نظر گرفته می‌شود
                 * و در این بازه درخواست تکراری غیرضروری ارسال نمی‌شود.
                 */
                staleTime: 30_000,

                /*
                 * اگر Query با خطا مواجه شود فقط یک بار مجدداً تلاش می‌کند.
                 */
                retry: shouldRetryQuery,

                /*
                 * با برگشت کاربر به Tab مرورگر درخواست خودکار ارسال نمی‌شود.
                 * در Queryهای حساس می‌توانیم بعداً این رفتار را Override کنیم.
                 */
                refetchOnWindowFocus: false,
            },

            mutations: {
                /*
                 * Mutationهایی مثل Create/Edit/Delete به‌صورت خودکار Retry نمی‌شوند
                 * تا عملیات ناخواسته دوبار روی Backend اجرا نشود.
                 */
                retry: 0,
            },
        },
    });
}
