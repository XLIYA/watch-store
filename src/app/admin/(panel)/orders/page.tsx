"use client";

import { useEffect, useState } from "react";

import { Eye } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
    getAdminOrders,
    type AdminOrderDeliveryFilter,
} from "@/services/orders.service";

import type { Order } from "@/types/order";

const PAGE_SIZE = 10;

function formatPrice(value: number) {
    return new Intl.NumberFormat("fa-IR").format(value);
}

function formatDate(timestamp: number) {
    return new Intl.DateTimeFormat("fa-IR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(timestamp));
}

function getOrderStatusLabel(status: Order["status"]) {
    switch (status) {
        case "pending_payment":
            return "در انتظار پرداخت";

        case "processing":
            return "در حال پردازش";

        case "completed":
            return "تحویل شده";

        case "cancelled":
            return "لغو شده";
    }
}

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
    const [orders, setOrders] = useState<Order[]>([]);

    const [page, setPage] = useState(1);

    const [totalPages, setTotalPages] = useState(1);

    const [filter, setFilter] =
        useState<AdminOrderDeliveryFilter>("all");

    const [isLoading, setIsLoading] =
        useState(true);

    const [error, setError] =
        useState<string | null>(null);

    useEffect(() => {
        let isCancelled = false;

        getAdminOrders({
            page,
            limit: PAGE_SIZE,
            deliveryStatus: filter,
        })
            .then((result) => {
                if (isCancelled) {
                    return;
                }

                setOrders(result.data);
                setTotalPages(
                    Math.max(result.totalPages, 1),
                );
                setError(null);
            })
            .catch((requestError) => {
                if (isCancelled) {
                    return;
                }

                console.error(
                    "Failed to load admin orders:",
                    requestError,
                );

                setError(
                    "دریافت لیست سفارش‌ها با خطا مواجه شد.",
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
    }, [page, filter]);

    const handleFilterChange = (
        value: AdminOrderDeliveryFilter,
    ) => {
        setIsLoading(true);
        setPage(1);
        setFilter(value);
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

        setIsLoading(true);
        setPage(nextPage);
    };

    return (
        <section className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
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

                <div className="w-full sm:w-56">
                    <p className="mb-2 text-sm font-medium">
                        وضعیت تحویل
                    </p>

                    <Select
                        value={filter}
                        onValueChange={(value) =>
                            handleFilterChange(
                                value as AdminOrderDeliveryFilter,
                            )
                        }
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue />
                        </SelectTrigger>

                        <SelectContent>
                            <SelectItem value="all">
                                همه سفارش‌ها
                            </SelectItem>

                            <SelectItem value="delivered">
                                تحویل شده
                            </SelectItem>

                            <SelectItem value="undelivered">
                                تحویل نشده
                            </SelectItem>
                        </SelectContent>
                    </Select>
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
                        {isLoading ? (
                            <TableRow>
                                <TableCell
                                    colSpan={8}
                                    className="h-32 text-center text-muted-foreground"
                                >
                                    در حال دریافت سفارش‌ها...
                                </TableCell>
                            </TableRow>
                        ) : error ? (
                            <TableRow>
                                <TableCell
                                    colSpan={8}
                                    className="h-32 text-center text-destructive"
                                >
                                    {error}
                                </TableCell>
                            </TableRow>
                        ) : orders.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={8}
                                    className="h-32 text-center text-muted-foreground"
                                >
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
                                        )}
                                        {" "}
                                        تومان
                                    </TableCell>

                                    <TableCell>
                                        <Badge
                                            variant={
                                                order.status ===
                                                    "completed"
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
                                        <Badge
                                            variant="outline"
                                        >
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
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                )}
        </section>
    );
}