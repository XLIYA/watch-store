"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

import {
    Edit3,
    Plus,
    Search,
    Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

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

import {
    getProducts,
} from "@/services/products.service";

import {
    getCategories,
} from "@/services/categories.service";

import type { Product } from "@/types/product";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

const PAGE_SIZE = 10;

type Categories =
    Awaited<
        ReturnType<typeof getCategories>
    >;

export default function AdminProductsPage() {
    const [products, setProducts] =
        useState<Product[]>([]);

    const [categories, setCategories] =
        useState<Categories>([]);

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
 * جلوگیری از ارسال درخواست API در هر بار تایپ کاربر.
 *
 * محل استفاده:
 * Search صفحه Admin Products.
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
     * اعمال مقدار Debounce شده روی جستجوی محصولات.
     *
     * محل استفاده:
     * بین Search Input و Query دریافت محصولات.
     *
     * نحوه کار:
     * بعد از پایان Debounce، Pagination به صفحه اول
     * برمی‌گردد و appliedSearch به‌روزرسانی می‌شود.
     */
    useEffect(() => {
        setPage(1);
        setAppliedSearch(
            debouncedSearch,
        );
    }, [debouncedSearch]);

    const [category, setCategory] =
        useState("all");

    const [isLoading, setIsLoading] =
        useState(true);

    const [error, setError] =
        useState<string | null>(null);

    useEffect(() => {
        getCategories()
            .then(setCategories)
            .catch((requestError) => {
                console.error(
                    "Failed to load categories:",
                    requestError,
                );
            });
    }, []);

    useEffect(() => {
        let isCancelled = false;

        /*
         * هدف:
         * نمایش Loading هنگام تغییر Pagination، Category یا Search.
         *
         * محل استفاده:
         * قبل از ارسال درخواست دریافت محصولات.
         *
         * نحوه کار:
         * هر Request جدید صفحه را وارد وضعیت Loading می‌کند.
         */
        setIsLoading(true);

        getProducts({
            page,
            limit: PAGE_SIZE,

            category:
                category === "all"
                    ? undefined
                    : Number(category),

            search:
                appliedSearch ||
                undefined,

            sort: "newest",
        })
            .then((result) => {
                if (isCancelled) {
                    return;
                }

                setProducts(result.data);

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
                    "Failed to load admin products:",
                    requestError,
                );

                setError(
                    "دریافت لیست محصولات با خطا مواجه شد.",
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
        category,
        appliedSearch,
    ]);

    const categoryMap =
        useMemo(() => {
            return new Map(
                categories.map(
                    (item) => [
                        Number(item.id),
                        item.name,
                    ],
                ),
            );
        }, [categories]);

    const handleCategoryChange = (
        value: string,
    ) => {
        setPage(1);
        setCategory(value);
    };

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
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <p className="section-eyebrow">
                        PRODUCTS
                    </p>

                    <h1 className="mt-2 text-3xl font-medium">
                        محصولات
                    </h1>

                    <p className="mt-2 text-sm text-muted-foreground">
                        مدیریت لیست محصولات فروشگاه
                    </p>
                </div>

                <Button
                    type="button"
                    disabled
                >
                    <Plus className="size-4" />

                    افزودن محصول
                </Button>
            </div>

            <div className="grid gap-4 border p-4 md:grid-cols-[1fr_220px]">
                {/*
 * هدف:
 * جستجوی خودکار محصولات بدون نیاز به دکمه Search.
 *
 * محل استفاده:
 * بخش فیلترهای Admin Products.
 *
 * نحوه کار:
 * مقدار Input بلافاصله در search قرار می‌گیرد،
 * اما API فقط پس از Debounce اجرا می‌شود.
 */}
                <div>
                    <p className="mb-2 text-sm font-medium">
                        جستجوی محصول
                    </p>

                    <div className="relative">
                        <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                        <Input
                            value={search}
                            onChange={(event) =>
                                setSearch(
                                    event.target.value,
                                )
                            }
                            placeholder="نام یا برند محصول..."
                            className="pr-10"
                        />
                    </div>
                </div>

                <div>
                    <p className="mb-2 text-sm font-medium">
                        گروه محصول
                    </p>

                    <Select
                        value={category}
                        onValueChange={
                            handleCategoryChange
                        }
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue />
                        </SelectTrigger>

                        <SelectContent>
                            <SelectItem value="all">
                                همه گروه‌ها
                            </SelectItem>

                            {categories.map(
                                (item) => (
                                    <SelectItem
                                        key={
                                            item.id
                                        }
                                        value={String(
                                            item.id,
                                        )}
                                    >
                                        {
                                            item.name
                                        }
                                    </SelectItem>
                                ),
                            )}
                        </SelectContent>
                    </Select>
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
                                گروه
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
                                    colSpan={7}
                                    className="h-32 text-center text-muted-foreground"
                                >
                                    در حال دریافت محصولات...
                                </TableCell>
                            </TableRow>
                        ) : error ? (
                            <TableRow>
                                <TableCell
                                    colSpan={7}
                                    className="h-32 text-center text-destructive"
                                >
                                    {error}
                                </TableCell>
                            </TableRow>
                        ) : products.length ===
                            0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={7}
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
                                            {categoryMap.get(
                                                Number(
                                                    product.category,
                                                ),
                                            ) ??
                                                "—"}
                                        </TableCell>

                                        <TableCell>
                                            {new Intl.NumberFormat(
                                                "fa-IR",
                                            ).format(
                                                product.price,
                                            )}
                                            {" "}
                                            تومان
                                        </TableCell>

                                        <TableCell>
                                            {new Intl.NumberFormat(
                                                "fa-IR",
                                            ).format(
                                                product.quantity,
                                            )}
                                        </TableCell>

                                        <TableCell>
                                            <div className="flex justify-center gap-2">
                                                <Button
                                                    type="button"
                                                    size="icon"
                                                    variant="outline"
                                                    title="ویرایش محصول"
                                                >
                                                    <Edit3 className="size-4" />
                                                </Button>

                                                <Button
                                                    type="button"
                                                    size="icon"
                                                    variant="outline"
                                                    title="حذف محصول"
                                                >
                                                    <Trash2 className="size-4" />
                                                </Button>
                                            </div>
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
                                    onClick={(
                                        event,
                                    ) => {
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
                                />
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
                                    onClick={(
                                        event,
                                    ) => {
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
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                )}
        </section>
    );
}