const rules = require('../shared/checkout-rules.json');
const { randomBytes, randomUUID, createHash } = require('node:crypto');

/** مسیرهای خرید آزمایشی؛ قیمت و موجودی از DB گرفته می‌شوند و هیچ مبلغ یا وضعیت ارسالی مشتری معتبر فرض نمی‌شود. */
function registerOrders(server, db, auth) {
  const fail = (res, status, message) => res.status(status).json({ code: 'ORDER_ERROR', message });
  const find = id => db.get('orders').find(order => String(order.id) === String(id)).value();
  const links = order => {
    const query = new URLSearchParams({ orderId: String(order.id), token: order.paymentToken });
    return { paymentUrl: `/payment?${query}`, resultUrl: `/payment/result?${query}` };
  };
  // خروجی مشتری عمداً فاقد نشانی و تلفن است؛ توکن فقط اجازهٔ دیدن/پرداخت همین سفارش آزمایشی را می‌دهد.
  const summary = order => ({ id: order.id, totalPrice: order.totalPrice, itemsCount: order.itemsCount,
    paymentStatus: order.paymentStatus, status: order.status, paidAt: order.paidAt,
    createdAt: order.createdAt, items: order.items.map(({ lineId, quantity }) => ({ lineId, quantity })), ...links(order) });
  const authorized = (req, order) => order && typeof req.query.token === 'string' && req.query.token === order.paymentToken;
  const digits = value => String(value ?? '').replace(/[۰-۹]/g, c => String(c.charCodeAt(0) - 1776)).replace(/[٠-٩]/g, c => String(c.charCodeAt(0) - 1632));
  const validText = (value, min, max) => typeof value === 'string' && value.trim().length >= min && value.trim().length <= max;
  // همهٔ نوشتن‌های سفارش از snapshot استفاده می‌کنند؛ خطای دیسک نباید حافظه را جلوتر از DB ببرد.
  const persist = state => {
    const previous = db.getState();
    try { db.setState(state).write(); } catch (error) { db.setState(previous); throw error; }
  };

  /** قیمت snapshot سفارش تثبیت می‌شود؛ پرداخت مجدداً موجودی را بررسی می‌کند، نه مبلغ مرورگر را. */
  server.post('/orders', (req, res) => {
    const { customer, delivery, items, requestId } = req.body || {};
    if (!validText(requestId, 20, 100) || !customer || !delivery || !Array.isArray(items) || !items.length || items.length > rules.maximumOrderLines)
      return fail(res, 422, 'اطلاعات سفارش کامل نیست.');
    const fingerprint = createHash('sha256').update(JSON.stringify({ customer, delivery, items })).digest('hex');
    const existing = db.get('orders').find({ requestId }).value();
    if (existing) return existing.fingerprint === fingerprint ? res.json({ id: existing.id, ...links(existing) }) : fail(res, 409, 'شناسهٔ درخواست قبلاً برای سفارش دیگری استفاده شده است.');
    const date = new Date(`${delivery.deliveryDate}T00:00:00`);
    const minimum = new Date(); minimum.setHours(0, 0, 0, 0); minimum.setDate(minimum.getDate() + rules.minimumDeliveryDays);
    if (!validText(customer.fullName, 3, 80) || !/^09\d{9}$/.test(digits(customer.mobile)) ||
        !/^\d{10}$/.test(digits(delivery.postalCode)) || !validText(delivery.address, 10, 300) ||
        !validText(delivery.plaque, 1, 10) || (delivery.unit != null && !validText(delivery.unit, 0, 10)) ||
        (delivery.note != null && !validText(delivery.note, 0, 500)) ||
        !Number.isFinite(delivery.latitude) || Math.abs(delivery.latitude) > 90 ||
        !Number.isFinite(delivery.longitude) || Math.abs(delivery.longitude) > 180 ||
        !/^\d{4}-\d{2}-\d{2}$/.test(delivery.deliveryDate) || !Number.isFinite(date.getTime()) ||
        `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}` !== delivery.deliveryDate || date < minimum ||
        !rules.deliveryTimeSlots.includes(delivery.deliveryTime))
      return fail(res, 422, 'اطلاعات تماس، نشانی یا زمان تحویل معتبر نیست.');
    const lines = [], seen = new Set(), totals = new Map();
    for (const item of items) {
      if (!item || typeof item !== 'object') return fail(res, 422, 'اطلاعات محصول معتبر نیست.');
      const product = db.get('products').find({ id: item.productId }).value();
      const variant = product?.variants?.find(v => v.id === item.variantId);
      const lineId = `${item.productId}:${item.variantId}`;
      if (!variant || seen.has(lineId) || !Number.isSafeInteger(item.quantity) || item.quantity < 1 || item.quantity > variant.quantity)
        return fail(res, 409, 'موجودی یا رنگ یکی از محصولات تغییر کرده است؛ سبد را دوباره بررسی کنید.');
      if (!Number.isFinite(product.price) || product.price < 0) return fail(res, 409, 'قیمت محصول معتبر نیست.');
      // قیمت مورد انتظار فقط برای تشخیص تغییر است؛ مبلغ نهایی همچنان از DB محاسبه می‌شود.
      if (item.unitPrice !== product.price) return fail(res, 409, 'قیمت محصول تغییر کرده است؛ سبد را دوباره بررسی کنید.');
      seen.add(lineId); totals.set(product.id, (totals.get(product.id) || 0) + item.quantity);
      if (totals.get(product.id) > product.quantity) return fail(res, 409, 'موجودی کل محصول کافی نیست.');
      lines.push({ lineId, productId: product.id, variantId: variant.id, name: product.name,
        thumbnail: product.thumbnail || product.images?.[0] || '', colorName: variant.name, colorHex: variant.hex,
        unitPrice: product.price, quantity: item.quantity, totalPrice: product.price * item.quantity });
    }
    const subtotal = lines.reduce((sum, item) => sum + item.totalPrice, 0);
    if (!Number.isFinite(subtotal)) return fail(res, 422, 'مبلغ سفارش معتبر نیست.');
    const order = { id: randomUUID(), requestId, fingerprint, paymentToken: randomBytes(32).toString('hex'),
      customer: { fullName: customer.fullName.trim(), mobile: digits(customer.mobile) },
      delivery: { address: delivery.address.trim(), postalCode: digits(delivery.postalCode), plaque: delivery.plaque.trim(),
        unit: delivery.unit?.trim(), note: delivery.note?.trim(), latitude: delivery.latitude, longitude: delivery.longitude,
        deliveryDate: delivery.deliveryDate, deliveryTime: delivery.deliveryTime },
      items: lines, itemsCount: lines.reduce((sum, item) => sum + item.quantity, 0), subtotal, shippingCost: rules.shippingCost, totalPrice: subtotal + rules.shippingCost,
      status: 'pending', paymentStatus: 'pending', paidAt: null, deliveredAt: null, createdAt: Date.now() };
    const state = structuredClone(db.getState());
    state.orders.push(order);
    persist(state);
    res.status(201).json({ id: order.id, ...links(order) });
  });

  server.get('/payments/:id', (req, res) => {
    res.set('Cache-Control', 'no-store');
    const order = find(req.params.id);
    if (!authorized(req, order)) return fail(res, 404, 'لینک پرداخت معتبر نیست.');
    res.json(summary(order));
  });

  /** FileSync یک snapshot شامل سفارش و محصولات می‌نویسد؛ در این سرور تک‌پردازشی بین بررسی و ثبت، await وجود ندارد. */
  server.post('/payments/:id/complete', (req, res) => {
    res.set('Cache-Control', 'no-store');
    const order = find(req.params.id);
    if (!authorized(req, order)) return fail(res, 404, 'لینک پرداخت معتبر نیست.');
    if (!['paid', 'failed'].includes(req.body?.outcome)) return fail(res, 422, 'نتیجهٔ پرداخت معتبر نیست.');
    // پاسخ تکراری همان نتیجهٔ قبلی است؛ شکست دیررس نیز نمی‌تواند پرداخت موفق را تغییر دهد.
    if (order.paymentStatus !== 'pending') return res.json(summary(order));
    const state = structuredClone(db.getState());
    const target = state.orders.find(o => o.id === order.id);
    if (req.body.outcome === 'paid') {
      for (const line of target.items) {
        const product = state.products.find(p => p.id === line.productId);
        const variant = product?.variants?.find(v => v.id === line.variantId);
        if (!variant || variant.quantity < line.quantity || product.quantity < line.quantity)
          return fail(res, 409, 'موجودی کافی نیست. به سبد برگردید و سفارش را دوباره بررسی کنید.');
        variant.quantity -= line.quantity; product.quantity -= line.quantity;
      }
      target.paymentStatus = 'paid'; target.paidAt = Date.now(); target.status = 'processing';
    } else target.paymentStatus = 'failed';
    persist(state);
    res.json(summary(target));
  });

  /** تحویل فقط برای سفارش پرداخت‌شده مجاز است و تکرار درخواست زمان اولین تحویل را حفظ می‌کند. */
  server.post('/orders/:id/deliver', auth.requireAdmin, (req, res) => {
    const order = find(req.params.id);
    if (!order) return fail(res, 404, 'سفارش پیدا نشد.');
    if (order.paymentStatus !== 'paid' || order.status === 'cancelled') return fail(res, 409, 'فقط سفارش پرداخت‌شده و لغونشده قابل تحویل است.');
    if (order.status !== 'delivered') {
      const state = structuredClone(db.getState());
      Object.assign(state.orders.find(o => o.id === order.id), { status: 'delivered', deliveredAt: Date.now() });
      persist(state);
    }
    res.json(find(order.id));
  });
}
module.exports = { registerOrders };
