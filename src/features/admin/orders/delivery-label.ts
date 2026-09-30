import { parseIsoDate } from "@/features/checkout/delivery-date";
import { formatFilterDate, formatPhoneNumber } from "@/lib/format";
/** تاریخ تحویل یک روز تقویمی است؛ parse محلی مانع جابه‌جایی روز به‌علت UTC می‌شود. */
export function deliveryLabel(date: string, time: string) {
  const parsed = parseIsoDate(date);
  return parsed ? formatFilterDate(parsed) + " · ساعت " + formatPhoneNumber(time) : "زمان تحویل مشخص نشده";
}
