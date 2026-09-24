"use client";

import Image from "next/image";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  /*
   * هدف:
   * نمایش Placeholder زمانی که محصول هیچ تصویری ندارد.
   *
   * محل استفاده:
   * ابتدای ProductGallery قبل از Render شدن Carousel.
   *
   * نحوه کار:
   * اگر images خالی باشد، به‌جای Gallery یک فضای ثابت با نام برند نمایش داده می‌شود.
   */
  if (images.length === 0) {
    return (
      <div className="flex aspect-[4/5] w-full items-center justify-center overflow-hidden bg-secondary">
        <span
          dir="ltr"
          className="font-heading text-3xl tracking-[0.12em] text-foreground/10"
        >
          WATCH STORE
        </span>
      </div>
    );
  }

  return (
    /*
     * هدف:
     * جایگزینی Swiper با Carousel رسمی shadcn و Embla.
     *
     * محل استفاده:
     * گالری تصاویر صفحه جزئیات محصول.
     *
     * نحوه کار:
     * هر تصویر داخل یک CarouselItem قرار می‌گیرد و Embla
     * Drag و Swipe را در موبایل و Desktop مدیریت می‌کند.
     */
    <Carousel
      opts={{
        align: "start",
        loop: images.length > 1,
        dragFree: false,
      }}
      className="group relative w-full overflow-hidden rounded-xl bg-secondary"
      dir="ltr"
    >
      {/*
       * هدف:
       * نگهداری تمام تصاویر محصول داخل Track اصلی Carousel.
       *
       * محل استفاده:
       * بخش اصلی ProductGallery.
       *
       * نحوه کار:
       * هر CarouselItem دقیقاً عرض کامل Gallery را می‌گیرد
       * تا در هر لحظه فقط یک تصویر نمایش داده شود.
       */}
      <CarouselContent className="ml-0">
        {images.map((image, index) => (
          <CarouselItem key={`${image}-${index}`} className="basis-full pl-0">
            <div className="relative aspect-[4/5] w-full overflow-hidden bg-secondary">
              <Image
                src={image}
                alt={`${productName} - تصویر ${index + 1}`}
                fill
                priority={index === 0}
                draggable={false}
                sizes="(max-width: 1024px) 100vw, 55vw"
                className="select-none object-contain p-6 mix-blend-multiply"
              />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>

      {/*
       * هدف:
       * نمایش دکمه‌های قبلی و بعدی به شکلی که در موبایل همیشه قابل مشاهده باشند.
       *
       * محل استفاده:
       * روی خود تصویر ProductGallery.
       *
       * نحوه کار:
       * در موبایل opacity همیشه 100 است؛ در Desktop دکمه‌ها هنگام Hover روی Gallery ظاهر می‌شوند.
       * CarouselPrevious و CarouselNext مستقیماً به Embla متصل هستند.
       */}
      {images.length > 1 ? (
        <>
          <CarouselPrevious
            aria-label="تصویر قبلی"
            className="luxury-transition !inset-y-auto !top-1/2 !bottom-auto !my-0 left-3 z-20 size-10 -translate-y-1/2 rounded-md border-white/25 bg-black/25 text-white opacity-100 backdrop-blur-sm hover:bg-black/45 hover:text-white md:left-5 md:size-11 md:opacity-0 md:group-hover:opacity-100"
          />

          <CarouselNext
            aria-label="تصویر بعدی"
            className="luxury-transition !inset-y-auto !top-1/2 !bottom-auto !my-0 right-3 z-20 size-10 -translate-y-1/2 rounded-md border-white/25 bg-black/25 text-white opacity-100 backdrop-blur-sm hover:bg-black/45 hover:text-white md:right-5 md:size-11 md:opacity-0 md:group-hover:opacity-100"
          />
        </>
      ) : null}
    </Carousel>
  );
}
