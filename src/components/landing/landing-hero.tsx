"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import Autoplay from "embla-carousel-autoplay";

import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
    type CarouselApi,
} from "@/components/ui/carousel";

import type { Product } from "@/types/product";

interface LandingHeroProps {
    products: Product[];
}

export function LandingHero({
    products,
}: LandingHeroProps) {
    /*
     * هدف:
     * دسترسی به API داخلی Embla و نگهداری شماره اسلاید فعال.
     *
     * محل استفاده:
     * داخل LandingHero برای Pagination و تغییر دستی اسلاید.
     *
     * نحوه کار:
     * setApi نمونه Carousel را دریافت می‌کند و selectedIndex
     * شماره اسلاید فعال را برای Dotهای پایین Hero نگه می‌دارد.
     */
    const [api, setApi] = useState<CarouselApi>();
    const [selectedIndex, setSelectedIndex] = useState(0);

    /*
     * هدف:
     * اجرای Autoplay روی Hero.
     *
     * محل استفاده:
     * در plugins مربوط به Carousel اصلی LandingHero.
     *
     * نحوه کار:
     * هر 6.5 ثانیه اسلاید بعدی انتخاب می‌شود.
     * Drag یا کلیک کاربر Autoplay را برای همیشه متوقف نمی‌کند
     * و قرار گرفتن Mouse روی Hero آن را موقتاً Pause می‌کند.
     */
    const [autoplayPlugin] = useState(() =>
        Autoplay({
            delay: 6500,
            stopOnInteraction: false,
            stopOnMouseEnter: true,
        }),
    );

    /*
     * هدف:
     * هماهنگ نگه داشتن Pagination با اسلاید فعال.
     *
     * محل استفاده:
     * هنگام Autoplay، Drag، Navigation و کلیک روی Dotها.
     *
     * نحوه کار:
     * با هر رویداد select یا reInit شماره اسلاید فعلی
     * از Embla خوانده و در selectedIndex ذخیره می‌شود.
     */
    useEffect(() => {
        if (!api) {
            return;
        }

        const handleSelect = () => {
            setSelectedIndex(api.selectedScrollSnap());
        };

        handleSelect();

        api.on("select", handleSelect);
        api.on("reInit", handleSelect);

        return () => {
            api.off("select", handleSelect);
            api.off("reInit", handleSelect);
        };
    }, [api]);

    /*
     * هدف:
     * جلوگیری از نمایش Hero خالی.
     *
     * محل استفاده:
     * قبل از Render شدن Carousel.
     *
     * نحوه کار:
     * اگر هیچ Productی وجود نداشته باشد چیزی Render نمی‌شود.
     */
    if (products.length === 0) {
        return null;
    }

    return (
        <section className="relative h-dvh min-h-[680px] overflow-hidden bg-ink text-white">
            {/*
       * هدف:
       * استفاده از Carousel رسمی shadcn/Embla به جای Swiper.
       *
       * محل استفاده:
       * Hero اصلی Landing Page.
       *
       * نحوه کار:
       * خود مکانیزم Carousel عمداً LTR است تا direction صفحه فارسی
       * محاسبات Track و Translate مربوط به Embla را خراب نکند.
       * محتوای فارسی هر اسلاید در Article دوباره RTL می‌شود.
       */}
            <Carousel
                dir="ltr"
                setApi={setApi}
                opts={{
                    align: "start",
                    loop: products.length > 1,
                    direction: "ltr",
                }}
                plugins={[autoplayPlugin]}
                className="h-full w-full [&_[data-slot=carousel-content]]:h-full"
            >
                {/*
         * هدف:
         * ایجاد Track تمام‌قد برای Hero.
         *
         * محل استفاده:
         * Container تمام اسلایدهای Hero.
         *
         * نحوه کار:
         * Viewport و Track هر دو ارتفاع کامل Hero را می‌گیرند
         * و هر CarouselItem دقیقاً یک صفحه کامل را اشغال می‌کند.
         */}
                <CarouselContent className="ml-0 h-full">
                    {products.map((product, index) => (
                        <CarouselItem
                            key={product.id}
                            className="h-dvh min-h-[680px] basis-full pl-0"
                        >
                            <article dir="rtl" className="relative h-full w-full">
                                <Image
                                    src={product.images[0]}
                                    alt={product.name}
                                    fill
                                    priority={index === 0}
                                    draggable={false}
                                    sizes="100vw"
                                    className="select-none object-cover"
                                />

                                <div className="absolute inset-0 bg-black/35" />

                                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-black/20" />

                                <div className="site-container relative z-10 flex h-full items-end pb-20 md:pb-28">
                                    <div className="max-w-3xl">
                                        <p dir="ltr" className="mb-4 text-xs tracking-[0.22em] text-white/65">
                                            {product.brand.toUpperCase()}
                                        </p>

                                        <h1 dir="ltr" className="font-heading text-5xl font-medium leading-[0.95] tracking-[0.08em] sm:text-6xl md:text-8xl">
                                            {product.name}
                                        </h1>

                                        <p className="mt-6 max-w-xl leading-8 text-white/70">
                                            انتخابی برای کسانی که زمان را فقط اندازه‌گیری نمی‌کنند، بلکه آن را زندگی می‌کنند.
                                        </p>

                                        <div className="mt-8 flex flex-wrap items-center gap-6">
                                            <Link
                                                href={`/product/${product.id}`}
                                                className="luxury-transition inline-flex border-b border-white/50 pb-2 text-sm hover:border-white"
                                            >
                                                مشاهده ساعت
                                            </Link>

                                            <Link
                                                href="/shop"
                                                className="luxury-transition text-sm text-white/60 hover:text-white"
                                            >
                                                مشاهده فروشگاه
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </article>
                        </CarouselItem>
                    ))}
                </CarouselContent>

                {/*
         * هدف:
         * نمایش Navigation در مرکز عمودی Hero.
         *
         * محل استفاده:
         * دو سمت چپ و راست LandingHero.
         *
         * نحوه کار:
         * inset-y پیش‌فرض Carousel شادسی‌ان Override می‌شود
         * تا دکمه‌ها دقیقاً روی 50 درصد ارتفاع Hero قرار بگیرند.
         */}
                {products.length > 1 ? (
                    <>
                        <CarouselPrevious
                            aria-label="اسلاید قبلی"
                            className="luxury-transition !inset-y-auto !top-1/2 !bottom-auto !my-0 left-4 z-30 size-10 -translate-y-1/2 rounded-none border-white/30 bg-black/20 text-white backdrop-blur-sm hover:bg-black/40 hover:text-white md:left-8 md:size-11"
                        />

                        <CarouselNext
                            aria-label="اسلاید بعدی"
                            className="luxury-transition !inset-y-auto !top-1/2 !bottom-auto !my-0 right-4 z-30 size-10 -translate-y-1/2 rounded-none border-white/30 bg-black/20 text-white backdrop-blur-sm hover:bg-black/40 hover:text-white md:right-8 md:size-11"
                        />
                    </>
                ) : null}

                {/*
         * هدف:
         * نمایش Pagination سفارشی و قابل کلیک.
         *
         * محل استفاده:
         * پایین Hero.
         *
         * نحوه کار:
         * selectedIndex اسلاید فعال را مشخص می‌کند
         * و کلیک روی هر Dot با scrollTo به همان اسلاید می‌رود.
         */}
                {products.length > 1 ? (
                    <div className="absolute bottom-8 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2">
                        {products.map((product, index) => (
                            <button
                                key={product.id}
                                type="button"
                                aria-label={`رفتن به اسلاید ${index + 1}`}
                                aria-current={selectedIndex === index ? "true" : undefined}
                                onClick={() => api?.scrollTo(index)}
                                className={`luxury-transition h-1.5 rounded-full bg-white ${selectedIndex === index ? "w-8 opacity-100" : "w-1.5 opacity-45 hover:opacity-75"}`}
                            />
                        ))}
                    </div>
                ) : null}
            </Carousel>
        </section>
    );
}