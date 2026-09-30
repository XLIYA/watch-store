const { test } = require('node:test');
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const { createServer } = require('../server/server');
const { loadTs } = require('./load-ts.cjs');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

async function fixture(t, persistent = false) {
  const data = { products: [{ id: 1, name: 'Test watch', price: 100, quantity: 5, variants: [{ id: 'black', name: 'Black', hex: '#000000', quantity: 3 }, { id: 'white', name: 'White', hex: '#ffffff', quantity: 2 }] }], orders: [], users: [{ id: 1, username: 'fixture-admin', password: 'fixture-password', role: 'admin' }] };
  const directory = persistent ? fs.mkdtempSync(path.join(os.tmpdir(), 'watch-order-test-')) : null;
  const dbPath = directory ? path.join(directory, 'db.json') : data;
  if (directory) fs.writeFileSync(dbPath, JSON.stringify(data));
  let server = createServer({ dbPath, quiet: true }).listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  t.after(async () => {
    await new Promise(resolve => { server.closeAllConnections(); server.close(resolve); });
    if (directory) { fs.unlinkSync(dbPath); fs.rmdirSync(directory); }
  });
  const restart = async () => {
    await new Promise(resolve => { server.closeAllConnections(); server.close(resolve); });
    server = createServer({ dbPath, quiet: true }).listen(0, '127.0.0.1');
    await new Promise(resolve => server.once('listening', resolve));
  };
  const request = async (path, body, cookie) => {
    const response = await fetch(`http://127.0.0.1:${server.address().port}${path}`, { method: body ? 'POST' : 'GET', headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'watch-store', ...(cookie ? { Cookie: cookie } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) });
    return { status: response.status, data: await response.json(), response };
  };
  const day = new Date(); day.setDate(day.getDate() + 14);
  let payloadIndex = 0;
const payload = () => { const dayForOrder = new Date(day); dayForOrder.setDate(dayForOrder.getDate() + payloadIndex++); return ({ requestId: randomUUID(), customer: { fullName: 'Test Customer', mobile: '09123456789' }, delivery: { postalCode: '1234567890', address: 'Test delivery address', plaque: '1', latitude: 35, longitude: 51, deliveryDate: `${dayForOrder.getFullYear()}-${String(dayForOrder.getMonth()+1).padStart(2,'0')}-${String(dayForOrder.getDate()).padStart(2,'0')}`, deliveryTime: '11:00' }, items: [{ productId: 1, variantId: 'black', quantity: 2, unitPrice: 100 }] }); };
  const create = async (body = payload()) => {
    const result = await request('/orders', body);
    assert.equal(result.status, 201, JSON.stringify(result.data));
    const url = new URL(result.data.paymentUrl, 'http://test.local');
    return { ...result.data, token: url.searchParams.get('token') };
  };
  const credentials = new Map();
  const payment = async (order, outcome) => {
    if (outcome === 'paid' && !credentials.has(order.id)) credentials.set(order.id, (async () => {
      const info = await request(`/payments/${order.id}?token=${order.token}`);
      const code = await request(`/payments/${order.id}/code?token=${order.token}`, {kind: 'pin'});
      const year = new Intl.DateTimeFormat('en-US-u-ca-persian', {year: 'numeric'}).formatToParts(new Date()).find(p => p.type === 'year').value;
      return { cardNumber: '4242424242424242', cvv: '123', month: '12', year: String((Number(year)+1) % 100).padStart(2, '0'), captcha: info.data.captcha, pin: code.data.code, email: '' };
    })());
    const fields = outcome === 'paid' ? await credentials.get(order.id) : undefined;
    return request(`/payments/${order.id}${outcome ? '/complete' : ''}?token=${order.token}`, outcome ? { outcome, fields } : undefined);
  };
  const login = async () => {
    const { response } = await request('/auth/login', { username: 'fixture-admin', password: 'fixture-password' });
    return response.headers.getSetCookie().map(c => c.split(';')[0]).join('; ');
  };
  const rewrite = async edit => {
    const snapshot = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    edit(snapshot);
    fs.writeFileSync(dbPath, JSON.stringify(snapshot));
    await restart();
  };
  return { request, payload, create, payment, login, restart, rewrite };
}

