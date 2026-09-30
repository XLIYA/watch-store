const {test} = require('node:test');
const assert = require('node:assert/strict');
const {loadTs} = require('./load-ts.cjs');

test('card groups preserve leading zeroes and all supported digit alphabets', () => {
  const {formatCardNumber, parseCardHistory} = loadTs('src/features/checkout/card-history.ts');
  assert.equal(formatCardNumber('٤٢٤٢٤٢٤٢٤٢٤٢٤٢٤٢'), '۴۲۴۲ ۴۲۴۲ ۴۲۴۲ ۴۲۴۲');
  assert.equal(formatCardNumber('0123456789012345'), '۰۱۲۳ ۴۵۶۷ ۸۹۰۱ ۲۳۴۵');
  assert.equal(formatCardNumber('bad'), 'bad');
  assert.deepEqual(parseCardHistory('broken JSON'), []);
  assert.deepEqual(parseCardHistory('["4242424242424242","4242424242424242","invalid"]'), ['4242424242424242']);
});

test('delivery date uses the Persian calendar and preserves the requested day', () => {
  const {deliveryLabel} = loadTs('src/features/admin/orders/delivery-label.ts');
  assert.equal(deliveryLabel('2026-10-07','11:00'), '۱۴۰۵/۰۷/۱۵ · ساعت ۱۱:۰۰');
  assert.equal(deliveryLabel('2026-02-31','11:00'), 'زمان تحویل مشخص نشده');
});

test('undelivered filter includes every non-delivered status rather than pending alone', async () => {
  let params;
  const {getAdminOrders} = loadTs('src/services/orders.service.ts', {
    '@/config/api': {endpoints:{orders:'/orders'}},
    '@/services/api/api-client': {apiClient:{get:async (_url, config) => {params=config.params;return {data:[],headers:{'x-total-count':'0'}};}}},
  });
  await getAdminOrders({status:'not_delivered'});
  assert.equal(params.status_ne, 'delivered');
  assert.equal(params.status, undefined);
});
