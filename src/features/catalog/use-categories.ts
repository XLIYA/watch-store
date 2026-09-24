"use client";

import { useQuery } from "@tanstack/react-query";
import { getCategories } from "@/services/categories.service";

/**
 * هدر، فوتر و فیلتر مدیریت به یک فهرست عمومی دسته‌بندی وابسته‌اند.
 * کلید مشترک باعث می‌شود این بخش‌ها نتیجه و درخواست در حال اجرا را به اشتراک بگذارند؛
 * نام و slug از API می‌آید تا افزودن گروه، به تغییر کد رابط نیاز نداشته باشد.
 */
export function useCategories() {
  return useQuery({
    queryKey: ["catalog", "categories"],
    queryFn: ({ signal }) => getCategories(signal),
  });
}

export { categoryHref } from "./catalog-navigation";
