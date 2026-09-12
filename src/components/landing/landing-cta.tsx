import Link from "next/link";

export function LandingCta() {
    return (
        <section className="bg-forest py-28 text-white md:py-40">
            <div className="site-container text-center">
                <p
                    dir="ltr"
                    className="font-heading text-5xl font-medium tracking-[0.12em] md:text-7xl"
                >
                    DISCOVER TIME
                </p>

                <p className="mx-auto mt-6 max-w-xl leading-8 text-white/60">
                    مجموعه کامل ساعت‌ها را مشاهده کنید و مدل مناسب
                    سبک خود را پیدا کنید.
                </p>

                <Link
                    href="/shop"
                    className="luxury-transition mt-10 inline-flex border border-white/40 px-8 py-4 text-sm hover:bg-white hover:text-forest"
                >
                    ورود به فروشگاه
                </Link>
            </div>
        </section>
    );
}