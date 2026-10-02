"use client";
import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import {
  Loader2,
  Wallet,
  ReceiptText,
  Boxes,
  PackageSearch,
} from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getDashboard } from "@/services/dashboard.service";
import { getApiErrorMessage } from "@/services/api/api-error";
import { getOrderStatusLabel } from "@/features/admin/orders/status-labels";
import { formatNumber, formatPrice } from "@/lib/format";

/** تاریخ روز گزارش بدون تبدیل نیمه‌شب به منطقهٔ مرورگر، با تقویم فارسی نمایش داده می‌شود. */
function dayLabel(value: string) {
  return new Intl.DateTimeFormat("fa-IR", {
    month: "short",
    day: "numeric",
    timeZone: "Asia/Tehran",
  }).format(new Date(value + "T12:00:00Z"));
}
/** این صفحه مصرف‌کنندهٔ گزارش تجمیعی سرور است؛ تغییر بازه query مستقل دارد تا نمودار قبلی با عنوان تازه اشتباه نشود. */
export default function DashboardPage() {
  const [days, setDays] = useState(30);
  const query = useQuery({
    queryKey: ["admin", "dashboard", days],
    queryFn: ({ signal }) => getDashboard(days, signal),
    staleTime: 0,
  });
  const report = query.data;
  return (
    <section className="min-w-0 space-y-7" dir="rtl">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="section-eyebrow">نمای کلی فروشگاه</p>
          <h1 className="mt-2 text-2xl font-semibold">داشبورد فروش</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            فروش بر اساس پرداخت موفق؛ موجودی بر اساس وضعیت فعلی کالاها
          </p>
        </div>
        <Select
          value={String(days)}
          onValueChange={(value) => setDays(Number(value))}
        >
          <SelectTrigger className="w-44" aria-label="بازهٔ گزارش">
            <SelectValue />
          </SelectTrigger>
          <SelectContent dir="rtl">
            {[7, 30, 90].map((value) => (
              <SelectItem key={value} value={String(value)}>
                {formatNumber(value)} روز اخیر
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </header>
      {query.isFetching && (
        <p
          role="status"
          className="flex items-center gap-2 text-sm text-muted-foreground"
        >
          <Loader2 className="size-4 animate-spin" />
          در حال دریافت گزارش…
        </p>
      )}
      {query.isError && (
        <div role="alert" className="surface p-6">
          <p>{getApiErrorMessage(query.error)}</p>
          <Button
            className="mt-4"
            disabled={query.isFetching}
            onClick={() => query.refetch()}
          >
            تلاش دوباره
          </Button>
        </div>
      )}
      {report && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              {
                label: "مبلغ پرداخت‌های موفق",
                value: formatPrice(report.revenue) + " تومان",
                hint: `${formatNumber(report.paidOrders)} پرداخت موفق در بازه`,
                icon: Wallet,
              },
              {
                label: "سفارش‌های ثبت‌شده",
                value: formatNumber(report.orderCount),
                hint: "تمام وضعیت‌ها در بازهٔ انتخاب‌شده",
                icon: ReceiptText,
              },
              {
                label: "کالاهای کاتالوگ",
                value: formatNumber(report.productCount),
                hint: `${formatNumber(report.stockCount)} عدد موجودی فعلی`,
                icon: Boxes,
              },
              {
                label: "نیازمند تأمین موجودی",
                value: formatNumber(report.lowStockCount),
                hint: "محصولات با موجودی حداکثر ۵ عدد",
                icon: PackageSearch,
              },
            ].map((stat) => (
              <article key={stat.label} className="surface space-y-4 p-5">
                <div className="flex items-center justify-between gap-2 text-sm text-muted-foreground">
                  {stat.label}
                  <stat.icon className="size-5 text-forest" />
                </div>
                <p className="break-words text-xl font-semibold">
                  {stat.value}
                </p>
                <p className="text-xs text-muted-foreground">{stat.hint}</p>
              </article>
            ))}
          </div>
          <div className="grid min-w-0 gap-5 xl:grid-cols-[1.5fr_1fr]">
            <article className="surface min-w-0 p-5">
              <h2 className="font-semibold">روند پرداخت‌های موفق</h2>
              <p className="mb-6 mt-2 text-xs text-muted-foreground">
                مبلغ دریافتی روزانه به تومان، شامل هزینهٔ ارسال
              </p>
              {!report.paidOrders ? (
                <p className="py-24 text-center text-muted-foreground">
                  در این بازه پرداخت موفقی ثبت نشده است.
                </p>
              ) : (
                <ChartContainer
                  config={{ amount: { label: "مبلغ", color: "var(--forest)" } }}
                  className="h-72 w-full"
                  dir="ltr"
                >
                  <AreaChart
                    accessibilityLayer
                    data={report.daily}
                    margin={{ left: 8, right: 12, top: 10, bottom: 0 }}
                  >
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="date"
                      tickFormatter={dayLabel}
                      minTickGap={30}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      width={60}
                      tickFormatter={(value) =>
                        new Intl.NumberFormat("fa-IR", {
                          notation: "compact",
                        }).format(value)
                      }
                      tickLine={false}
                      axisLine={false}
                    />
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          labelFormatter={(label) => dayLabel(String(label))}
                          formatter={(value) => (
                            <span dir="rtl">
                              {formatPrice(Number(value))} تومان
                            </span>
                          )}
                        />
                      }
                    />
                    <Area
                      type="monotone"
                      dataKey="amount"
                      stroke="var(--color-amount)"
                      fill="var(--color-amount)"
                      fillOpacity={0.12}
                      strokeWidth={2}
                      isAnimationActive={false}
                    />
                  </AreaChart>
                </ChartContainer>
              )}
            </article>
            <article className="surface min-w-0 p-5">
              <h2 className="font-semibold">وضعیت سفارش‌ها</h2>
              <p className="mb-6 mt-2 text-xs text-muted-foreground">
                سفارش‌های ایجادشده در بازهٔ انتخاب‌شده
              </p>
              {!report.orderCount ? (
                <p className="py-24 text-center text-muted-foreground">
                  هنوز سفارشی در این بازه وجود ندارد.
                </p>
              ) : (
                <ChartContainer
                  config={{
                    count: { label: "تعداد سفارش", color: "var(--forest)" },
                  }}
                  className="h-72 w-full"
                  dir="ltr"
                >
                  <BarChart
                    accessibilityLayer
                    data={report.statuses.map((item) => ({
                      ...item,
                      label: getOrderStatusLabel(item.status),
                    }))}
                    layout="vertical"
                    margin={{ left: 0, right: 10 }}
                  >
                    <CartesianGrid horizontal={false} />
                    <YAxis
                      type="category"
                      dataKey="label"
                      width={110}
                      tickLine={false}
                      axisLine={false}
                    />
                    <XAxis
                      type="number"
                      allowDecimals={false}
                      tickFormatter={formatNumber}
                    />
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          formatter={(value) => (
                            <span>{formatNumber(Number(value))} سفارش</span>
                          )}
                        />
                      }
                    />
                    <Bar
                      dataKey="count"
                      fill="var(--color-count)"
                      radius={5}
                      isAnimationActive={false}
                    />
                  </BarChart>
                </ChartContainer>
              )}
            </article>
          </div>
          <div className="grid gap-5 lg:grid-cols-2">
            <article className="surface p-5">
              <h2 className="mb-4 font-semibold">
                پرفروش‌ترین ساعت‌ها در این بازه
              </h2>
              {report.topProducts.length ? (
                <ol className="divide-y">
                  {report.topProducts.map((product, index) => (
                    <li
                      key={product.id}
                      className="flex items-center gap-3 py-4"
                    >
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-forest/10 text-forest">
                        {formatNumber(index + 1)}
                      </span>
                      <span
                        dir="auto"
                        className="min-w-0 flex-1 text-right text-sm"
                      >
                        {product.name}
                      </span>
                      <span className="text-sm">
                        {formatNumber(product.quantity)} عدد
                      </span>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="py-8 text-sm text-muted-foreground">
                  پس از اولین پرداخت موفق، محصولات اینجا نمایش داده می‌شوند.
                </p>
              )}
            </article>
            <article className="surface p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="font-semibold">اولویت تأمین موجودی</h2>
                <Link
                  href="/admin/inventory"
                  className="text-xs text-forest underline underline-offset-4"
                >
                  مدیریت موجودی
                </Link>
              </div>
              {report.lowStock.length ? (
                <ul className="divide-y">
                  {report.lowStock.map((product) => (
                    <li
                      key={product.id}
                      className="flex justify-between gap-3 py-4 text-sm"
                    >
                      <span dir="auto" className="text-right">
                        {product.name}
                      </span>
                      <span className="shrink-0">
                        {product.quantity
                          ? `${formatNumber(product.quantity)} عدد`
                          : "ناموجود"}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="py-8 text-sm text-muted-foreground">
                  موجودی همهٔ محصولات بیشتر از حد هشدار است.
                </p>
              )}
            </article>
          </div>
        </>
      )}
    </section>
  );
}
