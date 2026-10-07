"use client";
import { useState, type FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { Compass } from "lucide-react";
import {
  getProducts,
  type GetProductsParams,
} from "@/services/products.service";
import { ProductCard } from "@/components/store/product-card";
import { AdminPagination } from "@/components/common/admin-pagination";
import { QueryFeedback } from "@/components/common/query-feedback";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PriceInput } from "@/components/ui/price-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { formatNumber } from "@/lib/format";
import type { Category, Subcategory } from "@/types/category";

// هر دو منوی راهنما عرض محدود دارند؛ حداقل عرض داخلی Radix نیز حذف می‌شود تا منو روی فیلد کناری نیفتد.
const finderMenuProps = {
  dir: "rtl" as const,
  position: "popper" as const,
  align: "end" as const,
  sideOffset: 4,
  className:
    "finder-select-menu",
};

/** راهنما فقط انتخاب کاربر را به فیلترهای واقعی API تبدیل می‌کند؛ پیشنهاد ساختگی یا رتبه‌بندی پنهان ندارد. */
export function WatchFinder({
  categories,
  groups,
}: {
  categories: Category[];
  groups: Subcategory[];
}) {
  const [category, setCategory] = useState("all");
  const [group, setGroup] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [validation, setValidation] = useState("");
  const [filters, setFilters] = useState<GetProductsParams | null>(null);
  const [page, setPage] = useState(1);
  const query = useQuery({
    queryKey: ["products", "finder", filters, page],
    queryFn: ({ signal }) =>
      getProducts({ ...filters, page, sort: "popular" }, signal),
    enabled: filters !== null,
  });
  function find(event: FormEvent) {
    event.preventDefault();
    if (
      [minPrice, maxPrice].some(
        (value) =>
          value !== "" &&
          (!Number.isSafeInteger(Number(value)) || Number(value) < 0),
      )
    ) {
      setValidation("قیمت‌ها باید عدد صحیح و غیرمنفی باشند.");
      return;
    }
    if (
      minPrice !== "" &&
      maxPrice !== "" &&
      Number(minPrice) > Number(maxPrice)
    ) {
      setValidation("قیمت شروع نباید بیشتر از قیمت پایان باشد.");
      return;
    }
    setValidation("");
    setPage(1);
    setFilters({
      category: category === "all" ? undefined : Number(category),
      subcategory: group === "all" ? undefined : Number(group),
      minPrice: minPrice === "" ? undefined : Number(minPrice),
      maxPrice: maxPrice === "" ? undefined : Number(maxPrice),
    });
  }
  return (
    <main className="content-container experience-page">
      <header className="experience-heading">
        <p className="section-kicker">انتخابی به سلیقهٔ شما</p>
        <h1 className="section-title">از کدام ساعت شروع کنیم؟</h1>
        <p className="body-copy">
          سبک و بودجه‌تان را مشخص کنید؛ مدل‌های منطبق را از کاتالوگ فعلی کنار هم
          می‌آوریم.
        </p>
      </header>
      <form
        onSubmit={find}
        className="surface grid items-end gap-6 p-6 md:grid-cols-2 lg:grid-cols-4 md:p-8"
      >
        <div className="space-y-3">
          <Label htmlFor="finder-category">۱. کدام مجموعه؟</Label>
          <Select
            value={category}
            onValueChange={(value) => {
              setCategory(value);
              setGroup("all");
            }}
          >
            <SelectTrigger
              id="finder-category"
              className="h-11 w-full data-[size=default]:h-11"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent {...finderMenuProps}>
              <SelectItem value="all">همهٔ مجموعه‌ها</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-3">
          <Label htmlFor="finder-group">۲. چه گروهی؟</Label>
          <Select
            value={group}
            onValueChange={setGroup}
            disabled={category === "all"}
          >
            <SelectTrigger
              id="finder-group"
              className="h-11 w-full data-[size=default]:h-11"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent {...finderMenuProps}>
              <SelectItem value="all">همهٔ گروه‌ها</SelectItem>
              {groups
                .filter((g) => g.category === Number(category))
                .map((g) => (
                  <SelectItem key={g.id} value={String(g.id)}>
                    {g.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
        <fieldset className="min-w-0 space-y-3 md:col-span-2">
          <legend className="text-sm font-medium">۳. بازهٔ قیمت (تومان)</legend>
          <div className="grid grid-cols-2 gap-3">
            {[
              {
                id: "finder-min-price",
                label: "از قیمت",
                value: minPrice,
                change: setMinPrice,
              },
              {
                id: "finder-max-price",
                label: "تا قیمت",
                value: maxPrice,
                change: setMaxPrice,
              },
            ].map((field) => (
              <div key={field.id} className="min-w-0 space-y-2">
                <Label
                  htmlFor={field.id}
                  className="text-xs text-muted-foreground"
                >
                  {field.label}
                </Label>
                <PriceInput
                  id={field.id}
                  className="h-11"
                  value={field.value}
                  onValueChange={field.change}
                  placeholder="بدون محدودیت"
                  aria-invalid={!!validation}
                  aria-describedby={validation ? "finder-error" : undefined}
                />
              </div>
            ))}
          </div>
        </fieldset>
        {validation && (
          <p
            id="finder-error"
            role="alert"
            className="text-sm text-destructive md:col-span-2 lg:col-span-4"
          >
            {validation}
          </p>
        )}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t pt-5 md:col-span-2 lg:col-span-4">
          <p className="text-xs leading-6 text-muted-foreground">
            نتایج بر اساس انتخاب شما و با ترتیب محبوب‌ترین‌ها نمایش داده
            می‌شوند.
          </p>
          <Button
            type="submit"
            className="h-11 px-6"
            disabled={query.isFetching}
          >
            <Compass />
            {query.isFetching
              ? "در حال پیدا کردن ساعت‌ها…"
              : "ساعت‌های مناسب را ببین"}
          </Button>
        </div>
      </form>
      <section
        className="mt-10"
        aria-label="نتایج راهنمای انتخاب"
        aria-busy={query.isFetching}
      >
        {filters && (
          <QueryFeedback
            fetching={query.isFetching}
            error={query.error}
            retry={() => void query.refetch()}
          />
        )}
        {filters && query.isPending && (
          <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-72" />
            ))}
          </div>
        )}
        {query.data && !query.isFetching && (
          <>
            <p className="mb-6 text-sm text-muted-foreground">
              {formatNumber(query.data.total)} ساعت مطابق انتخاب شما
            </p>
            {query.data.data.length ? (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {query.data.data.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="experience-empty">
                <Compass />
                <h2>ساعتی با این ترکیب پیدا نشد</h2>
                <p className="text-sm text-muted-foreground">
                  بودجه را بیشتر کنید یا گروه‌های دیگری را ببینید.
                </p>
              </div>
            )}
            <div className="mt-8">
              <AdminPagination
                page={page}
                totalPages={query.data.totalPages}
                busy={query.isFetching}
                onPageChange={setPage}
              />
            </div>
          </>
        )}
      </section>
    </main>
  );
}
