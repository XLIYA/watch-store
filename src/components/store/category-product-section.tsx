import Link from "next/link";
import { ProductRow } from "@/components/store/product-row";
import { CategoryIcon } from "./category-icon";
import { groupHref } from "@/features/catalog/catalog-navigation";
import type { Category, Subcategory } from "@/types/category";
import type { Product } from "@/types/product";

/** بخش مشترک خانه و فروشگاه شش محصول منتخب را نشان می‌دهد؛ لینک‌های فرزند جای صفحهٔ مستقل سرگروه را می‌گیرند. */
export function CategoryProductSection({
  category,
  products,
  groups = [],
}: {
  category: Category;
  products: Product[];
  groups?: Subcategory[];
}) {
  return (
    <section
      id={`collection-${category.slug}`}
      className="scroll-mt-28 border-b border-border py-14 md:py-20"
    >
      <div className="site-container">
        <div className="mb-9 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="section-kicker mb-3">
              <CategoryIcon name={category.icon} className="size-4" />
              مجموعهٔ منتخب
            </p>
            <h2 className="text-3xl font-medium md:text-4xl">
              {category.name}
            </h2>
          </div>
          <nav
            aria-label={`گروه‌های ${category.name}`}
            className="flex flex-wrap gap-2"
          >
            {groups
              .filter((group) => group.category === category.id)
              .map((group) => (
                <Link
                  className="rounded-md border border-border px-4 py-2 text-xs transition-colors hover:border-gold hover:bg-card"
                  href={groupHref(group.slug)}
                  key={group.id}
                >
                  {group.name}
                </Link>
              ))}
          </nav>
        </div>
        {products.length ? (
          <ProductRow products={products} />
        ) : (
          <p className="surface py-12 text-center text-sm text-muted-foreground">
            محصولات این مجموعه به‌زودی اضافه می‌شوند.
          </p>
        )}
      </div>
    </section>
  );
}
