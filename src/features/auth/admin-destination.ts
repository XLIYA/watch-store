/** مقصد بازیابی نشست فقط مسیر داخلی مدیریت است؛ URL خارجی و مسیر نرمال‌شونده اجازهٔ redirect ندارند. */
export function adminDestination(value: string | null | undefined): string {
  const fallback = "/admin/orders";
  if (!value || !value.startsWith("/admin") || /[\\\s]/.test(value)) return fallback;
  try {
    const url = new URL(value, "https://internal.invalid");
    if (url.origin !== "https://internal.invalid" || !(url.pathname === "/admin" || url.pathname.startsWith("/admin/")) || url.pathname.startsWith("/admin/login")) return fallback;
    return url.pathname + url.search;
  } catch { return fallback; }
}
