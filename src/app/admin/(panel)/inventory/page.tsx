"use client";

import Image from "next/image";
import {
    useState,
} from "react";

import {
    Edit3,
    Search,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

import {
    useAdminProductsQuery,
} from "@/features/admin/products/queries/use-admin-products-query";

import {
    useDebouncedValue,
} from "@/hooks/use-debounced-value";

const PAGE_SIZE = 10;

/*
 * هدف:
 * نمایش اعداد قیمت و موجودی با فرمت فارسی.
 *
 * محل استفاده:
 * ستون قیمت و موجودی جدول Inventory.
 *
 * نحوه کار:
 * مقدار عددی با Locale فارسی فرمت می‌شود.
 */
function formatNumber(
    value: number,
) {
    return new Intl.NumberFormat(
        "fa-IR",
    ).format(value);
}

export default function AdminInventoryPage() {
    /*
     * هدف:
     * نگهداری شماره صفحه فعلی Pagination.
     *
     * محل استفاده:
     * Query محصولات و Pagination پایین جدول.
     *
     * نحوه کار:
     * تغییر page باعث تغییر Query Key و دریافت صفحه متناظر می‌شود.
     */
    const [
        page,
        setPage,
    ] = useState(1);

    /*
     * هدف:
     * نگهداری مقدار Search Input.
     *
     * محل استفاده:
     * جستجوی محصولات در صفحه Inventory.
     *
     * نحوه کار:
     * مقدار بلافاصله با تایپ کاربر تغییر می‌کند
     * ولی Request با مقدار Debounce شده اجرا می‌شود.
     */
    const [
        search,
        setSearch,
    ] = useState("");

    /*
     * هدف:
     * جلوگیری از ارسال Request در هر بار تایپ.
     *
     * محل استفاده:
     * Search صفحه Admin Inventory.
     *
     * نحوه کار:
     * پس از 400 میلی‌ثانیه توقف تایپ،
     * مقدار Search وارد Query محصولات می‌شود.
     */
    const debouncedSearch =
        useDebouncedValue(
            search.trim(),
            400,
        );

    /*
     * هدف:
     * دریافت اطلاعات قیمت و موجودی محصولات با React Query.
     *
     * محل استفاده:
     * Table، Search و Pagination صفحه Inventory.
     *
     * نحوه کار:
     * Inventory همان Product Data را مصرف می‌کند،
     * بنابراین از Query مشترک محصولات استفاده می‌شود.
     * Page و Search داخل Query Key قرار می‌گیرند و
     * React Query مسئول Request، Cache، Loading و Error است.
     */
    const {
        data: productsResult,
        isPending,
        isError,
    } = useAdminProductsQuery({
        page,
        limit: PAGE_SIZE,
        search:
            debouncedSearch ||
            undefined,
        sort: "newest",
    });

    /*
     * هدف:
     * استخراج امن لیست محصولات از Response.
     *
     * محل استفاده:
     * Table صفحه Inventory.
     *
     * نحوه کار:
     * قبل از دریافت اولین Response آرایه خالی استفاده می‌شود.
     */
    const products =
        productsResult?.data ?? [];

    /*
     * هدف:
     * تعیین تعداد صفحات Pagination.
     *
     * محل استفاده:
     * Pagination پایین جدول Inventory.
     *
     * نحوه کار:
     * totalPages از Response دریافت شده و
     * حداقل یک صفحه در نظر گرفته می‌شود.
     */
    const totalPages = Math.max(
        productsResult?.totalPages ?? 1,
        1,
    );

    /*
     * هدف:
     * مدیریت تغییر Search.
     *
     * محل استفاده:
     * Input جستجوی Inventory.
     *
     * نحوه کار:
     * مقدار Search ذخیره شده و Pagination
     * هنگام شروع جستجوی جدید به صفحه اول برمی‌گردد.
     */
    const handleSearchChange = (
        value: string,
    ) => {
        setSearch(value);

        if (page !== 1) {
            setPage(1);
        }
    };

    /*
     * هدف:
     * کنترل تغییر صفحات Pagination.
     *
     * محل استفاده:
     * Previous، Next و شماره صفحات.
     *
     * نحوه کار:
     * فقط شماره صفحه معتبر و متفاوت از صفحه فعلی ذخیره می‌شود.
     */
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

        setPage(
            nextPage,
        );
    };

    return (
        <section className="space-y-6">
            <div>
                <h1 className="text-3xl font-medium">
                    قیمت و موجودی
                </h1>

                <p className="mt-2 text-sm text-muted-foreground">
                    مشاهده قیمت و موجودی محصولات فروشگاه
                </p>
            </div>

            {/*
             * هدف:
             * جستجوی خودکار محصولات Inventory.
             *
             * محل استفاده:
             * بالای جدول قیمت و موجودی.
             *
             * نحوه کار:
             * Input بلافاصله تغییر می‌کند ولی Query
             * فقط بعد از پایان Debounce اجرا می‌شود.
             */}
            <div className="border p-4">
                <div className="relative">
                    <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                    <Input
                        value={search}
                        onChange={(event) =>
                            handleSearchChange(
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
                        {isPending ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                                    در حال دریافت اطلاعات...
                                </TableCell>
                            </TableRow>
                        ) : isError ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-32 text-center text-destructive">
                                    دریافت اطلاعات قیمت و موجودی با خطا مواجه شد.
                                </TableCell>
                            </TableRow>
                        ) : products.length ===
                            0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
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
                                            )}{" "}
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

            {!isPending &&
                !isError &&
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
                                    className={page === 1 ? "pointer-events-none opacity-50" : undefined}
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
                                    className={page === totalPages ? "pointer-events-none opacity-50" : undefined}
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