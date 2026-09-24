/** شناسه‌هایی مثل موبایل و کد پستی رشته می‌مانند تا صفر ابتدا حذف نشود؛ اعتبارسنجی روی رقم لاتین انجام می‌شود. */
export function normalizeDigits(value: string): string {
  return value.replace(/[۰-۹٠-٩]/g, digit =>
    String(digit.charCodeAt(0) - (digit >= "۰" ? 0x06f0 : 0x0660)),
  );
}

/** نمایش ورودی‌های شناسه در checkout فارسی است؛ حروف نامعتبر حذف نمی‌شوند تا اعتبارسنجی آن‌ها را تشخیص دهد. */
export function persianDigits(value: string): string {
  return normalizeDigits(value).replace(/[0-9]/g, digit => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)]);
}
