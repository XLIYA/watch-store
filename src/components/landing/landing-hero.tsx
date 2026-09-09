"use client";

import Image from "next/image";
import Link from "next/link";

import {
    Autoplay,
    EffectFade,
    Navigation,
    Pagination,
} from "swiper/modules";

import {
    Swiper,
    SwiperSlide,
} from "swiper/react";

import type { Product } from "@/types/product";

import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/navigation";
import "swiper/css/pagination";

interface LandingHeroProps {
    products: Product[];
}

export function LandingHero({
    products,
}: LandingHeroProps) {
    if (products.length === 0) {
        return null;
    }

    return (
        <section className="relative h-dvh min-h-[680px] overflow-hidden bg-ink text-white">
            <Swiper
                modules={[
                    Autoplay,
                    EffectFade,
                    Navigation,
                    Pagination,
                ]}
                slidesPerView={1}
                loop={products.length > 1}
                effect="fade"
                speed={1000}
                navigation
                pagination={{
                    clickable: true,
                }}
                autoplay={{
                    delay: 6500,
                    disableOnInteraction: false,
                    pauseOnMouseEnter: true,
                }}
                className="h-full"
            >
                {products.map((product, index) => (
                    <SwiperSlide key={product.id}>
                        <article className="relative h-full">
                            <Image
                                src={product.images[0]}
                                alt={product.name}
                                fill
                                priority={index === 0}
                                sizes="100vw"
                                className="object-cover"
                            />

                            <div className="absolute inset-0 bg-black/35" />

                            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-black/20" />

                            <div className="site-container relative z-10 flex h-full items-end pb-20 md:pb-28">
                                <div className="max-w-3xl">
                                    <p
                                        dir="ltr"
                                        className="mb-4 text-xs tracking-[0.22em] text-white/65"
                                    >
                                        {product.brand.toUpperCase()}
                                    </p>

                                    <h1
                                        dir="ltr"
                                        className="font-heading text-5xl font-medium leading-[0.95] tracking-[0.08em] sm:text-6xl md:text-8xl"
                                    >
                                        {product.name}
                                    </h1>

                                    <p className="mt-6 max-w-xl leading-8 text-white/70">
                                        انتخابی برای کسانی که زمان را فقط
                                        اندازه‌گیری نمی‌کنند، بلکه آن را زندگی
                                        می‌کنند.
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
                    </SwiperSlide>
                ))}
            </Swiper>
        </section>
    );
}