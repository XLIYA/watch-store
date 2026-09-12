"use client";

import {
    useEffect,
    useRef,
    useState,
} from "react";

import Image from "next/image";
import Link from "next/link";

import {
    Loader2,
    Search,
    X,
} from "lucide-react";

import { getProducts } from "@/services/products.service";

import type { Product } from "@/types/product";

interface HeaderSearchProps {
    onClose: () => void;
}

export function HeaderSearch({
    onClose,
}: HeaderSearchProps) {
    const [query, setQuery] = useState("");
    const [products, setProducts] = useState<
        Product[]
    >([]);
    const [total, setTotal] = useState(0);
    const [isLoading, setIsLoading] =
        useState(false);
    const [hasError, setHasError] =
        useState(false);

    const requestIdRef = useRef(0);

    const normalizedQuery = query.trim();

    useEffect(() => {
        function handleKeyDown(
            event: KeyboardEvent,
        ) {
            if (event.key === "Escape") {
                onClose();
            }
        }

        window.addEventListener(
            "keydown",
            handleKeyDown,
        );

        return () => {
            window.removeEventListener(
                "keydown",
                handleKeyDown,
            );
        };
    }, [onClose]);

    useEffect(() => {
        const requestId =
            ++requestIdRef.current;

        if (normalizedQuery.length < 2) {
            return;
        }

        const timeoutId = window.setTimeout(
            async () => {
                setIsLoading(true);
                setHasError(false);

                try {
                    const result =
                        await getProducts({
                            search: normalizedQuery,
                            page: 1,
                            limit: 6,
                            sort: "newest",
                        });

                    if (
                        requestId !==
                        requestIdRef.current
                    ) {
                        return;
                    }

                    setProducts(result.data);
                    setTotal(result.total);
                } catch {
                    if (
                        requestId !==
                        requestIdRef.current
                    ) {
                        return;
                    }

                    setHasError(true);
                    setProducts([]);
                    setTotal(0);
                } finally {
                    if (
                        requestId ===
                        requestIdRef.current
                    ) {
                        setIsLoading(false);
                    }
                }
            },
            1400,
        );

        return () => {
            window.clearTimeout(timeoutId);
        };
    }, [normalizedQuery]);

    const shouldSearch =
        normalizedQuery.length >= 2;

    return (
        <div
            className="fixed inset-0 z-[70] bg-background"
            role="dialog"
            aria-modal="true"
            aria-label="جستجوی محصولات"
        >
            {/* Search header */}
            <div className="border-b border-border">
                <div className="site-container">
                    <div className="flex h-[72px] items-center gap-4">
                        <Search
                            className="size-5 shrink-0 text-muted-foreground"
                            strokeWidth={1.5}
                        />

                        <input
                            autoFocus
                            type="search"
                            value={query}
                            onChange={(event) =>
                                setQuery(
                                    event.target.value,
                                )
                            }
                            placeholder="نام ساعت، برند یا محصول را جستجو کنید..."
                            className="
                h-full
                min-w-0
                flex-1
                bg-transparent
                text-base
                outline-none
                placeholder:text-muted-foreground/60
                md:text-lg
              "
                        />

                        {isLoading &&
                            shouldSearch ? (
                            <Loader2
                                className="size-4 animate-spin text-muted-foreground"
                                strokeWidth={1.5}
                            />
                        ) : null}

                        <button
                            type="button"
                            onClick={onClose}
                            className="luxury-transition flex size-10 shrink-0 items-center justify-center hover:bg-secondary"
                            aria-label="بستن جستجو"
                        >
                            <X
                                className="size-[18px]"
                                strokeWidth={1.5}
                            />
                        </button>
                    </div>
                </div>
            </div>

            {/* Results */}
            <div className="site-container py-10 md:py-14">
                {!shouldSearch ? (
                    <div className="py-20 text-center">
                        <p
                            dir="ltr"
                            className="font-heading text-4xl tracking-[0.08em] text-foreground/10 md:text-6xl"
                        >
                            DISCOVER
                        </p>

                        <p className="mt-5 text-sm text-muted-foreground">
                            برای شروع جستجو حداقل دو
                            حرف وارد کنید.
                        </p>
                    </div>
                ) : null}

                {shouldSearch &&
                    !isLoading &&
                    hasError ? (
                    <div className="py-20 text-center">
                        <p className="text-sm text-muted-foreground">
                            در دریافت نتایج جستجو مشکلی
                            ایجاد شد.
                        </p>
                    </div>
                ) : null}

                {shouldSearch &&
                    !isLoading &&
                    !hasError &&
                    products.length === 0 ? (
                    <div className="py-20 text-center">
                        <p className="text-lg">
                            محصولی پیدا نشد
                        </p>

                        <p className="mt-3 text-sm text-muted-foreground">
                            عبارت دیگری را امتحان کنید.
                        </p>
                    </div>
                ) : null}

                {shouldSearch &&
                    products.length > 0 ? (
                    <>
                        <div className="mb-8 flex items-center justify-between gap-4 border-b border-border pb-5">
                            <div>
                                <p
                                    dir="ltr"
                                    className="section-eyebrow"
                                >
                                    SEARCH RESULTS
                                </p>

                                <p className="mt-2 text-sm text-muted-foreground">
                                    {total.toLocaleString(
                                        "fa-IR",
                                    )}{" "}
                                    نتیجه
                                </p>
                            </div>

                            {total > products.length ? (
                                <Link
                                    href={`/shop?search=${encodeURIComponent(
                                        normalizedQuery,
                                    )}`}
                                    onClick={onClose}
                                    className="luxury-transition border-b border-foreground/30 pb-2 text-sm hover:border-foreground"
                                >
                                    مشاهده همه
                                </Link>
                            ) : null}
                        </div>

                        <div className="grid gap-x-10 gap-y-2 md:grid-cols-2">
                            {products.map(
                                (product) => {
                                    const image =
                                        product.thumbnail ||
                                        product.images?.[0];

                                    return (
                                        <Link
                                            key={product.id}
                                            href={`/product/${product.id}`}
                                            onClick={onClose}
                                            className="group flex items-center gap-5 border-b border-border py-5"
                                        >
                                            <div className="relative size-24 shrink-0 overflow-hidden bg-secondary sm:size-28">
                                                {image ? (
                                                    <Image
                                                        src={image}
                                                        alt={
                                                            product.name
                                                        }
                                                        fill
                                                        sizes="112px"
                                                        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                                                    />
                                                ) : null}
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <p
                                                    dir="ltr"
                                                    className="text-[0.65rem] uppercase tracking-[0.16em] text-muted-foreground"
                                                >
                                                    {product.brand}
                                                </p>

                                                <h3
                                                    dir="ltr"
                                                    className="mt-2 truncate font-heading text-xl font-medium md:text-2xl"
                                                >
                                                    {product.name}
                                                </h3>

                                                <p className="mt-3 text-sm">
                                                    {product.price.toLocaleString(
                                                        "fa-IR",
                                                    )}{" "}
                                                    تومان
                                                </p>
                                            </div>
                                        </Link>
                                    );
                                },
                            )}
                        </div>
                    </>
                ) : null}
            </div>
        </div>
    );
}