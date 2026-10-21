const { test } = require("node:test");
const assert = require("node:assert/strict");
const { spawn } = require("node:child_process");
const { once } = require("node:events");
const { mkdtempSync, rmSync } = require("node:fs");
const { tmpdir } = require("node:os");
const path = require("node:path");
const { startServer } = require("../test-support/fixture.cjs");
const money = require("../public/money");

test("bounded amounts and quantities, safe errors and scoped route IDs", async () => {
    const fixture = await startServer();
    try {
        const send = (route, body, type = "application/json") =>
            fetch(fixture.base + route, {
                method: "POST",
                headers: { "Content-Type": type },
                body,
            });
        const large = await send(
            "/api/items",
            JSON.stringify({ name: "a".repeat(17000), quantity: 1 }),
        );
        assert.equal(large.status, 413);
        assert.match((await large.json()).error, /16 KB/);
        for (const body of ["null", "[]", "true", "{", '"text"']) {
            assert.equal((await send("/api/items", body)).status, 400);
        }
        assert.equal((await send("/api/items", "{}", "text/plain")).status, 415);
        for (const body of [
            { name: "Huge", quantity: 1, price: 1e300 },
            { name: "Huge", quantity: 1000001 },
            { name: "Huge", quantity: 1, price: 1e9 + 1 },
        ]) {
            assert.equal((await send("/api/items", JSON.stringify(body))).status, 400);
        }
        const budget = await fetch(fixture.base + "/api/settings", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: '{"budget":1e300}',
        });
        assert.equal(budget.status, 400);
        for (const id of ["1e0", "0x1", "1.0", "-1", "9007199254740992"]) {
            assert.equal((await fetch(fixture.base + "/api/lists/" + id)).status, 400);
        }
        assert.deepEqual(await (await fetch(fixture.base + "/api/items")).json(), []);
        const page = await fetch(fixture.base);
        assert.equal(page.headers.get("x-powered-by"), null);
        assert.match(page.headers.get("content-security-policy"), /script-src 'self'/);
        assert.equal((await fetch(fixture.base + "/favicon.svg")).status, 200);
        assert.equal((await fetch(fixture.base + "/api/unknown")).status, 404);
        const invalidFlag = await fetch(fixture.base + "/api/settings/currency", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: '{"currency":"ZAR","resetMonetaryValues":"true"}',
        });
        assert.equal(invalidFlag.status, 400);
    } finally {
        await fixture.close();
    }
});

test("money estimates avoid false overspend and preserve unknown/zero/three decimals", () => {
    const total = money.total([
        { quantity: 1, price: 0.1 },
        { quantity: 1, price: 0.2 },
        { quantity: 10, price: null },
        { quantity: 2, price: 0 },
    ]);
    assert.equal(total, 0.3);
    assert.equal(money.round(0.3 - total), 0);
    assert.equal(
        money.total([
            { quantity: 3, price: 0.001 },
            { quantity: 2, price: 1.234 },
        ]),
        2.471,
    );
    assert.equal(money.validAmount(Infinity), false);
    assert.equal(money.validAmount("1"), false);
    assert.equal(money.validQuantity(1.1), false);
});

test("normal entry point binds to loopback, persists fresh data and reports port conflicts", async () => {
    const dir = mkdtempSync(path.join(tmpdir(), "grocerglow-start-"));
    let child;
    const start = () => {
        const process = spawn(global.process.execPath, [path.join(__dirname, "../server.js")], {
            env: {
                ...global.process.env,
                PORT: "0",
                HOST: "127.0.0.1",
                GROCERGLOW_DB_PATH: path.join(dir, "fresh.db"),
            },
            stdio: ["ignore", "pipe", "pipe"],
        });
        return process;
    };
    const ready = (child) =>
        new Promise((resolve, reject) => {
            const timeout = setTimeout(() => reject(new Error("Startup timeout")), 10000);
            child.stdout.on("data", (chunk) => {
                const match = String(chunk).match(/http:\/\/127\.0\.0\.1:(\d+)/);
                if (match) {
                    clearTimeout(timeout);
                    resolve(Number(match[1]));
                }
            });
            child.once("exit", (code) => {
                clearTimeout(timeout);
                reject(new Error(`Early exit ${code}`));
            });
        });
    const stop = async () => {
        if (child?.exitCode === null) {
            const exited = once(child, "exit");
            child.kill();
            await exited;
        }
    };
    try {
        child = start();
        let port = await ready(child);
        let response = await fetch(`http://127.0.0.1:${port}/api/items`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: '{"name":"Clone smoke item","quantity":2,"price":45}',
        });
        assert.equal(response.status, 201);
        const saved = await response.json();
        await stop();
        child = start();
        port = await ready(child);
        const items = await (await fetch(`http://127.0.0.1:${port}/api/items`)).json();
        assert.deepEqual(items, [saved]);
        const conflict = spawn(process.execPath, [path.join(__dirname, "../server.js")], {
            env: {
                ...process.env,
                PORT: String(port),
                HOST: "127.0.0.1",
                GROCERGLOW_DB_PATH: path.join(dir, "other.db"),
            },
            stdio: ["ignore", "pipe", "pipe"],
        });
        let errors = "";
        conflict.stderr.on("data", (chunk) => (errors += chunk));
        const [code] = await once(conflict, "exit");
        assert.equal(code, 1);
        assert.match(errors, /EADDRINUSE/);
    } finally {
        await stop();
        rmSync(dir, { recursive: true, force: true });
    }
});

test("a database path that is a directory fails without replacing it", async () => {
    const dir = mkdtempSync(path.join(tmpdir(), "grocerglow-blocked-"));
    try {
        const child = spawn(process.execPath, [path.join(__dirname, "../server.js")], {
            env: { ...process.env, PORT: "0", GROCERGLOW_DB_PATH: dir },
            stdio: ["ignore", "pipe", "pipe"],
        });
        let errors = "";
        child.stderr.on("data", (chunk) => (errors += chunk));
        const [code] = await once(child, "exit");
        assert.notEqual(code, 0);
        assert.match(errors, /SQLITE_CANTOPEN|unable to open/i);
    } finally {
        rmSync(dir, { recursive: true, force: true });
    }
});
