const { test } = require("node:test");
const assert = require("node:assert/strict");
const { createServer } = require("../server/server");
const jwt = require("../server/node_modules/jsonwebtoken");

// DB در حافظه است؛ هیچ تستی دادهٔ واقعی فروشگاه یا رمز کاربر واقعی را تغییر نمی‌دهد.
async function fixture(t) {
  const app = createServer({
    quiet: true,
    dbPath: {
      users: [
        {
          id: 1,
          username: "admin-test",
          password: "test-password",
          name: "Test",
          role: "admin",
        },
        {
          id: 2,
          username: "customer",
          password: "test-password",
          role: "customer",
        },
      ],
      products: [
        {
          id: 1,
          price: 100,
          name: "Test",
          brand: "Test",
          slug: "test",
          category: 1,
          subcategory: 1,
          description: "<p>Test</p>",
          thumbnail: "/images/test.jpg",
          images: ["/images/test.jpg"],
          quantity: 5,
          variants: [],
          isHero: false,
          heroOrder: null,
        },
      ],
      orders: [{ id: 1, status: "pending" }],
      category: [{ id: 1 }],
      subcategory: [{ id: 1, category: 1 }],
    },
    auth: {
      accessSecret: "test-access-secret",
      refreshSecret: "test-refresh-secret",
    },
  });
  const server = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  t.after(
    () =>
      new Promise((resolve) => {
        server.closeAllConnections();
        server.close(resolve);
      }),
  );
  const url = `http://127.0.0.1:${server.address().port}`;
  const request = (route, options = {}) =>
    fetch(url + route, {
      ...options,
      headers: {
        "X-Requested-With": "watch-store",
        "Content-Type": "application/json",
        ...options.headers,
      },
    });
  const login = async () => {
    const response = await request("/auth/login", {
      method: "POST",
      body: JSON.stringify({
        username: "admin-test",
        password: "test-password",
      }),
    });
    const cookies = response.headers.getSetCookie();
    return {
      response,
      cookies,
      cookie: cookies.map((value) => value.split(";")[0]).join("; "),
    };
  };
  return { request, login };
}

test("login sets HttpOnly cookies without exposing tokens in JSON", async (t) => {
  const { login } = await fixture(t);
  const { response, cookies } = await login();
  assert.equal(response.status, 200);
  assert.equal(cookies.length, 2);
  assert.ok(
    cookies.every(
      (value) => value.includes("HttpOnly") && value.includes("SameSite=Lax"),
    ),
  );
  assert.ok(
    cookies
      .find((value) => value.startsWith("watch-store-refresh="))
      .includes("Path=/auth"),
  );
  const body = await response.json();
  assert.equal(body.user.username, "admin-test");
  assert.equal(body.accessToken, undefined);
  assert.equal(body.refreshToken, undefined);
});

test("public reads work but admin reads and mutations require a session", async (t) => {
  const { request, login } = await fixture(t);
  assert.equal((await request("/products?_page=1&_limit=1")).status, 200);
  for (const [route, method] of [
    ["/orders", "GET"],
    ["/products", "POST"],
    ["/products/1", "PATCH"],
    ["/orders/1", "PATCH"],
    ["/upload", "POST"],
    ["/users", "GET"],
  ]) {
    assert.equal(
      (
        await request(route, {
          method,
          ...(method !== "GET" ? { body: "{}" } : {}),
        })
      ).status,
      401,
    );
  }
  const { cookie } = await login();
  assert.equal(
    (await request("/orders", { headers: { Cookie: cookie } })).status,
    200,
  );
  assert.equal(
    (
      await request("/products/1", {
        method: "PATCH",
        headers: { Cookie: cookie },
        body: '{"price":200}',
      })
    ).status,
    200,
  );
});

test("refresh restores missing/expired access and preserves identity", async (t) => {
  const { request, login } = await fixture(t);
  const { cookies } = await login();
  const refreshCookie = cookies
    .find((value) => value.startsWith("watch-store-refresh="))
    .split(";")[0];
  assert.equal(
    (await request("/auth/session", { headers: { Cookie: refreshCookie } }))
      .status,
    401,
  );
  const expiredAccess = jwt.sign(
    { username: "admin-test" },
    "test-access-secret",
    { expiresIn: -1 },
  );
  const response = await request("/auth/refresh-token", {
    method: "POST",
    headers: {
      Cookie: refreshCookie + "; watch-store-access=" + expiredAccess,
    },
  });
  assert.equal(response.status, 200);
  const accessCookie = response.headers.getSetCookie()[0].split(";")[0];
  const session = await request("/auth/session", {
    headers: { Cookie: accessCookie },
  });
  assert.equal(session.status, 200);
  assert.equal((await session.json()).user.username, "admin-test");
});

test("logout revokes old access and refresh even if copied before logout", async (t) => {
  const { request, login } = await fixture(t);
  const { cookie } = await login();
  assert.equal(
    (
      await request("/auth/logout", {
        method: "POST",
        headers: { Cookie: cookie },
      })
    ).status,
    204,
  );
  assert.equal(
    (await request("/orders", { headers: { Cookie: cookie } })).status,
    401,
  );
  assert.equal(
    (
      await request("/auth/refresh-token", {
        method: "POST",
        headers: { Cookie: cookie },
      })
    ).status,
    401,
  );
});

test("invalid refresh clears cookies and non-admin login is forbidden", async (t) => {
  const { request } = await fixture(t);
  const response = await request("/auth/refresh-token", {
    method: "POST",
    headers: { Cookie: "watch-store-refresh=invalid" },
  });
  assert.equal(response.status, 401);
  assert.equal(response.headers.getSetCookie().length, 2);
  assert.equal(
    (
      await request("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          username: "customer",
          password: "test-password",
        }),
      })
    ).status,
    403,
  );
  assert.equal(
    (
      await request("/auth/login", {
        method: "POST",
        body: JSON.stringify({ username: "admin-test", password: "wrong" }),
      })
    ).status,
    401,
  );
});

test("CSRF and credentialed CORS accept only the configured browser origin", async (t) => {
  const { request } = await fixture(t);
  assert.equal(
    (
      await request("/auth/login", {
        method: "POST",
        headers: { Origin: "https://untrusted.example" },
        body: "{}",
      })
    ).status,
    403,
  );
  assert.equal(
    (
      await request("/auth/logout", {
        method: "POST",
        headers: { "X-Requested-With": "" },
      })
    ).status,
    403,
  );
  const response = await request("/products", {
    headers: { Origin: "http://localhost:3000" },
  });
  assert.equal(
    response.headers.get("access-control-allow-origin"),
    "http://localhost:3000",
  );
  assert.equal(
    response.headers.get("access-control-allow-credentials"),
    "true",
  );
});