test('delivery capacity serializes simultaneous bookings and releases a cancelled slot', async t => {
  const f = await fixture(t), body = f.payload();
  const responses = await Promise.all([
    f.request('/orders', body),
    f.request('/orders', {...body, requestId: randomUUID()}),
  ]);
  assert.deepEqual(responses.map(r => r.status).sort(), [201,409]);
  const booked = responses.find(r => r.status === 201).data;
  const order = {...booked, token: new URL(booked.paymentUrl, 'http://test').searchParams.get('token')};
  const available = (await f.request('/delivery/availability')).data;
  assert.deepEqual(available.unavailable[body.delivery.deliveryDate], [body.delivery.deliveryTime]);
  assert.equal(JSON.stringify(available).includes(body.customer.mobile), false);
  await f.payment(order, 'failed');
  assert.equal((await f.request('/delivery/availability')).data.unavailable[body.delivery.deliveryDate], undefined);
  assert.equal((await f.request('/orders', {...body, requestId:randomUUID()})).status, 201);
});

test('expired reservations release capacity while paid orders keep their delivery slot', async t => {
  const f = await fixture(t, true), body = f.payload(), order = await f.create(body);
  await f.rewrite(data => {data.orders[0].expiresAt = Date.now()-1;});
  assert.equal((await f.request('/delivery/availability')).data.unavailable[body.delivery.deliveryDate], undefined);
  const replacement = await f.create({...body, requestId:randomUUID()});
  await f.payment(replacement, 'paid');
  await f.rewrite(data => {data.orders.find(o => o.id === replacement.id).expiresAt = Date.now()-1;});
  assert.deepEqual((await f.request('/delivery/availability')).data.unavailable[body.delivery.deliveryDate], [body.delivery.deliveryTime]);
  assert.equal((await f.request('/orders', {...body, requestId:randomUUID()})).status, 409);
  assert.equal((await f.payment(order)).data.paymentStatus, 'failed');
});

test('all configured hours make a day unavailable; one released hour reopens it', () => {
  const {deliveryAvailability} = require('../server/delivery-capacity');
  const {deliveryTimeSlots} = require('../shared/checkout-rules.json');
  const orders = deliveryTimeSlots.map(deliveryTime => ({paymentStatus:'paid',status:'processing',delivery:{deliveryDate:'2026-10-15',deliveryTime}}));
  assert.deepEqual(deliveryAvailability(orders).fullyBookedDates, ['2026-10-15']);
  orders[0].status = 'cancelled';
  assert.deepEqual(deliveryAvailability(orders).fullyBookedDates, []);
});

test('card validation handles Persian digits, checksum, expiry and optional email', () => {
  const { validatePaymentFields } = require('../shared/payment-validation');
  const valid = { cardNumber: '۴۲۴۲ ۴۲۴۲ ۴۲۴۲ ۴۲۴۲', cvv: '۱۲۳', month: '۱۲', year: '۱۰', captcha: '۱۲۳۴۵', pin: '۱۲۳۴۵۶', email: '' };
  const now = new Date('2026-09-30');
  assert.deepEqual(validatePaymentFields(valid, now), {});
  assert.ok(validatePaymentFields({...valid, year: '۱۴۱۰'}, now).year);
  assert.ok(validatePaymentFields({...valid, month: '۱'}, now).month);
  for (const [key, value] of Object.entries({cardNumber:'4242424242424241', cvv:'ab1', month:'13', year:'1400', captcha:'1234', pin:'123', email:'invalid'}))
    assert.ok(validatePaymentFields({...valid, [key]:value}, now)[key]);
});

