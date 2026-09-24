/** سرگروه صفحهٔ مستقل ندارد؛ لینک آن به بخش مربوط در فروشگاه و لینک گروه به فهرست صفحه‌بندی‌شده می‌رود. */
export const categoryHref = (slug: string) =>
  `/shop#collection-${encodeURIComponent(slug)}`;
export const groupHref = (slug: string) =>
  `/collections/${encodeURIComponent(slug)}`;

/** لینک صفحه‌بندی هم sort را حفظ می‌کند و هم href واقعی دارد تا در تب جدید و بعد از refresh معتبر بماند. */
export function collectionPageHref(slug: string, page: number, sort: string) {
  const query = new URLSearchParams({ page: String(page), sort });
  return `${groupHref(slug)}?${query}`;
}

/** تعداد لینک‌ها مستقل از حجم کاتالوگ است؛ برای لیست بزرگ هزاران دکمه ساخته نمی‌شود. */
export function paginationWindow(page: number, total: number) {
  return [...new Set([1, page - 2, page - 1, page, page + 1, page + 2, total])]
    .filter((value) => value >= 1 && value <= total)
    .sort((a, b) => a - b);
}
