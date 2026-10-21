const { test, after } = require("node:test");
const assert = require("node:assert/strict");
const { fork } = require("node:child_process");
const { mkdtempSync, rmSync } = require("node:fs");
const { tmpdir } = require("node:os");
const path = require("node:path");
const { once } = require("node:events");

const directory = mkdtempSync(path.join(tmpdir(), "grocerglow-test-"));
const database = path.join(directory, "test.db");
let child, base;
async function start() {
    child = fork(path.join(__dirname, "../test-support/server.cjs"), [], {
        env: { ...process.env, GROCERGLOW_DB_PATH: database },
        stdio: ["ignore", "pipe", "pipe", "ipc"],
    });
    let errors = "";
    child.stderr.on("data", (chunk) => {
        errors += chunk;
    });
    const port = await Promise.race([
        once(child, "message").then(([message]) => message.port),
        once(child, "exit").then(([code]) => {
            throw new Error(`Server exited ${code}: ${errors}`);
        }),
        new Promise((_, reject) => {
            const timer = setTimeout(
                () => reject(new Error(`Server startup timed out: ${errors}`)),
                15000,
            );
            timer.unref();
        }),
    ]);
    base = `http://127.0.0.1:${port}`;
}
async function stop() {
    if (child && child.exitCode === null) {
        const exited = once(child, "exit");
        child.kill();
        await exited;
    }
}
async function request(method, route, body, status = 200) {
    const response = await fetch(base + route, {
        method,
        ...(body === undefined
            ? {}
            : {
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(body),
              }),
    });
    const text = await response.text();
    assert.equal(response.status, status, `${method} ${route}: ${text}`);
    return text ? JSON.parse(text) : null;
}
after(async () => {
    await stop();
    rmSync(directory, { recursive: true, force: true }); // Only this test's generated directory.
});

