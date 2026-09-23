import { CategoryLinks } from "@/components/layout/category-links";
import Link from "next/link";

import { BrandLogo } from "@/components/brand/brand-logo";

export function SiteFooter() {
    return (
        <footer dir="rtl" className="border-t border-border/70">
            <div className="site-container py-12">
                {/*
                 * هدف:
                 * نمایش لوگوی فروشگاه و لینک‌های اصلی Footer با چیدمان RTL.
                 *
                 * محل استفاده:
                 * بخش بالایی Footer سایت.
                 *
                 * نحوه کار:
                 * در موبایل لوگو و لینک‌ها زیر هم و در صفحات بزرگ‌تر
                 * در یک ردیف نمایش داده می‌شوند.
                 */}
                <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
                    <BrandLogo href="/shop" />

                    <nav aria-label="لینک‌های پایین سایت" className="flex flex-wrap items-center justify-start gap-x-6 gap-y-3 text-right text-sm text-muted-foreground">
                        <CategoryLinks className="luxury-transition hover:text-foreground" />

                        <Link href="/cart" className="luxury-transition hover:text-foreground">
                            سبد خرید
                        </Link>
                    </nav>
                </div>

                <div className="luxury-divider my-8" />

                {/*
                 * هدف:
                 * نمایش اطلاعات پایانی Footer به زبان فارسی.
                 *
                 * محل استفاده:
                 * پایین‌ترین بخش Footer.
                 *
                 * نحوه کار:
                 * سال به‌صورت فارسی نمایش داده می‌شود و نام برند
                 * انگلیسی باقی می‌ماند چون نام تجاری فروشگاه است.
                 */}
                <div className="flex flex-col gap-2 text-right text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
                    <p>
                        ©{" "}
                        {new Intl.NumberFormat("fa-IR", {
                            useGrouping: false,
                        }).format(new Date().getFullYear())}
                        {" "}
                        Watch Store
                    </p>

                    <p>
                        تجربه خرید ساعت‌های لوکس
                    </p>
                </div>
            </div>
        </footer>
    );
}