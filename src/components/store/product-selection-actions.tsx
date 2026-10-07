"use client";

import { Heart, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProductSelection } from "@/features/catalog/selection";

/** بیرون لینک کارت قرار می‌گیرد تا ذخیره یا مقایسه، کاربر را ناخواسته به صفحهٔ محصول نبرد. */
export function ProductSelectionActions({
  id,
  name,
  compact = false,
}: {
  id: number;
  name: string;
  compact?: boolean;
}) {
  const favorites = useProductSelection("favorites");
  const compare = useProductSelection("compare");
  return (
    <div
      className={
        compact
          ? "absolute top-4 left-3 z-10 flex flex-col gap-2"
          : "flex flex-wrap gap-2"
      }
    >
      <Button
        variant="outline"
        size={compact ? "icon" : "default"}
        className={compact ? "rounded-full bg-card/95 shadow-sm" : ""}
        aria-label={`علاقه‌مندی: ${name}`}
        aria-pressed={favorites.ids.includes(id)}
        onClick={() => favorites.toggle(id)}
      >
        <Heart
          className={
            favorites.ids.includes(id) ? "fill-forest text-forest" : ""
          }
        />
        {!compact && "ذخیرهٔ ساعت"}
      </Button>
      <Button
        variant="outline"
        size={compact ? "icon" : "default"}
        className={compact ? "rounded-full bg-card/95 shadow-sm" : ""}
        aria-label={`مقایسه: ${name}`}
        aria-pressed={compare.ids.includes(id)}
        onClick={() => compare.toggle(id)}
      >
        <Scale className={compare.ids.includes(id) ? "text-forest" : ""} />
        {!compact && "افزودن به مقایسه"}
      </Button>
    </div>
  );
}
