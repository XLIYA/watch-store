"use client";

import Link from "next/link";
import { useCategories, categoryHref } from "@/features/catalog/use-categories";

/**
 * هر دو فوتر از همین جزء استفاده می‌کنند؛ فقط ظاهر لینک با className تعیین می‌شود.
 * خطای شبکه با نبود گروه اشتباه گرفته نمی‌شود و کاربر امکان تکرار درخواست دارد.
 */
export function CategoryLinks({ className }: { className?: string }) {
  const { data, isPending, isError, refetch } = useCategories();
  if (isPending) return <span role="status" className={className}>دریافت مجموعه‌ها…</span>;
  if (isError) return <button type="button" className={className} onClick={() => void refetch()}>دریافت دوبارهٔ مجموعه‌ها</button>;
  return data?.map(category => <Link key={category.id} href={categoryHref(category.slug)} className={className}>{category.name}</Link>);
}
