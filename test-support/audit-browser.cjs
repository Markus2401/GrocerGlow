const { chromium } = require("playwright");
const axe = require("axe-core");
const assert = require("node:assert/strict");
const path = require("node:path");
const { mkdirSync, writeFileSync } = require("node:fs");
const { startServer } = require("./fixture.cjs");

(async () => {
    const fixture = await startServer();
    let browser;
    const evidence = path.join(__dirname, "../docs/evidence");
    mkdirSync(evidence, { recursive: true });
    const scans = [];
    try {
        browser = await chromium.launch({
            channel: process.env.GROCERGLOW_BROWSER || "msedge",
            headless: true,
        });
        console.log(
            `Browser ${browser.version()}; Node ${process.version}; ${process.platform}/${process.arch}`,
        );
        const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
        const errors = [];
        page.on("pageerror", (error) => errors.push(error.message));
        const ready = async () =>
            page.waitForFunction(() => !document.querySelector("#list-select").disabled);
        const reload = async () => {
            await page.reload();
            await ready();
        };
        const request = async (method, suffix, body) => {
            const response = await page.request.fetch(fixture.base + suffix, {
                method,
                ...(body === undefined ? {} : { data: body }),
            });
            assert.ok(response.ok(), await response.text());
            return response.status() === 204 ? null : response.json();
        };
        const scan = async (label) => {
            await page.evaluate(axe.source);
            const result = await page.evaluate(() =>
                axe.run(document, {
                    runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] },
                }),
            );
            scans.push({
                label,
                violations: result.violations.map((v) => ({
                    id: v.id,
                    impact: v.impact,
                    nodes: v.nodes.map((n) => ({ target: n.target, summary: n.failureSummary })),
                })),
            });
            assert.deepEqual(scans.at(-1).violations, [], `Accessibility: ${label}`);
        };
        const add = async (name, quantity, price) => {
            await page.locator("#item-name").fill(name);
            await page.locator("#item-quantity").fill(String(quantity));
            await page.locator("#item-price").fill(price === null ? "" : String(price));
            await page.getByRole("button", { name: "Add Item", exact: true }).click();
            await page.locator(".item-text").filter({ hasText: name }).waitFor();
        };
        const budget = async (value) => {
            await page.locator("#shopping-budget").fill(value);
            await page.locator("#shopping-budget").press("Tab");
            await page.waitForFunction(
                () =>
                    document.querySelector("#settings-save-status").textContent === "Budget saved.",
            );
        };
        await page.goto(fixture.base);
        await ready();
        await add("Original", 1, 12);
        await page.locator(".edit-btn").click();
        await page.getByLabel("Item name", { exact: true }).last().fill("qq");
        await page.getByLabel("Quantity", { exact: true }).last().fill("2");
        await page.getByLabel("Price per item (optional)").fill("45");
        const patch = page.waitForRequest(
            (r) => r.method() === "PATCH" && /\/items\/\d+$/.test(r.url()),
        );
        await page.getByRole("button", { name: "Save changes", exact: true }).click();
        assert.deepEqual((await patch).postDataJSON(), { name: "qq", quantity: 2, price: 45 });
        await page.waitForFunction(() => !document.querySelector(".edit-form"));
        assert.equal(
            await page.locator(".edit-btn").evaluate((el) => el === document.activeElement),
            true,
        );
        await reload();
        assert.match(await page.locator(".item-text").innerText(), /2 × qq/);
        await page.locator(".edit-btn").click();
        await page.getByLabel("Price per item (optional)").fill("");
        await page.getByRole("button", { name: "Save changes", exact: true }).click();
        await page.locator(".item-price").filter({ hasText: "Price not set" }).waitFor();
        await reload();
        assert.equal((await request("GET", "/api/items"))[0].price, null);
        console.log(
            "PASS historical visible Edit payload, saved values, clear-to-null and edit focus restoration",
        );

        await page.locator("#shopping-mode-toggle").click();
        await page.locator(".item-info input").focus();
        await page.keyboard.press("Space");
        await page.locator(".shopping-item.completed").waitFor();
        assert.equal(
            await page.locator(".item-info input").evaluate((el) => el === document.activeElement),
            true,
        );
        await page.keyboard.press("Space");
        await page.waitForFunction(() => !document.querySelector(".shopping-item.completed"));
        assert.equal(
            await page.locator(".item-info input").evaluate((el) => el === document.activeElement),
            true,
        );
        await scan("shopping mode keyboard");
        await page.screenshot({ path: path.join(evidence, "shopping-mode.png"), fullPage: true });
        await page.getByRole("link", { name: "My Lists", exact: true }).click();
        await page.keyboard.press("Shift+Tab");
        assert.equal(await page.evaluate(() => document.activeElement.tagName !== "BODY"), true);
        const settings = page.getByRole("button", { name: "Settings", exact: true });
        await settings.focus();
        await page.keyboard.press("Enter");
        await scan("settings dialog light");
        await page.locator("#close-settings").focus();
        await page.keyboard.press("Shift+Tab");
        assert.equal(
            await page.locator("#done-settings").evaluate((el) => el === document.activeElement),
            true,
            await page.evaluate(
                () =>
                    `Focused control: ${document.activeElement.id || document.activeElement.tagName}`,
            ),
        );
        await page.keyboard.press("Tab");
        assert.equal(
            await page.locator("#close-settings").evaluate((el) => el === document.activeElement),
            true,
        );
        await page.keyboard.press("Escape");
        assert.equal(await settings.evaluate((el) => el === document.activeElement), true);
        await page.locator("#new-list-button").focus();
        await page.keyboard.press("Enter");
        await scan("new list dialog");
        await page.keyboard.press("Escape");
        assert.equal(
            await page.locator("#new-list-button").evaluate((el) => el === document.activeElement),
            true,
        );
        const firstId = (await request("GET", "/api/items"))[0].id;
        await request("DELETE", `/api/items/${firstId}`);
        await reload();
        await add("A", 1, 0.1);
        await add("B", 1, 0.2);
        await add("Unknown", 1, null);
        await add("Free", 1, 0);
        await budget("0.3");
        assert.match(await page.locator("#budget-status").innerText(), /Remaining budget/);
        assert.doesNotMatch(await page.locator("#budget-status").innerText(), /Over/);
        await page.locator(".item-info input").first().check();
        await page.locator(".shopping-item.completed").waitFor();
        assert.match(await page.locator("#estimated-total").innerText(), /0[,.]30/);
        assert.match(await page.locator("#missing-prices").innerText(), /1 item/);
        const budgetPattern = "**/api/lists/1/settings";
        await page.route(budgetPattern, (r) =>
            r.fulfill({
                status: 503,
                contentType: "application/json",
                body: '{"error":"Simulated save failure"}',
            }),
        );
        await page.locator("#shopping-budget").fill("999");
        await page.locator("#shopping-budget").press("Tab");
        await page.waitForFunction(() =>
            document.querySelector("#settings-save-status").textContent.includes("restored"),
        );
        assert.equal(await page.locator("#shopping-budget").inputValue(), "0.3");
        await page.unroute(budgetPattern);
        console.log(
            "PASS keyboard Space/Enter/Tab/Shift+Tab, native dialog trap/return, exact-budget arithmetic, zero/unknown, failed-save rollback",
        );

        page.on("dialog", (dialog) => dialog.accept());
        await page.route("**/api/lists/1/items", async (route) => {
            if (route.request().method() === "GET")
                return route.fulfill({
                    status: 503,
                    contentType: "application/json",
                    body: '{"error":"Refresh failed"}',
                });
            return route.continue();
        });
        await settings.click();
        await page.locator("#currency-select").selectOption("USD");
        await page.waitForFunction(() =>
            document
                .querySelector("#currency-save-status")
                .textContent.includes("Items could not refresh"),
        );
        assert.equal(await page.locator("#header-currency").innerText(), "USD");
        assert.equal(await page.locator("#shopping-budget").inputValue(), "");
        assert.equal(
            await page.locator(".item-price").filter({ hasText: "Price not set" }).count(),
            4,
        );
        await page.unroute("**/api/lists/1/items");
        await page.keyboard.press("Escape");
        await reload();
        assert.equal((await request("GET", "/api/settings")).currency, "USD");
        console.log(
            "PASS committed currency reset remains consistent when the follow-up item request fails",
        );

        await page.evaluate(() => {
            Object.defineProperty(navigator, "geolocation", {
                configurable: true,
                value: {
                    getCurrentPosition: (success) => {
                        window.delayedLocation = success;
                    },
                },
            });
        });
        await page.locator("#detect-currency").click();
        assert.equal(await page.locator("#list-select").isDisabled(), true);
        assert.equal(await page.locator("#new-list-button").isDisabled(), true);
        const locationRequest = page.waitForRequest((r) =>
            r.url().endsWith("/api/detect-currency"),
        );
        await page.evaluate(() =>
            window.delayedLocation({ coords: { latitude: -30.000001, longitude: 25.123456 } }),
        );
        assert.deepEqual((await locationRequest).postDataJSON(), {
            latitude: -30,
            longitude: 25.12,
        });
        await ready();
        assert.match(await page.locator("#shopping-area").inputValue(), /Cape Town/);
        assert.equal(
            await page.evaluate(() => Object.values(localStorage).some((v) => v.includes("25.12"))),
            false,
        );
        console.log(
            "PASS list stays locked while geolocation permission is pending; coordinates rounded before browser sends them",
        );

        await settings.click();
        await page.locator("#currency-select").selectOption("KWD");
        await page.waitForFunction(
            () => document.querySelector("#header-currency").textContent === "KWD",
        );
        await page.keyboard.press("Escape");
        await add("Three decimals", 3, 0.001);
        assert.match(await page.locator("#estimated-total").innerText(), /0[,.]003/);
        await settings.click();
        await page.locator("#currency-select").selectOption("JPY");
        await page.waitForFunction(
            () => document.querySelector("#header-currency").textContent === "JPY",
        );
        await page.keyboard.press("Escape");
        await add("Fractional estimate in yen", 1, 1.234);
        assert.match(await page.locator("#estimated-total").innerText(), /1[,.]234/);
        console.log(
            "PASS 0- and 3-minor-unit currencies preserve visible estimate precision; no exchange-rate conversion",
        );

        const longName = "Very long grocery name ".repeat(5).slice(0, 120);
        await add(longName, 99, 10.001);
        await page.locator("#shopping-area").fill("Very long town name ".repeat(8).slice(0, 160));
        const list = await request("POST", "/api/lists", {
            name: "Long shopping list ".repeat(5).slice(0, 80),
        });
        await request("POST", `/api/lists/${list.id}/items`, {
            name: longName,
            quantity: 2,
            price: 45,
        });
        await page.evaluate(
            (id) => localStorage.setItem("grocerglow.activeList", String(id)),
            list.id,
        );
        await reload();
        for (const width of [320, 390, 600, 768, 1024, 1440]) {
            await page.setViewportSize({ width, height: 1000 });
            assert.equal(
                await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
                true,
                `overflow at ${width}`,
            );
            await page.screenshot({
                path: path.join(evidence, `light-${width}.png`),
                fullPage: true,
            });
            await scan(`light ${width}`);
        }
        await page.locator(".edit-btn").click();
        await scan("edit form");
        await page.getByRole("button", { name: "Cancel", exact: true }).click();
        await page.locator("#theme-toggle").click();
        await scan("dark desktop");
        await page.screenshot({ path: path.join(evidence, "dark-1440.png"), fullPage: true });
        await page.setViewportSize({ width: 320, height: 700 });
        await scan("dark mobile");
        await page.screenshot({ path: path.join(evidence, "dark-320.png"), fullPage: true });
        await settings.click();
        await scan("dark mobile settings");
        await page.screenshot({ path: path.join(evidence, "settings-mobile.png"), fullPage: true });
        await page.keyboard.press("Escape");
        await page.emulateMedia({ reducedMotion: "reduce" });
        assert.equal(
            await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior),
            "auto",
        );
        console.log(
            "PASS long text, six responsive widths, light/dark, dialogs, reduced motion and automated WCAG A/AA checks",
        );

        const context = await browser.newContext();
        await context.addInitScript(() => {
            for (const name of ["localStorage", "sessionStorage"])
                Object.defineProperty(window, name, {
                    get() {
                        throw new DOMException("Blocked", "SecurityError");
                    },
                });
        });
        const blocked = await context.newPage();
        blocked.on("pageerror", (e) => errors.push(e.message));
        await blocked.goto(fixture.base);
        await blocked.waitForFunction(() => !document.querySelector("#list-select").disabled);
        await blocked.locator("#theme-toggle").click();
        await blocked.locator("#shopping-area").fill("Manual town");
        await blocked.locator("#shopping-mode-toggle").click();
        assert.equal(
            await blocked.locator("#shopping-mode-toggle").getAttribute("aria-pressed"),
            "true",
        );
        await context.close();
        const stale = await request("POST", "/api/lists", { name: "Soon deleted" });
        await request("DELETE", `/api/lists/${stale.id}`);
        await page.evaluate(
            (id) => localStorage.setItem("grocerglow.activeList", String(id)),
            stale.id,
        );
        await reload();
        assert.notEqual(await page.locator("#list-select").inputValue(), String(stale.id));
        assert.deepEqual(errors, []);
        console.log(
            "PASS unavailable browser storage, stale deleted-list preference and no uncaught JavaScript exceptions",
        );
    } finally {
        writeFileSync(path.join(evidence, "accessibility.json"), JSON.stringify(scans, null, 2));
        if (browser) await browser.close();
        await fixture.close();
    }
})().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
