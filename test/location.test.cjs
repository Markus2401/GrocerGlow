const { test } = require("node:test");
const assert = require("node:assert/strict");
const { createLocationHandler } = require("../location");
test("provider failures, cache, throttle and configurable HTTPS provider", async (t) => {
    const originalFetch = global.fetch,
        now = Date.now,
        provider = process.env.GROCERGLOW_GEOCODER_URL;
    let time = 100000,
        calls = 0;
    Date.now = () => time;
    const res = () => ({
        statusCode: 200,
        headers: {},
        status(code) {
            this.statusCode = code;
            return this;
        },
        set(k, v) {
            this.headers[k] = v;
            return this;
        },
        json(body) {
            this.body = body;
            return this;
        },
    });
    const req = (lat) => ({ body: { latitude: lat, longitude: 25.12345 } });
    try {
        global.fetch = async (url, options) => {
            calls++;
            assert.equal(url.searchParams.get("lon"), "25.12");
            assert.match(options.headers["User-Agent"], /GrocerGlow/);
            assert.ok(options.signal);
            return {
                ok: true,
                json: async () => ({
                    address: { country_code: "za", country: "South Africa", hamlet: "Small place" },
                }),
            };
        };
        const handler = createLocationHandler(new Set(["ZAR"]));
        await t.test(
            "same coordinates use cache; concurrent/new requests obey throttle",
            async () => {
                let r = res();
                await handler(req(-30), r);
                assert.equal(r.body.city, "Small place");
                r = res();
                await handler(req(-30), r);
                assert.equal(calls, 1);
                r = res();
                await handler(req(-31), r);
                assert.equal(r.statusCode, 429);
                assert.equal(r.headers["Retry-After"], "2");
                let release;
                global.fetch = () =>
                    new Promise((resolve) => {
                        release = resolve;
                    });
                time += 1200;
                const pending = handler(req(-32), res());
                time += 1200;
                r = res();
                await handler(req(-33), r);
                assert.equal(r.statusCode, 429);
                release({ ok: false });
                await pending;
            },
        );
        await t.test(
            "upstream denial, timeout, bad JSON, missing/unknown country have manual fallback",
            async () => {
                for (const upstream of [
                    async () => ({ ok: false }),
                    async () => {
                        throw new DOMException("Timed out", "TimeoutError");
                    },
                    async () => ({
                        ok: true,
                        json: async () => {
                            throw new SyntaxError("Invalid JSON");
                        },
                    }),
                ]) {
                    global.fetch = upstream;
                    const r = res();
                    await createLocationHandler(new Set(["ZAR"]))(req(-30), r);
                    assert.equal(r.statusCode, 502);
                    assert.match(r.body.error, /manually/);
                }
                for (const address of [
                    { city: "No country" },
                    { country_code: "xx", country: "Unknown" },
                ]) {
                    global.fetch = async () => ({ ok: true, json: async () => ({ address }) });
                    const r = res();
                    await createLocationHandler(new Set(["ZAR"]))(req(-30), r);
                    assert.equal(r.statusCode, 422);
                }
            },
        );
        await t.test(
            "provider can change without code changes; HTTP provider rejected",
            async () => {
                process.env.GROCERGLOW_GEOCODER_URL = "https://example.test/reverse";
                global.fetch = async (url) => {
                    assert.equal(url.hostname, "example.test");
                    return { ok: true, json: async () => ({ address: { country_code: "za" } }) };
                };
                let r = res();
                await createLocationHandler(new Set(["ZAR"]))(req(-30), r);
                assert.equal(r.statusCode, 200);
                process.env.GROCERGLOW_GEOCODER_URL = "http://example.test/reverse";
                r = res();
                await createLocationHandler(new Set(["ZAR"]))(req(-30), r);
                assert.equal(r.statusCode, 502);
            },
        );
    } finally {
        global.fetch = originalFetch;
        Date.now = now;
        if (provider === undefined) delete process.env.GROCERGLOW_GEOCODER_URL;
        else process.env.GROCERGLOW_GEOCODER_URL = provider;
    }
});
