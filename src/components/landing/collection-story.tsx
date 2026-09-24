import { formatNumber } from "@/lib/format";
import Image from "next/image";
import Link from "next/link";
import { categoryHref } from "@/features/catalog/catalog-navigation";

import { ScrollReveal } from "@/components/common/scroll-reveal";

import type { Category } from "@/types/category";
import type { Product } from "@/types/product";

interface CollectionStoryProps {
  category: Category;
  products: Product[];
  index: number;
}

export function CollectionStory({
  category,
  products,
  index,
}: CollectionStoryProps) {
  const isReversed = index % 2 !== 0;

  const featuredProduct = products[0];

  const featuredImage =
    featuredProduct?.images?.[0] ?? featuredProduct?.thumbnail;

  return (
    <section className="section-shell overflow-hidden">
      <div className="site-container">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          {/* Product image */}
          <ScrollReveal
            direction={isReversed ? "left" : "right"}
            className={isReversed ? "lg:order-2" : ""}
          >
            <div className="group relative aspect-[4/5] overflow-hidden rounded-3xl bg-secondary">
              {featuredProduct && featuredImage ? (
                <>
                  <Image
                    src={featuredImage}
                    alt={featuredProduct.name}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.025]"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-transparent" />

                  <div className="absolute inset-x-0 bottom-0 p-6 text-white md:p-8">
                    <p
                      dir="auto"
                      className="text-xs tracking-[0.18em] text-white/60"
                    >
                      {featuredProduct.brand}
                    </p>

                    <h3
                      dir="auto"
                      className="mt-2 font-sans text-3xl font-medium tracking-[0.04em] md:text-4xl"
                    >
                      {featuredProduct.name}
                    </h3>

                    <p className="mt-3 text-sm text-white/60">
                      {formatNumber(featuredProduct.price)} تومان
                    </p>
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span
                    dir="auto"
                    className="font-sans text-5xl tracking-[0.12em] text-foreground/10"
                  >
                    {category.slug.toUpperCase()}
                  </span>
                </div>
              )}
            </div>
          </ScrollReveal>

          {/* Collection information */}
          <ScrollReveal
            direction={isReversed ? "right" : "left"}
            delay={120}
            className="max-w-xl"
          >
            <p dir="auto" className="section-eyebrow mb-5">
              مجموعهٔ {formatNumber(index + 1)}
            </p>

            <h2 className="section-title">{category.name}</h2>

            <p className="body-copy mt-6">
              مجموعه‌ای منتخب با طراحی دقیق، هویت منحصربه‌فرد و تمرکز بر جزئیاتی
              که یک ساعت را از یک ابزار ساده به بخشی از سبک شخصی تبدیل می‌کند.
            </p>

            {products.length > 0 ? (
              <div className="mt-8 border-y border-border">
                {products.map((product, productIndex) => (
                  <Link
                    key={product.id}
                    href={`/product/${product.id}`}
                    className={`
                        luxury-transition
                        group/product
                        flex
                        items-center
                        justify-between
                        gap-5
                        py-4
                        hover:opacity-60
                        ${
                          productIndex !== products.length - 1
                            ? "border-b border-border"
                            : ""
                        }
                      `}
                  >
                    <div className="min-w-0">
                      <p
                        dir="auto"
                        className="truncate font-sans text-lg font-medium tracking-[0.03em]"
                      >
                        {product.name}
                      </p>

                      <p
                        dir="auto"
                        className="mt-1 text-[0.7rem] tracking-[0.12em] text-muted-foreground"
                      >
                        {product.brand}
                      </p>
                    </div>

                    <span className="shrink-0 text-xs text-muted-foreground">
                      {formatNumber(product.price)} تومان
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="mt-8 text-sm text-muted-foreground">
                محصولی در این مجموعه موجود نیست.
              </p>
            )}

            <Link
              href={categoryHref(category.slug)}
              className="
                luxury-transition
                mt-8
                inline-flex
                border-b
                border-foreground/40
                pb-2
                text-sm
                hover:border-foreground
              "
            >
              مشاهده مجموعه
            </Link>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
