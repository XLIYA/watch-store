import { SelectedProducts } from "@/components/store/selected-products";
import { getCategories, getSubcategories } from "@/services/categories.service";
export const dynamic = "force-dynamic";
export default async function ComparePage() {
  const [categories, groups] = await Promise.all([
    getCategories(),
    getSubcategories(),
  ]);
  return (
    <SelectedProducts kind="compare" categories={categories} groups={groups} />
  );
}