test('gateway rejects missing fields, wrong captcha and wrong pin; renewed captcha invalidates previous code', async t => {
  const f = await fixture(t), order = await f.create();
  const base = `/payments/${order.id}`, query = `?token=${order.token}`;
  assert.equal((await f.request(base+'/complete'+query, {outcome:'paid'})).status, 422);
  const info = (await f.payment(order)).data;
  assert.match(info.orderNumber, /^\d{8}$/);
  const pin = (await f.request(base+'/code'+query, {kind:'pin'})).data.code;
  assert.equal((await f.request(base+'/code'+query, {kind:'pin'})).status, 429);
  const fields = {cardNumber:'4242424242424242',cvv:'123',month:'12',year:'10',captcha:info.captcha,pin,email:''};
  const changed = (await f.request(base+'/code'+query, {kind:'captcha'})).data.code;
  fields.captcha = changed === '11111' ? '22222' : '11111';
  assert.equal((await f.request(base+'/complete'+query, {outcome:'paid',fields})).status, 422);
  fields.captcha = changed;
  assert.equal((await f.request(base+'/complete'+query, {outcome:'paid',fields:{...fields,pin:pin==='111111'?'222222':'111111'}})).status, 422);
  assert.equal((await f.request(base+'/complete'+query, {outcome:'paid',fields})).data.paymentStatus, 'paid');
  const saved = (await f.request('/orders/'+order.id, undefined, await f.login())).data;
  assert.equal(saved.cardNumber, undefined);
  assert.equal(saved.cvv, undefined);
  assert.equal(saved.pinHash, undefined);
  assert.equal(saved.fields, undefined);
});

test('abandoned sessions expire without reducing stock and cannot later be paid', async t => {
  const f = await fixture(t, true), order = await f.create();
  await f.rewrite(data => { data.orders[0].expiresAt = Date.now()-1; });
  const result = await f.payment(order);
  assert.equal(result.data.paymentStatus, 'failed');
  assert.equal(result.data.failureReason, 'expired');
  assert.equal((await f.payment(order, 'paid')).data.paymentStatus, 'failed');
  assert.equal((await f.request('/products/1')).data.quantity, 5);
});

test('expired payment codes are rejected while the session remains unpaid', async t => {
  const f = await fixture(t, true), order = await f.create();
  const base = `/payments/${order.id}`, query = `?token=${order.token}`;
  const info = (await f.payment(order)).data;
  const pin = (await f.request(base+'/code'+query, {kind:'pin'})).data.code;
  await f.rewrite(data => { data.orders[0].codeExpiresAt = Date.now()-1; });
  const response = await f.request(base+'/complete'+query, {outcome:'paid', fields:{cardNumber:'4242424242424242',cvv:'123',month:'12',year:'10',captcha:info.captcha,pin,email:''}});
  assert.equal(response.status, 422);
  assert.equal((await f.payment(order)).data.paymentStatus, 'pending');
});

test('payment links, result and stock survive backend restart', async t => {
  const f = await fixture(t, true), order = await f.create();
  await f.restart();
  assert.equal((await f.payment(order)).data.paymentStatus, 'pending');
  await f.payment(order, 'paid');
  await f.restart();
  assert.equal((await f.payment(order)).data.paymentStatus, 'paid');
  await f.payment(order, 'paid');
  assert.equal((await f.request('/products/1')).data.quantity, 3);
});

test('checkout validates selection and contact data, calculates totals and deduplicates retries', async t => {
  const f = await fixture(t), body = f.payload();
  body.totalPrice = 1; body.paymentStatus = 'paid';
  const order = await f.create(body);
  const repeat = await f.request('/orders', body);
  assert.equal(repeat.data.id, order.id);
  const result = await f.payment(order);
  assert.equal(result.data.totalPrice, 200);
  assert.equal(result.data.paymentStatus, 'pending');
  assert.equal(result.data.customer, undefined);
  assert.equal(result.data.delivery, undefined);
  assert.equal((await f.request('/orders', { ...body, customer: { ...body.customer, fullName: 'Changed Customer' } })).status, 409);
  for (const modify of [p => p.items[0].quantity = 0, p => p.items[0].quantity = 4, p => p.items.push(p.items[0]), p => p.items[0].unitPrice = 1, p => p.customer.mobile = '123', p => p.delivery.deliveryDate = '2027-02-31', p => p.items = [null], p => p.delivery.unit = 0, p => p.delivery.note = false]) {
    const invalid = f.payload(); modify(invalid);
    assert.ok([409, 422].includes((await f.request('/orders', invalid)).status));
  }
});

