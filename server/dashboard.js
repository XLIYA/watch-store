/** روز گزارش با منطقهٔ زمانی فروشگاه محاسبه می‌شود تا پرداخت نزدیک نیمه‌شب به روز اشتباه نرود. */
function dateKey(time) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tehran",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(time);
}

/** فقط دادهٔ تجمیعی به داشبورد می‌رود؛ فروش از پرداخت موفق گرفته می‌شود و شامل هزینهٔ ارسال است. */
function buildDashboard(orders, products, days = 30, now = Date.now()) {
  const today = dateKey(now);
  const base = new Date(`${today}T12:00:00Z`);
  const daily = Array.from({ length: days }, (_, index) => {
    const day = new Date(base);
    day.setUTCDate(day.getUTCDate() - days + 1 + index);
    return { date: day.toISOString().slice(0, 10), amount: 0, count: 0 };
  });
  const dates = new Map(daily.map((day) => [day.date, day]));
  const inRange = (time) => Number.isFinite(time) && dates.has(dateKey(time));
  const selected = orders.filter((order) => inRange(order.createdAt));
  const paid = orders.filter(
    (order) =>
      order.paymentStatus === "paid" &&
      inRange(order.paidAt ?? order.createdAt),
  );
  for (const order of paid) {
    const day = dates.get(dateKey(order.paidAt ?? order.createdAt));
    day.amount += Number(order.totalPrice) || 0;
    day.count++;
  }
  const statuses = [
    "pending",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
  ].map((status) => ({
    status,
    count: selected.filter((order) => order.status === status).length,
  }));
  const top = new Map();
  for (const order of paid)
    for (const item of order.items || []) {
      const current = top.get(item.productId) || {
        id: item.productId,
        name: item.name,
        quantity: 0,
      };
      current.quantity += item.quantity;
      top.set(item.productId, current);
    }
  const lowStock = products
    .filter((product) => product.quantity <= 5)
    .sort((a, b) => a.quantity - b.quantity);
  return {
    days,
    generatedAt: now,
    revenue: daily.reduce((sum, day) => sum + day.amount, 0),
    paidOrders: paid.length,
    orderCount: selected.length,
    productCount: products.length,
    stockCount: products.reduce((sum, p) => sum + p.quantity, 0),
    lowStockCount: lowStock.length,
    lowStock: lowStock
      .slice(0, 8)
      .map(({ id, name, quantity }) => ({ id, name, quantity })),
    daily,
    statuses,
    topProducts: [...top.values()]
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5),
  };
}
module.exports = { buildDashboard };
