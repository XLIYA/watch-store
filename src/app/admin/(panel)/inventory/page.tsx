"use client";
import { useState } from "react";
import Image from "next/image";
import { Save, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PriceInput } from "@/components/ui/price-input";
import { Input } from "@/components/ui/input";
import { PersianDigitInput } from "@/components/ui/persian-digit-input";
import { inventoryDraftError } from "@/features/admin/products/inventory-draft";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AdminPagination } from "@/components/common/admin-pagination";
import { QueryFeedback } from "@/components/common/query-feedback";
import { useAdminProductsQuery } from "@/features/admin/products/queries/use-admin-products-query";
import { useInventoryEditor } from "@/features/admin/products/use-inventory-editor";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { uiConfig } from "@/config/ui";
import { formatNumber } from "@/lib/format";

/** صفحه فقط نمایش و رویدادها را مدیریت می‌کند؛ صف ذخیره و draft در hook مستقل هستند تا قابل آزمون بمانند. */
export default function AdminInventoryPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(
    search.trim(),
    uiConfig.searchDebounceMs,
  );
  const query = useAdminProductsQuery({
    page,
    limit: uiConfig.adminPageSize,
    search: debouncedSearch || undefined,
    sort: "newest",
  });
  const editor = useInventoryEditor();
  const products = query.data?.data ?? [];
  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="section-kicker mb-3">کنترل کاتالوگ</p>
          <h1 className="text-3xl font-medium">قیمت و موجودی</h1>
          <p className="mt-3 max-w-xl text-sm leading-7 text-muted-foreground">
            روی عدد کلیک کنید. برای لغو ویرایش هر خانه، Escape را بزنید. تغییرات
            با دکمهٔ ذخیره ثبت می‌شوند. مجموع موجودی رنگ‌ها باید برابر موجودی کل باشد.
          </p>
        </div>
        <label className="relative">
          <span className="sr-only">جستجوی محصول</span>
          <Search className="absolute right-3 top-3 size-4 text-muted-foreground" />
          <Input
            className="h-11 pr-10"
            placeholder="نام یا برند محصول…"
            value={search}
            disabled={editor.saving}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
          />
        </label>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card p-4">
        <span className="text-sm text-muted-foreground">
          {formatNumber(editor.changedIds.length)} محصول با تغییر ذخیره‌نشده
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            disabled={editor.saving || !Object.keys(editor.drafts).length}
            onClick={editor.discardAll}
          >
            انصراف از تغییرات
          </Button>
          <Button
            disabled={!editor.changedIds.length || editor.saving}
            onClick={() => void editor.save()}
          >
            <Save />
            {editor.saving ? "در حال ذخیره…" : "ذخیرهٔ تغییرات"}
          </Button>
        </div>
      </div>
      <QueryFeedback
        fetching={query.isFetching}
        error={query.error}
        retry={() => void query.refetch()}
      />
      <div className="surface overflow-hidden">
        <Table className="min-w-[1050px] table-fixed" aria-busy={query.isFetching || editor.saving}>
          <colgroup><col className="w-[23%]"/><col className="w-[10%]"/><col className="w-[17%]"/><col className="w-[12%]"/><col className="w-[23%]"/><col className="w-[15%]"/></colgroup><TableHeader>
            <TableRow>
              <TableHead>محصول</TableHead>
              <TableHead>برند</TableHead>
              <TableHead>قیمت (تومان)</TableHead>
              <TableHead>موجودی کل</TableHead>
              <TableHead>موجودی رنگ‌ها</TableHead>
              <TableHead>وضعیت</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!query.isPending && !query.isError && !products.length && (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center">
                  محصولی پیدا نشد.
                </TableCell>
              </TableRow>
            )}
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Image
                      src={product.thumbnail}
                      alt=""
                      width={52}
                      height={52}
                      className="size-13 rounded-lg object-cover"
                    />
                    <span dir="auto">{product.name}</span>
                  </div>
                </TableCell>
                <TableCell>{product.brand}</TableCell>
                {(["price", "quantity"] as const).map((field) => (
                  <TableCell key={field}>
                    {editor.drafts[product.id]?.values[field] !== undefined ? (
                      <InventoryValueInput price={field === "price"} label={(field === "price" ? "قیمت" : "موجودی") + " " + product.name} disabled={editor.saving} value={editor.drafts[product.id].values[field] ?? ""} onChange={value=>editor.edit(product,field,value)} onEscape={()=>editor.cancel(product.id,field)}/>
                    ) : (
                      <button
                        type="button"
                        disabled={editor.saving || query.isPlaceholderData}
                        className="rounded-md border border-dashed border-transparent px-3 py-2 tabular-nums hover:border-gold hover:bg-secondary focus-visible:outline-gold"
                        aria-label={`ویرایش ${field === "price" ? "قیمت" : "موجودی"} ${product.name}`}
                        onClick={() => editor.edit(product, field)}
                      >
                        {formatNumber(product[field])}
                      </button>
                    )}
                  </TableCell>
                ))}
                <TableCell>
                  {/* رنگ‌ها از snapshot همان ویرایش می‌آیند؛ دریافت مجدد لیست نباید draft کاربر را جابه‌جا کند. */}
                  <div className="space-y-2">
                    {(editor.drafts[product.id]?.original.variants ?? product.variants).map(variant => {
                      const field = `variant:${variant.id}` as const;
                      const value = editor.drafts[product.id]?.values[field];
                      // دو ستون هم‌اندازه در همهٔ ردیف‌ها، نام رنگ و تعداد را تراز می‌کنند؛ نام بلند در ستون خودش می‌شکند.
                      return <div key={variant.id} className="grid grid-cols-[6rem_6rem] items-center gap-3">
                        <span className="flex min-w-0 items-center gap-2 whitespace-normal break-words text-xs"><span aria-hidden className="size-3 shrink-0 rounded-full border" style={{backgroundColor: variant.hex}} />{variant.name}</span>
                        <div className="w-24 shrink-0">
                          {value !== undefined ? <InventoryValueInput price={false} label={`موجودی رنگ ${variant.name} ${product.name}`} disabled={editor.saving} value={value} onChange={value => editor.edit(product, field, value)} onEscape={() => editor.cancel(product.id, field)} /> :
                            <Button variant="ghost" className="w-full border border-dashed border-border tabular-nums" disabled={editor.saving || query.isPlaceholderData} aria-label={`ویرایش موجودی رنگ ${variant.name} ${product.name}`} onClick={() => editor.edit(product, field)}>{formatNumber(variant.quantity)}</Button>}
                        </div>
                      </div>;
                    })}
                    {!product.variants.length && <span className="text-xs text-muted-foreground">برای افزودن رنگ از فرم ویرایش محصول استفاده کنید.</span>}
                  </div>
                </TableCell>
                <TableCell className="max-w-60 text-xs">
                  {inventoryDraftError(editor.drafts[product.id]) || editor.drafts[product.id]?.error ? (
                    <span role="alert" className="text-destructive">
                      {inventoryDraftError(editor.drafts[product.id]) || editor.drafts[product.id].error}
                    </span>
                  ) : editor.changedIds.includes(product.id) ? (
                    <span className="text-foreground">در انتظار ذخیره</span>
                  ) : (
                    <span className="text-muted-foreground">ثبت‌شده</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <AdminPagination
        page={page}
        totalPages={query.data?.totalPages ?? 0}
        busy={query.isFetching || editor.saving}
        onPageChange={setPage}
      />
    </section>
  );
}

/** هر سلول عرض ثابت دارد؛ قیمت فقط در نمایش فرمت می‌شود و Escape به همان draft مستقل برمی‌گردد. */
function InventoryValueInput({price,label,disabled,value,onChange,onEscape}:{price:boolean;label:string;disabled:boolean;value:string;onChange:(value:string)=>void;onEscape:()=>void}) {const shared={autoFocus:true,disabled,"aria-label":label,className:"w-full min-w-0 text-right",onKeyDown:(event:React.KeyboardEvent<HTMLInputElement>)=>{if(event.key==="Escape"){event.preventDefault();onEscape();}}};return price?<PriceInput {...shared} value={value} onValueChange={onChange}/>:<PersianDigitInput {...shared} type="text" inputMode="numeric" value={value} onChange={event=>onChange(event.target.value)}/>;}
