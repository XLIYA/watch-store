import Link from "next/link";
import { BrandLogo } from "@/components/brand/brand-logo";
import { CategoryLinks } from "./category-links";
import { brand } from "@/config/brand";

/** فوتر مشترک خانه، کاتالوگ و خرید؛ لینک گروه‌ها از API و هویت بصری از تنظیمات برند می‌آید. */
export function SiteFooter() {
  return (
    <footer className="bg-ink text-ivory">
      <div className="site-container">
        <div className="grid gap-10 py-16 md:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <BrandLogo />
            <p className="mt-6 max-w-sm text-sm leading-8 text-ivory/60">
              {brand.description}
            </p>
            <p
              className="mt-8 text-right text-xl leading-10 text-gold-light"
              dir="rtl"
            >
              زمان، به سلیقهٔ شما.
            </p>
          </div>
          <div>
            <h2 className="mb-5 text-sm text-gold-light">مجموعه‌ها</h2>
            <nav
              aria-label="مجموعه‌های پایین سایت"
              className="grid gap-3 text-xs"
            >
              <CategoryLinks className="w-fit text-ivory/65 transition-colors hover:text-white" />
            </nav>
          </div>
          <div>
            <h2 className="mb-5 text-sm text-gold-light">خانهٔ ساعت</h2>
            <nav
              aria-label="دسترسی سریع"
              className="grid gap-4 text-xs text-ivory/65"
            >
              <Link href="/shop">کاتالوگ ساعت‌ها</Link>
              <Link href="/finder">راهنمای انتخاب ساعت</Link>
              <Link href="/compare">مقایسهٔ ساعت‌ها</Link>
              <Link href="/favorites">علاقه‌مندی‌ها</Link>
              <Link href="/cart">سبد خرید</Link>
              <Link href="/admin/login">مدیریت فروشگاه</Link>
            </nav>
          </div>
        </div>
        <div className="flex flex-wrap justify-between gap-3 border-t border-white/10 py-6 text-[10px] text-ivory/45">
          <p>
            ©{" "}
            {new Intl.NumberFormat("fa-IR", { useGrouping: false }).format(
              new Date().getFullYear(),
            )}{" "}
            {brand.name}
          </p>
          <p>زمان، به سلیقهٔ شما.</p>
        </div>
      </div>
    </footer>
  );
}
