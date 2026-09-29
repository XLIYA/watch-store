"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { uiConfig } from "@/config/ui";

import { useState } from "react";

import { endOfDay, startOfDay } from "date-fns";
import { CalendarDays, X } from "lucide-react";
import type { DateRange } from "react-day-picker";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";

import { AdminPagination } from "@/components/common/admin-pagination";
import { QueryFeedback } from "@/components/common/query-feedback";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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

import { useAdminOrdersQuery } from "@/features/admin/orders/queries/use-admin-orders-query";

import {
  type AdminOrderStatusFilter,
  type AdminPaymentStatusFilter,
} from "@/services/orders.service";

import { getOrderStatusLabel, getPaymentStatusLabel } from "@/features/admin/orders/status-labels";

const PAGE_SIZE = uiConfig.adminPageSize;

import {
  formatPrice,
  formatDate,
  formatPhoneNumber,
  formatFilterDate,
} from "@/lib/format";

export default function AdminOrdersPage() {
  const router = useRouter();
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
   * نگهداری فیلتر وضعیت سفارش.
   *
   * محل استفاده:
   * Select وضعیت سفارش و Query سفارش‌ها.
   *
   * نحوه کار:
   * مقدار all یعنی تمام وضعیت‌ها و سایر مقادیر
   * مستقیماً به Backend ارسال می‌شوند.
   */
  const [filter, setFilter] = useState<AdminOrderStatusFilter>("all");

  /*
   * هدف:
   * نگهداری فیلتر وضعیت پرداخت.
   *
   * محل استفاده:
   * Select وضعیت پرداخت و Query سفارش‌ها.
   *
   * نحوه کار:
   * مقدار all یعنی فیلتر پرداخت اعمال نمی‌شود.
   */
  const [paymentFilter, setPaymentFilter] =
    useState<AdminPaymentStatusFilter>("all");

  /*
   * هدف:
   * نگهداری تاریخ یا بازه تاریخ انتخاب‌شده.
   *
   * محل استفاده:
   * Date Range Picker صفحه Admin Orders.
   *
   * نحوه کار:
   * اگر فقط from وجود داشته باشد همان روز فیلتر می‌شود.
   * اگر from و to وجود داشته باشند کل بازه فیلتر می‌شود.
   */
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  /*
   * هدف:
   * تبدیل تاریخ شروع انتخاب‌شده به timestamp ابتدای روز.
   *
   * محل استفاده:
   * پارامتر dateFrom در Query سفارش‌ها.
   *
   * نحوه کار:
   * ساعت تاریخ شروع روی ابتدای روز قرار می‌گیرد.
   */
  const dateFrom = dateRange?.from
    ? startOfDay(dateRange.from).getTime()
    : undefined;

  /*
   * هدف:
   * تبدیل تاریخ پایان انتخاب‌شده به timestamp انتهای روز.
   *
   * محل استفاده:
   * پارامتر dateTo در Query سفارش‌ها.
   *
   * نحوه کار:
   * اگر تاریخ پایان انتخاب نشده باشد،
   * همان تاریخ شروع به‌عنوان انتهای روز استفاده می‌شود.
   */
  const dateTo = dateRange?.from
    ? endOfDay(dateRange.to ?? dateRange.from).getTime()
    : undefined;

  /*
   * هدف:
   * دریافت Server State سفارش‌ها با React Query.
   *
   * محل استفاده:
   * منبع اطلاعات Table و Pagination.
   *
   * نحوه کار:
   * Pagination، وضعیت سفارش، وضعیت پرداخت و تاریخ
   * همگی داخل Query Params و Query Key قرار می‌گیرند.
   */
  const {
    data,
    isPending,
    isError,
    isFetching,
    isPlaceholderData,
    error,
    refetch,
  } = useAdminOrdersQuery({
    page,
    limit: PAGE_SIZE,
    status: filter,
    paymentStatus: paymentFilter,
    dateFrom,
    dateTo,
  });

  /*
   * هدف:
   * استخراج امن آرایه سفارش‌ها از Response.
   *
   * محل استفاده:
   * Table سفارش‌ها.
   *
   * نحوه کار:
   * پیش از دریافت Response آرایه خالی استفاده می‌شود.
   */
  const orders = data?.data ?? [];

  /*
   * هدف:
   * تعیین تعداد صفحات Pagination.
   *
   * محل استفاده:
   * Pagination پایین صفحه.
   *
   * نحوه کار:
   * حداقل یک صفحه در نظر گرفته می‌شود.
   */
  const totalPages = Math.max(data?.totalPages ?? 1, 1);

  /*
   * هدف:
   * تغییر فیلتر وضعیت سفارش.
   *
   * محل استفاده:
   * Select وضعیت سفارش.
   *
   * نحوه کار:
   * فیلتر تغییر می‌کند و Pagination به صفحه اول برمی‌گردد.
   */
  const handleFilterChange = (value: AdminOrderStatusFilter) => {
    setFilter(value);
    setPage(1);
  };

  /*
   * هدف:
   * تغییر فیلتر وضعیت پرداخت.
   *
   * محل استفاده:
   * Select وضعیت پرداخت.
   *
   * نحوه کار:
   * فیلتر تغییر می‌کند و Pagination به صفحه اول برمی‌گردد.
   */
  const handlePaymentFilterChange = (value: AdminPaymentStatusFilter) => {
    setPaymentFilter(value);
    setPage(1);
  };

  /*
   * هدف:
   * تغییر تاریخ یا بازه تاریخ انتخاب‌شده.
   *
   * محل استفاده:
   * Calendar فیلتر تاریخ سفارش‌ها.
   *
   * نحوه کار:
   * مقدار Calendar در State ذخیره شده و Pagination ریست می‌شود.
   */
  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
    setPage(1);
  };

  /*
   * هدف:
   * کنترل تغییر صفحات بدون خروج از محدوده Pagination.
   *
   * محل استفاده:
   * Previous، Next و شماره صفحات.
   *
   * نحوه کار:
   * فقط شماره صفحه معتبر در State ذخیره می‌شود.
   */

  return (
    <section className="space-y-6">
      <QueryFeedback
        fetching={isFetching && !isPending}
        error={error}
        retry={() => void refetch()}
      />
      <div className="flex flex-col gap-6 2xl:flex-row 2xl:items-end 2xl:justify-between">
        <div>
          <h1 className="text-3xl font-medium">سفارش‌ها</h1>

          <p className="mt-2 text-sm text-muted-foreground">
            لیست سفارش‌های ثبت شده فروشگاه
          </p>
        </div>

        {/*
         * هدف:
         * نمایش همه فیلترهای Admin Orders در یک بخش منظم.
         *
         * محل استفاده:
         * بالای جدول سفارش‌ها.
         *
         * نحوه کار:
         * در موبایل تک‌ستونه، در Tablet دو ستونه
         * و در صفحات بزرگ سه ستونه نمایش داده می‌شود.
         */}
        <div className="grid w-full gap-4 sm:grid-cols-2 2xl:w-auto 2xl:grid-cols-3">
          {/*
           * هدف:
           * فیلتر سفارش‌ها بر اساس وضعیت چرخه سفارش.
           *
           * محل استفاده:
           * اولین فیلتر صفحه.
           *
           * نحوه کار:
           * مقدار انتخاب‌شده به status Query تبدیل می‌شود.
           */}
          <div className="w-full sm:min-w-[220px]">
            <p className="mb-2 text-sm font-medium">وضعیت سفارش</p>

            <Select
              dir="rtl"
              value={filter}
              onValueChange={(value) =>
                handleFilterChange(value as AdminOrderStatusFilter)
              }
            >
              <SelectTrigger className="w-full text-right [&>span]:text-right">
                <SelectValue placeholder="وضعیت سفارش" />
              </SelectTrigger>

              <SelectContent dir="rtl">
                <SelectItem value="all">همه سفارش‌ها</SelectItem>

                <SelectItem value="pending">در انتظار بررسی</SelectItem>

                <SelectItem value="processing">در حال پردازش</SelectItem>

                <SelectItem value="shipped">ارسال شده</SelectItem>

                <SelectItem value="delivered">تحویل شده</SelectItem>

                <SelectItem value="cancelled">لغو شده</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/*
           * هدف:
           * فیلتر سفارش‌ها بر اساس وضعیت پرداخت.
           *
           * محل استفاده:
           * دومین فیلتر صفحه.
           *
           * نحوه کار:
           * مقدار انتخاب‌شده به paymentStatus Query تبدیل می‌شود.
           */}
          <div className="w-full sm:min-w-[220px]">
            <p className="mb-2 text-sm font-medium">وضعیت پرداخت</p>

            <Select
              dir="rtl"
              value={paymentFilter}
              onValueChange={(value) =>
                handlePaymentFilterChange(value as AdminPaymentStatusFilter)
              }
            >
              <SelectTrigger className="w-full text-right [&>span]:text-right">
                <SelectValue placeholder="وضعیت پرداخت" />
              </SelectTrigger>

              <SelectContent dir="rtl">
                <SelectItem value="all">همه وضعیت‌های پرداخت</SelectItem>

                <SelectItem value="pending">در انتظار پرداخت</SelectItem>

                <SelectItem value="paid">پرداخت موفق</SelectItem>

                <SelectItem value="failed">پرداخت ناموفق</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/*
           * هدف:
           * فیلتر سفارش‌ها بر اساس یک روز یا بازه تاریخ.
           *
           * محل استفاده:
           * سومین فیلتر صفحه Admin Orders.
           *
           * نحوه کار:
           * Calendar در حالت range اجرا می‌شود.
           * یک روز انتخاب شود همان روز فیلتر می‌شود.
           * دو روز انتخاب شوند بازه کامل فیلتر می‌شود.
           */}
          <div className="w-full sm:min-w-[280px]">
            <p className="mb-2 text-sm font-medium">تاریخ ثبت</p>

            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="min-w-0 flex-1 justify-start gap-2 font-normal"
                  >
                    <CalendarDays className="size-4 shrink-0" />

                    {dateRange?.from ? (
                      dateRange.to &&
                      dateRange.to.getTime() !== dateRange.from.getTime() ? (
                        <span className="truncate">
                          {formatFilterDate(dateRange.from)}
                          {" تا "}
                          {formatFilterDate(dateRange.to)}
                        </span>
                      ) : (
                        <span className="truncate">
                          {formatFilterDate(dateRange.from)}
                        </span>
                      )
                    ) : (
                      <span className="truncate text-muted-foreground">
                        انتخاب تاریخ
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>

                <PopoverContent dir="rtl" align="end" className="w-auto p-0">
                  <Calendar
                    mode="range"
                    selected={dateRange}
                    onSelect={handleDateRangeChange}
                    numberOfMonths={1}
                  />
                </PopoverContent>
              </Popover>

              {dateRange?.from && (
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  title="پاک کردن فیلتر تاریخ"
                  onClick={() => handleDateRangeChange(undefined)}
                >
                  <X className="size-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-md border">
        <Table aria-busy={isFetching}>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">کد سفارش</TableHead>

              <TableHead className="text-right">مشتری</TableHead>

              <TableHead className="text-right">تلفن</TableHead>

              <TableHead className="text-right">تاریخ ثبت</TableHead>

              <TableHead className="text-right">مبلغ کل</TableHead>

              <TableHead className="text-right">وضعیت سفارش</TableHead>

              <TableHead className="text-right">وضعیت پرداخت</TableHead>


            </TableRow>
          </TableHeader>

          <TableBody>
            {isPending ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-32 text-center text-muted-foreground"
                >
                  در حال دریافت سفارش‌ها...
                </TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-32 text-center text-destructive"
                >
                  دریافت لیست سفارش‌ها با خطا مواجه شد.
                </TableCell>
              </TableRow>
            ) : orders.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-32 text-center text-muted-foreground"
                >
                  سفارشی یافت نشد.
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order.id} className="cursor-pointer" onClick={() => router.push(`/admin/orders/${order.id}`)}>
                  <TableCell className="font-medium"><Link href={`/admin/orders/${order.id}`} aria-label={`جزئیات سفارش ${order.id}`} className="underline underline-offset-4" onClick={event=>event.stopPropagation()}>#{order.id}</Link></TableCell>

                  <TableCell>{order.customer.fullName}</TableCell>

                  <TableCell className="text-right">
                    <span dir="ltr" className="inline-block tabular-nums">
                      {formatPhoneNumber(order.customer.mobile)}
                    </span>
                  </TableCell>

                  <TableCell>{formatDate(order.createdAt)}</TableCell>

                  <TableCell>{formatPrice(order.totalPrice)} تومان</TableCell>

                  <TableCell>
                    <Badge
                      variant={
                        order.status === "delivered" ? "default" : "secondary"
                      }
                    >
                      {getOrderStatusLabel(order.status)}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <Badge variant="outline">
                      {getPaymentStatusLabel(order.paymentStatus)}
                    </Badge>
                  </TableCell>


                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {!isPending && !isError && (
        <AdminPagination
          page={page}
          totalPages={totalPages}
          busy={isFetching || isPlaceholderData}
          onPageChange={setPage}
        />
      )}
    </section>
  );
}
