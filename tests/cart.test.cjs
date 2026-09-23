const { test } = require("node:test");
const assert = require("node:assert/strict");
const axios = require("axios");
const { loadTs } = require("./load-ts.cjs");
const item = { lineId: "1:black", productId: 1, variantId: "black", name: "Watch", quantity: 2, maxQuantity: 5, unitPrice: 100 };
const product = { id: 1, name: "Watch", price: 100, quantity: 5, variants: [{ id: "black", quantity: 5 }] };
function validator(getProductById) { return loadTs("src/features/checkout/validate-checkout-stock.ts", { "@/services/products.service": { getProductById } }).validateCheckoutStock; }

test("network/server failures reject validation without marking any cart line unavailable", async () => {
  const before = structuredClone(item);
  for (const error of [new Error("network"), new axios.AxiosError("server", "ERR_BAD_RESPONSE", undefined, undefined, { status: 500 })]) {
    await assert.rejects(() => validator(async () => { throw error; })([item]));
    assert.deepEqual(item, before);
  }
});
test("a confirmed 404 marks only the deleted product unavailable", async () => {
  const result = await validator(async id => {
    if (id === 2) throw new axios.AxiosError("missing", "ERR_BAD_REQUEST", undefined, undefined, { status: 404 });
    return product;
  })([item, { ...item, productId: 2, lineId: "2:black" }]);
  assert.deepEqual(result.unavailableItems.map(value => value.lineId), ["2:black"]);
  assert.equal(result.isValid, false);
});
test("each product is fetched once and total stock across variants is checked", async () => {
  let calls = 0;
  const result = await validator(async () => { calls++; return { ...product, quantity: 3, variants: [{ id: "black", quantity: 3 }, { id: "white", quantity: 3 }] }; })([item, { ...item, variantId: "white", lineId: "1:white" }]);
  assert.equal(calls, 1);
  assert.equal(result.productStockIssues[0].requestedQuantity, 4);
  assert.equal(result.isValid, false);
});
test("changed prices and reduced stock require another customer confirmation", async () => {
  const result = await validator(async () => ({ ...product, price: 200, quantity: 1 }))([item]);
  assert.equal(result.priceChangedItems[0].currentPrice, 200);
  assert.equal(result.reducedItems[0].availableQuantity, 1);
  assert.equal(result.isValid, false);
});
test("shared sync updates Redux only from completed validation", async () => {
  const { makeStore } = loadTs("src/store/store.ts");
  const { hydrateCart } = loadTs("src/features/cart/cart.slice.ts");
  const { syncCartStock } = loadTs("src/features/checkout/sync-cart-stock.ts");
  const store = makeStore(); store.dispatch(hydrateCart([item]));
  const result = await validator(async () => ({ ...product, price: 200, quantity: 1 }))([item]);
  syncCartStock(result, store.dispatch);
  assert.equal(store.getState().cart.items[0].quantity, 1);
  assert.equal(store.getState().cart.items[0].unitPrice, 200);
});
test("date parsing rejects rollover dates while preserving valid leap days", () => {
  const { parseIsoDate } = loadTs("src/features/checkout/delivery-date.ts");
  assert.equal(parseIsoDate("2025-02-29"), undefined);
  assert.equal(parseIsoDate("2026-13-01"), undefined);
  assert.ok(parseIsoDate("2024-02-29"));
});
