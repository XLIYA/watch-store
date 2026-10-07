"use client";
import Link from "next/link";
import { Heart, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProductSelection } from "@/features/catalog/selection";
import { formatNumber } from "@/lib/format";

/** شمارنده‌های کوچک هدر، انتخاب‌های مشترک کارت‌ها را در دسکتاپ و موبایل قابل دسترسی نگه می‌دارند. */
export function SelectionLinks() {
  const favorites = useProductSelection("favorites");
  const compare = useProductSelection("compare");
  return (
    <>
      {[
        {
          href: "/favorites",
          title: "علاقه‌مندی‌ها",
          ids: favorites.ids,
          Icon: Heart,
        },
        {
          href: "/compare",
          title: "مقایسهٔ ساعت‌ها",
          ids: compare.ids,
          Icon: Scale,
        },
      ].map(({ href, title, ids, Icon }) => (
        <Button
          key={href}
          asChild
          variant="ghost"
          size="icon"
          className="relative size-9 sm:size-10"
        >
          <Link
            href={href}
            aria-label={`${title}، ${formatNumber(ids.length)} ساعت`}
          >
            <Icon className="size-[18px]" strokeWidth={1.5} />
            {ids.length > 0 && (
              <span className="absolute -top-1 right-0 rounded-full bg-forest px-1 text-[10px] text-white">
                {formatNumber(ids.length)}
              </span>
            )}
          </Link>
        </Button>
      ))}
    </>
  );
}
