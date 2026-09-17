"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import {
    Edit3,
    Search,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";

import { getProducts } from "@/services/products.service";

import type { Product } from "@/types/product";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

const PAGE_SIZE = 10;

function formatNumber(value: number) {
    return new Intl.NumberFormat(
        "fa-IR",
    ).format(value);
}

export default function AdminInventoryPage() {
    const [products, setProducts] =
        useState<Product[]>([]);

    const [page, setPage] =
        useState(1);

    const [totalPages, setTotalPages] =
        useState(1);

    const [search, setSearch] =
        useState("");

    const [appliedSearch, setAppliedSearch] =
        useState("");

    /*
 * هدف:
 * جلوگیری از ارسال Request در هر بار تایپ کاربر.
 *
 * محل استفاده:
 * Search صفحه Admin Inventory.
 *
 * نحوه کار:
 * مقدار search پس از 400 میلی‌ثانیه توقف تایپ
 * به مقدار Debounce شده تبدیل می‌شود.
 */
    const debouncedSearch =
        useDebouncedValue(
            search.trim(),
            400,
        );

    /*
     * هدف:
     * اعمال Search جدید روی لیست موجودی.
     *
     * محل استفاده:
     * بین Search Input و دریافت محصولات Inventory.
     *
     * نحوه کار:
     * پس از پایان Debounce، صفحه به 1 برمی‌گردد
     * و مقدار جستجوی API به‌روزرسانی می‌شود.
     */
    useEffect(() => {
        setPage(1);
        setAppliedSearch(
            debouncedSearch,
        );
    }, [debouncedSearch]);

    const [isLoading, setIsLoading] =
        useState(true);

    const [error, setError] =
        useState<string | null>(null);

    useEffect(() => {
        let isCancelled = false;

        /*
         * هدف:
         * فعال کردن Loading برای هر درخواست جدید Inventory.
         *
         * محل استفاده:
         * قبل از getProducts.
         *
         * نحوه کار:
         * تغییر Search یا Page باعث نمایش Loading می‌شود.
         */
        setIsLoading(true);

        getProducts({
            page,
            limit: PAGE_SIZE,
            search:
                appliedSearch ||
                undefined,
            sort: "newest",
        })
            .then((result) => {
                if (isCancelled) {
                    return;
                }

                setProducts(
                    result.data,
                );

                setTotalPages(
                    Math.max(
                        result.totalPages,
                        1,
                    ),
                );

                setError(null);
            })
            .catch((requestError) => {
                if (isCancelled) {
                    return;
                }

                console.error(
                    "Failed to load inventory:",
                    requestError,
                );

                setError(
                    "دریافت اطلاعات قیمت و موجودی با خطا مواجه شد.",
                );
            })
            .finally(() => {
                if (!isCancelled) {
                    setIsLoading(false);
                }
            });

        return () => {
            isCancelled = true;
        };
    }, [
        page,
        appliedSearch,
    ]);

    const handlePageChange = (
        nextPage: number,
    ) => {
        if (
            nextPage < 1 ||
            nextPage > totalPages ||
            nextPage === page
        ) {
            return;
        }
        setPage(nextPage);
    };

    return (
        <section className="space-y-6">
            <div>
                <p className="section-eyebrow">
                    INVENTORY
                </p>

                <h1 className="mt-2 text-3xl font-medium">
                    قیمت و موجودی
                </h1>

                <p className="mt-2 text-sm text-muted-foreground">
                    مشاهده قیمت و موجودی محصولات فروشگاه
                </p>
            </div>

            {/*
 * هدف:
 * جستجوی خودکار محصولات Inventory بدون دکمه Search.
 *
 * محل استفاده:
 * بالای جدول قیمت و موجودی.
 *
 * نحوه کار:
 * مقدار Input در search ذخیره می‌شود
 * و Debounce مسئول زمان اجرای درخواست است.
 */}
            <div className="border p-4">
                <div className="relative">
                    <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                    <Input
                        value={search}
                        onChange={(event) =>
                            setSearch(
                                event.target.value,
                            )
                        }
                        placeholder="جستجوی نام یا برند محصول..."
                        className="pr-10"
                    />
                </div>
            </div>

            <div className="overflow-hidden rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-right">
                                تصویر
                            </TableHead>

                            <TableHead className="text-right">
                                نام محصول
                            </TableHead>

                            <TableHead className="text-right">
                                برند
                            </TableHead>

                            <TableHead className="text-right">
                                قیمت
                            </TableHead>

                            <TableHead className="text-right">
                                موجودی
                            </TableHead>

                            <TableHead className="text-center">
                                عملیات
                            </TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell
                                    colSpan={6}
                                    className="h-32 text-center text-muted-foreground"
                                >
                                    در حال دریافت اطلاعات...
                                </TableCell>
                            </TableRow>
                        ) : error ? (
                            <TableRow>
                                <TableCell
                                    colSpan={6}
                                    className="h-32 text-center text-destructive"
                                >
                                    {error}
                                </TableCell>
                            </TableRow>
                        ) : products.length ===
                            0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={6}
                                    className="h-32 text-center text-muted-foreground"
                                >
                                    محصولی یافت نشد.
                                </TableCell>
                            </TableRow>
                        ) : (
                            products.map(
                                (product) => (
                                    <TableRow
                                        key={
                                            product.id
                                        }
                                    >
                                        <TableCell>
                                            <div className="relative size-14 overflow-hidden border bg-muted">
                                                <Image
                                                    src={
                                                        product.thumbnail
                                                    }
                                                    alt={
                                                        product.name
                                                    }
                                                    fill
                                                    sizes="56px"
                                                    className="object-cover"
                                                />
                                            </div>
                                        </TableCell>

                                        <TableCell className="font-medium">
                                            {
                                                product.name
                                            }
                                        </TableCell>

                                        <TableCell>
                                            {
                                                product.brand
                                            }
                                        </TableCell>

                                        <TableCell>
                                            {formatNumber(
                                                product.price,
                                            )}
                                            {" "}
                                            تومان
                                        </TableCell>

                                        <TableCell>
                                            {formatNumber(
                                                product.quantity,
                                            )}
                                        </TableCell>

                                        <TableCell className="text-center">
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="outline"
                                            >
                                                <Edit3 className="size-4" />

                                                ویرایش
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ),
                            )
                        )}
                    </TableBody>
                </Table>
            </div>

            {!isLoading &&
                !error &&
                totalPages > 1 && (
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    href="#"
                                    onClick={(event) => {
                                        event.preventDefault();

                                        handlePageChange(
                                            page - 1,
                                        );
                                    }}
                                    className={
                                        page === 1
                                            ? "pointer-events-none opacity-50"
                                            : undefined
                                    }
                                >
                                    قبلی
                                </PaginationPrevious>
                            </PaginationItem>

                            {Array.from(
                                {
                                    length:
                                        totalPages,
                                },
                                (_, index) => {
                                    const pageNumber =
                                        index +
                                        1;

                                    return (
                                        <PaginationItem
                                            key={
                                                pageNumber
                                            }
                                        >
                                            <PaginationLink
                                                href="#"
                                                isActive={
                                                    pageNumber ===
                                                    page
                                                }
                                                onClick={(
                                                    event,
                                                ) => {
                                                    event.preventDefault();

                                                    handlePageChange(
                                                        pageNumber,
                                                    );
                                                }}
                                            >
                                                {
                                                    pageNumber
                                                }
                                            </PaginationLink>
                                        </PaginationItem>
                                    );
                                },
                            )}

                            <PaginationItem>
                                <PaginationNext
                                    href="#"
                                    onClick={(event) => {
                                        event.preventDefault();

                                        handlePageChange(
                                            page + 1,
                                        );
                                    }}
                                    className={
                                        page ===
                                            totalPages
                                            ? "pointer-events-none opacity-50"
                                            : undefined
                                    }
                                >
                                    بعدی
                                </PaginationNext>
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                )}
        </section>
    );
}