"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice, formatNumber } from "@/lib/format";
import type { Product } from "@/types/product";
/** ویترین لندینگ یک محصول را در مرکز توجه می‌گذارد؛ حرکت دستی با reduced-motion سازگار است. */
export function LandingHero({ products }: { products: Product[] }) {
  const [index, setIndex] = useState(0);
  const active = index % Math.max(products.length, 1);
  const product = products[active];
  function move(direction: number) {
    if (products.length)
      setIndex(
        (value) => (value + direction + products.length) % products.length,
      );
  }
  return (
    <section
      className="relative isolate overflow-hidden bg-forest text-ivory"
      aria-label="ویترین ساعت‌های منتخب"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -left-40 top-20 size-[650px] rounded-full border border-white/10"
      />
      <div className="site-container relative grid items-center gap-12 py-14 lg:min-h-[740px] lg:grid-cols-[.9fr_1.1fr] lg:gap-20 lg:py-20">
        <div className="hero-arrive">
          <p className="mb-8 flex items-center gap-3 text-xs text-gold-light">
            <span className="h-px w-10 bg-gold" />
            خانهٔ ساعت · انتخابی ماندگار
          </p>
          <h1 className="text-[clamp(2.7rem,5vw,5.3rem)] font-light leading-[1.6]">
            برای لحظه‌هایی
            <br />
            که <span className="text-gold-light">می‌مانند.</span>
          </h1>
          <p className="mt-7 max-w-md text-sm leading-8 text-white/65">
            فراتر از دانستن زمان؛ یک انتخاب شخصی. ساعت‌هایی با شخصیت، برای
            داستانی که هر روز می‌سازید.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-5">
            <Button
              asChild
              className="h-12 rounded-full bg-ivory px-7 text-forest transition-all hover:-translate-y-1 hover:bg-gold-light hover:shadow-xl"
            >
              <Link href="/shop">
                کشف مجموعه‌ها <ArrowUpLeft />
              </Link>
            </Button>
            {product && (
              <Link
                href={"/product/" + product.id}
                className="group inline-flex items-center gap-3 border-b border-white/30 pb-2 text-sm transition-colors hover:border-gold-light hover:text-gold-light"
              >
                داستان این ساعت{" "}
                <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
              </Link>
            )}
          </div>
          <div className="mt-14 flex gap-8 border-t border-white/15 pt-6 text-xs text-white/55">
            <span>جزئیات دقیق</span>
            <span>طراحی ماندگار</span>
            <span>انتخاب شما</span>
          </div>
        </div>
        <div
          className="min-w-0"
          onKeyDown={(event) => {
            if (event.key === "ArrowLeft") move(1);
            if (event.key === "ArrowRight") move(-1);
          }}
        >
          {product ? (
            <div key={product.id} className="hero-arrive relative">
              <div className="group relative aspect-square overflow-hidden rounded-t-[46%] rounded-b-3xl bg-ivory shadow-2xl">
                <Image
                  src={product.thumbnail}
                  alt={product.name}
                  fill
                  priority
                  sizes="(max-width:1024px) 90vw,48vw"
                  className="object-contain p-8 mix-blend-multiply transition-transform duration-1000 group-hover:scale-105 group-hover:-rotate-3"
                />
                <div className="absolute inset-x-5 bottom-5 rounded-2xl border border-white/60 bg-white/85 p-5 text-right text-forest backdrop-blur-md">
                  <p
                    dir="auto"
                    className="text-right text-[10px] text-muted-foreground"
                  >
                    {product.brand}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                    <h2 dir="auto" className="text-right text-sm font-semibold">
                      {product.name}
                    </h2>
                    <span className="text-xs">
                      {formatPrice(product.price)} تومان
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid aspect-square place-items-center rounded-3xl border border-white/20">
              ویترین به‌زودی تکمیل می‌شود.
            </div>
          )}
          {products.length > 1 && (
            <div className="mt-6 flex items-center justify-between gap-4">
              <div className="flex gap-2">
                {products.map((item, i) => (
                  <Button
                    key={item.id}
                    type="button"
                    variant="ghost"
                    aria-label={"نمایش " + item.name}
                    aria-pressed={active === i}
                    onClick={() => setIndex(i)}
                    className={
                      "relative size-12 overflow-hidden rounded-xl border p-0 transition-opacity " +
                      (active === i
                        ? "border-gold-light opacity-100"
                        : "border-white/20 opacity-45 hover:opacity-100")
                    }
                  >
                    <Image
                      src={item.thumbnail}
                      alt=""
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </Button>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-white/60">
                  {formatNumber(active + 1)} / {formatNumber(products.length)}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="ساعت قبلی"
                  className="rounded-full border border-white/25 hover:bg-white/15 hover:text-white"
                  onClick={() => move(-1)}
                >
                  <ArrowRight />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="ساعت بعدی"
                  className="rounded-full border border-white/25 hover:bg-white/15 hover:text-white"
                  onClick={() => move(1)}
                >
                  <ArrowLeft />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
