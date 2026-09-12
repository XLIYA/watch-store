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

import {
    getProductById,
    getProducts,
} from "@/services/products.service";

interface ProductPageProps {
    params: Promise<{
        productId: string;
    }>;
}

export const dynamic = "force-dynamic";

export default async function ProductPage({
    params,
}: ProductPageProps) {
    const { productId } = await params;

    const numericProductId =
        Number(productId);

    if (
        !Number.isInteger(numericProductId) ||
        numericProductId <= 0
    ) {
        notFound();
    }

    let product;

    try {
        product =
            await getProductById(
                numericProductId,
            );
    } catch {
        notFound();
    }

    if (!product) {
        notFound();
    }

    const [
        category,
        subcategory,
        similarResult,
    ] = await Promise.all([
        getCategoryById(
            product.category,
        ),

        getSubcategoryById(
            product.subcategory,
        ),

        getProducts({
            category: product.category,
            page: 1,
            limit: 6,
            sort: "popular",
        }),
    ]);

    const similarProducts =
        similarResult.data
            .filter(
                (item) =>
                    item.id !== product.id,
            )
            .slice(0, 4);

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
    const safeDescription =
        sanitizeHtml(
            product.description,
            {
                allowedTags: [
                    "p",
                    "br",
                    "strong",
                    "b",
                    "em",
                    "i",
                    "ul",
                    "ol",
                    "li",
                ],

                allowedAttributes: {},
            },
        );

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
                                    href={`/collections/${category.slug}`}
                                    className="luxury-transition hover:text-foreground"
                                >
                                    {category.name}
                                </Link>
                            </>
                        ) : null}

                        {subcategory ? (
                            <>
                                <span>/</span>

                                <span className="text-foreground/70">
                                    {subcategory.name}
                                </span>
                            </>
                        ) : null}
                    </nav>
                </div>
            </div>

            {/* Main Product */}
            <section className="border-b border-border">
                <div className="grid min-h-[calc(100vh-120px)] lg:grid-cols-2">
                    {/* Gallery */}
                    <div className="bg-secondary">
                        <ProductGallery
                            images={images}
                            productName={
                                product.name
                            }
                        />
                    </div>

                    {/* Product Information */}
                    <div className="flex items-center">
                        <div className="w-full px-6 py-14 sm:px-10 lg:px-16 xl:px-20">
                            <div className="mx-auto max-w-xl">
                                {/* Category */}
                                <div className="flex flex-wrap items-center gap-3 text-xs">
                                    {category ? (
                                        <Link
                                            href={`/collections/${category.slug}`}
                                            className="luxury-transition text-muted-foreground hover:text-foreground"
                                        >
                                            {category.name}
                                        </Link>
                                    ) : null}

                                    {category &&
                                        subcategory ? (
                                        <span className="text-border">
                                            /
                                        </span>
                                    ) : null}

                                    {subcategory ? (
                                        <span className="text-muted-foreground">
                                            {subcategory.name}
                                        </span>
                                    ) : null}
                                </div>

                                {/* Brand */}
                                <p
                                    dir="ltr"
                                    className="section-eyebrow mt-7"
                                >
                                    {product.brand}
                                </p>

                                {/* Name */}
                                <h1
                                    dir="ltr"
                                    className="mt-5 font-heading text-4xl font-medium leading-none tracking-[0.04em] sm:text-5xl xl:text-6xl"
                                >
                                    {product.name}
                                </h1>

                                {/* Price */}
                                <p className="mt-7 text-xl font-medium">
                                    {product.price.toLocaleString(
                                        "fa-IR",
                                    )}{" "}
                                    تومان
                                </p>

                                <div className="mt-8 luxury-divider" />

                                {/* Stock */}
                                <div className="mt-7 flex items-center justify-between gap-6 text-sm">
                                    <span className="text-muted-foreground">
                                        وضعیت موجودی
                                    </span>

                                    <span>
                                        {product.quantity > 0
                                            ? `${product.quantity.toLocaleString(
                                                "fa-IR",
                                            )} عدد موجود`
                                            : "ناموجود"}
                                    </span>
                                </div>

                                {/* Description */}
                                <div
                                    className="body-copy mt-8 space-y-4"
                                    dangerouslySetInnerHTML={{
                                        __html:
                                            safeDescription,
                                    }}
                                />

                                {/* Purchase */}
                                <ProductPurchasePanel
                                    product={product}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Similar products */}
            <SimilarProducts
                products={similarProducts}
                category={category}
            />
        </main>
    );
}