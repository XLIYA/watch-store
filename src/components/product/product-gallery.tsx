"use client";

import Image from "next/image";

import {
    Autoplay,
    Navigation,
    Pagination,
} from "swiper/modules";

import {
    Swiper,
    SwiperSlide,
} from "swiper/react";

import {
    ChevronLeft,
    ChevronRight,
} from "lucide-react";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

interface ProductGalleryProps {
    images: string[];
    productName: string;
}

export function ProductGallery({
    images,
    productName,
}: ProductGalleryProps) {
    if (images.length === 0) {
        return (
            <div className="flex aspect-[4/5] items-center justify-center bg-secondary">
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
        <div
            className="group relative overflow-hidden bg-secondary"
            dir="ltr"
        >
            <Swiper
                modules={[
                    Autoplay,
                    Navigation,
                    Pagination,
                ]}
                slidesPerView={1}
                speed={800}
                loop={images.length > 1}
                navigation={{
                    prevEl: ".product-gallery-prev",
                    nextEl: ".product-gallery-next",
                }}
                pagination={{
                    clickable: true,
                }}
                autoplay={
                    images.length > 1
                        ? {
                            delay: 5000,
                            disableOnInteraction: false,
                            pauseOnMouseEnter: true,
                        }
                        : false
                }
                className="aspect-[4/5]"
            >
                {images.map((image, index) => (
                    <SwiperSlide
                        key={`${image}-${index}`}
                    >
                        <div className="relative h-full w-full">
                            <Image
                                src={image}
                                alt={`${productName} - تصویر ${index + 1
                                    }`}
                                fill
                                priority={index === 0}
                                sizes="(max-width: 1024px) 100vw, 55vw"
                                className="object-cover"
                            />
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>

            {images.length > 1 ? (
                <>
                    <button
                        type="button"
                        aria-label="تصویر قبلی"
                        className="
                        product-gallery-prev
                        luxury-transition
                        absolute
                        left-5
                        top-1/2
                        z-20
                        flex
                        size-11
                        -translate-y-1/2
                        items-center
                        justify-center
                        border
                        border-white/25
                        bg-black/20
                        text-white
                        opacity-0
                        backdrop-blur-sm
                        hover:bg-black/40
                        group-hover:opacity-100
                        "
                    >
                        <ChevronLeft
                            className="size-4"
                            strokeWidth={1.5}
                        />
                    </button>

                    <button
                        type="button"
                        aria-label="تصویر بعدی"
                        className="
                        product-gallery-next
                        luxury-transition
                        absolute
                        right-5
                        top-1/2
                        z-20
                        flex
                        size-11
                        -translate-y-1/2
                        items-center
                        justify-center
                        border
                        border-white/25
                        bg-black/20
                        text-white
                        opacity-0
                        backdrop-blur-sm
                        hover:bg-black/40
                        group-hover:opacity-100
                        "
                    >
                        <ChevronRight
                            className="size-4"
                            strokeWidth={1.5}
                        />
                    </button>
                </>
            ) : null}
        </div>
    );
}