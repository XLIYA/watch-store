const { test } = require("node:test");
const assert = require("node:assert/strict");
const { loadTs } = require("./load-ts.cjs");
const {
  inventoryPatch,
  discardInventoryField,
  changedInventoryIds,
  saveInventoryQueue,
} = loadTs("src/features/admin/products/inventory-draft.ts");

const colorStock = {
  price: 10, quantity: 10,
  variants: [
    { id: "black", name: "Black", hex: "#111111", quantity: 6 },
    { id: "silver", name: "Silver", hex: "#aaaaaa", quantity: 4 },
  ],
};

test("total and color stock form one patch without mutating the server snapshot", () => {
  const patch = inventoryPatch({ original: colorStock, values: { quantity: "100", "variant:black": "60", "variant:silver": "40" } });
  assert.equal(patch.quantity, 100);
  assert.deepEqual(patch.variants.map(item => item.quantity), [60, 40]);
  assert.deepEqual(colorStock.variants.map(item => item.quantity), [6, 4]);
  assert.equal(patch.price, undefined);
});

test("stock can be redistributed between colors without changing the total", () => {
  const patch = inventoryPatch({ original: colorStock, values: { "variant:black": "7", "variant:silver": "3" } });
  assert.equal(patch.quantity, undefined);
  assert.deepEqual(patch.variants.map(item => item.quantity), [7, 3]);
  assert.deepEqual(changedInventoryIds({ 1: { original: colorStock, values: { "variant:black": "6" } } }), []);
});

test("Escape on a color preserves other colors, price and total drafts", () => {
  const drafts = { 1: { original: colorStock, values: { price: "20", quantity: "11", "variant:black": "7", "variant:silver": "5" } } };
  const next = discardInventoryField(drafts, 1, "variant:silver");
  assert.deepEqual(inventoryPatch(next[1]), { price: 20, quantity: 11, variants: [{ ...colorStock.variants[0], quantity: 7 }, colorStock.variants[1]] });
  assert.equal(drafts[1].values["variant:silver"], "5");
});

test("invalid color stock is not sent and does not prevent saving another product", async () => {
  for (const value of ["", "-1", "1.5", "Infinity", "5"]) {
    assert.throws(() => inventoryPatch({ original: colorStock, values: { "variant:black": value } }));
  }
  const saved = [], failed = [];
  await saveInventoryQueue({
    1: { original: colorStock, values: { quantity: "100" } },
    2: { original: colorStock, values: { quantity: "100", "variant:black": "60", "variant:silver": "40" } },
  }, async (id, patch) => { saved.push(id); assert.equal(patch.variants.reduce((sum, item) => sum + item.quantity, 0), patch.quantity); }, () => {}, id => failed.push(id));
  assert.deepEqual(saved, [2]);
  assert.deepEqual(failed, [1]);
});

test("Escape discards one field while preserving another changed field", () => {
  const next = discardInventoryField(
    {
      1: {
        original: { price: 10, quantity: 4, variants: [{ id: "black", name: "Black", hex: "#111111", quantity: 4 }] },
        values: { price: "20", quantity: "3" },
      },
    },
    1,
    "quantity",
  );
  assert.deepEqual(inventoryPatch(next[1]), { price: 20 });
  assert.deepEqual(changedInventoryIds(next), [1]);
  assert.deepEqual(discardInventoryField(next, 1, "price"), {});
});
test("unchanged values are clean and empty or fractional stock stays invalid", () => {
  assert.deepEqual(
    changedInventoryIds({
      1: { original: { price: 10, quantity: 4, variants: [{ id: "black", name: "Black", hex: "#111111", quantity: 4 }] }, values: { price: "10" } },
    }),
    [],
  );
  for (const quantity of ["", "-1", "1.5", "Infinity"]) {
    assert.throws(() =>
      inventoryPatch({
        original: { price: 10, quantity: 4, variants: [{ id: "black", name: "Black", hex: "#111111", quantity: 4 }] },
        values: { quantity },
      }),
    );
  }
});
test("save requests run serially and one failure leaves later rows saveable", async () => {
  const draft = {
    original: { price: 10, quantity: 4, variants: [{ id: "black", name: "Black", hex: "#111111", quantity: 4 }] },
    values: { price: "20" },
  };
  const events = [];
  let active = 0;
  await saveInventoryQueue(
    { 1: draft, 2: draft, 3: draft },
    async (id) => {
      active++;
      assert.equal(active, 1);
      events.push(`start${id}`);
      await new Promise((resolve) => setTimeout(resolve, 5));
      active--;
      if (id === 2) throw new Error("Offline");
      events.push(`end${id}`);
    },
    (id) => events.push(`saved${id}`),
    (id) => events.push(`failed${id}`),
  );
  assert.deepEqual(events, [
    "start1",
    "end1",
    "saved1",
    "start2",
    "failed2",
    "start3",
    "end3",
    "saved3",
  ]);
});
