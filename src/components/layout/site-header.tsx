"use client";

import Link from "next/link";
import {
    Search,
    ShoppingBag,
    UserRoundCog,
} from "lucide-react";

import { BrandLogo } from "@/components/brand/brand-logo";

export function SiteHeader() {
    return (
        <header className="sticky top-0 z-50 border-b border-border/70 bg-background/95 backdrop-blur">
            <div className="site-container flex h-[var(--header-height)] items-center justify-between">
                <div className="flex items-center gap-8">
                    <BrandLogo href="/shop" />

                    <nav className="hidden items-center gap-6 lg:flex">
                        <Link
                            href="/collections/classic"
                            className="luxury-transition text-sm text-foreground/70 hover:text-foreground"
                        >
                            کلاسیک
                        </Link>

                        <Link
                            href="/collections/dress"
                            className="luxury-transition text-sm text-foreground/70 hover:text-foreground"
                        >
                            رسمی
                        </Link>

                        <Link
                            href="/collections/sport"
                            className="luxury-transition text-sm text-foreground/70 hover:text-foreground"
                        >
                            اسپرت
                        </Link>

                        <Link
                            href="/collections/diver"
                            className="luxury-transition text-sm text-foreground/70 hover:text-foreground"
                        >
                            غواصی
                        </Link>
                    </nav>
                </div>

                <div className="flex items-center gap-1">
                    <button
                        type="button"
                        aria-label="جستجو"
                        className="luxury-transition inline-flex size-10 items-center justify-center hover:bg-secondary"
                    >
                        <Search className="size-4.5" />
                    </button>

                    <Link
                        href="/cart"
                        aria-label="سبد خرید"
                        className="luxury-transition relative inline-flex size-10 items-center justify-center hover:bg-secondary"
                    >
                        <ShoppingBag className="size-4.5" />
                    </Link>

                    <Link
                        href="/admin/login"
                        aria-label="مدیریت"
                        className="luxury-transition inline-flex size-10 items-center justify-center hover:bg-secondary"
                    >
                        <UserRoundCog className="size-4.5" />
                    </Link>
                </div>
            </div>
        </header>
    );
}