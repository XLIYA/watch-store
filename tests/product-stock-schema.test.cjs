const { test } = require("node:test");
const assert = require("node:assert/strict");
const { loadTs } = require("./load-ts.cjs");
const { productSchema } = loadTs("src/features/admin/products/product.schema.ts");

test("shared add/edit schema requires exact allocation of total stock across colors", () => {
  const product = {
    name: "Watch", brand: "Test", slug: "test-watch", category: 1, subcategory: 1,
    description: "Description", price: 10, quantity: 100, isHero: false, heroOrder: null,
  };
  const variants = quantities => quantities.map((quantity, index) => ({
    id: `color-${index}`, name: `Color ${index}`, hex: "#111111", quantity,
  }));
  for (const quantities of [[], [0, 0], [40, 50], [60, 50]]) {
    const result = productSchema.safeParse({ ...product, variants: variants(quantities) });
    assert.equal(result.success, false);
    assert.ok(result.error.issues.some(issue => issue.path[0] === "quantity"));
  }
  for (const quantities of [[40, 60], [100, 0]]) {
    assert.equal(productSchema.safeParse({ ...product, variants: variants(quantities) }).success, true);
  }
  assert.equal(productSchema.safeParse({ ...product, quantity: 0, variants: variants([0, 0]) }).success, true);
});
