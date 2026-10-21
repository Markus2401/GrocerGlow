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
        const context = await browser.newContext({
            permissions: ["geolocation"],
            geolocation: { latitude: -30, longitude: 25 },
        });
        const page = await context.newPage();
        const errors = [];
        page.on("pageerror", (error) => errors.push(error.message));
        await page.goto(`http://127.0.0.1:${port}`);
        await page.waitForFunction(
            () => document.querySelectorAll("#currency-select option").length > 100,
        );
        assert.equal(await page.getByRole("link", { name: "My Lists", exact: true }).count(), 1);
        await page.getByRole("button", { name: "Toggle dark mode", exact: true }).click();
        assert.equal(await page.locator("html").getAttribute("data-theme"), "dark");
        await page.reload();
        await page.waitForFunction(
            () => document.querySelectorAll("#currency-select option").length > 100,
        );
        assert.equal(await page.locator("html").getAttribute("data-theme"), "dark");
        assert.equal(await page.locator("#theme-toggle").getAttribute("aria-pressed"), "true");
        await page.getByRole("button", { name: "Toggle dark mode", exact: true }).click();
        console.log("PASS My Lists navigation, theme toggle and saved dark preference");
        const product = "Milk & bread + 50% / café <script>";
        await page.locator("#item-name").fill(product);
        await page.locator("#item-quantity").fill("2");
        await page.getByRole("button", { name: "Add Item", exact: true }).click();
        const link = page.getByRole("link", {
            name: `Find Local Prices for ${product}`,
            exact: true,
        });
        await link.waitFor();
        assert.equal(await link.getAttribute("href"), null);
        // Disabled links still let keyboard users reach an explanation and area input.
        await link.focus();
        await page.keyboard.press("Enter");
        assert.equal(
            await page
                .locator("#shopping-area")
                .evaluate((element) => element === document.activeElement),
            true,
        );
        assert.match(
            await page.locator("#price-search-status").innerText(),
            /Enter your town or city/,
        );
        const area = "Cape Town & surrounds, South Africa";
        await page.locator("#shopping-area").fill(area);
        let target = new URL(await link.getAttribute("href"));
        assert.equal(target.origin, "https://www.google.com");
        assert.equal(target.pathname, "/search");
        assert.equal(target.searchParams.get("q"), `${product} grocery price ${area} ZAR`);
        assert.equal(target.searchParams.size, 1);
        assert.equal(await link.getAttribute("rel"), "noopener noreferrer");
        assert.equal(await link.getAttribute("target"), "_blank");
        // Intercept the outgoing search page so testing does not query Google.
        await context.route("https://www.google.com/search?**", (route) =>
            route.fulfill({ contentType: "text/html", body: "<title>Search test</title>" }),
        );
        const popupPromise = page.waitForEvent("popup");
        await link.click();
        const popup = await popupPromise;
        await popup.waitForLoadState();
        assert.equal(new URL(popup.url()).searchParams.get("q"), target.searchParams.get("q"));
        await popup.close();
        console.log(
            "PASS safely encoded product/area, blank-area keyboard fallback, real new-tab navigation (search provider intercepted)",
        );

        await page.reload();
        await page.waitForFunction(() =>
            document.querySelector(".price-search-link")?.hasAttribute("href"),
        );
        assert.equal(await page.locator("#shopping-area").inputValue(), area);
        await page.getByRole("button", { name: "Settings", exact: true }).click();
        await page.locator("#settings-shopping-area").fill("Manual test town");
        assert.equal(await page.locator("#shopping-area").inputValue(), "Manual test town");
        await page.getByRole("button", { name: "Detect my location", exact: true }).click();
        await page.waitForFunction(
            () => document.querySelector("#shopping-area").value === "Cape Town, South Africa",
        );
        assert.equal(
            await page.locator("#settings-shopping-area").inputValue(),
            "Cape Town, South Africa",
        );
        assert.match(await page.locator("#settings-location-status").innerText(), /Cape Town/);
        await page.getByRole("button", { name: "Done", exact: true }).click();
        assert.match(
            await page.locator("#location-status").innerText(),
            /Cape Town, South Africa.*already correct/,
        );
        assert.equal(await page.locator("#currency-select").inputValue(), "ZAR");
        console.log(
            "PASS detection fills city/country even when currency is already correct; manual area survives refresh",
        );

        await page.getByRole("button", { name: "Edit", exact: true }).click();
        await page.locator(".edit-form input[type=number]").nth(1).fill("24.99");
        await page.getByRole("button", { name: "Save changes" }).click();
        await page.waitForFunction(() => !document.querySelector(".edit-form"));
        assert.match(await page.locator("#estimated-total").innerText(), /49[.,]98/);
        await page.locator("#shopping-budget").fill("100");
        await page.locator("#shopping-budget").press("Tab");
        await page.waitForFunction(
            () => document.querySelector("#settings-save-status").textContent === "Budget saved.",
        );
        assert.match(await page.locator("#budget-status").innerText(), /50[.,]02/);
        assert.equal(await page.locator("#budget-percentage").innerText(), "50% of budget");
        await page.locator("#shopping-budget").fill("10");
        assert.equal(await page.locator("#budget-percentage").innerText(), "500% of budget");
        assert.equal(await page.locator("#budget-percentage").getAttribute("data-tone"), "over");
        await page.locator("#shopping-budget").fill("0");
        assert.equal(await page.locator("#budget-percentage").innerText(), "Over budget");
        await page.locator("#shopping-budget").fill("100");
        await page.locator("#shopping-budget").press("Tab");
        await page.locator(".item-info input").check();
        await page.locator(".shopping-item.completed").waitFor();
        await page.reload();
        await page.waitForFunction(() => document.querySelector(".shopping-item.completed"));
        assert.match(await page.locator("#estimated-total").innerText(), /49[.,]98/);
        assert.equal(await page.locator("#shopping-budget").inputValue(), "100");
        console.log(
            "PASS researched price saved via Edit, totals/budget recalculated, purchased state and data survive refresh",
        );

        await page.locator("#item-name").fill("Bread for shopping mode");
        await page.getByRole("button", { name: "Add Item", exact: true }).click();
        await page.waitForFunction(() => document.querySelectorAll(".shopping-item").length === 2);
        await page.getByRole("button", { name: "Shopping Mode", exact: true }).click();
        assert.equal(await page.locator(".add-panel").isVisible(), false);
        assert.equal(await page.locator(".planning-column").isVisible(), false);
        assert.match(
            await page.locator(".item-text").first().innerText(),
            /Bread for shopping mode/,
        );
        assert.equal(
            await page.locator("#shopping-progress").innerText(),
            "1 of 2 items purchased",
        );
        await page.locator(".shopping-item").first().locator("input[type=checkbox]").check();
        await page.waitForFunction(
            () => document.querySelectorAll(".shopping-item.completed").length === 2,
        );
        await page.reload();
        await page.waitForFunction(
            () => document.querySelectorAll(".shopping-item.completed").length === 2,
        );
        assert.equal(
            await page.locator("#shopping-mode-toggle").getAttribute("aria-pressed"),
            "true",
        );
        assert.equal(
            await page.locator("#shopping-progress").innerText(),
            "2 of 2 items purchased",
        );
        await page.getByRole("link", { name: "Budget", exact: true }).click();
        assert.equal(await page.locator(".planning-column").isVisible(), true);
        assert.equal(
            await page.locator("#shopping-mode-toggle").getAttribute("aria-pressed"),
            "false",
        );
        page.once("dialog", (dialog) => dialog.accept());
        await page
            .locator(".shopping-item")
            .filter({ hasText: "Bread for shopping mode" })
            .getByRole("button", { name: "Delete", exact: true })
            .click();
        await page.waitForFunction(() => document.querySelectorAll(".shopping-item").length === 1);
        console.log(
            "PASS Shopping Mode sorting, larger view, saved checkmarks, reload and Budget navigation exit",
        );

        await page.getByRole("button", { name: "Edit", exact: true }).click();
        await page.locator(".edit-form input[type=number]").nth(1).fill("");
        await page.getByRole("button", { name: "Save changes" }).click();
        await page.waitForFunction(() => !document.querySelector(".edit-form"));
        let acceptCurrency = false;
        page.on("dialog", (dialog) =>
            acceptCurrency || dialog.message().startsWith("Delete ")
                ? dialog.accept()
                : dialog.dismiss(),
        );
        await page.getByRole("button", { name: "Settings", exact: true }).click();
        assert.equal(
            await page.locator("#currency-dialog").evaluate((element) => element.open),
            true,
        );
        await page.locator("#currency-select").selectOption("EUR");
        await page.waitForFunction(
            () =>
                document.querySelector("#location-status").textContent ===
                "Currency change cancelled.",
        );
        assert.equal(await page.locator("#shopping-budget").inputValue(), "100");
        acceptCurrency = true;
        await page.locator("#currency-select").selectOption("EUR");
        await page.waitForFunction(() =>
            document.querySelector("#current-currency").textContent.includes("EUR"),
        );
        assert.match(new URL(await link.getAttribute("href")).searchParams.get("q"), / EUR$/);
        assert.equal(await page.locator("#shopping-budget").inputValue(), "");
        assert.equal(await page.locator("#header-currency").innerText(), "EUR");
        await page.getByRole("button", { name: "Done", exact: true }).click();
        assert.equal(
            await page.locator("#currency-dialog").evaluate((element) => element.open),
            false,
        );
        await page.getByRole("button", { name: "Settings", exact: true }).click();
        await page.keyboard.press("Escape");
        assert.equal(
            await page.locator("#currency-dialog").evaluate((element) => element.open),
            false,
        );
        console.log(
            "PASS currency cancellation preserves money; confirmed change updates search currency",
        );

        await context.setGeolocation({ latitude: -34, longitude: 25 });
        await page.reload(); // Reset status, not backend cache/rate limit.
        await page.waitForFunction(() =>
            document.querySelector("#current-currency").textContent.includes("EUR"),
        );
        await new Promise((resolve) => setTimeout(resolve, 1150));
        await page
            .getByRole("button", { name: "Detect My Location & Currency", exact: true })
            .click();
        await page.waitForFunction(() =>
            document.querySelector("#price-search-status").textContent.includes("no town or city"),
        );
        assert.equal(await page.locator("#shopping-area").inputValue(), "Cape Town, South Africa");
        console.log("PASS missing settlement gives manual fallback and preserves existing area");

        const deniedContext = await browser.newContext();
        const denied = await deniedContext.newPage();
        await denied.goto(`http://127.0.0.1:${port}`);
        await denied.waitForFunction(
            () => document.querySelectorAll("#currency-select option").length > 100,
        );
        await denied
            .getByRole("button", { name: "Detect My Location & Currency", exact: true })
            .click();
        await denied.waitForFunction(() =>
            /denied|unavailable|could not provide/i.test(
                document.querySelector("#location-status").textContent,
            ),
        );
        assert.match(
            await denied.locator("#price-search-status").innerText(),
            /Could not autofill your town or city/,
        );
        await denied.locator("#shopping-area").fill("Berlin, Germany");
        assert.match(
            new URL(
                await denied.locator(".price-search-link").getAttribute("href"),
            ).searchParams.get("q"),
            /Berlin, Germany/,
        );
        await deniedContext.close();
        for (const width of [1280, 768, 375, 320]) {
            await page.setViewportSize({ width, height: 900 });
            assert.equal(
                await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
                true,
                `overflow at ${width}px`,
            );
            assert.equal(await page.locator("#shopping-mode-toggle").isVisible(), true);
            assert.equal(await page.locator("[data-open-settings]").isVisible(), true);
            await page.getByRole("link", { name: "Budget", exact: true }).click();
            assert.equal(await page.locator("#shopping-budget").isVisible(), true);
            if (width <= 600) {
                const itemWidth = await page
                    .locator(".shopping-item")
                    .evaluate((element) => element.getBoundingClientRect().width);
                const detailsWidth = await page
                    .locator(".item-info")
                    .evaluate((element) => element.getBoundingClientRect().width);
                assert.ok(detailsWidth >= itemWidth - 30, `item details squeezed at ${width}px`);
            }
        }
        await page.getByRole("button", { name: "Delete", exact: true }).click();
        await page.waitForFunction(() => document.querySelectorAll(".shopping-item").length === 0);
        await page.locator("#empty-add").click();
        assert.equal(
            await page
                .locator("#item-name")
                .evaluate((element) => element === document.activeElement),
            true,
        );
        assert.equal(await page.locator("#item-count").innerText(), "0 items");
        assert.deepEqual(errors, []);
        console.log(
            "PASS denied-location manual searches, no horizontal overflow at 1280/768/375/320px, deletion, no JS exceptions",
        );
    } finally {
        if (browser) await browser.close();
        await fixture.close();
    }
})().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
