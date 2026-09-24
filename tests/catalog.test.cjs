const { test } = require("node:test");
const assert = require("node:assert/strict");
const { loadTs } = require("./load-ts.cjs");
test("home only fetches selected categories with six newest products", async () => {
  const calls = [];
  const { getFeaturedCollections } = loadTs("src/services/catalog.service.ts", {
    "./products.service": {
      getProducts: async (params) => {
        calls.push(params);
        return { data: [{ id: params.category }] };
      },
    },
  });
  const result = await getFeaturedCollections([
    { id: 1, featured: true },
    { id: 2, featured: false },
    { id: 3, featured: true },
  ]);
  assert.deepEqual(
    calls.map((value) => value.category),
    [1, 3],
  );
  assert.ok(
    calls.every((value) => value.limit === 6 && value.sort === "newest"),
  );
  assert.equal(result.length, 2);
});
test("group pagination has navigable encoded URLs and bounded page windows", () => {
  const { categoryHref, collectionPageHref, paginationWindow } = loadTs(
    "src/features/catalog/catalog-navigation.ts",
  );
  assert.equal(categoryHref("classic"), "/shop#collection-classic");
  assert.equal(
    collectionPageHref("automatic", 2, "newest"),
    "/collections/automatic?page=2&sort=newest",
  );
  assert.deepEqual(paginationWindow(1, 4), [1, 2, 3, 4]);
  assert.ok(paginationWindow(500, 10000).length <= 7);
});
