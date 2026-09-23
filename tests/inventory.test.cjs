const { test } = require("node:test");
const assert = require("node:assert/strict");
const { loadTs } = require("./load-ts.cjs");
const { inventoryPatch, discardInventoryField, changedInventoryIds, saveInventoryQueue } = loadTs("src/features/admin/products/inventory-draft.ts");

test("Escape discards one field while preserving another changed field", () => {
  const next = discardInventoryField({1:{original:{price:10,quantity:4},values:{price:"20",quantity:"3"}}},1,"quantity");
  assert.deepEqual(inventoryPatch(next[1]),{price:20});
  assert.deepEqual(changedInventoryIds(next),[1]);
  assert.deepEqual(discardInventoryField(next,1,"price"),{});
});
test("unchanged values are clean and empty or fractional stock stays invalid", () => {
  assert.deepEqual(changedInventoryIds({1:{original:{price:10,quantity:4},values:{price:"10"}}}),[]);
  for(const quantity of ["", "-1", "1.5", "Infinity"]){assert.throws(()=>inventoryPatch({original:{price:10,quantity:4},values:{quantity}}));}
});
test("save requests run serially and one failure leaves later rows saveable", async () => {
  const draft = {original:{price:10,quantity:4},values:{price:"20"}};
  const events=[];let active=0;
  await saveInventoryQueue({1:draft,2:draft,3:draft}, async id => {
    active++;assert.equal(active,1);events.push(`start${id}`);await new Promise(resolve=>setTimeout(resolve,5));active--;
    if(id===2)throw new Error("Offline");
    events.push(`end${id}`);
  },id=>events.push(`saved${id}`),id=>events.push(`failed${id}`));
  assert.deepEqual(events,["start1","end1","saved1","start2","failed2","start3","end3","saved3"]);
});
