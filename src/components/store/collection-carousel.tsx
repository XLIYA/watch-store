"use client";
import Image from "next/image";
import Link from "next/link";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import { categoryHref, groupHref } from "@/features/catalog/catalog-navigation";
import type { Category, Subcategory } from "@/types/category";

/** کاور واقعی مجموعه‌ها در خانه و هیروی فروشگاه مشترک است؛ سرگروه به بخش خود و فرزندان به صفحهٔ محصولات می‌روند. */
export function CollectionCarousel({
  categories,
  groups = [],
  compact = false,
}: {
  categories: Category[];
  groups?: Subcategory[];
  compact?: boolean;
}) {
  return (
    <Carousel
      dir="rtl"
      opts={{ direction: "rtl", align: "start", loop: categories.length > 3 }}
    >
      <CarouselContent className="-mr-5">
        {categories.map((category) => (
          <CarouselItem
            key={category.id}
            className={
              compact
                ? "basis-[80%] pr-5 sm:basis-1/2 lg:basis-1/3"
                : "basis-[88%] pr-5 md:basis-1/2 lg:basis-[42%]"
            }
          >
            <article className="group relative overflow-hidden rounded-3xl bg-forest">
              <Link
                href={categoryHref(category.slug)}
                className="relative isolate block aspect-[4/3] overflow-hidden"
              >
                {category.coverImage && (
                  <Image
                    src={category.coverImage}
                    alt={category.name}
                    fill
                    sizes="(max-width:768px) 85vw,40vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                )}
                {/* برش روی قاب تصویر است؛ scale عکس نباید وارد لینک‌های زیر کارت شود. گرادیان و متن همواره بالای عکس‌اند. */}
                <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-forest via-forest/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 z-20 p-7 text-white">
                  <p className="mb-3 text-xs text-white/70">روایتی از زمان</p>
                  <h2 className="text-2xl">{category.name}</h2>
                </div>
              </Link>
              {groups.length > 0 && (
                <nav
                  aria-label={"گروه‌های " + category.name}
                  className="flex flex-wrap gap-x-4 gap-y-3 px-7 pb-6 text-xs text-white/85"
                >
                  {groups
                    .filter((group) => group.category === category.id)
                    .map((group) => (
                      <Link
                        key={group.id}
                        href={groupHref(group.slug)}
                        className="border-b border-white/20 pb-1 transition-colors hover:text-gold-light"
                      >
                        {group.name}
                      </Link>
                    ))}
                </nav>
              )}
            </article>
          </CarouselItem>
        ))}
      </CarouselContent>
      <div className="mt-6 flex justify-end gap-2">
        <CarouselPrevious
          aria-label="مجموعه قبلی"
          className="static translate-y-0 border-current bg-transparent [&_svg]:rotate-180"
        />
        <CarouselNext
          aria-label="مجموعه بعدی"
          className="static translate-y-0 border-current bg-transparent [&_svg]:rotate-180"
        />
      </div>
    </Carousel>
  );
}
