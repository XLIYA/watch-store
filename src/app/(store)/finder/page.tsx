import { WatchFinder } from "@/components/store/watch-finder";
import { getCategories, getSubcategories } from "@/services/categories.service";
export const dynamic = "force-dynamic";
export default async function FinderPage() {
  const [categories, groups] = await Promise.all([
    getCategories(),
    getSubcategories(),
  ]);
  return <WatchFinder categories={categories} groups={groups} />;
}
