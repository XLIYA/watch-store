import { CategoryLinks } from "@/components/layout/category-links";
import Link from "next/link";

import { BrandLogo } from "@/components/brand/brand-logo";

export function LandingFooter() {
    const currentYear = new Intl.NumberFormat("fa-IR", {
        useGrouping: false,
    }).format(new Date().getFullYear());

    return (
        <footer dir="rtl" className="border-t border-white/10 bg-ink text-right text-white">
            <div className="site-container">
                {/*
                 * هدف:
                 * نمایش اطلاعات برند و لینک‌های اصلی Footer با ساختار کاملاً RTL.
                 *
                 * محل استفاده:
                 * Footer صفحه اصلی سایت.
                 *
                 * نحوه کار:
                 * در موبایل ستون‌ها زیر هم و در اندازه‌های بزرگ‌تر
                 * در سه ستون نمایش داده می‌شوند.
                 */}
                <div className="grid gap-12 py-14 md:grid-cols-[1.4fr_1fr_1fr] md:py-20">
                    {/*
                     * هدف:
                     * نمایش برند و توضیح کوتاه فروشگاه.
                     *
                     * محل استفاده:
                     * ستون اصلی Footer.
                     *
                     * نحوه کار:
                     * لوگوی برند حفظ شده و توضیح آن با جهت فارسی نمایش داده می‌شود.
                     */}
                    <div className="max-w-md text-right">
                        <BrandLogo href="/" className="text-white" />

                        <p className="mt-6 max-w-sm text-sm leading-7 text-white/50">
                            مجموعه‌ای منتخب از ساعت‌هایی با طراحی
                            ماندگار، جزئیات دقیق و هویتی فراتر از
                            زمان.
                        </p>
                    </div>

                    {/*
                     * هدف:
                     * نمایش لینک مجموعه‌های اصلی فروشگاه.
                     *
                     * محل استفاده:
                     * ستون مجموعه‌ها در Footer.
                     *
                     * نحوه کار:
                     * عنوان و تمام لینک‌ها از راست و با جهت RTL
                     * در یک راستا نمایش داده می‌شوند.
                     */}
                    <div className="text-right">
                        <p className="mb-5 text-sm font-medium text-white/70">
                            مجموعه‌ها
                        </p>

                        <nav aria-label="مجموعه‌های ساعت" className="flex flex-col items-start gap-3 text-sm">
                            <CategoryLinks className="luxury-transition text-white/65 hover:text-white" />

                        </nav>
                    </div>

                    {/*
                     * هدف:
                     * نمایش لینک‌های دسترسی سریع سایت.
                     *
                     * محل استفاده:
                     * ستون سوم Footer.
                     *
                     * نحوه کار:
                     * عنوان و لینک‌ها به‌صورت RTL و هم‌راستا نمایش داده می‌شوند.
                     */}
                    <div className="text-right">
                        <p className="mb-5 text-sm font-medium text-white/70">
                            دسترسی سریع
                        </p>

                        <nav aria-label="دسترسی سریع" className="flex flex-col items-start gap-3 text-sm">
                            <Link href="/shop" className="luxury-transition text-white/65 hover:text-white">
                                فروشگاه
                            </Link>

                            <Link href="/cart" className="luxury-transition text-white/65 hover:text-white">
                                سبد خرید
                            </Link>

                            <Link href="/admin/login" className="luxury-transition text-white/65 hover:text-white">
                                مدیریت
                            </Link>
                        </nav>
                    </div>
                </div>

                {/*
                 * هدف:
                 * نمایش اطلاعات پایانی Footer.
                 *
                 * محل استفاده:
                 * پایین‌ترین قسمت Footer.
                 *
                 * نحوه کار:
                 * سال به ارقام فارسی نمایش داده می‌شود و
                 * نام انگلیسی برند فقط به‌عنوان نام تجاری حفظ می‌شود.
                 */}
                <div className="flex flex-col gap-4 border-t border-white/10 py-6 text-xs text-white/35 sm:flex-row sm:items-center sm:justify-between">
                    <p>
                        © {currentYear}{" "}
                        <span dir="ltr" className="inline-block">
                            WATCH STORE
                        </span>
                    </p>

                    <p>
                        طراحی شده برای تجربه‌ای فراتر از زمان
                    </p>
                </div>
            </div>
        </footer>
    );
}