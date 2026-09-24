"use client";
import { useFeaturedCategoryMutation } from "./mutations";
import { Checkbox } from "@/components/ui/checkbox";

import { useCategories } from "@/features/catalog/use-categories";

import { getApiErrorMessage } from "@/services/api/api-error";

/** انتخاب ادمین در API ذخیره می‌شود؛ checkbox کنترل‌شده تنها با پاسخ موفق تغییر می‌کند تا شکست شبکه انتخاب دروغین نسازد. */
export function FeaturedCategories() {
  const query = useCategories();
  const mutation = useFeaturedCategoryMutation();
  return (
    <details className="surface p-5">
      <summary className="cursor-pointer text-sm font-medium">
        انتخاب مجموعه‌های صفحهٔ اصلی
      </summary>
      <p className="mt-4 text-xs leading-6 text-muted-foreground">
        از هر مجموعهٔ انتخاب‌شده، شش محصول جدید در خانه و فروشگاه نمایش داده
        می‌شود.
      </p>
      <div className="mt-4 flex flex-wrap gap-5">
        {query.data?.map((category) => (
          <label key={category.id} className="flex items-center gap-2 text-sm">
            <Checkbox
              
              className="accent-primary"
              checked={category.featured}
              disabled={mutation.isPending}
              onCheckedChange={(checked) =>
                mutation.mutate({
                  id: category.id,
                  featured: checked === true,
                })
              }
            />
            {category.name}
          </label>
        ))}
      </div>
      {(mutation.isError || query.isError) && (
        <p role="alert" className="mt-3 text-xs text-destructive">
          {getApiErrorMessage(mutation.error || query.error)}
        </p>
      )}
    </details>
  );
}
