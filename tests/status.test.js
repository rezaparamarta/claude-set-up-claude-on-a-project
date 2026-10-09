const test = require("node:test");
const assert = require("node:assert");
const request = require("supertest");

const app = require("../server");

test("GET /status returns the uptime in whole seconds", async () => {
  const res = await request(app).get("/status");

  assert.strictEqual(res.status, 200);
  assert.ok(Number.isInteger(res.body.uptimeSeconds));
  assert.ok(res.body.uptimeSeconds >= 0);
});

test("GET /status uptime never goes down between calls", async () => {
  const first = await request(app).get("/status");
  const second = await request(app).get("/status");

  assert.ok(second.body.uptimeSeconds >= first.body.uptimeSeconds);
});
