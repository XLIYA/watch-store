import { CategoryProductSection } from "@/components/store/category-product-section";
import { PopularProducts } from "@/components/store/popular-products";
import { StoreHero } from "@/components/store/store-hero";

import { getCategories } from "@/services/categories.service";
import {
    getPopularProducts,
    getProducts,
} from "@/services/products.service";

export const dynamic = "force-dynamic";

export default async function ShopPage() {
    const [categories, popularProducts] =
        await Promise.all([
            getCategories(),
            getPopularProducts(6),
        ]);

    const categoryCollections =
        await Promise.all(
            categories.map(async (category) => {
                const result = await getProducts({
                    category: category.id,
                    page: 1,
                    limit: 6,
                    sort: "newest",
                });

                return {
                    category,
                    products: result.data,
                };
            }),
        );

    return (
        <main>
            <StoreHero />

            <PopularProducts
                products={popularProducts}
            />

            <div
                id="collections"
                className="scroll-mt-20"
            >
                {categoryCollections.map(
                    ({ category, products }) => (
                        <CategoryProductSection
                            key={category.id}
                            category={category}
                            products={products}
                        />
                    ),
                )}
            </div>
        </main>
    );
}