test("HTTP + Express + SQLite integration", async (t) => {
    await start();
    let item;
    await t.test("currency endpoint returns the frontend's array contract", async () => {
        const codes = await request("GET", "/api/currencies");
        assert.ok(Array.isArray(codes));
        assert.deepEqual(codes, Intl.supportedValuesOf("currency"));
        assert.ok(codes.includes("ZAR") && codes.includes("EUR"));
    });
    await t.test("serves the actual frontend and edit/currency callers", async () => {
        for (const [route, expected] of [
            ["/", 'id="shopping-list"'],
            ["/app.js", 'jsonRequest("PATCH", { name, quantity, price })'],
            ["/styles.css", ".edit-form"],
        ]) {
            const response = await fetch(base + route);
            assert.equal(response.status, 200);
            assert.ok((await response.text()).includes(expected));
        }
    });
    await t.test("creates priced items and persists a budget", async () => {
        item = await request("POST", "/api/items", { name: "Milk", quantity: 1, price: 12 }, 201);
        assert.equal(item.completed, false);
        assert.deepEqual(await request("PATCH", "/api/settings", { budget: 1000 }), {
            budget: 1000,
            currency: "ZAR",
        });
    });
    await t.test("checkbox update preserves name, quantity and price", async () => {
        item = await request("PATCH", `/api/items/${item.id}`, { completed: true });
        assert.deepEqual(item, {
            id: item.id,
            name: "Milk",
            quantity: 1,
            price: 12,
            completed: true,
        });
    });
    await t.test(
        "exact reported edit payload succeeds and preserves purchased status",
        async () => {
            item = await request("PATCH", `/api/items/${item.id}`, {
                name: "qq",
                quantity: 2,
                price: 45,
            });
            assert.deepEqual(item, {
                id: item.id,
                name: "qq",
                quantity: 2,
                price: 45,
                completed: true,
            });
            assert.deepEqual(await request("GET", "/api/items"), [item]);
            assert.equal(item.quantity * item.price, 90);
        },
    );
    await t.test(
        "mixed and partial updates preserve omitted fields; null clears price",
        async () => {
            item = await request("PATCH", `/api/items/${item.id}`, {
                name: "Fresh milk",
                completed: false,
            });
            assert.equal(item.name, "Fresh milk");
            assert.equal(item.completed, false);
            assert.equal(item.price, 45);
            item = await request("PATCH", `/api/items/${item.id}`, { price: null });
            assert.equal(item.price, null);
            item = await request("PATCH", `/api/items/${item.id}`, { price: 0 });
            assert.equal(item.price, 0);
        },
    );
    await t.test("invalid edits return 400 without partial database writes", async () => {
        for (const body of [
            { completed: "true" },
            { completed: null },
            { name: "" },
            { name: "x".repeat(121) },
            { quantity: 1.5 },
            { quantity: 0 },
            { quantity: Number.MAX_SAFE_INTEGER + 1 },
            { price: -1 },
            { price: "45" },
            {},
            [],
            { name: "Must not save", completed: 1 },
        ]) {
            await request("PATCH", `/api/items/${item.id}`, body, 400);
            assert.deepEqual(await request("GET", "/api/items"), [item]);
        }
        await request("PATCH", "/api/items/bad", { completed: true }, 400);
        await request("PATCH", "/api/items/999999", { completed: true }, 404);
    });
    await t.test(
        "currency validation and unconfirmed switch preserve all monetary data",
        async () => {
            await request("PATCH", "/api/settings/currency", { currency: "INVALID" }, 400);
            await request("PATCH", "/api/settings/currency", { currency: "EUR" }, 409);
            assert.deepEqual(await request("GET", "/api/items"), [item]);
            assert.deepEqual(await request("GET", "/api/settings"), {
                budget: 1000,
                currency: "ZAR",
            });
            await request("PATCH", "/api/settings/currency", {
                currency: "ZAR",
                resetMonetaryValues: true,
            });
            assert.equal((await request("GET", "/api/settings")).budget, 1000);
        },
    );
    await t.test("edits, checkbox and budget survive a real server process restart", async () => {
        await stop();
        await start();
        assert.deepEqual(await request("GET", "/api/items"), [item]);
        assert.deepEqual(await request("GET", "/api/settings"), { budget: 1000, currency: "ZAR" });
    });
    await t.test(
        "explicitly confirmed currency switch retains items and clears only money",
        async () => {
            assert.deepEqual(
                await request("PATCH", "/api/settings/currency", {
                    currency: "EUR",
                    resetMonetaryValues: true,
                }),
                { budget: null, currency: "EUR" },
            );
            item.price = null;
            assert.deepEqual(await request("GET", "/api/items"), [item]);
            await stop();
            await start();
            assert.deepEqual(await request("GET", "/api/settings"), {
                budget: null,
                currency: "EUR",
            });
            assert.deepEqual(await request("GET", "/api/items"), [item]);
        },
    );
    await t.test(
        "country detection validates coordinates, maps ZA, caches and handles failure",
        async () => {
            await request("POST", "/api/detect-currency", { latitude: 91, longitude: 0 }, 400);
            const coordinates = { latitude: -30, longitude: 25 };
            const expected = {
                country: "South Africa",
                countryCode: "ZA",
                city: "Cape Town",
                currency: "ZAR",
            };
            assert.deepEqual(await request("POST", "/api/detect-currency", coordinates), expected);
            assert.deepEqual(await request("POST", "/api/detect-currency", coordinates), expected);
            await request("POST", "/api/detect-currency", { latitude: 1, longitude: 1 }, 429);
            await new Promise((resolve) => setTimeout(resolve, 1150));
            await request("POST", "/api/detect-currency", { latitude: 1, longitude: 1 }, 502);
            assert.equal((await request("GET", "/api/settings")).currency, "EUR");
        },
    );
    await t.test(
        "settlement fallbacks and missing-city responses preserve country/currency",
        async () => {
            for (const [latitude, city] of [
                [-31, "Stellenbosch"],
                [-32, "Franschhoek"],
                [-33, null],
                [-34, null],
            ]) {
                await stop();
                await start();
                const detected = await request("POST", "/api/detect-currency", {
                    latitude,
                    longitude: 25,
                });
                assert.deepEqual(detected, {
                    country: "South Africa",
                    countryCode: "ZA",
                    city,
                    currency: "ZAR",
                });
                assert.equal(Object.hasOwn(detected, "latitude"), false);
                assert.equal(Object.hasOwn(detected, "longitude"), false);
            }
        },
    );
    await t.test("deletion survives restart and missing records return 404", async () => {
        await request("DELETE", `/api/items/${item.id}`, undefined, 204);
        await request("DELETE", `/api/items/${item.id}`, undefined, 404);
        await stop();
        await start();
        assert.deepEqual(await request("GET", "/api/items"), []);
    });
    let originalList, secondList, freshCopy, pricedCopy, milk, bread;
    await t.test(
        "list creation validates names/currency and the final list cannot be deleted",
        async () => {
            const all = await request("GET", "/api/lists");
            assert.equal(all.length, 1);
            originalList = all[0];
            await request("DELETE", `/api/lists/${originalList.id}`, undefined, 409);
            for (const body of [
                { name: "" },
                { name: " " },
                { name: 12 },
                { name: "x".repeat(81) },
                { name: "Bad currency", currency: "INVALID" },
            ]) {
                await request("POST", "/api/lists", body, 400);
            }
            await request("GET", "/api/lists/nope", undefined, 400);
            await request("GET", "/api/lists/999999", undefined, 404);
            originalList = await request("PATCH", `/api/lists/${originalList.id}`, {
                name: "Weekly groceries",
            });
            await request("PATCH", `/api/lists/${originalList.id}`, { name: "" }, 400);
        },
    );
    await t.test("different lists keep separate items, budgets and currencies", async () => {
        await request("PATCH", `/api/lists/${originalList.id}/settings/currency`, {
            currency: "ZAR",
        });
        milk = await request(
            "POST",
            `/api/lists/${originalList.id}/items`,
            { name: "Milk", quantity: 2, price: 25 },
            201,
        );
        milk = await request("PATCH", `/api/lists/${originalList.id}/items/${milk.id}`, {
            completed: true,
        });
        await request("PATCH", `/api/lists/${originalList.id}/settings`, { budget: 100 });
        secondList = await request("POST", "/api/lists", { name: "Weekend", currency: "EUR" }, 201);
        bread = await request(
            "POST",
            `/api/lists/${secondList.id}/items`,
            { name: "Bread", quantity: 1, price: 4 },
            201,
        );
        await request("PATCH", `/api/lists/${secondList.id}/settings`, { budget: 20 });
        assert.deepEqual(await request("GET", `/api/lists/${originalList.id}/items`), [milk]);
        assert.deepEqual(await request("GET", `/api/lists/${secondList.id}/items`), [bread]);
        assert.deepEqual(await request("GET", `/api/lists/${originalList.id}/settings`), {
            budget: 100,
            currency: "ZAR",
        });
        assert.deepEqual(await request("GET", `/api/lists/${secondList.id}/settings`), {
            budget: 20,
            currency: "EUR",
        });
        await request("PATCH", `/api/lists/${secondList.id}/items/${milk.id}`, { price: 99 }, 404);
        await request("DELETE", `/api/lists/${secondList.id}/items/${milk.id}`, undefined, 404);
    });
    await t.test("a confirmed currency reset affects only the requested list", async () => {
        await request(
            "PATCH",
            `/api/lists/${secondList.id}/settings/currency`,
            { currency: "USD" },
            409,
        );
        await request("PATCH", `/api/lists/${secondList.id}/settings/currency`, {
            currency: "USD",
            resetMonetaryValues: true,
        });
        assert.deepEqual(await request("GET", `/api/lists/${originalList.id}/items`), [milk]);
        assert.deepEqual(await request("GET", `/api/lists/${originalList.id}/settings`), {
            budget: 100,
            currency: "ZAR",
        });
        assert.equal((await request("GET", `/api/lists/${secondList.id}/items`))[0].price, null);
    });
    await t.test(
        "Shop Again defaults to unchecked items with fresh prices, leaving the source unchanged",
        async () => {
            freshCopy = await request(
                "POST",
                `/api/lists/${originalList.id}/duplicate`,
                { name: "Next week" },
                201,
            );
            const copied = await request("GET", `/api/lists/${freshCopy.id}/items`);
            assert.equal(copied.length, 1);
            assert.notEqual(copied[0].id, milk.id);
            assert.deepEqual(
                { ...copied[0], id: milk.id },
                { ...milk, completed: false, price: null },
            );
            assert.equal(freshCopy.budget, 100);
            assert.equal(freshCopy.currency, "ZAR");
            assert.deepEqual(await request("GET", `/api/lists/${originalList.id}/items`), [milk]);
        },
    );
    await t.test(
        "copying previous estimates is explicit and preserves null and zero prices",
        async () => {
            await request(
                "POST",
                `/api/lists/${originalList.id}/items`,
                { name: "Unknown", quantity: 1 },
                201,
            );
            await request(
                "POST",
                `/api/lists/${originalList.id}/items`,
                { name: "Free", quantity: 1, price: 0 },
                201,
            );
            const before = await request("GET", `/api/lists/${originalList.id}/items`);
            pricedCopy = await request(
                "POST",
                `/api/lists/${originalList.id}/duplicate`,
                { name: "With estimates", copyPrices: true },
                201,
            );
            const copied = await request("GET", `/api/lists/${pricedCopy.id}/items`);
            assert.deepEqual(
                copied.map((item) => item.price),
                [25, null, 0],
            );
            assert.ok(copied.every((item) => !item.completed));
            assert.deepEqual(await request("GET", `/api/lists/${originalList.id}/items`), before);
            const count = (await request("GET", "/api/lists")).length;
            await request(
                "POST",
                `/api/lists/${originalList.id}/duplicate`,
                { name: "Bad", copyPrices: "true" },
                400,
            );
            await request("POST", `/api/lists/${originalList.id}/duplicate`, { name: "" }, 400);
            assert.equal((await request("GET", "/api/lists")).length, count);
        },
    );
    await t.test(
        "list names, copies and independent settings survive a server restart",
        async () => {
            await request("PATCH", `/api/lists/${secondList.id}`, { name: "Weekend barbecue" });
            await stop();
            await start();
            assert.equal(
                (await request("GET", `/api/lists/${secondList.id}`)).name,
                "Weekend barbecue",
            );
            assert.deepEqual(await request("GET", `/api/lists/${secondList.id}/settings`), {
                budget: null,
                currency: "USD",
            });
            assert.equal((await request("GET", `/api/lists/${pricedCopy.id}/items`)).length, 3);
        },
    );
    await t.test(
        "list deletion cascades only its items; legacy clients fall back after deleting the original",
        async () => {
            await request("DELETE", `/api/lists/${freshCopy.id}`, undefined, 204);
            await request("GET", `/api/lists/${freshCopy.id}/items`, undefined, 404);
            await request("DELETE", `/api/lists/${pricedCopy.id}`, undefined, 204);
            await request("DELETE", `/api/lists/${originalList.id}`, undefined, 204);
            assert.equal((await request("GET", `/api/lists/${secondList.id}/items`)).length, 1);
            assert.deepEqual(await request("GET", "/api/settings"), {
                budget: null,
                currency: "USD",
            });
            await request("DELETE", `/api/lists/${secondList.id}`, undefined, 409);
            await stop();
            const Database = require("better-sqlite3");
            const inspection = new Database(database, { readonly: true });
            assert.deepEqual(inspection.prepare("SELECT DISTINCT list_id FROM items").all(), [
                { list_id: secondList.id },
            ]);
            assert.deepEqual(inspection.pragma("foreign_key_check"), []);
            inspection.close();
        },
    );
});
