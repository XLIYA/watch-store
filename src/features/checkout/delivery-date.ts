// این قانون باید بین تقویم و schema مشترک باشد تا تاریخ قابل‌انتخاب با تاریخ معتبر فرق نکند.
export function getMinimumDeliveryDate() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 7);
  return date;
}

export function parseIsoDate(value: string): Date | undefined {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  // Date تاریخ‌هایی مانند ۳۱ فوریه را جابه‌جا می‌کند؛ آن‌ها را ورودی معتبر حساب نمی‌کنیم.
  return date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
    ? date
    : undefined;
}

export function formatIsoDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
