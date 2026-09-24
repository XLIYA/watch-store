import Link from "next/link";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { LandingHero } from "@/components/landing/landing-hero";
import { CollectionStory } from "@/components/landing/collection-story";
import { CollectionCarousel } from "@/components/store/collection-carousel";
import { ScrollReveal } from "@/components/common/scroll-reveal";
import { getCategories } from "@/services/categories.service";
import { getHeroProducts, getProducts } from "@/services/products.service";
export const dynamic = "force-dynamic";
/** لندینگ روایت برند است؛ مجموعه‌های landingEnabled معرفی می‌شوند و کاتالوگ کامل در shop می‌ماند. */
export default async function LandingPage() {
  const [categories, heroProducts] = await Promise.all([
    getCategories(),
    getHeroProducts(),
  ]);
  const selected = categories
    .filter((item) => item.landingEnabled)
    .sort((a, b) => a.landingOrder - b.landingOrder);
  const stories = await Promise.all(
    selected
      .slice(0, 2)
      .map(async (category) => ({
        category,
        products: (
          await getProducts({
            category: category.id,
            limit: 3,
            sort: "popular",
          })
        ).data,
      })),
  );
  return (
    <>
      <SiteHeader />
      <main>
        <LandingHero products={heroProducts} />
        <section className="site-container py-20 md:py-28">
          <ScrollReveal>
            <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
              <div>
                <p className="section-kicker mb-4">سبک شما، امضای شما</p>
                <h2 className="text-3xl leading-relaxed md:text-4xl">
                  هر مجموعه، یک شخصیت.
                </h2>
              </div>
              <Link
                href="/shop"
                className="border-b border-gold pb-2 text-sm transition-colors hover:text-forest"
              >
                تماشای همهٔ ساعت‌ها ↖
              </Link>
            </div>
            <CollectionCarousel
              categories={selected.length ? selected : categories}
            />
          </ScrollReveal>
        </section>
        <section className="bg-forest px-6 py-16 text-center text-ivory">
          <ScrollReveal>
            <p className="text-xs text-gold-light">نگاهی نزدیک‌تر به جزئیات</p>
            <h2 className="mx-auto mt-6 max-w-3xl text-2xl font-light leading-loose md:text-4xl">
              زیبایی، در چیزهایی‌ست
              <br />
              که با گذشت زمان می‌مانند.
            </h2>
          </ScrollReveal>
        </section>
        {stories.map((story, index) => (
          <CollectionStory key={story.category.id} {...story} index={index} />
        ))}
        <section className="site-container py-20 text-center">
          <ScrollReveal>
            <p className="text-sm text-muted-foreground">
              انتخاب بعدی شما کدام است؟
            </p>
            <Link
              href="/shop"
              className="mt-6 inline-flex rounded-full bg-forest px-9 py-4 text-sm text-white transition-all hover:-translate-y-1 hover:bg-forest-light"
            >
              ورود به دنیای ساعت‌ها ↖
            </Link>
          </ScrollReveal>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
