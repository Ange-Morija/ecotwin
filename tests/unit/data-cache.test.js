import test from "node:test";
import assert from "node:assert/strict";
import { createSnapshotLoader } from "../../web/js/data-cache.js";

test("concurrent consumers share one request and a fresh snapshot", async () => {
  let calls = 0;
  const cache = createSnapshotLoader(async () => {
    calls++;
    return ["observation"];
  });
  const [first, second] = await Promise.all([cache.load(), cache.load()]);
  assert.equal(calls, 1);
  assert.equal(first, second);
  assert.equal(await cache.load(), first);
  assert.equal(calls, 1);
});

test("expired snapshots refresh once for concurrent consumers", async () => {
  let clock = 0,
    calls = 0;
  const cache = createSnapshotLoader(async () => ++calls, {
    ttl: 30,
    now: () => clock,
  });
  assert.equal(await cache.load(), 1);
  clock = 29;
  assert.equal(await cache.load(), 1);
  clock = 30;
  assert.deepEqual(await Promise.all([cache.load(), cache.load()]), [2, 2]);
  assert.equal(calls, 2);
});

test("a pre-mutation response cannot replace a newer snapshot", async () => {
  const requests = [];
  const cache = createSnapshotLoader(
    () => new Promise((resolve) => requests.push(resolve)),
  );
  const old = cache.load();
  await Promise.resolve();
  cache.invalidate();
  const fresh = cache.load();
  await Promise.resolve();
  requests[1]("after-save");
  assert.equal(await fresh, "after-save");
  requests[0]("before-save");
  assert.equal(await old, "before-save");
  assert.equal(await cache.load(), "after-save");
});

test("a failed refresh leaves the previous snapshot available and permits retry", async () => {
  let clock = 0,
    fail = false;
  const cache = createSnapshotLoader(
    async () => {
      if (fail) throw new Error("offline");
      return "observation";
    },
    { ttl: 1, now: () => clock },
  );
  await cache.load();
  clock = 2;
  fail = true;
  await assert.rejects(cache.load(), /offline/);
  assert.equal(cache.peek(), "observation");
  fail = false;
  assert.equal(await cache.load(), "observation");
});
