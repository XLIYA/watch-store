"use client";
import { useEffect, useState, type RefObject } from "react";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice, formatNumber } from "@/lib/format";

/** فقط وقتی دکمهٔ اصلی بیرون دید است نشان داده می‌شود؛ قیمت، رنگ و اعتبارسنجی از همان پنل خرید می‌آیند. */
export function MobilePurchaseBar({
  anchor,
  price,
  quantity,
  color,
  disabled,
  label,
  onBuy,
}: {
  anchor: RefObject<HTMLButtonElement | null>;
  price: number;
  quantity: number;
  color?: string;
  disabled: boolean;
  label: string;
  onBuy: () => void;
}) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!anchor.current) return;
    const observer = new IntersectionObserver(([entry]) =>
      setVisible(!entry.isIntersecting),
    );
    observer.observe(anchor.current);
    return () => observer.disconnect();
  }, [anchor]);
  if (!visible) return null;
  return (
    <aside
      data-mobile-purchase
      className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-lg backdrop-blur-md lg:hidden"
      aria-label="خرید سریع ساعت"
    >
      <div className="mx-auto flex max-w-xl items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">
            {formatPrice(price * quantity)}{" "}
            <span className="text-[10px]">تومان</span>
          </p>
          <p className="mt-1 truncate text-xs text-muted-foreground">
            {color ?? "بدون رنگ موجود"} · {formatNumber(quantity)} عدد
          </p>
        </div>
        <Button
          className="h-11 max-w-[58%] whitespace-normal text-xs"
          onClick={onBuy}
          disabled={disabled}
        >
          <ShoppingBag className="shrink-0" />
          {label}
        </Button>
      </div>
    </aside>
  );
}
