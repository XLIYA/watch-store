import type { Category } from "@/types/category";
import { getProducts } from "./products.service";
import rules from "../../shared/product-rules.json";

export async function getFeaturedCollections(categories: Category[]) {
  return Promise.all(
    categories
      .filter((category) => category.featured)
      .map(async (category) => ({
        category,
        products: (
          await getProducts({
            category: category.id,
            limit: rules.featuredCount,
            sort: "newest",
          })
        ).data,
      })),
  );
}
