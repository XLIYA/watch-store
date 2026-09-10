import Link from "next/link";

import { ProductRow } from "@/components/store/product-row";

import type { Product } from "@/types/product";

interface PopularProductsProps {
    products: Product[];
}

export function PopularProducts({
    products,
}: PopularProductsProps) {
    return (
        <section className="section-shell overflow-hidden">
            <div className="site-container">
                <div className="mb-8 flex items-end justify-between gap-6 md:mb-10">
                    <div>
                        <p
                            dir="ltr"
                            className="section-eyebrow mb-3"
                        >
                            MOST POPULAR
                        </p>

                        <h2 className="section-title">
                            محبوب‌ترین ساعت‌ها
                        </h2>

                        <p className="body-copy mt-4 max-w-xl">
                            انتخاب‌هایی که بیشترین توجه
                            مشتریان را به خود جلب کرده‌اند.
                        </p>
                    </div>

                    <Link
                        href="/shop"
                        className="
              luxury-transition
              hidden
              shrink-0
              border-b
              border-foreground/30
              pb-2
              text-sm
              hover:border-foreground
              sm:inline-flex
            "
                    >
                        مشاهده همه محصولات
                    </Link>
                </div>

                <ProductRow products={products} />
            </div>
        </section>
    );
}