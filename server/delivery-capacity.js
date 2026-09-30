const rules = require('../shared/checkout-rules.json');
const paymentRules = require('../shared/payment-rules.json');
/** رزرو موقت تا پایان مهلت پرداخت و رزرو قطعی پس از پرداخت، ظرفیت یک پیک را اشغال می‌کنند. */
function holdsDeliverySlot(order, now = Date.now()) {
  if (order.status === 'cancelled' || !order.delivery) return false;
  return order.paymentStatus === 'paid' || (order.paymentStatus === 'pending' &&
    Number(order.expiresAt || order.createdAt + paymentRules.sessionMinutes * 60000) > now);
}
/** ثبت سفارش و تأیید پرداخت هر دو از همین کنترل ظرفیت استفاده می‌کنند. */
function slotTaken(orders, delivery, excludeId, now = Date.now()) {
  return orders.some(o => o.id !== excludeId && holdsDeliverySlot(o, now) &&
    o.delivery.deliveryDate === delivery.deliveryDate && o.delivery.deliveryTime === delivery.deliveryTime);
}
/** پاسخ عمومی ظرفیت فاقد اطلاعات مشتری است؛ روز کامل از تعداد ساعت‌های تنظیم‌شده به دست می‌آید. */
function deliveryAvailability(orders, now = Date.now()) {
  const unavailable = {};
  for (const order of orders) {
    if (!holdsDeliverySlot(order, now) || !rules.deliveryTimeSlots.includes(order.delivery.deliveryTime)) continue;
    const date = order.delivery.deliveryDate;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) continue;
    unavailable[date] ||= [];
    if (!unavailable[date].includes(order.delivery.deliveryTime)) unavailable[date].push(order.delivery.deliveryTime);
  }
  return { unavailable, fullyBookedDates: Object.keys(unavailable).filter(date => rules.deliveryTimeSlots.every(time => unavailable[date].includes(time))) };
}
module.exports = { holdsDeliverySlot, slotTaken, deliveryAvailability };
