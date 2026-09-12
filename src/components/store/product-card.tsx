import Image from "next/image";
import Link from "next/link";

import type { Product } from "@/types/product";

interface ProductCardProps {
    product: Product;
    priority?: boolean;
}

export function ProductCard({
    product,
    priority = false,
}: ProductCardProps) {
    const productImage =
        product.thumbnail || product.images?.[0];

    const isOutOfStock = product.quantity <= 0;

    return (
        <article className="group min-w-0">
            <Link
                href={`/product/${product.id}`}
                className="block"
                aria-label={`مشاهده ${product.name}`}
            >
                <div className="relative aspect-[4/5] overflow-hidden bg-secondary">
                    {productImage ? (
                        <Image
                            src={productImage}
                            alt={product.name}
                            fill
                            priority={priority}
                            sizes="(max-width: 640px) 78vw, (max-width: 1024px) 40vw, 25vw"
                            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.035]"
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span
                                dir="ltr"
                                className="font-heading text-2xl tracking-[0.12em] text-foreground/10"
                            >
                                WATCH STORE
                            </span>
                        </div>
                    )}

                    <div className="pointer-events-none absolute inset-0 bg-black/0 transition-colors duration-500 group-hover:bg-black/[0.03]" />

                    {isOutOfStock ? (
                        <div className="absolute inset-x-0 bottom-0 bg-ink/85 px-4 py-3 text-center text-xs text-white">
                            ناموجود
                        </div>
                    ) : null}
                </div>

                <div className="pt-5">
                    <p
                        dir="ltr"
                        className="text-[0.68rem] uppercase tracking-[0.18em] text-muted-foreground"
                    >
                        {product.brand}
                    </p>

                    <h3
                        dir="ltr"
                        className="mt-2 truncate font-heading text-xl font-medium tracking-[0.025em] text-foreground sm:text-2xl"
                    >
                        {product.name}
                    </h3>

                    <div className="mt-3 flex items-center justify-between gap-4">
                        <p className="text-sm text-foreground">
                            {product.price.toLocaleString("fa-IR")} تومان
                        </p>

                        {!isOutOfStock ? (
                            <span className="text-[0.7rem] text-muted-foreground">
                                موجود
                            </span>
                        ) : null}
                    </div>
                </div>
            </Link>
        </article>
    );
}