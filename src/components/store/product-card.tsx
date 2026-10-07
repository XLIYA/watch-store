import { ProductSelectionActions } from "@/components/store/product-selection-actions";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpLeft, Watch } from "lucide-react";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/types/product";
/** کارت مشترک از مرجع تصویری پیروی می‌کند؛ قیمت روی عکس و اطلاعات روی گرادیان خوانا باقی می‌مانند. */
export function ProductCard({
  product,
  priority = false,
  onNavigate,
}: {
  product: Product;
  priority?: boolean;
  onNavigate?: () => void;
}) {
  const image = product.thumbnail || product.images?.[0];
  return (
    <article className="group relative min-w-0 overflow-hidden rounded-3xl border border-border bg-secondary shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-xl">
      <Link
        href={"/product/" + product.id}
        onClick={onNavigate}
        aria-label={"مشاهده " + product.name}
        className="relative flex aspect-[3/4.3] flex-col justify-end overflow-hidden"
      >
        {image && (
          <Image
            src={image}
            alt={product.name}
            fill
            priority={priority}
            sizes="(max-width:640px) 85vw,(max-width:1024px) 42vw,28vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        )}
        {/* نیمهٔ بالای تصویر بدون رنگ می‌ماند؛ تیرگی فقط پشت اطلاعات پایین کارت قرار دارد. */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-forest via-forest/90 to-transparent" />
        {/* سایهٔ نرم، نشان قیمت را روی تصاویر روشن از پس‌زمینه جدا می‌کند. */}
        <span className="absolute right-4 top-4 rounded-full border border-white/60 bg-white/90 px-4 py-2.5 text-xs font-medium text-ink shadow-md shadow-ink/15 backdrop-blur-md">
          {formatPrice(product.price)}{" "}
          <span className="text-[10px]">تومان</span>
        </span>
        <div className="relative space-y-3 p-5 text-right text-white">
          <p dir="auto" className="text-right text-xs text-white/70">
            {product.brand}
          </p>
          <h3
            dir="auto"
            className="min-h-12 text-right text-base font-semibold leading-6 line-clamp-2"
          >
            {product.name}
          </h3>
          <div className="flex items-center justify-between gap-3 text-[11px] text-white/80">
            <span className="flex items-center gap-1.5">
              <Watch className="size-3.5" />{" "}
              {product.quantity > 0 ? "آمادهٔ انتخاب" : "اتمام موجودی"}
            </span>
            <span>{product.variants.length.toLocaleString("fa-IR")} رنگ</span>
          </div>
          <span className="flex items-center justify-between rounded-full bg-ivory px-5 py-3.5 text-xs font-medium text-forest transition-colors group-hover:bg-gold-light">
            کشف این ساعت{" "}
            <ArrowUpLeft className="size-4 transition-transform group-hover:-translate-x-1 group-hover:-translate-y-1" />
          </span>
        </div>
      </Link>
      <ProductSelectionActions id={product.id} name={product.name} compact />
    </article>
  );
}
