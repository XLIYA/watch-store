"use client";
import { useState } from "react";
import { useQueries } from "@tanstack/react-query";
import Link from "next/link";
import Image from "next/image";
import { Heart, Scale, X } from "lucide-react";
import { getProductById } from "@/services/products.service";
import { getErrorStatus } from "@/services/api/api-error";
import {
  useProductSelection,
  type SelectionKind,
} from "@/features/catalog/selection";
import { useHydrated } from "@/hooks/use-hydrated";
import { ProductCard } from "@/components/store/product-card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { formatNumber, formatPrice } from "@/lib/format";
import type { Product } from "@/types/product";
import type { Category, Subcategory } from "@/types/category";
import { AdminPagination } from "@/components/common/admin-pagination";
import productRules from "../../../shared/product-rules.json";

/** شناسه‌های محلی به دادهٔ تازه تبدیل می‌شوند؛ محصول حذف‌شده و خطای شبکه جدا مدیریت می‌شوند. */
export function SelectedProducts({
  kind,
  categories = [],
  groups = [],
}: {
  kind: SelectionKind;
  categories?: Category[];
  groups?: Subcategory[];
}) {
  const { ids, remove } = useProductSelection(kind);
  const hydrated = useHydrated();
  const [differences, setDifferences] = useState(false);
  const [requestedPage, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(ids.length / productRules.pageSize));
  const page = Math.min(requestedPage, totalPages);
  // علاقه‌مندی بزرگ هم فقط یک صفحه درخواست می‌زند؛ حذف آخرین مورد، صفحه را به محدودهٔ معتبر برمی‌گرداند.
  const visibleIds =
    kind === "compare"
      ? ids
      : ids.slice(
          (page - 1) * productRules.pageSize,
          page * productRules.pageSize,
        );
  const queries = useQueries({
    queries: visibleIds.map((id) => ({
      queryKey: ["products", "selection", id],
      queryFn: ({ signal }: { signal: AbortSignal }) =>
        getProductById(id, signal),
      retry: false,
    })),
  });
  const products = queries.flatMap((query) => (query.data ? [query.data] : []));
  const isCompare = kind === "compare";
  const rows: { label: string; value: (product: Product) => string }[] = [
    { label: "قیمت", value: (p) => `${formatPrice(p.price)} تومان` },
    { label: "برند", value: (p) => p.brand },
    {
      label: "مجموعه",
      value: (p) =>
        categories.find((c) => c.id === p.category)?.name ?? "ثبت نشده",
    },
    {
      label: "گروه",
      value: (p) =>
        groups.find((c) => c.id === p.subcategory)?.name ?? "ثبت نشده",
    },
    {
      label: "رنگ‌ها",
      value: (p) => p.variants.map((v) => v.name).join("، ") || "ثبت نشده",
    },
    {
      label: "وضعیت",
      value: (p) => (p.quantity > 0 ? "موجود" : "اتمام موجودی"),
    },
  ];
  return (
    <main className="content-container experience-page">
      <header className="experience-heading">
        <p className="section-kicker">انتخاب‌های شما</p>
        <h1 className="section-title">
          {isCompare ? "کنار هم، انتخاب روشن‌تر" : "ساعت‌هایی که دوست دارید"}
        </h1>
        <p className="body-copy">
          {isCompare
            ? "تا سه ساعت را با اطلاعات فعلی فروشگاه مقایسه کنید."
            : "انتخاب‌ها در همین مرورگر ذخیره می‌شوند؛ هر زمان خواستید دوباره به آن‌ها برگردید."}
        </p>
      </header>
      {!hydrated || queries.some((q) => q.isPending) ? (
        <div
          role="status"
          aria-label="دریافت انتخاب‌ها"
          className="grid grid-cols-2 gap-4"
        >
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      ) : null}
      {hydrated && ids.length === 0 && (
        <div className="experience-empty">
          {isCompare ? <Scale /> : <Heart />}
          <h2 className="text-lg">
            {isCompare
              ? "هنوز ساعتی برای مقایسه انتخاب نکرده‌اید"
              : "اولین ساعت محبوبتان را پیدا کنید"}
          </h2>
          <p className="text-sm text-muted-foreground">
            از دکمهٔ {isCompare ? "ترازو" : "قلب"} روی کارت ساعت‌ها استفاده
            کنید.
          </p>
          <Button asChild>
            <Link href="/shop">کشف ساعت‌ها</Link>
          </Button>
        </div>
      )}
      {queries.map(
        (query, i) =>
          query.isError && (
            <div
              key={visibleIds[i]}
              role="alert"
              className="surface my-3 flex flex-wrap items-center gap-3 p-4"
            >
              <p>
                {getErrorStatus(query.error) === 404
                  ? "یکی از ساعت‌های انتخاب‌شده دیگر در فروشگاه نیست."
                  : "دریافت اطلاعات یکی از ساعت‌ها ناموفق بود."}
              </p>
              {getErrorStatus(query.error) !== 404 && (
                <Button
                  variant="outline"
                  disabled={query.isFetching}
                  onClick={() => void query.refetch()}
                >
                  تلاش دوباره
                </Button>
              )}
              <Button variant="ghost" onClick={() => remove(visibleIds[i])}>
                حذف از فهرست
              </Button>
            </div>
          ),
      )}
      {!isCompare && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
      {!isCompare && ids.length > 0 && (
        <div className="mt-8">
          <AdminPagination
            page={page}
            totalPages={totalPages}
            busy={queries.some((q) => q.isFetching)}
            onPageChange={setPage}
          />
        </div>
      )}
      {isCompare && products.length > 0 && (
        <>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={differences}
                onCheckedChange={(value) => setDifferences(value === true)}
                disabled={products.length < 2}
              />
              فقط تفاوت‌ها
            </label>
            <span className="text-xs text-muted-foreground">
              {formatNumber(products.length)} از ۳ ساعت
            </span>
          </div>
          <div
            className="surface overflow-x-auto"
            tabIndex={0}
            aria-label="جدول مقایسه؛ برای دیدن مدل‌های دیگر افقی حرکت کنید"
          >
            <table className="w-full min-w-[580px] table-fixed text-right text-sm">
              <caption className="sr-only">
                مقایسهٔ مشخصات ثبت‌شدهٔ ساعت‌ها
              </caption>
              <thead>
                <tr>
                  <th className="w-28 p-4 font-medium">مشخصات</th>
                  {products.map((p) => (
                    <th
                      key={p.id}
                      className="min-w-48 p-4 align-top font-normal"
                    >
                      <div className="relative mb-3 aspect-square overflow-hidden rounded-xl bg-secondary">
                        {(p.thumbnail || p.images[0]) && (
                          <Image
                            src={p.thumbnail || p.images[0]}
                            alt={p.name}
                            fill
                            sizes="300px"
                            className="object-contain p-4"
                          />
                        )}
                        <Button
                          variant="outline"
                          size="icon-sm"
                          className="absolute top-2 left-2"
                          onClick={() => remove(p.id)}
                          aria-label={`حذف ${p.name} از مقایسه`}
                        >
                          <X />
                        </Button>
                      </div>
                      <Link
                        href={`/product/${p.id}`}
                        className="font-medium leading-7 hover:text-forest"
                      >
                        {p.name}
                      </Link>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows
                  .filter(
                    (row) =>
                      !differences ||
                      products.length < 2 ||
                      new Set(products.map(row.value)).size > 1,
                  )
                  .map((row) => (
                    <tr
                      key={row.label}
                      className="border-t odd:bg-secondary/30"
                    >
                      <th
                        scope="row"
                        className="p-4 font-normal text-muted-foreground"
                      >
                        {row.label}
                      </th>
                      {products.map((p) => (
                        <td key={p.id} className="p-4 leading-7">
                          {row.value(p)}
                        </td>
                      ))}
                    </tr>
                  ))}
                <tr className="border-t">
                  <th scope="row" className="p-4 font-normal">
                    انتخاب نهایی
                  </th>
                  {products.map((p) => (
                    <td key={p.id} className="p-4">
                      <Button asChild variant="outline">
                        <Link href={`/product/${p.id}`}>مشاهدهٔ ساعت</Link>
                      </Button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-xs leading-6 text-muted-foreground">
            فقط مشخصات ثبت‌شده نمایش داده می‌شوند؛ اطلاعات فنی ثبت‌نشده، حدس زده
            نمی‌شوند.
          </p>
        </>
      )}
    </main>
  );
}
