import Link from "next/link";

import { BrandLogo } from "@/components/brand/brand-logo";

export function LandingFooter() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="border-t border-white/10 bg-ink text-white">
            <div className="site-container">
                <div className="grid gap-12 py-14 md:grid-cols-[1.4fr_1fr_1fr] md:py-20">
                    {/* Brand */}
                    <div className="max-w-md">
                        <BrandLogo
                            href="/"
                            className="text-white"
                        />

                        <p className="mt-6 max-w-sm text-sm leading-7 text-white/50">
                            مجموعه‌ای منتخب از ساعت‌هایی با طراحی
                            ماندگار، جزئیات دقیق و هویتی فراتر از
                            زمان.
                        </p>
                    </div>

                    {/* Collections */}
                    <div>
                        <p
                            dir="ltr"
                            className="mb-5 text-[0.7rem] tracking-[0.18em] text-white/40"
                        >
                            COLLECTIONS
                        </p>

                        <nav className="flex flex-col items-start gap-3 text-sm">
                            <Link
                                href="/collections/classic"
                                className="luxury-transition text-white/65 hover:text-white"
                            >
                                کلاسیک
                            </Link>

                            <Link
                                href="/collections/dress"
                                className="luxury-transition text-white/65 hover:text-white"
                            >
                                رسمی
                            </Link>

                            <Link
                                href="/collections/sport"
                                className="luxury-transition text-white/65 hover:text-white"
                            >
                                اسپرت
                            </Link>

                            <Link
                                href="/collections/diver"
                                className="luxury-transition text-white/65 hover:text-white"
                            >
                                غواصی
                            </Link>

                            <Link
                                href="/collections/chronograph"
                                className="luxury-transition text-white/65 hover:text-white"
                            >
                                کرنوگراف
                            </Link>

                            <Link
                                href="/collections/limited-edition"
                                className="luxury-transition text-white/65 hover:text-white"
                            >
                                نسخه محدود
                            </Link>
                        </nav>
                    </div>

                    {/* Navigation */}
                    <div>
                        <p
                            dir="ltr"
                            className="mb-5 text-[0.7rem] tracking-[0.18em] text-white/40"
                        >
                            WATCH STORE
                        </p>

                        <nav className="flex flex-col items-start gap-3 text-sm">
                            <Link
                                href="/shop"
                                className="luxury-transition text-white/65 hover:text-white"
                            >
                                فروشگاه
                            </Link>

                            <Link
                                href="/cart"
                                className="luxury-transition text-white/65 hover:text-white"
                            >
                                سبد خرید
                            </Link>

                            <Link
                                href="/admin/login"
                                className="luxury-transition text-white/65 hover:text-white"
                            >
                                مدیریت
                            </Link>
                        </nav>
                    </div>
                </div>

                <div className="flex flex-col gap-4 border-t border-white/10 py-6 text-xs text-white/35 sm:flex-row sm:items-center sm:justify-between">
                    <p dir="ltr">
                        © {currentYear} WATCH STORE
                    </p>

                    <p>
                        طراحی شده برای تجربه‌ای فراتر از زمان
                    </p>
                </div>
            </div>
        </footer>
    );
}