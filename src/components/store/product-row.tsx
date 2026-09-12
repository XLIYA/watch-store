"use client";

import { useId } from "react";

import {
    ChevronLeft,
    ChevronRight,
} from "lucide-react";

import { Navigation } from "swiper/modules";

import {
    Swiper,
    SwiperSlide,
} from "swiper/react";

import { ProductCard } from "@/components/store/product-card";

import type { Product } from "@/types/product";

import "swiper/css";
import "swiper/css/navigation";

interface ProductRowProps {
    products: Product[];
    className?: string;
}

export function ProductRow({
    products,
    className = "",
}: ProductRowProps) {
    const id = useId().replace(
        /[^a-zA-Z0-9-_]/g,
        "",
    );

    const prevClass = `product-row-prev-${id}`;
    const nextClass = `product-row-next-${id}`;

    if (products.length === 0) {
        return (
            <div className="border-y border-border py-12 text-center text-sm text-muted-foreground">
                محصولی برای نمایش وجود ندارد.
            </div>
        );
    }

    return (
        <div
            className={`relative ${className}`}
            dir="rtl"
        >
            <Swiper
                modules={[Navigation]}
                dir="rtl"
                slidesPerView={1.15}
                spaceBetween={16}
                watchOverflow
                grabCursor={products.length > 1}
                navigation={{
                    prevEl: `.${prevClass}`,
                    nextEl: `.${nextClass}`,
                }}
                breakpoints={{
                    480: {
                        slidesPerView: 1.55,
                        spaceBetween: 18,
                    },

                    640: {
                        slidesPerView: 2.15,
                        spaceBetween: 20,
                    },

                    768: {
                        slidesPerView: 2.6,
                        spaceBetween: 24,
                    },

                    1024: {
                        slidesPerView: 3.25,
                        spaceBetween: 28,
                    },

                    1280: {
                        slidesPerView: 4,
                        spaceBetween: 32,
                    },
                }}
                className="!overflow-visible"
            >
                {products.map((product) => (
                    <SwiperSlide
                        key={product.id}
                        className="!h-auto"
                    >
                        <ProductCard
                            product={product}
                        />
                    </SwiperSlide>
                ))}
            </Swiper>

            {products.length > 1 ? (
                <div className="mt-8 flex items-center justify-end gap-2 md:gap-3">
                    <button
                        type="button"
                        aria-label="محصول قبلی"
                        className={`
              ${prevClass}
              luxury-transition
              flex
              size-10
              items-center
              justify-center
              border
              border-border
              bg-background
              hover:bg-secondary
              disabled:pointer-events-none
              disabled:opacity-25
              md:size-11
            `}
                    >
                        <ChevronRight
                            className="size-4"
                            strokeWidth={1.5}
                        />
                    </button>

                    <button
                        type="button"
                        aria-label="محصول بعدی"
                        className={`
              ${nextClass}
              luxury-transition
              flex
              size-10
              items-center
              justify-center
              border
              border-border
              bg-background
              hover:bg-secondary
              disabled:pointer-events-none
              disabled:opacity-25
              md:size-11
            `}
                    >
                        <ChevronLeft
                            className="size-4"
                            strokeWidth={1.5}
                        />
                    </button>
                </div>
            ) : null}
        </div>
    );
}