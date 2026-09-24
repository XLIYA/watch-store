import type { Category } from "@/types/category";
import { getProducts } from "./products.service";
import rules from "../../shared/product-rules.json";

/** خانه و فروشگاه این سیاست مشترک را مصرف می‌کنند؛ featured تنها مرجع انتخاب ادمین و شش تعداد تعریف‌شده در پروژه است. */
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
