import Image from "next/image";
import Link from "next/link";

interface StoreHeroProps {
    imageSrc?: string;
}

export function StoreHero({
    imageSrc = "/images/products/watch-placeholder-1.webp",
}: StoreHeroProps) {
    return (
        <section className="relative min-h-[560px] overflow-hidden bg-ink text-white md:min-h-[620px]">
            <Image
                src={imageSrc}
                alt="Luxury watch collection"
                fill
                priority
                sizes="100vw"
                className="object-cover"
            />

            <div className="absolute inset-0 bg-black/45" />

            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/20" />

            <div className="site-container relative z-10 flex min-h-[560px] items-end py-16 md:min-h-[620px] md:py-20">
                <div className="max-w-2xl">
                    <p
                        dir="ltr"
                        className="mb-4 text-xs tracking-[0.22em] text-white/55"
                    >
                        WATCH STORE
                    </p>

                    <h1
                        dir="ltr"
                        className="font-heading text-5xl font-medium leading-[0.95] tracking-[0.06em] sm:text-6xl md:text-7xl"
                    >
                        TIME, REFINED.
                    </h1>

                    <p className="mt-6 max-w-xl text-sm leading-8 text-white/70 md:text-base">
                        مجموعه‌ای منتخب از ساعت‌های کلاسیک، رسمی،
                        اسپرت و حرفه‌ای برای کسانی که زمان را بخشی
                        از سبک شخصی خود می‌دانند.
                    </p>

                    <div className="mt-8 flex flex-wrap items-center gap-5">
                        <Link
                            href="#collections"
                            className="luxury-transition inline-flex items-center justify-center bg-white px-6 py-3 text-sm text-ink hover:bg-white/90"
                        >
                            مشاهده مجموعه‌ها
                        </Link>

                        <Link
                            href="/collections/limited-edition"
                            className="luxury-transition border-b border-white/40 pb-2 text-sm text-white/80 hover:border-white hover:text-white"
                        >
                            نسخه‌های محدود
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}