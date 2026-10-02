import {
  CollectionNavigation,
  CollectionNavigationLink,
} from "@/components/store/collection-navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { notFound, redirect } from "next/navigation";
import { getCategories, getSubcategories } from "@/services/categories.service";
import { getProducts, type ProductSort } from "@/services/products.service";
import { CatalogSidebar } from "@/components/store/catalog-sidebar";
import { ProductCard } from "@/components/store/product-card";
import {
  categoryHref,
  collectionPageHref,
  paginationWindow,
} from "@/features/catalog/catalog-navigation";
import { formatNumber } from "@/lib/format";
import rules from "../../../../../shared/product-rules.json";

export const dynamic = "force-dynamic";
const sorting: { value: ProductSort; label: string }[] = [
  { value: "newest", label: "جدیدترین" },
  { value: "price-asc", label: "کمترین قیمت" },
  { value: "price-desc", label: "بیشترین قیمت" },
  { value: "popular", label: "محبوب‌ترین" },
];

/** URL منبع وضعیت فیلتر و صفحه است؛ Server Component نتیجهٔ درست را برای refresh و بازکردن تب جدید می‌سازد. */
export default async function CollectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ categorySlug: string }>;
  searchParams: Promise<{ page?: string; sort?: string }>;
}) {
  const [{ categorySlug }, query, categories, groups] = await Promise.all([
    params,
    searchParams,
    getCategories(),
    getSubcategories(),
  ]);
  const group = groups.find((item) => item.slug === categorySlug);
  if (!group) {
    const parent = categories.find((item) => item.slug === categorySlug);
    if (parent) redirect(categoryHref(parent.slug));
    notFound();
  }
  const parent = categories.find((item) => item.id === group.category);
  const requestedPage = Number(query.page ?? 1);
  const page =
    Number.isSafeInteger(requestedPage) && requestedPage > 0
      ? requestedPage
      : 1;
  const sort =
    sorting.find((option) => option.value === query.sort)?.value ?? "newest";
  const result = await getProducts({
    subcategory: group.id,
    category: group.category,
    page,
    limit: rules.pageSize,
    sort,
  });
  if (page > Math.max(1, result.totalPages))
    redirect(
      collectionPageHref(group.slug, Math.max(1, result.totalPages), sort),
    );
  return (
    <main className="site-container py-10 md:py-16">
      <nav
        aria-label="مسیر صفحه"
        className="mb-8 flex gap-3 text-xs text-muted-foreground"
      >
        <Link href="/shop">فروشگاه</Link>
        <span>/</span>
        <span>{parent?.name}</span>
        <span>/</span>
        <span className="text-foreground">{group.name}</span>
      </nav>
      <header className="mb-12 flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="section-kicker mb-4">انتخابی برای هر لحظه</p>
          <h1 className="editorial-title">{group.name}</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          {formatNumber(result.total)} ساعت در این مجموعه
        </p>
      </header>
      <CollectionNavigation>
        <div className="grid items-start gap-8 lg:grid-cols-[230px_minmax(0,1fr)]">
          <CatalogSidebar
            categories={categories}
            groups={groups}
            activeId={group.id}
          />
          <section aria-label={`ساعت‌های ${group.name}`}>
            <nav
              aria-label="مرتب‌سازی محصولات"
              className="mb-7 flex flex-wrap gap-2"
            >
              {sorting.map((option) => (
                <CollectionNavigationLink
                  key={option.value}
                  href={collectionPageHref(group.slug, 1, option.value)}
                  aria-current={sort === option.value ? "true" : undefined}
                  className={`rounded-md border px-4 py-2 text-xs ${sort === option.value ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-secondary"}`}
                >
                  {option.label}
                </CollectionNavigationLink>
              ))}
            </nav>
            {result.data.length ? (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {result.data.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="surface py-20 text-center">
                <h2 className="text-xl">هنوز ساعتی در این گروه نیست</h2>
                <p className="mt-3 text-sm text-muted-foreground">
                  مجموعه‌های دیگر را از فهرست انتخاب کنید.
                </p>
              </div>
            )}
            {
              <nav
                aria-label="صفحه‌بندی محصولات"
                className="mt-10 flex flex-wrap items-center justify-center gap-2"
                dir="rtl"
              >
                {/* ظاهر مشترک با ادمین؛ لینک واقعی، مرتب‌سازی و بازشدن در تب جدید را حفظ می‌کند. */}
                {page > 1 ? (
                  <Button asChild variant="outline">
                    <CollectionNavigationLink
                      href={collectionPageHref(group.slug, page - 1, sort)}
                    >
                      قبلی
                    </CollectionNavigationLink>
                  </Button>
                ) : (
                  <Button variant="outline" disabled>
                    قبلی
                  </Button>
                )}
                {paginationWindow(page, Math.max(1, result.totalPages)).map(
                  (value, index, items) => (
                    <span key={value} className="flex items-center gap-2">
                      {index > 0 && value - items[index - 1] > 1 && (
                        <span aria-hidden>…</span>
                      )}
                      <Button
                        asChild
                        variant={value === page ? "default" : "outline"}
                      >
                        <CollectionNavigationLink
                          aria-current={value === page ? "page" : undefined}
                          href={collectionPageHref(group.slug, value, sort)}
                        >
                          {formatNumber(value)}
                        </CollectionNavigationLink>
                      </Button>
                    </span>
                  ),
                )}
                {page < result.totalPages ? (
                  <Button asChild variant="outline">
                    <CollectionNavigationLink
                      href={collectionPageHref(group.slug, page + 1, sort)}
                    >
                      بعدی
                    </CollectionNavigationLink>
                  </Button>
                ) : (
                  <Button variant="outline" disabled>
                    بعدی
                  </Button>
                )}
              </nav>
            }
          </section>
        </div>
      </CollectionNavigation>
    </main>
  );
}
