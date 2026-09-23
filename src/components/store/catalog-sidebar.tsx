import Link from "next/link";
import { CategoryIcon } from "./category-icon";
import type { Category, Subcategory } from "@/types/category";
import { groupHref } from "@/features/catalog/catalog-navigation";

/** هر سرگروه فقط عنوان بازشونده است؛ گروه‌های فرزند از API می‌آیند و به صفحهٔ مستقل خود لینک می‌شوند. */
export function CatalogSidebar({categories,groups,activeId}:{categories:Category[];groups:Subcategory[];activeId:number}) {
  return <aside className="surface h-fit p-5 lg:sticky lg:top-28"><p className="section-kicker mb-5">مجموعه‌های ساعت</p><nav aria-label="گروه‌های محصولات" className="divide-y divide-border">
    {categories.map(category=><details key={category.id} open={groups.some(group=>group.category===category.id&&group.id===activeId)} className="py-3"><summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-medium"><CategoryIcon name={category.icon} className="size-4 text-gold"/>{category.name}<span className="mr-auto text-muted-foreground">＋</span></summary><ul className="mt-3 space-y-1 border-r border-border pr-3">{groups.filter(group=>group.category===category.id).map(group=><li key={group.id}><Link href={groupHref(group.slug)} aria-current={group.id===activeId?"page":undefined} className={`block rounded-md px-3 py-2 text-sm transition-colors ${group.id===activeId?"bg-primary text-primary-foreground":"text-muted-foreground hover:bg-secondary"}`}>{group.name}</Link></li>)}</ul></details>)}
  </nav></aside>;
}
