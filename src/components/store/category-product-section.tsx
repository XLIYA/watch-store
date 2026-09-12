import Link from "next/link";

import { ProductRow } from "@/components/store/product-row";

import type { Category } from "@/types/category";
import type { Product } from "@/types/product";

interface CategoryProductSectionProps {
    category: Category;
    products: Product[];
}

export function CategoryProductSection({
    category,
    products,
}: CategoryProductSectionProps) {
    return (
        <section className="section-shell overflow-hidden">
            <div className="site-container">
                <div className="mb-8 flex items-end justify-between gap-6 md:mb-10">
                    <div>
                        <p
                            dir="ltr"
                            className="section-eyebrow mb-3"
                        >
                            {category.slug
                                .replaceAll("-", " ")
                                .toUpperCase()}
                        </p>

                        <h2 className="section-title">
                            {category.name}
                        </h2>
                    </div>

                    <Link
                        href={`/collections/${category.slug}`}
                        className="
              luxury-transition
              shrink-0
              border-b
              border-foreground/30
              pb-2
              text-sm
              hover:border-foreground
            "
                    >
                        مشاهده همه
                    </Link>
                </div>

                <ProductRow products={products} />
            </div>
        </section>
    );
}