const { test } = require("node:test");
const assert = require("node:assert/strict");
const { NextRequest } = require("next/server");
const { loadTs } = require("./load-ts.cjs");
const { proxy } = loadTs("src/proxy.ts", {
  "@/config/api": { apiConfig: { baseURL: "https://backend.test", timeout: 1000 }, endpoints: { auth: { session: "/auth/session" } } },
});
const { adminDestination } = loadTs("src/features/auth/admin-destination.ts");
const request = (path, token) => new NextRequest(`https://store.test${path}`, { headers: token ? { cookie: `watch-store-access=${token}; unrelated=private` } : {} });

test("admin destination rejects external, login and escaped paths", () => {
  for (const value of [undefined, "https://evil.test", "//evil.test", "/admin/../../shop", "/administrator", "/admin/login", "/admin\\evil", "/shop"]) assert.equal(adminDestination(value), "/admin/orders");
  assert.equal(adminDestination("/admin/inventory?page=2"), "/admin/inventory?page=2");
});

test("public login bypasses authentication and missing access goes to recovery", async () => {
  assert.equal((await proxy(request("/admin/login"))).headers.get("x-middleware-next"), "1");
  const response = await proxy(request("/admin/products?page=2"));
  const location = new URL(response.headers.get("location"));
  assert.equal(location.pathname, "/auth/admin-session");
  assert.equal(location.searchParams.get("next"), "/admin/products?page=2");
});

test("proxy trusts only a successful backend admin session and forwards only access cookie", async t => {
  const fetchMock = t.mock.method(global, "fetch", async (url, options) => {
    assert.equal(url, "https://backend.test/auth/session");
    assert.deepEqual(options.headers, { Cookie: "watch-store-access=valid", Accept: "application/json" });
    assert.equal(options.cache, "no-store");
    assert.equal(options.redirect, "error");
    return Response.json({ user: { role: "admin" } });
  });
  const allowed = await proxy(request("/admin/inventory", "valid"));
  assert.equal(allowed.headers.get("x-middleware-next"), "1");
  assert.equal(allowed.headers.get("cache-control"), "private, no-store");
  for (const status of [401, 403]) {
    fetchMock.mock.mockImplementation(async () => new Response(null, { status }));
    const response = await proxy(request("/admin/orders", "invalid"));
    assert.equal(new URL(response.headers.get("location")).pathname, status === 401 ? "/auth/admin-session" : "/admin/login");
  }
  fetchMock.mock.mockImplementation(async () => Response.json({ user: { role: "user" } }));
  assert.equal(new URL((await proxy(request("/admin/orders", "nonadmin"))).headers.get("location")).pathname, "/admin/login");
  fetchMock.mock.mockImplementation(async () => { throw new Error("Offline"); });
  const offline = await proxy(request("/admin/orders", "valid"));
  assert.equal(offline.status, 503);
  assert.equal(offline.headers.get("set-cookie"), null);
});
