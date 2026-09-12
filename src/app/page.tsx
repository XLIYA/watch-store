import { AllCollections } from "@/components/landing/all-collections";
import { CollectionStory } from "@/components/landing/collection-story";
import { LandingCta } from "@/components/landing/landing-cta";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingHero } from "@/components/landing/landing-hero";
import { LandingReveal } from "@/components/landing/landing-reveal";

import { getCategories } from "@/services/categories.service";
import {
  getHeroProducts,
  getProducts,
} from "@/services/products.service";

export const dynamic = "force-dynamic";

export default async function LandingPage() {
  const [categories, heroProducts] =
    await Promise.all([
      getCategories(),
      getHeroProducts(),
    ]);

  const landingCategories = categories
    .filter(
      (category) => category.landingEnabled,
    )
    .sort(
      (a, b) =>
        a.landingOrder - b.landingOrder,
    );

  const collections = await Promise.all(
    landingCategories.map(
      async (category) => {
        const result = await getProducts({
          category: category.id,
          page: 1,
          limit: 3,
          sort: "newest",
        });

        return {
          category,
          products: result.data,
        };
      },
    ),
  );

  return (
    <LandingReveal>
      <main>
        <LandingHero
          products={heroProducts}
        />

        {collections.map(
          (
            { category, products },
            index,
          ) => (
            <CollectionStory
              key={category.id}
              category={category}
              products={products}
              index={index}
            />
          ),
        )}

        <AllCollections
          categories={landingCategories}
        />
        <LandingCta />
        <LandingFooter />
      </main>
    </LandingReveal>
  );
}