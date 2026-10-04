const rules = require('../shared/checkout-rules.json');
const paymentRules = require('../shared/payment-rules.json');
/** رزرو موقت تا پایان مهلت پرداخت و رزرو قطعی پس از پرداخت، ظرفیت یک پیک را اشغال می‌کنند. */
function holdsDeliverySlot(order, now = Date.now()) {
  if (order.status === 'cancelled' || !order.delivery) return false;
  return order.paymentStatus === 'paid' || (order.paymentStatus === 'pending' &&
    Number(order.expiresAt || order.createdAt + paymentRules.sessionMinutes * 60000) > now);
}
/** ساعت قدیمی یک نقطه است؛ بازه‌ها انتهای باز دارند تا دو بازهٔ مجاور همدیگر را رزرو نکنند. */
function overlaps(first, second) {
  const parse = value => {
    if (typeof value !== 'string' || !/^\d{2}:\d{2}(?:-\d{2}:\d{2})?$/.test(value)) return null;
    const parts = value.split('-').map(time => {
      const [hours, minutes] = time.split(':').map(Number);
      return hours < 24 && minutes < 60 ? hours * 60 + minutes : NaN;
    });
    if (parts.some(value => !Number.isFinite(value)) || (parts.length === 2 && parts[1] <= parts[0])) return null;
    return parts;
  };
  const a = parse(first), b = parse(second);
  if (!a || !b) return false;
  if (a.length === 1 && b.length === 1) return a[0] === b[0];
  if (a.length === 1) return a[0] >= b[0] && a[0] < b[1];
  if (b.length === 1) return b[0] >= a[0] && b[0] < a[1];
  return a[0] < b[1] && b[0] < a[1];
}
/** ثبت سفارش و تأیید پرداخت، هم‌پوشانی با سفارش‌های جدید و ساعت‌های قدیمی را کنترل می‌کنند. */
function slotTaken(orders, delivery, excludeId, now = Date.now()) {
  return orders.some(o => o.id !== excludeId && holdsDeliverySlot(o, now) &&
    o.delivery.deliveryDate === delivery.deliveryDate && overlaps(o.delivery.deliveryTime, delivery.deliveryTime));
}
/** پاسخ عمومی ظرفیت فاقد اطلاعات مشتری است؛ روز کامل از تعداد ساعت‌های تنظیم‌شده به دست می‌آید. */
function deliveryAvailability(orders, now = Date.now()) {
  const unavailable = {};
  for (const order of orders) {
    if (!holdsDeliverySlot(order, now)) continue;
    const date = order.delivery.deliveryDate;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) continue;
    unavailable[date] ||= [];
    for (const time of rules.deliveryTimeSlots) {
      if (overlaps(order.delivery.deliveryTime, time) && !unavailable[date].includes(time)) unavailable[date].push(time);
    }
  }
  return { unavailable, fullyBookedDates: Object.keys(unavailable).filter(date => rules.deliveryTimeSlots.every(time => unavailable[date].includes(time))) };
}
module.exports = { holdsDeliverySlot, slotTaken, deliveryAvailability };
