"use client";

import { useState } from "react";

import { Eye } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";

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
    useAdminOrdersQuery,
} from "@/features/admin/orders/queries/use-admin-orders-query";

import {
    type AdminOrderStatusFilter,
    type AdminPaymentStatusFilter,
} from "@/services/orders.service";

import type { Order } from "@/types/order";

const PAGE_SIZE = 10;

/*
 * هدف:
 * نمایش مبلغ سفارش با فرمت عددی فارسی.
 *
 * محل استفاده:
 * ستون مبلغ کل در جدول سفارش‌های Admin.
 *
 * نحوه کار:
 * Intl.NumberFormat مقدار عددی را با Locale فارسی فرمت می‌کند.
 */
function formatPrice(value: number) {
    return new Intl.NumberFormat("fa-IR").format(value);
}

/*
 * هدف:
 * نمایش تاریخ ثبت سفارش با فرمت فارسی.
 *
 * محل استفاده:
 * ستون تاریخ ثبت در جدول سفارش‌های Admin.
 *
 * نحوه کار:
 * timestamp ذخیره‌شده در Order به Date تبدیل شده
 * و سپس با Intl.DateTimeFormat به فرمت فارسی نمایش داده می‌شود.
 */
function formatDate(timestamp: number) {
    return new Intl.DateTimeFormat("fa-IR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(timestamp));
}
/*
 * هدف:
 * تبدیل وضعیت فنی سفارش به متن فارسی قابل نمایش.
 *
 * محل استفاده:
 * ستون وضعیت سفارش در جدول Admin Orders.
 *
 * نحوه کار:
 * هر مقدار OrderStatus به Label فارسی متناظر تبدیل می‌شود.
 */
function getOrderStatusLabel(
    status: Order["status"],
) {
    switch (status) {
        case "pending":
            return "در انتظار بررسی";

        case "processing":
            return "در حال پردازش";

        case "shipped":
            return "ارسال شده";

        case "delivered":
            return "تحویل شده";

        case "cancelled":
            return "لغو شده";
    }
}

/*
 * هدف:
 * تبدیل وضعیت فنی پرداخت به Label فارسی.
 *
 * محل استفاده:
 * ستون وضعیت پرداخت در جدول Admin Orders.
 *
 * نحوه کار:
 * paymentStatus دریافتی از Backend به متن فارسی مناسب تبدیل می‌شود.
 */
function getPaymentStatusLabel(
    status: Order["paymentStatus"],
) {
    switch (status) {
        case "pending":
            return "در انتظار پرداخت";

        case "paid":
            return "پرداخت شده";

        case "failed":
            return "ناموفق";
    }
}

export default function AdminOrdersPage() {
    /*
     * هدف:
     * نگهداری شماره صفحه فعلی Pagination.
     *
     * محل استفاده:
     * در Query سفارش‌ها و کنترل Pagination صفحه.
     *
     * نحوه کار:
     * با تغییر page، Query Key تغییر می‌کند و React Query
     * اطلاعات همان صفحه را از Cache یا Backend دریافت می‌کند.
     */
    const [page, setPage] = useState(1);

    /*
     * هدف:
     * نگهداری فیلتر فعلی سفارش‌ها.
     *
     * محل استفاده:
     * در Select بالای جدول و Query سفارش‌ها.
     *
     * نحوه کار:
     * با تغییر Filter، صفحه به 1 برمی‌گردد و React Query
     * بر اساس پارامتر جدید اطلاعات را دریافت می‌کند.
     */
    const [filter, setFilter] =
        useState<AdminOrderStatusFilter>(
            "all",
        );

    /*
 * هدف:
 * نگهداری فیلتر وضعیت پرداخت در صفحه سفارش‌های Admin.
 *
 * محل استفاده:
 * Select وضعیت پرداخت و Query مربوط به لیست سفارش‌ها.
 *
 * نحوه کار:
 * با تغییر مقدار، React Query به‌دلیل تغییر Query Key
 * درخواست جدید را با paymentStatus مناسب ارسال می‌کند.
 */
    const [paymentFilter, setPaymentFilter] =
        useState<AdminPaymentStatusFilter>(
            "all",
        );

    /*
     * هدف:
     * دریافت Server State مربوط به سفارش‌ها با React Query.
     *
     * محل استفاده:
     * منبع اصلی اطلاعات Table و Pagination صفحه Admin Orders.
     *
     * نحوه کار:
     * page، limit و filter به Hook داده می‌شوند.
     * Hook مسئول Request، Cache، Loading و Error خواهد بود.
     */
    const {
        data,
        isPending,
        isError,
    } = useAdminOrdersQuery({
        page,
        limit: PAGE_SIZE,
        status: filter,
        paymentStatus: paymentFilter,
    });

    /*
     * هدف:
     * استخراج لیست سفارش‌ها از نتیجه React Query با مقدار پیش‌فرض امن.
     *
     * محل استفاده:
     * Table سفارش‌ها.
     *
     * نحوه کار:
     * قبل از دریافت اولین Response، آرایه خالی استفاده می‌شود.
     */
    const orders =
        data?.data ?? [];

    /*
     * هدف:
     * تعیین تعداد صفحات Pagination از Response Backend.
     *
     * محل استفاده:
     * Pagination پایین جدول سفارش‌ها.
     *
     * نحوه کار:
     * حداقل یک صفحه در نظر گرفته می‌شود تا Logic Pagination مقدار صفر نگیرد.
     */
    const totalPages = Math.max(
        data?.totalPages ?? 1,
        1,
    );

    /*
     * هدف:
     * تغییر فیلتر وضعیت سفارش و بازگرداندن Pagination به صفحه اول.
     *
     * محل استفاده:
     * Select وضعیت سفارش در صفحه Admin Orders.
     *
     * نحوه کار:
     * با تغییر Status، مقدار فیلتر در State ذخیره می‌شود
     * و React Query بر اساس Query Key جدید داده مناسب را دریافت می‌کند.
     */
    const handleFilterChange = (
        value: AdminOrderStatusFilter,
    ) => {
        setFilter(value);
        setPage(1);
    };

    /*
 * هدف:
 * تغییر فیلتر وضعیت پرداخت و بازگرداندن لیست به صفحه اول.
 *
 * محل استفاده:
 * Select وضعیت پرداخت در صفحه Admin Orders.
 *
 * نحوه کار:
 * مقدار جدید در State ذخیره می‌شود و Pagination ریست می‌شود
 * تا نتیجه فیلتر جدید از صفحه اول نمایش داده شود.
 */
    const handlePaymentFilterChange = (
        value: AdminPaymentStatusFilter,
    ) => {
        setPaymentFilter(value);
        setPage(1);
    };

    /*
     * هدف:
     * کنترل تغییر صفحات بدون خروج از محدوده Pagination.
     *
     * محل استفاده:
     * دکمه‌های Previous، Next و شماره صفحات.
     *
     * نحوه کار:
     * فقط Page معتبر و متفاوت از Page فعلی در State ذخیره می‌شود.
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

        setPage(nextPage);
    };

    return (
        <section className="space-y-6">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <p className="section-eyebrow">
                        ORDERS
                    </p>

                    <h1 className="mt-2 text-3xl font-medium">
                        سفارش‌ها
                    </h1>

                    <p className="mt-2 text-sm text-muted-foreground">
                        لیست سفارش‌های ثبت شده فروشگاه
                    </p>
                </div>

                {/*
     * هدف:
     * نمایش فیلترهای وضعیت سفارش و وضعیت پرداخت در کنار یکدیگر.
     *
     * محل استفاده:
     * بالای جدول سفارش‌های Admin.
     *
     * نحوه کار:
     * در موبایل فیلترها زیر هم نمایش داده می‌شوند
     * و در اندازه‌های بزرگ‌تر کنار هم قرار می‌گیرند.
     */}
                <div className="grid w-full gap-4 sm:grid-cols-2 lg:w-auto">
                    {/*
         * هدف:
         * فیلتر کردن سفارش‌ها بر اساس مرحله چرخه سفارش.
         *
         * محل استفاده:
         * فیلتر اول صفحه Admin Orders.
         *
         * نحوه کار:
         * مقدار انتخاب‌شده داخل filter ذخیره می‌شود
         * و React Query بر اساس status جدید داده را دریافت می‌کند.
         */}
                    <div className="w-full sm:min-w-[220px]">
                        <p className="mb-2 text-sm font-medium">
                            وضعیت سفارش
                        </p>

                        <Select
                            value={filter}
                            onValueChange={(value) =>
                                handleFilterChange(
                                    value as AdminOrderStatusFilter,
                                )
                            }
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="وضعیت سفارش" />
                            </SelectTrigger>

                            <SelectContent dir="rtl">
                                <SelectItem value="all">
                                    همه سفارش‌ها
                                </SelectItem>

                                <SelectItem value="pending">
                                    در انتظار بررسی
                                </SelectItem>

                                <SelectItem value="processing">
                                    در حال پردازش
                                </SelectItem>

                                <SelectItem value="shipped">
                                    ارسال شده
                                </SelectItem>

                                <SelectItem value="delivered">
                                    تحویل شده
                                </SelectItem>

                                <SelectItem value="cancelled">
                                    لغو شده
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/*
         * هدف:
         * فیلتر کردن سفارش‌ها بر اساس وضعیت پرداخت.
         *
         * محل استفاده:
         * فیلتر دوم صفحه Admin Orders.
         *
         * نحوه کار:
         * مقدار انتخاب‌شده داخل paymentFilter ذخیره می‌شود
         * و React Query درخواست جدید را با paymentStatus ارسال می‌کند.
         */}
                    <div className="w-full sm:min-w-[220px]">
                        <p className="mb-2 text-sm font-medium">
                            وضعیت پرداخت
                        </p>

                        <Select
                            value={paymentFilter}
                            onValueChange={(value) =>
                                handlePaymentFilterChange(
                                    value as AdminPaymentStatusFilter,
                                )
                            }
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="وضعیت پرداخت" />
                            </SelectTrigger>

                            <SelectContent dir="rtl">
                                <SelectItem value="all">
                                    همه وضعیت‌های پرداخت
                                </SelectItem>

                                <SelectItem value="pending">
                                    در انتظار پرداخت
                                </SelectItem>

                                <SelectItem value="paid">
                                    پرداخت موفق
                                </SelectItem>

                                <SelectItem value="failed">
                                    پرداخت ناموفق
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            <div className="overflow-hidden rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-right">
                                کد سفارش
                            </TableHead>

                            <TableHead className="text-right">
                                مشتری
                            </TableHead>

                            <TableHead className="text-right">
                                تلفن
                            </TableHead>

                            <TableHead className="text-right">
                                تاریخ ثبت
                            </TableHead>

                            <TableHead className="text-right">
                                مبلغ کل
                            </TableHead>

                            <TableHead className="text-right">
                                وضعیت سفارش
                            </TableHead>

                            <TableHead className="text-right">
                                وضعیت پرداخت
                            </TableHead>

                            <TableHead className="text-center">
                                عملیات
                            </TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {isPending ? (
                            <TableRow>
                                <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                                    در حال دریافت سفارش‌ها...
                                </TableCell>
                            </TableRow>
                        ) : isError ? (
                            <TableRow>
                                <TableCell colSpan={8} className="h-32 text-center text-destructive">
                                    دریافت لیست سفارش‌ها با خطا مواجه شد.
                                </TableCell>
                            </TableRow>
                        ) : orders.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                                    سفارشی یافت نشد.
                                </TableCell>
                            </TableRow>
                        ) : (
                            orders.map((order) => (
                                <TableRow key={order.id}>
                                    <TableCell className="font-medium">
                                        #{order.id}
                                    </TableCell>

                                    <TableCell>
                                        {order.customer.fullName}
                                    </TableCell>

                                    <TableCell dir="ltr">
                                        {order.customer.mobile}
                                    </TableCell>

                                    <TableCell>
                                        {formatDate(
                                            order.createdAt,
                                        )}
                                    </TableCell>

                                    <TableCell>
                                        {formatPrice(
                                            order.totalPrice,
                                        )}{" "}
                                        تومان
                                    </TableCell>

                                    <TableCell>
                                        <Badge
                                            variant={
                                                order.status ===
                                                    "delivered"
                                                    ? "default"
                                                    : "secondary"
                                            }
                                        >
                                            {getOrderStatusLabel(
                                                order.status,
                                            )}
                                        </Badge>
                                    </TableCell>

                                    <TableCell>
                                        <Badge variant="outline">
                                            {getPaymentStatusLabel(
                                                order.paymentStatus,
                                            )}
                                        </Badge>
                                    </TableCell>

                                    <TableCell className="text-center">
                                        <Button
                                            type="button"
                                            size="icon"
                                            variant="outline"
                                            title="مشاهده سفارش"
                                        >
                                            <Eye className="size-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
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
                                />
                            </PaginationItem>

                            {Array.from(
                                {
                                    length: totalPages,
                                },
                                (_, index) => {
                                    const pageNumber =
                                        index + 1;

                                    return (
                                        <PaginationItem
                                            key={pageNumber}
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
                                                {pageNumber}
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
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                )}
        </section>
    );
}