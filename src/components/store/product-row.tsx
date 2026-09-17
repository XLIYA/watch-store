"use client";

import { ProductCard } from "@/components/store/product-card";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";

import type { Product } from "@/types/product";

interface ProductRowProps {
    products: Product[];
    className?: string;
}

export function ProductRow({
    products,
    className = "",
}: ProductRowProps) {
    /*
     * هدف:
     * نمایش حالت خالی زمانی که هیچ محصولی برای Carousel وجود ندارد.
     *
     * محل استفاده:
     * ابتدای ProductRow قبل از Render شدن Carousel.
     *
     * نحوه کار:
     * اگر آرایه products خالی باشد، به‌جای Carousel پیام مناسب نمایش داده می‌شود.
     */
    if (products.length === 0) {
        return (
            <div className="border-y border-border py-12 text-center text-sm text-muted-foreground">
                محصولی برای نمایش وجود ندارد.
            </div>
        );
    }

    return (
        /*
         * هدف:
         * جایگزینی Swiper با Carousel رسمی shadcn.
         *
         * محل استفاده:
         * در ردیف‌های محصولات صفحات فروشگاه و Landing.
         *
         * نحوه کار:
         * shadcn Carousel از Embla استفاده می‌کند و با direction برابر rtl
         * حرکت و ترتیب اسلایدها با ساختار فارسی سایت هماهنگ می‌شود.
         */
        <Carousel
            dir="rtl"
            opts={{
                align: "start",
                direction: "rtl",
                slidesToScroll: 1,
            }}
            className={`relative ${className}`}
        >
            {/*
       * هدف:
       * تعریف فاصله بین اسلایدها در اندازه‌های مختلف صفحه.
       *
       * محل استفاده:
       * Container اصلی اسلایدهای ProductRow.
       *
       * نحوه کار:
       * Margin منفی CarouselContent با Padding هر CarouselItem هماهنگ است
       * تا فاصله‌های Responsive مشابه تنظیمات قبلی Swiper ایجاد شوند.
       */}
            <CarouselContent className="-mr-4 cursor-grab active:cursor-grabbing min-[480px]:-mr-[18px] sm:-mr-5 md:-mr-6 lg:-mr-7 xl:-mr-8">
                {products.map((product) => (
                    /*
                     * هدف:
                     * کنترل تعداد Product Cardهای قابل مشاهده در هر Breakpoint.
                     *
                     * محل استفاده:
                     * برای هر محصول داخل ProductRow.
                     *
                     * نحوه کار:
                     * basis هر Item معادل تقریبی slidesPerView قبلی Swiper تنظیم شده است.
                     */
                    <CarouselItem
                        key={product.id}
                        className="h-auto basis-[86.9565%] pr-4 min-[480px]:basis-[64.5161%] min-[480px]:pr-[18px] sm:basis-[46.5116%] sm:pr-5 md:basis-[38.4615%] md:pr-6 lg:basis-[30.7692%] lg:pr-7 xl:basis-1/4 xl:pr-8"
                    >
                        <ProductCard product={product} />
                    </CarouselItem>
                ))}
            </CarouselContent>

            {/*
       * هدف:
       * نمایش کنترل‌های حرکت Carousel فقط زمانی که بیش از یک محصول وجود دارد.
       *
       * محل استفاده:
       * پایین ProductRow.
       *
       * نحوه کار:
       * CarouselPrevious و CarouselNext مستقیماً از API داخلی Embla استفاده می‌کنند
       * و وضعیت disabled ابتدا و انتهای Carousel را نیز خودکار مدیریت می‌کنند.
       */}
            {products.length > 1 ? (
                <div className="mt-8 flex items-center justify-end gap-2 md:gap-3">
                    <CarouselPrevious
                        aria-label="محصول قبلی"
                        className="luxury-transition static size-10 translate-y-0 rounded-none border-border bg-background hover:bg-secondary disabled:pointer-events-none disabled:opacity-25 md:size-11 [&_svg]:rotate-180"
                    />

                    <CarouselNext
                        aria-label="محصول بعدی"
                        className="luxury-transition static size-10 translate-y-0 rounded-none border-border bg-background hover:bg-secondary disabled:pointer-events-none disabled:opacity-25 md:size-11 [&_svg]:rotate-180"
                    />
                </div>
            ) : null}
        </Carousel>
    );
}