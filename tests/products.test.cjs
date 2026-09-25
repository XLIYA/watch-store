const { test } = require("node:test");
const assert = require("node:assert/strict");
const { createServer } = require("../server/server");

test("admin CRUD validates grouping and numbers, sanitizes HTML and persists inventory", async (t) => {
  const source = structuredClone(require("../server/db.json"));
  source.users = [
    {
      id: 1,
      username: "catalog-test",
      password: "test-password",
      role: "admin",
      name: "Test",
    },
  ];
  const server = createServer({ dbPath: source, quiet: true }).listen(
    0,
    "127.0.0.1",
  );
  await new Promise((resolve) => server.once("listening", resolve));
  t.after(
    () =>
      new Promise((resolve) => {
        server.closeAllConnections();
        server.close(resolve);
      }),
  );
  const base = `http://127.0.0.1:${server.address().port}`;
  let cookie = "";
  const request = (route, method = "GET", body) =>
    fetch(base + route, {
      method,
      headers: {
        "X-Requested-With": "watch-store",
        "Content-Type": "application/json",
        Cookie: cookie,
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
  const login = await request("/auth/login", "POST", {
    username: "catalog-test",
    password: "test-password",
  });
  cookie = login.headers
    .getSetCookie()
    .map((value) => value.split(";")[0])
    .join("; ");
  const payload = { ...source.products[0] };
  delete payload.id;
  delete payload.createdAt;
  delete payload.soldCount;
  payload.slug = "regression-watch";
  payload.description = "<p>Safe</p><script>alert(1)</script>";
  payload.quantity = payload.variants.reduce((sum, variant) => sum + variant.quantity, 0);
  // نمونهٔ کاربر: ثبت ۱۰۰ عدد بدون تخصیص موجودی رنگ‌ها باید در API هم رد شود.
  for (const quantities of [[0, 0], [40, 50], [60, 50]]) {
    const variants = quantities.map((quantity, index) => ({
      id: `color-${index}`, name: `Color ${index}`, hex: "#111111", quantity,
    }));
    assert.equal((await request("/products", "POST", { ...payload, quantity: 100, variants })).status, 422);
  }
  const invalid = await request("/products", "POST", {
    ...payload,
    quantity: -1,
  });
  assert.equal(invalid.status, 422);
  const mismatch = source.subcategory.find(
    (group) => group.category !== payload.category,
  );
  assert.equal(
    (
      await request("/products", "POST", {
        ...payload,
        subcategory: mismatch.id,
      })
    ).status,
    422,
  );
  const create = await request("/products", "POST", payload);
  assert.equal(create.status, 201);
  const saved = await create.json();
  assert.ok(saved.id);
  assert.ok(saved.createdAt);
  assert.equal(saved.description, "<p>Safe</p>");
  assert.equal((await request("/products", "POST", payload)).status, 422);
  for (const method of ["PATCH", "PUT"]) {
    assert.equal((await request(`/products/${saved.id}`, method, { quantity: payload.quantity + 2 })).status, 422);
  }
  const patch = await request(`/products/${saved.id}`, "PATCH", {
    price: 12345,
    quantity: payload.quantity + 2,
    variants: payload.variants.map((variant, index) => ({ ...variant, quantity: variant.quantity + (index === 0 ? 2 : 0) })),
  });
  assert.equal(patch.status, 200);
  const updated = await (await request(`/products/${saved.id}`)).json();
  assert.equal(updated.price, 12345);
  assert.equal(updated.quantity, payload.quantity + 2);
  assert.equal(updated.soldCount, 0);
  const replacement = await request(`/products/${saved.id}`, "PUT", {
    price: 13000,
  });
  assert.equal(replacement.status, 200);
  const replaced = await replacement.json();
  assert.equal(replaced.name, payload.name);
  assert.equal(replaced.createdAt, saved.createdAt);
  assert.equal(replaced.price, 13000);
  assert.equal((await request(`/products/${saved.id}`, "DELETE")).status, 200);
  assert.equal((await request(`/products/${saved.id}`)).status, 404);
});

test("image upload requires authentication, validates limits and serves JPEG bytes", async (t) => {
  const fs = require("node:fs/promises");
  const path = require("node:path");
  const os = require("node:os");
  const sharp = require("sharp");
  const rules = require("../shared/product-rules.json");
  const uploadDir = await fs.mkdtemp(
    path.join(os.tmpdir(), "watch-upload-test-"),
  );
  const source = {
    users: [
      {
        id: 1,
        username: "upload-test",
        password: "test-password",
        role: "admin",
      },
    ],
  };
  const server = createServer({
    dbPath: source,
    uploadDir,
    quiet: true,
  }).listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  t.after(async () => {
    await new Promise((resolve) => {
      server.closeAllConnections();
      server.close(resolve);
    });
    // پوشهٔ یکتای ساخته‌شده توسط همین تست فقط فایل‌های آپلود آزمایشی را دارد.
    for (const filename of await fs.readdir(uploadDir))
      await fs.unlink(path.join(uploadDir, filename));
    await fs.rmdir(uploadDir);
  });
  const base = `http://127.0.0.1:${server.address().port}`;
  const jpeg = await sharp({
    create: { width: 8, height: 8, channels: 3, background: "#191b19" },
  })
    .jpeg()
    .toBuffer();
  const upload = (bytes, type, cookie = "") => {
    const form = new FormData();
    form.append("image", new Blob([bytes], { type }), "sample.jpg");
    return fetch(`${base}/upload`, {
      method: "POST",
      headers: { "X-Requested-With": "watch-store", Cookie: cookie },
      body: form,
    });
  };
  assert.equal((await upload(jpeg, rules.imageMime)).status, 401);
  const login = await fetch(`${base}/auth/login`, {
    method: "POST",
    headers: {
      "X-Requested-With": "watch-store",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: "upload-test",
      password: "test-password",
    }),
  });
  const cookie = login.headers
    .getSetCookie()
    .map((value) => value.split(";")[0])
    .join("; ");
  assert.equal((await upload(jpeg, "image/png", cookie)).status, 400);
  assert.equal(
    (
      await upload(
        Buffer.alloc(rules.maxImageBytes + 1),
        rules.imageMime,
        cookie,
      )
    ).status,
    400,
  );
  const response = await upload(jpeg, rules.imageMime, cookie);
  assert.equal(response.status, 200);
  const { image } = await response.json();
  const file = await fetch(base + image);
  assert.equal(file.status, 200);
  assert.match(file.headers.get("content-type"), /image\/jpeg/);
  assert.deepEqual(Buffer.from(await file.arrayBuffer()), jpeg);
});
