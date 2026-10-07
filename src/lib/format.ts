/**
 * جدول‌های مدیریت، کارت محصول، هدر و سبد خرید از قالب‌بندی فارسی مشترک استفاده می‌کنند.
 * Intl یک بار ساخته می‌شود تا هر سلول formatter جدید نسازد و اعداد در تمام صفحات یکسان باشند.
 * تلفن جدا تبدیل می‌شود چون یک شناسه است و صفر ابتدایی آن نباید از بین برود.
 */
// نمونهٔ formatter مشترک از ساخت دوبارهٔ Intl در هر سلول جدول جلوگیری می‌کند.
const numberFormatter = new Intl.NumberFormat("fa-IR");
const dateFormatter = new Intl.DateTimeFormat("fa-IR", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});
const dateTimeFormatter = new Intl.DateTimeFormat("fa-IR", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});
export const formatNumber = (value: number) => numberFormatter.format(value);
export const formatPrice = formatNumber;
export const formatDate = (timestamp: number) =>
  dateTimeFormatter.format(new Date(timestamp));
export const formatFilterDate = (date: Date) => dateFormatter.format(date);
export const formatPhoneNumber = (value: string) =>
  value.replace(/\d/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)]);

/** نمایش مشترک بازهٔ تحویل در checkout و جزئیات سفارش؛ ساعت سفارش‌های قدیمی نیز حفظ می‌شود. */
export const formatDeliveryTime = (value: string) => formatPhoneNumber(value).replace("-", " تا ");
