"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { ProductSelectionActions } from "@/components/store/product-selection-actions";
import { formatPrice, formatNumber } from "@/lib/format";
import type { Product } from "@/types/product";
import type {
  WatchPlacement,
  WatchImageBounds,
} from "@/features/catalog/try-on-assets";

/** Embla حرکت و swipe را انجام می‌دهد؛ تنها تصویر شفاف روی دست ثابت قرار می‌گیرد، بدون دوربین یا ادعای اندازه‌گیری. */
export function WristPreview({
  wristImage,
  aspectRatio,
  items,
}: {
  wristImage: string;
  aspectRatio: string;
  items: {
    product: Product;
    image: string;
    placement: WatchPlacement;
    bounds?: WatchImageBounds;
  }[];
}) {
  const [api, setApi] = useState<CarouselApi>();
  const [selected, setSelected] = useState(0);
  useEffect(() => {
    if (!api) return;
    const sync = () => setSelected(api.selectedScrollSnap());
    api.on("select", sync);
    api.on("reInit", sync);
    return () => {
      api.off("select", sync);
      api.off("reInit", sync);
    };
  }, [api]);
  const item = items[selected] ?? items[0];
  return (
    <Carousel
      setApi={setApi}
      opts={{ direction: "rtl", loop: items.length > 1 }}
      dir="rtl"
      className="grid items-start gap-6 lg:grid-cols-[1.35fr_1fr] lg:gap-8"
    >
      <div
        className="relative overflow-hidden rounded-3xl border border-border/60 bg-secondary lg:sticky lg:top-24"
        style={{ aspectRatio }}
      >
        <Image
          src={wristImage}
          alt="مچ نمونه برای نمایش ساعت"
          fill
          priority
          sizes="(max-width:1024px) 100vw,50vw"
          className="object-cover"
        />
        <div className="absolute inset-0">
          <CarouselContent className="ml-0 h-full" viewportClassName="h-full">
            {items.map(({ product, image, placement, bounds }) => (
              <CarouselItem key={product.id} className="relative h-full pl-0">
                {/* ماسک ثابت دست، بند را در لبهٔ مچ پنهان می‌کند؛ خود تصویر ساعت و جزئیات آن تغییر نمی‌کند. */}
                <div
                  className="absolute inset-0"
                  style={{
                    maskImage: `url(${wristImage})`,
                    maskSize: "100% 100%",
                    maskRepeat: "no-repeat",
                  }}
                >
                  <div
                    className="absolute overflow-hidden"
                    style={{
                      left: `${placement.x}%`,
                      top: `${placement.y}%`,
                      width: `${placement.width}%`,
                      transform: `translate(-50%, -50%) rotate(${placement.rotation}deg)`,
                      aspectRatio: bounds
                        ? (bounds.width * bounds.aspect) / bounds.height
                        : "7 / 10",
                    }}
                  >
                    {/* محدودهٔ واقعی پیکسل‌های ساعت اندازه را تعیین می‌کند، نه حاشیهٔ شفاف فایل؛ همهٔ مدل‌ها عرض یکسان دارند. */}
                    <Image
                      src={image}
                      alt={product.name}
                      width={700}
                      height={1000}
                      unoptimized
                      className="absolute max-w-none select-none"
                      style={
                        bounds
                          ? {
                              width: `${100 / bounds.width}%`,
                              height: `${100 / bounds.height}%`,
                              left: `${(-100 * bounds.x) / bounds.width}%`,
                              top: `${(-100 * bounds.y) / bounds.height}%`,
                            }
                          : { width: "100%", height: "100%" }
                      }
                      draggable={false}
                    />
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </div>
      </div>
      <div className="space-y-6 rounded-3xl border border-border/70 bg-card p-5 md:p-7">
        <div className="flex items-center justify-between gap-3">
          <p className="section-kicker">انتخاب شما</p>
          <span className="rounded-full bg-secondary px-3 py-1 text-xs text-muted-foreground">
            {formatNumber(items.length)} مدل برای پرو
          </span>
        </div>
        <div aria-live="polite">
          <p className="text-sm text-muted-foreground">{item.product.brand}</p>
          <h2
            dir="auto"
            className="mt-2 text-right text-xl leading-relaxed md:text-2xl"
          >
            {item.product.name}
          </h2>
          <p className="mt-4 text-lg text-forest">
            {formatPrice(item.product.price)} تومان
          </p>
        </div>
        <div className="flex items-center justify-between gap-3 border-y border-border/70 py-3">
          <CarouselPrevious
            className="static translate-x-0 translate-y-0 [&_svg]:rotate-180"
            aria-label="ساعت قبلی"
          />
          <span className="text-xs text-muted-foreground">
            مدل {formatNumber(selected + 1)} از {formatNumber(items.length)}
          </span>
          <CarouselNext
            className="static translate-x-0 translate-y-0 [&_svg]:rotate-180"
            aria-label="ساعت بعدی"
          />
        </div>
        <div>
          <p className="mb-3 text-sm font-medium">مدل بعدی را انتخاب کنید</p>
          {/* تصاویر کوچک انتخاب مدل را سریع می‌کنند؛ نام کامل هر دکمه برای صفحه‌خوان و راهنمای ماوس حفظ می‌شود. */}
          <div
            className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-4"
            role="group"
            aria-label="انتخاب مدل ساعت"
          >
            {items.map(({ product, image }, index) => (
              <Button
                key={product.id}
                variant={index === selected ? "default" : "outline"}
                onClick={() => api?.scrollTo(index)}
                aria-pressed={index === selected}
                aria-label={product.name}
                title={product.name}
                className="relative h-20 overflow-hidden rounded-xl p-2 transition-transform hover:-translate-y-0.5 motion-reduce:transform-none"
              >
                <Image
                  src={image}
                  alt=""
                  fill
                  sizes="80px"
                  className="object-contain p-2"
                />
              </Button>
            ))}
          </div>
        </div>
        <ProductSelectionActions
          id={item.product.id}
          name={item.product.name}
        />
        <Button asChild className="h-12 w-full px-8">
          <Link href={`/product/${item.product.id}`}>مشخصات و انتخاب ساعت</Link>
        </Button>
        <p className="text-xs leading-7 text-muted-foreground">
          نمایش روی مچ نمونه برای مقایسهٔ ظاهر است؛ اندازهٔ واقعی ساعت روی مچ
          شما را تعیین نمی‌کند.
        </p>
      </div>
    </Carousel>
  );
}
