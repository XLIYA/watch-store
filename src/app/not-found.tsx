import Link from "next/link";

import {
    ArrowRight,
    ShoppingBag,
} from "lucide-react";

import { Button } from "@/components/ui/button";

/*
 * هدف:
 * نمایش صفحه اختصاصی 404 برای مسیرهایی که در فروشگاه وجود ندارند.
 *
 * محل استفاده:
 * Next.js به‌صورت خودکار این Component را برای Routeهای نامعتبر نمایش می‌دهد.
 *
 * نحوه کار:
 * صفحه بدون نیاز به Client Component رندر می‌شود و
 * کاربر می‌تواند به صفحه اصلی یا فروشگاه برگردد.
 */
export default function NotFound() {
    return (
        <main dir="rtl" className="flex min-h-[70vh] items-center justify-center px-4 py-16 text-right">
            <div className="mx-auto w-full max-w-2xl">
                <div className="border border-border bg-background px-6 py-12 sm:px-10 sm:py-16">
                    {/*
                     * هدف:
                     * نمایش کد خطای 404 به‌عنوان عنصر بصری اصلی صفحه.
                     *
                     * محل استفاده:
                     * بالای محتوای صفحه Not Found.
                     *
                     * نحوه کار:
                     * عدد خطا با Typography بزرگ نمایش داده می‌شود
                     * و صرفاً نقش بصری و اطلاع‌رسانی دارد.
                     */}
                    <p className="text-7xl font-medium tracking-tight text-muted-foreground/30 sm:text-8xl">
                        ۴۰۴
                    </p>

                    <div className="mt-8">
                        <h1 className="text-2xl font-medium sm:text-3xl">
                            صفحه موردنظر پیدا نشد
                        </h1>

                        <p className="mt-4 max-w-lg text-sm leading-7 text-muted-foreground sm:text-base">
                            ممکن است آدرس صفحه تغییر کرده باشد، صفحه حذف شده باشد یا نشانی واردشده صحیح نباشد.
                        </p>
                    </div>

                    {/*
                     * هدف:
                     * فراهم کردن مسیر بازگشت کاربر از صفحه 404.
                     *
                     * محل استفاده:
                     * پایین محتوای اصلی صفحه Not Found.
                     *
                     * نحوه کار:
                     * دکمه اول کاربر را به صفحه اصلی و
                     * دکمه دوم به صفحه فروشگاه هدایت می‌کند.
                     */}
                    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                        <Button asChild>
                            <Link href="/">
                                <ArrowRight className="size-4" />
                                بازگشت به صفحه اصلی
                            </Link>
                        </Button>

                        <Button asChild variant="outline">
                            <Link href="/shop">
                                <ShoppingBag className="size-4" />
                                مشاهده فروشگاه
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </main>
    );
}