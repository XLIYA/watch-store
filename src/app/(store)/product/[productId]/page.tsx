import { categoryHref, groupHref } from "@/features/catalog/catalog-navigation";

import { formatNumber } from "@/lib/format";
import { getErrorStatus } from "@/services/api/api-error";
import Link from "next/link";
import { notFound } from "next/navigation";

import sanitizeHtml from "sanitize-html";

import { ProductGallery } from "@/components/product/product-gallery";
import { ProductPurchasePanel } from "@/components/product/product-purchase-panel";
import { SimilarProducts } from "@/components/product/similar-products";

import {
  getCategoryById,
  getSubcategoryById,
} from "@/services/categories.service";

import { getProductById, getProducts } from "@/services/products.service";

interface ProductPageProps {
  params: Promise<{
    productId: string;
  }>;
}

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: ProductPageProps) {
  const { productId } = await params;

  const numericProductId = Number(productId);

  if (!Number.isInteger(numericProductId) || numericProductId <= 0) {
    notFound();
  }

  let product;

  try {
    product = await getProductById(numericProductId);
  } catch (error) {
    if (getErrorStatus(error) === 404) notFound();
    throw error;
  }

  if (!product) {
    notFound();
  }

  const [category, subcategory, similarResult] = await Promise.all([
    getCategoryById(product.category),

    getSubcategoryById(product.subcategory),

    getProducts({
      category: product.category,
      page: 1,
      limit: 7,
      sort: "popular",
    }),
  ]);

  let similarProducts = similarResult.data
    .filter((item) => item.id !== product.id)
    .slice(0, 6);

  // گروه کوچک با محصولات محبوب تکمیل می‌شود؛ خود محصول و شناسه‌های تکراری دوباره نمایش داده نمی‌شوند.
  if (similarProducts.length < 6) {
    const additional = await getProducts({limit: 7, sort: "popular"});
    const existing = new Set([product.id,...similarProducts.map(item=>item.id)]);
    similarProducts = [...similarProducts,...additional.data.filter(item=>!existing.has(item.id))].slice(0,6);
  }
  const images =
    product.images?.length > 0
      ? product.images
      : product.thumbnail
        ? [product.thumbnail]
        : [];

  /*
   * توضیحات از Backend می‌آید،
   * بنابراین قبل از dangerouslySetInnerHTML
   * آن را Sanitise می‌کنیم.
   */
  const safeDescription = sanitizeHtml(product.description, {
    allowedTags: ["p", "br", "strong", "b", "em", "i", "ul", "ol", "li"],

    allowedAttributes: {},
  });

  return (
    <main>
      {/* Breadcrumb */}
      <div className="border-b border-border">
        <div className="site-container">
          <nav
            aria-label="مسیر صفحه"
            className="flex min-h-12 flex-wrap items-center gap-2 py-3 text-xs text-muted-foreground"
          >
            <Link
              href="/shop"
              className="luxury-transition hover:text-foreground"
            >
              فروشگاه
            </Link>

            {category ? (
              <>
                <span>/</span>

                <Link
                  href={categoryHref(category.slug)}
                  className="luxury-transition hover:text-foreground"
                >
                  {category.name}
                </Link>
              </>
            ) : null}

            {subcategory ? (
              <>
                <span>/</span>

                <Link
                  href={groupHref(subcategory.slug)}
                  className="text-foreground/70"
                >
                  {subcategory.name}
                </Link>
              </>
            ) : null}
          </nav>
        </div>
      </div>

      {/* Main Product */}
      <section className="border-b border-border">
        <div className="site-container grid items-start gap-8 py-10 lg:grid-cols-2 lg:py-16">
          {/* Gallery */}
          <div className="overflow-hidden rounded-xl bg-secondary lg:sticky lg:top-28">
            <ProductGallery images={images} productName={product.name} />
          </div>

          {/* Product Information */}
          <div className="flex items-center">
            <div className="w-full px-2 py-4 sm:px-6 lg:px-8">
              <div className="mx-auto max-w-xl">
                {/* Category */}
                <div className="flex flex-wrap items-center gap-3 text-xs">
                  {category ? (
                    <Link
                      href={categoryHref(category.slug)}
                      className="luxury-transition text-muted-foreground hover:text-foreground"
                    >
                      {category.name}
                    </Link>
                  ) : null}

                  {category && subcategory ? (
                    <span className="text-border">/</span>
                  ) : null}

                  {subcategory ? (
                    <span className="text-muted-foreground">
                      {subcategory.name}
                    </span>
                  ) : null}
                </div>

                {/* Brand */}
                <p dir="auto" className="section-eyebrow mt-7">
                  {product.brand}
                </p>

                {/* Name */}
                <h1
                  dir="ltr"
                  className="mt-5 font-sans text-4xl font-medium leading-none tracking-[0.04em] sm:text-5xl xl:text-6xl"
                >
                  {product.name}
                </h1>

                {/* Price */}
                <p className="mt-7 text-xl font-medium">
                  {formatNumber(product.price)} تومان
                </p>

                <div className="mt-8 luxury-divider" />

                {/* Stock */}
                <div className="mt-7 flex items-center justify-between gap-6 text-sm">
                  <span className="text-muted-foreground">وضعیت موجودی</span>

                  <span>
                    {product.quantity > 0
                      ? `${formatNumber(product.quantity)} عدد موجود`
                      : "اتمام موجودی"}
                  </span>
                </div>

                {/* Description */}
                <div
                  className="body-copy mt-8 space-y-4"
                  dangerouslySetInnerHTML={{
                    __html: safeDescription,
                  }}
                />

                {/* Purchase */}
                <ProductPurchasePanel product={product} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Similar products */}
      <SimilarProducts products={similarProducts} category={category} />
    </main>
  );
}
