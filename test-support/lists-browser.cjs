const { chromium } = require("playwright");
const { startServer } = require("./fixture.cjs");
const assert = require("node:assert/strict");
(async () => {
    const fixture = await startServer();
    let browser;
    try {
        const { port } = fixture;
        browser = await chromium.launch({
            channel: process.env.GROCERGLOW_BROWSER || "msedge",
            headless: true,
        });
        const page = await browser.newPage();
        const errors = [];
        page.on("pageerror", (error) => errors.push(error.message));
        await page.goto(`http://127.0.0.1:${port}`);
        await page.waitForFunction(() => !document.querySelector("#list-select").disabled);
        const originalId = await page.locator("#list-select").inputValue();
        const waitForList = async (name) =>
            page.waitForFunction(
                (expected) =>
                    document.querySelector("#page-title").textContent === expected &&
                    !document.querySelector("#list-select").disabled,
                name,
            );
        const switchTo = async (id, name) => {
            await page.locator("#list-select").selectOption(id);
            await waitForList(name);
        };
        const saveBudget = async (amount) => {
            await page.locator("#shopping-budget").fill(amount);
            await page.locator("#shopping-budget").press("Tab");
            await page.waitForFunction(
                () =>
                    document.querySelector("#settings-save-status").textContent === "Budget saved.",
            );
        };
        const add = async (name, quantity, price) => {
            await page.locator("#item-name").fill(name);
            await page.locator("#item-quantity").fill(quantity);
            await page.locator("#item-price").fill(price);
            await page.getByRole("button", { name: "Add Item", exact: true }).click();
            await page.locator(".shopping-item").filter({ hasText: name }).waitFor();
        };
        const makeList = async (name) => {
            await page.getByRole("button", { name: "New list", exact: true }).click();
            await page.locator("#list-name").fill(name);
            await page.getByRole("button", { name: "Create list", exact: true }).click();
            await waitForList(name);
            return page.locator("#list-select").inputValue();
        };
        const duplicate = async (name, copyPrices) => {
            await page.getByRole("button", { name: "Shop Again", exact: true }).click();
            assert.equal(await page.locator("#copy-prices").isChecked(), false);
            await page.locator("#list-name").fill(name);
            if (copyPrices) await page.locator("#copy-prices").check();
            await page.getByRole("button", { name: "Create fresh list", exact: true }).click();
            await waitForList(name);
            return page.locator("#list-select").inputValue();
        };
        assert.equal(await page.locator("#delete-list-button").isEnabled(), false);
        await page.getByRole("button", { name: "Rename", exact: true }).click();
        await page.locator("#list-name").fill("Weekly groceries");
        await page.getByRole("button", { name: "Save name", exact: true }).click();
        await waitForList("Weekly groceries");
        await add("Milk", "3", "5");
        await saveBudget("100");
        await page.locator(".item-info input").check();
        await page.locator(".shopping-item.completed").waitFor();
        await page.getByRole("button", { name: "New list", exact: true }).click();
        await page.locator("#list-name").fill("   ");
        await page.getByRole("button", { name: "Create list", exact: true }).click();
        assert.match(await page.locator("#list-dialog-status").innerText(), /Enter a list name/);
        await page.keyboard.press("Escape");
        const secondId = await makeList("Weekend");
        assert.equal(await page.locator(".shopping-item").count(), 0);
        assert.equal(await page.locator("#shopping-budget").inputValue(), "");
        await page.getByRole("button", { name: "Settings", exact: true }).click();
        await page.locator("#currency-select").selectOption("EUR");
        await page.waitForFunction(
            () => document.querySelector("#header-currency").textContent === "EUR",
        );
        await page.getByRole("button", { name: "Done", exact: true }).click();
        await add("Bread", "1", "4");
        await saveBudget("50");
        await switchTo(originalId, "Weekly groceries");
        assert.equal(await page.locator("#shopping-budget").inputValue(), "100");
        assert.equal(await page.locator("#header-currency").innerText(), "ZAR");
        assert.equal(await page.locator(".item-info input").isChecked(), true);
        assert.match(await page.locator("#estimated-total").innerText(), /15/);
        console.log(
            "PASS create/rename lists, blank-name validation, independent items, budgets and currencies",
        );

        let release;
        const gate = new Promise((resolve) => {
            release = resolve;
        });
        const budgetPattern = `**/api/lists/${originalId}/settings`;
        await page.route(budgetPattern, async (route) => {
            if (route.request().method() === "PATCH") await gate;
            await route.continue();
        });
        await page.locator("#shopping-budget").fill("200");
        await page.locator("#shopping-budget").press("Tab");
        await page.waitForFunction(() => document.querySelector("#list-select").disabled);
        assert.equal(await page.locator("#list-select").isEnabled(), false);
        release();
        await page.waitForFunction(() => !document.querySelector("#list-select").disabled);
        await page.unroute(budgetPattern);
        await switchTo(secondId, "Weekend");
        assert.equal(await page.locator("#shopping-budget").inputValue(), "50");
        await switchTo(originalId, "Weekly groceries");
        assert.equal(await page.locator("#shopping-budget").inputValue(), "200");
        const failurePattern = `**/api/lists/${secondId}`;
        await page.route(failurePattern, (route) =>
            route.fulfill({
                status: 503,
                contentType: "application/json",
                body: JSON.stringify({ error: "Simulated list load failure" }),
            }),
        );
        await page.locator("#list-select").selectOption(secondId);
        await page.waitForFunction(() =>
            document
                .querySelector("#lists-status")
                .textContent.includes("Simulated list load failure"),
        );
        assert.equal(await page.locator("#list-select").inputValue(), originalId);
        assert.match(await page.locator(".item-text").innerText(), /Milk/);
        await page.unroute(failurePattern);
        console.log(
            "PASS list switching locked during saves; failed loading retains the previous list",
        );

        const freshId = await duplicate("Next week", false);
        assert.equal(await page.locator(".item-info input").isChecked(), false);
        assert.match(await page.locator(".item-price").innerText(), /Price not set/);
        assert.equal(await page.locator("#shopping-budget").inputValue(), "200");
        await switchTo(originalId, "Weekly groceries");
        assert.equal(await page.locator(".item-info input").isChecked(), true);
        assert.match(await page.locator("#estimated-total").innerText(), /15/);
        const pricedId = await duplicate("With estimates", true);
        assert.equal(await page.locator(".item-info input").isChecked(), false);
        assert.match(await page.locator("#estimated-total").innerText(), /15/);
        await page.getByRole("button", { name: "Rename", exact: true }).click();
        await page.locator("#list-name").fill("Party");
        await page.getByRole("button", { name: "Save name", exact: true }).click();
        await waitForList("Party");
        await page.reload();
        await waitForList("Party");
        assert.equal(await page.locator("#list-select").inputValue(), pricedId);
        await page.getByRole("button", { name: "Shopping Mode", exact: true }).click();
        await page.locator(".item-info input").check();
        await page.locator(".shopping-item.completed").waitFor();
        await page.reload();
        await page.locator(".shopping-item.completed").waitFor();
        assert.equal(
            await page.locator("#shopping-mode-toggle").getAttribute("aria-pressed"),
            "true",
        );
        await page.getByRole("link", { name: "My Lists", exact: true }).click();
        await waitForList("Party");
        assert.equal(
            await page
                .locator("#list-select")
                .evaluate((element) => element === document.activeElement),
            true,
        );
        console.log(
            "PASS Shop Again optional estimates, original preservation, active-list refresh and Shopping Mode persistence",
        );

        let accept = false;
        page.on("dialog", (dialog) => (accept ? dialog.accept() : dialog.dismiss()));
        await page.getByRole("button", { name: "Settings", exact: true }).click();
        await page.locator("#currency-select").selectOption("USD");
        await page.waitForFunction(
            () =>
                document.querySelector("#currency-save-status").textContent ===
                "Currency change cancelled.",
        );
        assert.equal(await page.locator("#shopping-budget").inputValue(), "200");
        accept = true;
        await page.locator("#currency-select").selectOption("USD");
        await page.waitForFunction(
            () => document.querySelector("#header-currency").textContent === "USD",
        );
        await page.getByRole("button", { name: "Done", exact: true }).click();
        assert.equal(await page.locator("#shopping-budget").inputValue(), "");
        assert.match(await page.locator(".item-price").innerText(), /Price not set/);
        await switchTo(originalId, "Weekly groceries");
        assert.equal(await page.locator("#shopping-budget").inputValue(), "200");
        assert.equal(await page.locator("#header-currency").innerText(), "ZAR");
        assert.match(await page.locator("#estimated-total").innerText(), /15/);
        await switchTo(pricedId, "Party");
        accept = false;
        await page.getByRole("button", { name: "Delete list", exact: true }).click();
        assert.equal(await page.locator("#list-select option").count(), 4);
        accept = true;
        await page.getByRole("button", { name: "Delete list", exact: true }).click();
        await waitForList("Weekly groceries");
        assert.equal(await page.locator("#list-select option").count(), 3);
        await switchTo(freshId, "Next week");
        await page.getByRole("button", { name: "Delete list", exact: true }).click();
        await waitForList("Weekly groceries");
        await page.getByRole("button", { name: "Delete list", exact: true }).click();
        await waitForList("Weekend");
        assert.equal(await page.locator("#delete-list-button").isEnabled(), false);
        assert.equal(await page.locator("#shopping-budget").inputValue(), "50");
        assert.equal(await page.locator("#header-currency").innerText(), "EUR");
        assert.match(await page.locator(".item-text").innerText(), /Bread/);
        console.log(
            "PASS per-list currency safeguards, delete cancellation, cascade isolation and final-list protection",
        );
        for (const width of [1280, 768, 390, 320]) {
            await page.setViewportSize({ width, height: 900 });
            assert.equal(
                await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
                true,
                `overflow ${width}`,
            );
        }
        assert.deepEqual(errors, []);
        console.log("PASS list-management responsive layout and no JavaScript exceptions");
    } finally {
        if (browser) await browser.close();
        await fixture.close();
    }
})().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