test('success consumes stock once, repeated and conflicting callbacks cannot change it', async t => {
  const f = await fixture(t), order = await f.create();
  const responses = await Promise.all([f.payment(order, 'paid'), f.payment(order, 'paid')]);
  assert.ok(responses.every(r => r.status === 200));
  const product = (await f.request('/products/1')).data;
  assert.equal(product.quantity, 3);
  assert.equal(product.variants[0].quantity, 1);
  const paid = await f.payment(order);
  assert.equal(paid.data.paymentStatus, 'paid');
  const delayedFailure = await f.payment(order, 'failed');
  assert.equal(delayedFailure.data.paymentStatus, 'paid');
  assert.equal(delayedFailure.data.paidAt, paid.data.paidAt);
  assert.equal((await f.request(`/payments/${order.id}?token=wrong`)).status, 404);
  assert.equal((await f.request(`/orders/${order.id}`)).status, 401);
});

test('cancellation preserves stock and cannot later become success; insufficient stock is all-or-nothing', async t => {
  const f = await fixture(t);
  const cancelled = await f.create();
  assert.equal((await f.payment(cancelled, 'failed')).data.paymentStatus, 'failed');
  assert.equal((await f.payment(cancelled, 'paid')).data.paymentStatus, 'failed');
  assert.equal((await f.request('/products/1')).data.quantity, 5);
  const first = await f.create();
  const body = f.payload(); body.items.push({ productId: 1, variantId: 'white', quantity: 2, unitPrice: 100 });
  const second = await f.create(body);
  await f.payment(first, 'paid');
  assert.equal((await f.payment(second, 'paid')).status, 409);
  const product = (await f.request('/products/1')).data;
  assert.equal(product.quantity, 3);
  assert.equal(product.variants[1].quantity, 2);
  assert.equal((await f.payment(second)).data.paymentStatus, 'pending');
});

test('delivery requires an admin and a paid order, and preserves the first timestamp', async t => {
  const f = await fixture(t), order = await f.create();
  assert.equal((await f.request(`/orders/${order.id}/deliver`, {})).status, 401);
  const cookie = await f.login();
  assert.equal((await f.request(`/orders/${order.id}/deliver`, {}, cookie)).status, 409);
  await f.payment(order, 'paid');
  const first = await f.request(`/orders/${order.id}/deliver`, {}, cookie);
  assert.equal(first.data.status, 'delivered'); assert.ok(first.data.deliveredAt);
  assert.equal((await f.request(`/orders/${order.id}/deliver`, {}, cookie)).data.deliveredAt, first.data.deliveredAt);
});

test('paid cart settlement is repeat-safe and preserves unrelated and newer purchases', () => {
  const { default: reducer, hydrateCart, settlePayment } = loadTs('src/features/cart/cart.slice.ts');
  const line = { lineId: '1:black', productId: 1, variantId: 'black', quantity: 3, maxQuantity: 5, addedAt: 10 };
  let state = reducer(undefined, hydrateCart([line, { ...line, lineId: '2:white', productId: 2 }]));
  const payment = { id: 'paid-order', createdAt: 20, items: [{ lineId: '1:black', quantity: 2 }] };
  state = reducer(state, settlePayment(payment));
  assert.equal(state.items[0].quantity, 1); assert.equal(state.items[1].quantity, 3);
  assert.deepEqual(reducer(state, settlePayment(payment)), state);
  const newer = reducer(undefined, hydrateCart([{ ...line, addedAt: 30 }]));
  assert.equal(reducer(newer, settlePayment(payment)).items[0].quantity, 3);
  const restored = reducer(undefined, hydrateCart(state));
  assert.deepEqual(reducer(restored, settlePayment(payment)), state);
});
