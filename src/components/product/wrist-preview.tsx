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
import type { WatchPlacement } from "@/features/catalog/try-on-assets";

/** Embla حرکت و swipe را انجام می‌دهد؛ تنها تصویر شفاف روی دست ثابت قرار می‌گیرد، بدون دوربین یا ادعای اندازه‌گیری. */
export function WristPreview({
  wristImage,
  aspectRatio,
  items,
}: {
  wristImage: string;
  aspectRatio: string;
  items: { product: Product; image: string; placement: WatchPlacement }[];
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
      className="grid items-center gap-8 lg:grid-cols-2 lg:gap-16"
    >
      <div
        className="relative overflow-hidden rounded-3xl bg-secondary"
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
            {items.map(({ product, image, placement }) => (
              <CarouselItem key={product.id} className="relative h-full pl-0">
                <div
                  className="absolute"
                  style={{
                    left: `${placement.x}%`,
                    top: `${placement.y}%`,
                    width: `${placement.width}%`,
                    transform: `translate(-50%, -50%) rotate(${placement.rotation}deg)`,
                  }}
                >
                  <Image
                    src={image}
                    alt={product.name}
                    width={700}
                    height={1000}
                    unoptimized
                    className="h-auto w-full select-none"
                    draggable={false}
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </div>
      </div>
      <div className="space-y-6">
        <p className="section-kicker">روی مچ ببین</p>
        <div aria-live="polite">
          <p className="text-sm text-muted-foreground">{item.product.brand}</p>
          <h2 className="mt-3 text-2xl leading-relaxed">{item.product.name}</h2>
          <p className="mt-4 text-lg text-forest">
            {formatPrice(item.product.price)} تومان
          </p>
        </div>
        <div className="flex items-center gap-3">
          <CarouselPrevious
            className="static translate-x-0 translate-y-0 [&_svg]:rotate-180"
            aria-label="ساعت قبلی"
          />
          <span className="text-sm">
            {formatNumber(selected + 1)} / {formatNumber(items.length)}
          </span>
          <CarouselNext
            className="static translate-x-0 translate-y-0 [&_svg]:rotate-180"
            aria-label="ساعت بعدی"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {items.map(({ product }, index) => (
            <Button
              key={product.id}
              variant={index === selected ? "default" : "outline"}
              onClick={() => api?.scrollTo(index)}
              aria-pressed={index === selected}
            >
              {product.name}
            </Button>
          ))}
        </div>
        <ProductSelectionActions
          id={item.product.id}
          name={item.product.name}
        />
        <Button asChild className="h-12 px-8">
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
