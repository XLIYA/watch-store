/**
 * سرویس سفارش و محصول پاسخ صفحه‌بندی JSON Server را با یک قرارداد به صفحات می‌دهند.
 * تفسیر هدر تعداد اینجا انجام می‌شود تا محاسبهٔ صفحات و fallback در هر سرویس تکرار نشود.
 */
import type { PaginatedResult } from "@/types/pagination";

export function toPaginatedResult<T>(
  data: T[],
  totalHeader: unknown,
  page: number,
  limit: number,
): PaginatedResult<T> {
  const count = Number(totalHeader ?? data.length);
  const total = Number.isFinite(count) && count >= 0 ? count : data.length;
  return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
}
