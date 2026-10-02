"use client";

import { uiConfig } from "@/config/ui";
import { formatNumber } from "@/lib/format";


import {
    useEffect,
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

import { useQuery } from "@tanstack/react-query";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { getApiErrorMessage } from "@/services/api/api-error";
import { Input } from "@/components/ui/input";
import { useCategories, categoryHref } from "@/features/catalog/use-categories";
import { ProductCard } from "@/components/store/product-card";
import { Button } from "@/components/ui/button";

interface HeaderSearchProps {
    onClose: () => void;
}

export function HeaderSearch({
    onClose,
}: HeaderSearchProps) {
    const { data: categories = [] } = useCategories();
    const [query, setQuery] = useState("");
    const [page, setPage] = useState(1);
    const normalizedQuery = query.trim();
    const debouncedQuery = useDebouncedValue(normalizedQuery, uiConfig.searchDebounceMs);
    const shouldSearch = normalizedQuery.length >= 2;
    const { data, isFetching, isError: hasError, error, refetch } = useQuery({
        queryKey: ["products", "search", debouncedQuery, page],
        queryFn: ({ signal }) => getProducts({ search: debouncedQuery, page, limit: 6, sort: "newest" }, signal),
        enabled: debouncedQuery.length >= 2 && shouldSearch,
    });
    // در فاصلهٔ debounce، نتیجهٔ عبارت قبلی به اسم عبارت تازه نمایش داده نمی‌شود.
    const isLoading = normalizedQuery !== debouncedQuery || isFetching;
    const products = isLoading ? [] : (data?.data ?? []);
    const total = data?.total ?? 0;

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

    return (
        <div
            className="fixed inset-0 z-[70] overflow-y-auto bg-background"
            role="dialog"
            aria-modal="true"
            aria-label="جستجوی محصولات"
        >
            {/* قاب مشترک ورودی و آیکون در Discover فوکوس را نشان می‌دهد؛ حلقهٔ داخلی حذف شده تا دو بوردر دیده نشود. */}
            <div className="sticky top-0 z-10 border-b border-border/60 bg-background/95 backdrop-blur-sm">
                <div className="mx-auto flex max-w-5xl items-center gap-3 px-5 py-5 md:py-7">
                    <div className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl border border-border bg-card px-4 transition-[border-color,box-shadow] duration-200 focus-within:border-forest/60 focus-within:ring-2 focus-within:ring-forest/10">
                        <Search aria-hidden="true" className="size-5 shrink-0 text-forest" strokeWidth={1.5} />
                        <Input autoFocus type="search" aria-label="جستجوی ساعت‌ها" value={query}
                            onChange={(event) => { setQuery(event.target.value); setPage(1); }}
                            placeholder="نام ساعت یا برند را جستجو کنید…"
                            className="h-14 min-w-0 flex-1 rounded-none border-0 bg-transparent px-0 text-right shadow-none focus-visible:border-transparent focus-visible:ring-0 md:text-base" />
                        {isLoading && shouldSearch ? <Loader2 aria-label="در حال جستجو" className="size-4 shrink-0 animate-spin text-forest" /> : null}
                    </div>
                    <Button type="button" variant="ghost" size="icon" onClick={onClose} className="size-11 shrink-0 rounded-full hover:bg-forest/10 hover:text-forest" aria-label="بستن جستجو">
                        <X className="size-5" strokeWidth={1.5} />
                    </Button>
                </div>
            </div>

            {/* Results */}
            <div className="site-container py-10 md:py-14">
                {!shouldSearch ? (
                    <div className="mx-auto max-w-5xl py-8 text-center md:py-12">
                        <Search aria-hidden="true" className="mx-auto mb-6 size-10 text-forest/60" strokeWidth={1} />
                        {/* حذف dir مستقل مانع اعمال قانون عمومی راست‌چین روی عنوان وسط‌چین Discover می‌شود. */}
                        <p
                            className="text-center text-4xl text-forest md:text-5xl"
                        >
                            کشف ساعت‌ها
                        </p>
                        {/* مجموعه‌ها از کش مشترک هدر می‌آیند؛ عکس و نام ثابت در رابط تکرار نمی‌شوند. */}
                        {categories.length > 0 && <div className="mt-10">
                            <p className="mb-5 text-xs text-muted-foreground">یا از مجموعه‌های ما شروع کنید</p>
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                                {categories.map(category => <Link key={category.id} href={categoryHref(category.slug)} onClick={onClose} className="group overflow-hidden rounded-2xl border border-border bg-card transition-colors hover:border-forest/40 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-forest">
                                    <div className="relative aspect-square overflow-hidden bg-secondary">
                                        {category.coverImage && <Image src={category.coverImage} alt="" fill sizes="(max-width:640px) 45vw, 160px" className="object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transform-none" />}
                                    </div>
                                    <span className="block px-2 py-4 text-sm text-forest">{category.name}</span>
                                </Link>)}
                            </div>
                        </div>}

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
                            {getApiErrorMessage(error)}
                        </p>
                        <Button className="mt-4" onClick={() => void refetch()}>تلاش دوباره</Button>
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
                                    dir="rtl"
                                    className="section-eyebrow"
                                >نتایج جستجو</p>

                                <p className="mt-2 text-sm text-muted-foreground">
                                    {formatNumber(total)}{" "}
                                    نتیجه
                                </p>
                            </div>

                            {total > 6 && <div className="flex gap-2">
                                <Button variant="outline" disabled={page <= 1 || isLoading} onClick={() => setPage(page - 1)}>قبلی</Button>
                                <span className="self-center text-sm">{formatNumber(page)}</span>
                                <Button variant="outline" disabled={page >= (data?.totalPages ?? 1) || isLoading} onClick={() => setPage(page + 1)}>بعدی</Button>
                            </div>}
                        </div>

                        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {products.map(product => <ProductCard key={product.id} product={product} onNavigate={onClose} />)}
                        </div>
                    </>
                ) : null}
            </div>
        </div>
    );
}
