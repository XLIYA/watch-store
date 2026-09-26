"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpLeft } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { ScrollReveal } from "@/components/common/scroll-reveal";
import { categoryHref } from "@/features/catalog/catalog-navigation";
import { formatNumber, formatPrice } from "@/lib/format";
import type { Category } from "@/types/category";
import type { Product } from "@/types/product";

/** روایت هر مجموعه در لندینگ: عنوان ثابت کنار اسلایدهای واقعی است تا همهٔ محصولات عکس و مقصد مستقل داشته باشند. */
export function CollectionStory({ category, products, index }: { category: Category; products: Product[]; index: number }) {
  return (
    <section className="site-container py-12 md:py-20" aria-label={`منتخب ${category.name}`}>
      <ScrollReveal className="border-t border-border pt-10">
        <Carousel dir="rtl" opts={{ direction: "rtl", align: "start" }} className="grid items-center gap-8 lg:grid-cols-[1fr_1.5fr] lg:gap-16">
          <div className="max-w-md">
            <p className="section-kicker mb-4">مجموعهٔ {formatNumber(index + 1)}</p>
            <h2 className="text-3xl font-medium leading-relaxed md:text-4xl">{category.name}</h2>
            <p className="mt-5 text-sm leading-8 text-muted-foreground">جزئیات را نزدیک‌تر ببینید؛ ساعت‌ها را ورق بزنید و انتخاب خود را در این مجموعه پیدا کنید.</p>
            <Link href={categoryHref(category.slug)} className="mt-6 inline-flex items-center gap-3 border-b border-gold pb-2 text-sm transition-colors hover:text-forest">
              تماشای مجموعه <ArrowUpLeft className="size-4" />
            </Link>
            <div className="mt-8 flex items-center gap-3">
              <CarouselPrevious className="static m-0 translate-x-0 translate-y-0 [&_svg]:rotate-180" />
              <CarouselNext className="static m-0 translate-x-0 translate-y-0 [&_svg]:rotate-180" />
              <span className="mr-2 text-xs text-muted-foreground">{formatNumber(products.length)} ساعت منتخب</span>
            </div>
          </div>
          <div className="min-w-0">
            <CarouselContent>
              {products.map(product => {
                const image = product.images?.[0] || product.thumbnail;
                return (
                  <CarouselItem key={product.id} className="basis-[88%] sm:basis-1/2">
                    <Link href={`/product/${product.id}`} className="group block rounded-3xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-forest">
                      <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-secondary">
                        {image && <Image src={image} alt={product.name} fill sizes="(max-width:640px) 80vw,30vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />}
                      </div>
                      <p dir="auto" className="mt-4 truncate text-right text-xs text-muted-foreground">{product.brand}</p>
                      <h3 dir="auto" className="mt-2 line-clamp-2 min-h-12 text-right text-sm font-medium leading-6">{product.name}</h3>
                      <p className="mt-2 text-xs text-forest">{formatPrice(product.price)} تومان</p>
                    </Link>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            {!products.length && <p className="py-12 text-center text-muted-foreground">هنوز محصولی در این مجموعه نیست.</p>}
          </div>
        </Carousel>
      </ScrollReveal>
    </section>
  );
}
