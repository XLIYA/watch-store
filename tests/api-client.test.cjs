const { test } = require("node:test");
const assert = require("node:assert/strict");
const axios = require("axios");
const { loadTs } = require("./load-ts.cjs");

function client() {
  const events = [];
  const previous = global.window;
  global.window = { dispatchEvent: event => events.push(event.type) };
  const api = loadTs("src/services/api/api-client.ts", { "@/config/api": {
    apiConfig: { baseURL: "http://localhost:3002", timeout: 1000 },
    endpoints: { auth: { refresh: "/auth/refresh-token", logout: "/auth/logout" } },
  } });
  return { ...api, events, restore: () => { global.window = previous; } };
}
const response = config => ({ config, data: {}, status: 200, statusText: "OK", headers: {} });
const unauthorized = config => new axios.AxiosError("unauthorized", "ERR_BAD_REQUEST", config, null, { ...response(config), status: 401 });

test("concurrent protected requests share one refresh and replay once", async t => {
  const api = client(); t.after(api.restore);
  let refreshed = false, refreshCount = 0, requests = 0;
  api.apiClient.defaults.adapter = async config => { requests++; if (!refreshed) throw unauthorized(config); return response(config); };
  api.authClient.defaults.adapter = async config => { refreshCount++; await new Promise(resolve => setTimeout(resolve, 20)); refreshed = true; return response(config); };
  await Promise.all(Array.from({ length: 5 }, () => api.apiClient.get("/orders", { requiresAuth: true })));
  assert.equal(refreshCount, 1);
  assert.equal(requests, 10);
});
test("refresh network failure preserves session and rejects the request", async t => {
  const api = client(); t.after(api.restore);
  api.apiClient.defaults.adapter = async config => { throw unauthorized(config); };
  api.authClient.defaults.adapter = async () => { throw new axios.AxiosError("offline", "ERR_NETWORK"); };
  await assert.rejects(api.apiClient.get("/orders", { requiresAuth: true }));
  assert.equal(api.events.length, 0);
});
test("invalid refresh ends session without an infinite retry", async t => {
  const api = client(); t.after(api.restore);
  let refreshCount = 0;
  api.apiClient.defaults.adapter = async config => { throw unauthorized(config); };
  api.authClient.defaults.adapter = async config => { refreshCount++; throw unauthorized(config); };
  await assert.rejects(api.apiClient.get("/orders", { requiresAuth: true }));
  assert.equal(refreshCount, 1);
  assert.deepEqual(api.events, [api.SESSION_ENDED_EVENT]);
});
test("a replayed 401 is not refreshed again and public requests never refresh", async t => {
  const api = client(); t.after(api.restore);
  let refreshCount = 0;
  api.apiClient.defaults.adapter = async config => { throw unauthorized(config); };
  api.authClient.defaults.adapter = async config => { refreshCount++; return response(config); };
  await assert.rejects(api.apiClient.get("/orders", { requiresAuth: true }));
  await assert.rejects(api.apiClient.get("/products"));
  assert.equal(refreshCount, 1);
});
test("logout waits for pending refresh and prevents replay after session changes", async t => {
  const api = client(); t.after(api.restore);
  const order = [];
  let releaseRefresh;
  let refreshStarted;
  const started = new Promise(resolve => { refreshStarted = resolve; });
  api.apiClient.defaults.adapter = async config => { throw unauthorized(config); };
  api.authClient.defaults.adapter = async config => {
    if (config.url.includes("refresh")) { refreshStarted(); await new Promise(resolve => { releaseRefresh = resolve; }); order.push("refresh"); }
    else order.push("logout");
    return response(config);
  };
  const request = api.apiClient.get("/orders", { requiresAuth: true }).catch(error => error);
  await started;
  const logout = api.endSession();
  releaseRefresh();
  await logout;
  assert.equal(axios.isCancel(await request), true);
  assert.deepEqual(order, ["refresh", "logout"]);
});
