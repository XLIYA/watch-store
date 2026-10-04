"use client";

import { useCategories, categoryHref } from "@/features/catalog/use-categories";

import { useAdminSession } from "@/features/auth/use-admin-session";
import { useState } from "react";

import Link from "next/link";

import { Menu, Search, ShoppingBag, UserRound, X } from "lucide-react";

import { SelectionLinks } from "@/components/store/selection-links";
import { BrandLogo } from "@/components/brand/brand-logo";
import { HeaderCart } from "@/components/layout/header-cart";
import { HeaderSearch } from "@/components/layout/header-search";

import { useHydrated } from "@/hooks/use-hydrated";
import { selectCartTotals } from "@/features/cart/cart.selectors";
import { useAppSelector } from "@/store/hooks";

export function SiteHeader() {
  const session = useAdminSession();
  const isAdmin = session.data?.user.role === "admin";
  const { data: categories = [] } = useCategories();
  const navigation = categories.map((category) => ({
    label: category.name,
    href: categoryHref(category.slug),
  }));
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const [isCartOpen, setIsCartOpen] = useState(false);

  /*
   * تا زمانی که Hydration کامل نشده،
   * اطلاعات localStorage را در HTML
   * اولیه نمایش نمی‌دهیم.
   */
  const isHydrated = useHydrated();

  const { totalQuantity: cartQuantity } = useAppSelector(selectCartTotals);

  /*
   * Server و اولین Client Render
   * هر دو مقدار صفر می‌بینند.
   *
   * بعد از Hydration مقدار واقعی
   * Redux نمایش داده می‌شود.
   */
  const displayedCartQuantity = isHydrated ? cartQuantity : 0;

  return (
    <>
      {/* Main Header */}
      <header className="sticky top-0 z-50 border-b border-border/70 bg-background/95 backdrop-blur-md">
        <div className="site-container">
          <div className="flex h-[72px] items-center justify-between gap-1 sm:gap-4">
            {/* Mobile menu button */}
            <button
              type="button"
              className="luxury-transition flex size-10 items-center justify-center lg:hidden"
              aria-label="باز کردن منو"
              aria-expanded={isMenuOpen}
              onClick={() => setIsMenuOpen(true)}
            >
              <Menu className="size-[18px]" strokeWidth={1.5} />
            </button>

            {/* Logo */}
            <div className="shrink-0">
              <BrandLogo
                href="/shop"
                className="[&>span]:hidden sm:[&>span]:grid"
              />
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden flex-1 items-center justify-center gap-7 lg:flex">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="luxury-transition text-sm text-foreground/65 hover:text-foreground"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Header Actions */}
            <div className="flex shrink-0 items-center gap-1" dir="ltr">
              <SelectionLinks />
              {/* Search */}
              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                className="luxury-transition flex size-10 items-center justify-center hover:bg-secondary"
                aria-label="جستجو"
              >
                <Search className="size-[18px]" strokeWidth={1.5} />
              </button>

              {/* Cart */}
              <button
                type="button"
                onClick={() => setIsCartOpen(true)}
                className="luxury-transition relative flex size-10 items-center justify-center hover:bg-secondary"
                aria-label={`سبد خرید، ${displayedCartQuantity} کالا`}
              >
                <ShoppingBag className="size-[18px]" strokeWidth={1.5} />

                {displayedCartQuantity > 0 ? (
                  <span
                    className="
                      absolute
                      right-0
                      top-0
                      flex
                      min-h-4
                      min-w-4
                      items-center
                      justify-center
                      rounded-full
                      bg-foreground
                      px-1
                      text-[0.6rem]
                      leading-none
                      text-background
                    "
                  >
                    {displayedCartQuantity > 99 ? "99+" : displayedCartQuantity}
                  </span>
                ) : null}
              </button>

              {/* Admin */}
              <Link
                href={isAdmin ? "/admin/orders" : "/admin/login"}
                className="luxury-transition hidden size-10 items-center justify-center hover:bg-secondary sm:flex"
                aria-label="مدیریت"
              >
                <UserRound className="size-[18px]" strokeWidth={1.5} />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <div
        className={`
          fixed
          inset-0
          z-[60]
          transition
          duration-300
          lg:hidden
          ${
            isMenuOpen
              ? "pointer-events-auto visible"
              : "pointer-events-none invisible"
          }
        `}
      >
        {/* Backdrop */}
        <button
          type="button"
          aria-label="بستن منو"
          className={`
            absolute
            inset-0
            bg-black/40
            transition-opacity
            duration-300
            ${isMenuOpen ? "opacity-100" : "opacity-0"}
          `}
          onClick={() => setIsMenuOpen(false)}
        />

        {/* Mobile Drawer */}
        <aside
          className={`
            absolute
            right-0
            top-0
            flex
            h-full
            w-[85%]
            max-w-sm
            flex-col
            bg-background
            transition-transform
            duration-500
            ease-out
            ${isMenuOpen ? "translate-x-0" : "translate-x-full"}
          `}
        >
          {/* Drawer Header */}
          <div className="flex h-[72px] items-center justify-between border-b border-border px-6">
            <BrandLogo href="/shop" />

            <button
              type="button"
              className="flex size-10 items-center justify-center"
              aria-label="بستن منو"
              onClick={() => setIsMenuOpen(false)}
            >
              <X className="size-[18px]" strokeWidth={1.5} />
            </button>
          </div>

          {/* Drawer Navigation */}
          <nav className="flex flex-1 flex-col px-6 py-8">
            <Link
              href={isAdmin ? "/admin/orders" : "/shop"}
              onClick={() => setIsMenuOpen(false)}
              className="border-b border-border py-4 text-base"
            >
              {isAdmin ? "مشاهدهٔ پنل" : "مشاهدهٔ فروشگاه"}
            </Link>

            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className="luxury-transition border-b border-border py-4 text-base text-foreground/70 hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}

            <Link
              href={isAdmin ? "/admin/orders" : "/admin/login"}
              onClick={() => setIsMenuOpen(false)}
              className="mt-auto pt-8 text-sm text-muted-foreground"
            >
              ورود به مدیریت
            </Link>
          </nav>
        </aside>
      </div>

      {/* Search Dialog */}
      {isSearchOpen ? (
        <HeaderSearch onClose={() => setIsSearchOpen(false)} />
      ) : null}

      {/* Cart Drawer */}
      {isCartOpen ? <HeaderCart onClose={() => setIsCartOpen(false)} /> : null}
    </>
  );
}
