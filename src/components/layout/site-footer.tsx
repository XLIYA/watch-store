import Link from "next/link";

import { BrandLogo } from "@/components/brand/brand-logo";

export function SiteFooter() {
    return (
        <footer className="border-t border-border/70">
            <div className="site-container py-12">
                <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
                    <BrandLogo href="/shop" />

                    <nav className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted-foreground">
                        <Link
                            href="/collections/classic"
                            className="luxury-transition hover:text-foreground"
                        >
                            کلاسیک
                        </Link>

                        <Link
                            href="/collections/dress"
                            className="luxury-transition hover:text-foreground"
                        >
                            رسمی
                        </Link>

                        <Link
                            href="/collections/sport"
                            className="luxury-transition hover:text-foreground"
                        >
                            اسپرت
                        </Link>

                        <Link
                            href="/cart"
                            className="luxury-transition hover:text-foreground"
                        >
                            سبد خرید
                        </Link>
                    </nav>
                </div>

                <div className="luxury-divider my-8" />

                <div className="flex flex-col gap-2 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
                    <p>
                        © {new Date().getFullYear()} Watch Store
                    </p>

                    <p>
                        Luxury Watch Experience
                    </p>
                </div>
            </div>
        </footer>
    );
}