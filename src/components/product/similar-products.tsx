import Link from "next/link";

import { ProductRow } from "@/components/store/product-row";

import type { Category } from "@/types/category";
import type { Product } from "@/types/product";

interface SimilarProductsProps {
    products: Product[];
    category: Category | null;
}

export function SimilarProducts({
    products,
    category,
}: SimilarProductsProps) {
    if (products.length === 0) {
        return null;
    }

    return (
        <section className="section-shell overflow-hidden border-t border-border">
            <div className="site-container">
                <div className="mb-8 flex items-end justify-between gap-6 md:mb-10">
                    <div>
                        <p
                            dir="ltr"
                            className="section-eyebrow mb-3"
                        >
                            YOU MAY ALSO LIKE
                        </p>

                        <h2 className="section-title">
                            محصولات مشابه
                        </h2>
                    </div>

                    {category ? (
                        <Link
                            href={`/collections/${category.slug}`}
                            className="luxury-transition shrink-0 border-b border-foreground/30 pb-2 text-sm hover:border-foreground"
                        >
                            مشاهده مجموعه
                        </Link>
                    ) : null}
                </div>

                <ProductRow products={products} />
            </div>
        </section>
    );
}