/** فرم درگاه و API همین قواعد را اجرا می‌کنند؛ تبدیل ارقام قبل از اعتبارسنجی است و اطلاعات کارت ذخیره نمی‌شود. */
function normalizePaymentDigits(value) {
  return String(value ?? '').replace(/[۰-۹٠-٩]/g, c => String(c.charCodeAt(0) - (c >= '۰' ? 1776 : 1632)));
}
function validatePaymentFields(fields, now = new Date()) {
  const errors = {};
  const card = normalizePaymentDigits(fields?.cardNumber).replace(/[ -]/g, '');
  // Luhn خطای تایپ شماره را تشخیص می‌دهد؛ اثبات تعلق کارت یا تأیید بانکی نیست.
  const sum = [...card].reduce((total, c, i) => {
    const n = Number(c) * (i % 2 === 0 ? 2 : 1);
    return total + (n > 9 ? n - 9 : n);
  }, 0);
  if (!/^\d{16}$/.test(card) || /^(\d)\1+$/.test(card) || sum % 10 !== 0)
    errors.cardNumber = 'شمارهٔ کارت ۱۶ رقمی معتبر وارد کنید.';
  if (!/^\d{3,4}$/.test(normalizePaymentDigits(fields?.cvv)))
    errors.cvv = 'کد شناسایی باید ۳ یا ۴ رقم باشد.';
  const month = normalizePaymentDigits(fields?.month), year = normalizePaymentDigits(fields?.year);
  const parts = new Intl.DateTimeFormat('en-US-u-ca-persian', { year: 'numeric', month: 'numeric' }).formatToParts(now);
  const currentYear = Number(parts.find(p => p.type === 'year').value);
  const currentMonth = Number(parts.find(p => p.type === 'month').value);
  const fullYear = year.length === 2 ? Math.floor(currentYear / 100) * 100 + Number(year) : Number(year);
  if (!/^\d{1,2}$/.test(month) || Number(month) < 1 || Number(month) > 12)
    errors.month = 'ماه باید بین ۱ تا ۱۲ باشد.';
  if (!/^(\d{2}|\d{4})$/.test(year) || fullYear < currentYear || (fullYear === currentYear && Number(month) < currentMonth))
    errors.year = 'تاریخ انقضای کارت معتبر نیست.';
  if (!/^\d{5}$/.test(normalizePaymentDigits(fields?.captcha))) errors.captcha = 'کد امنیتی پنج‌رقمی را وارد کنید.';
  if (!/^\d{6}$/.test(normalizePaymentDigits(fields?.pin))) errors.pin = 'رمز شش‌رقمی این پرداخت را وارد کنید.';
  if (fields?.email && (typeof fields.email !== 'string' || fields.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)))
    errors.email = 'ایمیل معتبر وارد کنید یا این فیلد را خالی بگذارید.';
  return errors;
}
module.exports = { normalizePaymentDigits, validatePaymentFields };
