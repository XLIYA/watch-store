import { TryOnTeaser } from "@/components/store/try-on-teaser";
import { ExperienceIntro } from "@/components/store/experience-intro";
import { getCategories, getSubcategories } from "@/services/categories.service";
import { CategoryProductSection } from "@/components/store/category-product-section";
import { CollectionCarousel } from "@/components/store/collection-carousel";

import { getFeaturedCollections } from "@/services/catalog.service";

export const dynamic = "force-dynamic";
/** تمام گروه‌ها قابل دسترسی‌اند، اما ویترین شش‌تایی فقط برای انتخاب ادمین ساخته می‌شود؛ گروه غیرمنتخب مخفی از فروش نیست. */
export default async function ShopPage() {
  const [categories, groups] = await Promise.all([
    getCategories(),
    getSubcategories(),
  ]);
  const collections = await getFeaturedCollections(categories);
  return (
    <main>
      <header className="overflow-hidden bg-forest text-ivory">
        <div className="site-container py-12 md:py-16">
          <div className="mb-9 flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="mb-4 text-xs text-gold-light">کاتالوگ خانهٔ ساعت</p>
              <h1 className="text-3xl leading-relaxed md:text-4xl">
                از کدام مجموعه شروع می‌کنید؟
              </h1>
            </div>
            <p className="max-w-sm text-sm leading-7 text-white/60">
              مجموعه‌ها را ورق بزنید و سبک مورد علاقه‌تان را کشف کنید.
            </p>
          </div>
          <CollectionCarousel categories={categories} groups={groups} compact />
        </div>
      </header>
      <ExperienceIntro />
      <TryOnTeaser />
      <div id="collections">
        {collections.map((item) => (
          <CategoryProductSection
            key={item.category.id}
            {...item}
            groups={groups}
          />
        ))}
      </div>
    </main>
  );
}
