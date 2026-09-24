"use client";
import { FeaturedCategories } from "@/features/admin/products/featured-categories";
import { ProductEditor } from "@/features/admin/products/product-editor";
import { DeleteProductDialog } from "@/features/admin/products/delete-product-dialog";
import type { Product } from "@/types/product";

import { uiConfig } from "@/config/ui";

import Image from "next/image";
import { useMemo, useState } from "react";

import { Edit3, Plus, Search, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { AdminPagination } from "@/components/common/admin-pagination";
import { QueryFeedback } from "@/components/common/query-feedback";

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

import { useAdminCategoriesQuery } from "@/features/admin/products/queries/use-admin-categories-query";

import { useAdminProductsQuery } from "@/features/admin/products/queries/use-admin-products-query";

import { useDebouncedValue } from "@/hooks/use-debounced-value";

import { formatNumber } from "@/lib/format";

const PAGE_SIZE = uiConfig.adminPageSize;

export default function AdminProductsPage() {
  // null فرم بسته و undefined فرم ایجاد است؛ محصول انتخاب‌شده فرم مشترک ویرایش را پر می‌کند.
  const [editing, setEditing] = useState<Product | null | undefined>(null);
  const [deleting, setDeleting] = useState<Product | null>(null);
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
  const [page, setPage] = useState(1);

  /*
   * هدف:
   * نگهداری مقدار خام Search Input.
   *
   * محل استفاده:
   * Input جستجوی محصولات.
   *
   * نحوه کار:
   * مقدار بلافاصله با تایپ کاربر تغییر می‌کند،
   * اما مقدار Debounce شده برای Query استفاده می‌شود.
   */
  const [search, setSearch] = useState("");

  /*
   * هدف:
   * نگهداری گروه محصول انتخاب‌شده.
   *
   * محل استفاده:
   * Select گروه محصول و Query محصولات.
   *
   * نحوه کار:
   * all یعنی همه گروه‌ها و سایر مقادیر شناسه Category هستند.
   */
  const [category, setCategory] = useState("all");

  /*
   * هدف:
   * جلوگیری از ارسال Request در هر بار تایپ کاربر.
   *
   * محل استفاده:
   * Search صفحه Admin Products.
   *
   * نحوه کار:
   * مقدار Search پس از 400 میلی‌ثانیه توقف تایپ
   * وارد Query محصولات می‌شود.
   */
  const debouncedSearch = useDebouncedValue(
    search.trim(),
    uiConfig.searchDebounceMs,
  );

  /*
   * هدف:
   * دریافت محصولات Admin با React Query.
   *
   * محل استفاده:
   * Table، Pagination، Search و فیلتر Category.
   *
   * نحوه کار:
   * Page، Search، Category و Sort داخل Query Key قرار می‌گیرند.
   * React Query مسئول Request، Cache، Loading و Error است.
   */
  const {
    data: productsResult,
    isPending: isProductsPending,
    isError: isProductsError,
    isFetching,
    isPlaceholderData,
    error,
    refetch,
  } = useAdminProductsQuery({
    page,
    limit: PAGE_SIZE,
    category: category === "all" ? undefined : Number(category),
    search: debouncedSearch || undefined,
    sort: "newest",
  });

  /*
   * هدف:
   * دریافت دسته‌بندی‌های محصولات با React Query.
   *
   * محل استفاده:
   * Select گروه محصول و نمایش نام گروه در جدول.
   *
   * نحوه کار:
   * Categories دارای Query Key مستقل هستند
   * و تغییر Search یا Pagination باعث Request مجدد آن‌ها نمی‌شود.
   */
  const {
    data: categories = [],
    isPending: isCategoriesPending,
    isError: isCategoriesError,
  } = useAdminCategoriesQuery();

  /*
   * هدف:
   * استخراج امن لیست محصولات از Response.
   *
   * محل استفاده:
   * Table محصولات.
   *
   * نحوه کار:
   * قبل از دریافت اولین Response آرایه خالی استفاده می‌شود.
   */
  const products = productsResult?.data ?? [];

  /*
   * هدف:
   * تعیین تعداد صفحات Pagination.
   *
   * محل استفاده:
   * Pagination پایین جدول.
   *
   * نحوه کار:
   * مقدار totalPages از Response گرفته شده
   * و حداقل یک صفحه در نظر گرفته می‌شود.
   */
  const totalPages = Math.max(productsResult?.totalPages ?? 1, 1);

  /*
   * هدف:
   * ساخت ارتباط بین شناسه Category و نام آن.
   *
   * محل استفاده:
   * ستون گروه محصول در Table.
   *
   * نحوه کار:
   * Categories به Map تبدیل می‌شوند تا نام گروه
   * بر اساس شناسه محصول سریع پیدا شود.
   */
  const categoryMap = useMemo(() => {
    return new Map(categories.map((item) => [Number(item.id), item.name]));
  }, [categories]);

  /*
   * هدف:
   * مدیریت تغییر Search Input.
   *
   * محل استفاده:
   * Input جستجوی محصولات.
   *
   * نحوه کار:
   * مقدار Search ذخیره شده و Pagination به صفحه اول برمی‌گردد.
   * اجرای Request واقعی همچنان بعد از Debounce انجام می‌شود.
   */
  const handleSearchChange = (value: string) => {
    setSearch(value);

    if (page !== 1) {
      setPage(1);
    }
  };

  /*
   * هدف:
   * تغییر فیلتر Category.
   *
   * محل استفاده:
   * Select گروه محصول.
   *
   * نحوه کار:
   * Category جدید ذخیره شده و Pagination به صفحه اول برمی‌گردد.
   */
  const handleCategoryChange = (value: string) => {
    setCategory(value);
    setPage(1);
  };

  /*
   * هدف:
   * کنترل تغییر Pagination.
   *
   * محل استفاده:
   * Previous، Next و شماره صفحات.
   *
   * نحوه کار:
   * فقط شماره صفحه معتبر و متفاوت از صفحه فعلی ذخیره می‌شود.
   */

  return (
    <section className="space-y-6">
      <QueryFeedback
        fetching={isFetching && !isProductsPending}
        error={error}
        retry={() => void refetch()}
      />
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-medium">محصولات</h1>

          <p className="mt-2 text-sm text-muted-foreground">
            مدیریت لیست محصولات فروشگاه
          </p>
        </div>

        <Button type="button" onClick={() => setEditing(undefined)}>
          <Plus className="size-4" />
          افزودن محصول
        </Button>
      </div>

      {/*
       * هدف:
       * نمایش ابزارهای جستجو و فیلتر محصولات.
       *
       * محل استفاده:
       * بالای Table محصولات.
       *
       * نحوه کار:
       * Search با Debounce کار می‌کند و Category
       * مستقیماً Query Key محصولات را تغییر می‌دهد.
       */}
      <div className="surface grid gap-4 p-4 md:grid-cols-[1fr_220px]">
        <div>
          <p className="mb-2 text-sm font-medium">جستجوی محصول</p>

          <div className="relative">
            <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              value={search}
              onChange={(event) => handleSearchChange(event.target.value)}
              placeholder="نام یا برند محصول..."
              className="pr-10"
            />
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium">گروه محصول</p>

          <Select
            dir="rtl"
            value={category}
            onValueChange={handleCategoryChange}
            disabled={isCategoriesPending || isCategoriesError}
          >
            <SelectTrigger className="w-full text-right [&>span]:text-right">
              <SelectValue placeholder="انتخاب گروه" />
            </SelectTrigger>

            <SelectContent dir="rtl">
              <SelectItem value="all">همه گروه‌ها</SelectItem>

              {categories.map((item) => (
                <SelectItem key={item.id} value={String(item.id)}>
                  {item.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {isCategoriesError && (
            <p className="mt-2 text-xs text-destructive">
              دریافت گروه‌های محصولات با خطا مواجه شد.
            </p>
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-md border">
        <Table className="min-w-[850px] table-fixed" aria-busy={isFetching}>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">تصویر</TableHead>

              <TableHead className="text-right">نام محصول</TableHead>

              <TableHead className="text-right">برند</TableHead>

              <TableHead className="text-right">گروه</TableHead>

              <TableHead className="text-right">قیمت</TableHead>

              <TableHead className="text-right">موجودی</TableHead>

              <TableHead className="text-center">عملیات</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isProductsPending ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-32 text-center text-muted-foreground"
                >
                  در حال دریافت محصولات...
                </TableCell>
              </TableRow>
            ) : isProductsError ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-32 text-center text-destructive"
                >
                  دریافت لیست محصولات با خطا مواجه شد.
                </TableCell>
              </TableRow>
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-32 text-center text-muted-foreground"
                >
                  محصولی یافت نشد.
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="relative size-14 overflow-hidden rounded-md border bg-muted">
                      <Image
                        src={product.thumbnail}
                        alt={product.name}
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    </div>
                  </TableCell>

                  <TableCell className="font-medium">{product.name}</TableCell>

                  <TableCell>{product.brand}</TableCell>

                  <TableCell>
                    {categoryMap.get(Number(product.category)) ?? "—"}
                  </TableCell>

                  <TableCell>{formatNumber(product.price)} تومان</TableCell>

                  <TableCell>{formatNumber(product.quantity)}</TableCell>

                  <TableCell>
                    <div className="flex justify-center gap-2">
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        title="ویرایش محصول"
                        onClick={() => setEditing(product)}
                      >
                        <Edit3 className="size-4" />
                      </Button>

                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        title="حذف محصول"
                        onClick={() => setDeleting(product)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {!isProductsPending && !isProductsError && (
        <AdminPagination
          page={page}
          totalPages={totalPages}
          busy={isFetching || isPlaceholderData}
          onPageChange={setPage}
        />
      )}
      <FeaturedCategories />
      {editing !== null && (
        <ProductEditor product={editing} onClose={() => setEditing(null)} />
      )}
      {deleting && (
        <DeleteProductDialog
          product={deleting}
          onClose={() => setDeleting(null)}
          onDeleted={() => {
            if (products.length === 1 && page > 1) setPage(page - 1);
          }}
        />
      )}
    </section>
  );
}
