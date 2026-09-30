import { normalizeDigits, persianDigits } from "@/lib/digits";
const KEY = "payment-card-history";
const EVENT = "payment-card-history-changed";
/** فرم پرداخت تاریخچه را فقط در حافظهٔ نشست همین تب نگه می‌دارد؛ رمز و CVV ذخیره نمی‌شوند. */
export function readCardHistory() {
  try { return sessionStorage.getItem(KEY) || "[]"; } catch { return "[]"; }
}
/** فرم با useSyncExternalStore تغییر کارت‌های همین تب را بدون ناسازگاری hydration دریافت می‌کند. */
export function subscribeCardHistory(notify: () => void) {
  window.addEventListener(EVENT, notify);
  return () => window.removeEventListener(EVENT, notify);
}
/** دادهٔ خراب یا تکراری storage نباید پیشنهادهای فرم را خراب کند؛ پنج کارت آخر کافی است. */
export function parseCardHistory(raw: string): string[] {
  try { const value: unknown = JSON.parse(raw); return Array.isArray(value) ? [...new Set(value.filter((n): n is string => typeof n === "string" && /^\d{16}$/.test(n)))].slice(0, 5) : []; }
  catch { return []; }
}
/** پس از اعتبارسنجی فرم، کارت استفاده‌شده به ابتدای پیشنهادها منتقل می‌شود. */
export function rememberCard(value: string) {
  const number = normalizeDigits(value).replace(/[ -]/g, "");
  if (!/^\d{16}$/.test(number)) return;
  try {
    sessionStorage.setItem(KEY, JSON.stringify([number, ...parseCardHistory(readCardHistory()).filter(n => n !== number)].slice(0, 5)));
    window.dispatchEvent(new Event(EVENT));
  } catch { /* محدودیت storage مانع پرداخت نمی‌شود. */ }
}
/** دکمهٔ پاک‌کردن کارت‌ها، حافظهٔ اختیاری و پیشنهادهای باز فرم را هم‌زمان پاک می‌کند. */
export function clearCardHistory() {
  try { sessionStorage.removeItem(KEY); window.dispatchEvent(new Event(EVENT)); } catch { /* حافظهٔ نشست اختیاری است. */ }
}
/** ورودی نامعتبر را حذف نمی‌کنیم تا validation خطا را نشان دهد؛ جداکننده صرفاً نمایشی است. */
export function formatCardNumber(value: string) {
  const digits = normalizeDigits(value).replace(/[ -]/g, "");
  return persianDigits(/^\d*$/.test(digits) ? digits.slice(0,16).replace(/(.{4})(?=.)/g, "$1 ") : value);
}
