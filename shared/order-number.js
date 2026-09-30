/** شمارهٔ نمایشی مستقل از کلید دسترسی است؛ سفارش‌های قدیمی بدون تغییر شناسهٔ اصلی نمایش عددی پایدار دارند. */
function displayOrderNumber(order) {
  if (order.orderNumber) return order.orderNumber;
  const id = String(order.id);
  if (/^\d+$/.test(id)) return id;
  let hash = 2166136261;
  for (const c of id) hash = Math.imul(hash ^ c.charCodeAt(0), 16777619);
  return String((hash >>> 0) % 90000000 + 10000000);
}
module.exports = { displayOrderNumber };
