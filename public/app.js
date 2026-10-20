"use strict";

// GrocerGlow frontend: items, budget and fully integrated currency settings.
// Currency labels are formatting only; this application does not convert money.
const form = document.getElementById("item-form");
const itemInput = document.getElementById("item-name");
const quantityInput = document.getElementById("item-quantity");
const priceInput = document.getElementById("item-price");
const shoppingList = document.getElementById("shopping-list");
const budgetInput = document.getElementById("shopping-budget");
const totalText = document.getElementById("estimated-total");
const budgetStatus = document.getElementById("budget-status");
const missingPricesText = document.getElementById("missing-prices");

let items = [];
let activeCurrency = "ZAR";
let savedBudget = null;
let savingCurrency = false;

// Your earlier index.html did not contain a manual currency dropdown.
// Build any missing currency controls with JavaScript, so only these four
// requested files need to be replaced; index.html can remain unchanged.
function ensureCurrencyControls() {
    let panel = document.querySelector(".currency-settings");
    if (!panel) {
        panel = document.createElement("div");
        panel.className = "currency-settings";
        const summary = document.querySelector(".budget-summary");
        budgetInput.closest("section").insertBefore(panel, summary || null);
    }

    let select = document.getElementById("currency-select");
    if (!select) {
        const label = document.createElement("label");
        label.setAttribute("for", "currency-select");
        label.textContent = "Choose a currency";
        select = document.createElement("select");
        select.id = "currency-select";
        const detect = panel.querySelector("#detect-currency");
        panel.insertBefore(label, detect || null);
        panel.insertBefore(select, detect || null);
    }

    function ensureElement(id, tagName, text) {
        let element = document.getElementById(id);
        if (!element) {
            element = document.createElement(tagName);
            element.id = id;
            element.textContent = text;
            panel.appendChild(element);
        }
        return element;
    }

    const detectButton = ensureElement(
        "detect-currency", "button", "Detect My Currency"
    );
    detectButton.type = "button";
    const currentCurrency = ensureElement(
        "current-currency", "p", "Current currency: Loading..."
    );
    const locationStatus = ensureElement(
        "location-status", "p", "Choose a currency or detect your country."
    );
    locationStatus.setAttribute("role", "status");
    locationStatus.setAttribute("aria-live", "polite");

    // Earlier HTML versions contain a long location paragraph, and previous
    // app.js versions add a second disclaimer. Remove those duplicates and
    // replace them with one concise, accessible notice plus OSM credit.
    for (const paragraph of panel.querySelectorAll("p")) {
        const text = paragraph.textContent || "";
        if (
            paragraph.id === "currency-note" ||
            paragraph.classList.contains("currency-disclaimer") ||
            paragraph.classList.contains("location-credit") ||
            (paragraph.classList.contains("small-note") &&
                (/OpenStreetMap|Location detection|Currency detection|Map data:/i.test(text)))
        ) {
            paragraph.remove();
        }
    }

    const notice = document.createElement("p");
    notice.id = "currency-note";
    notice.className = "currency-privacy-note";
    notice.append("Location detection shares approximate coordinates with OpenStreetMap. ");
    const credit = document.createElement("a");
    credit.href = "https://www.openstreetmap.org/copyright";
    credit.target = "_blank";
    credit.rel = "noopener noreferrer";
    credit.textContent = "© OpenStreetMap contributors";
    notice.appendChild(credit);
    panel.appendChild(notice);

    let saveStatus = document.getElementById("settings-save-status");
    if (!saveStatus) {
        saveStatus = document.createElement("p");
        saveStatus.id = "settings-save-status";
        saveStatus.setAttribute("role", "status");
        budgetInput.insertAdjacentElement("afterend", saveStatus);
    }

    let emptyList = document.getElementById("empty-list");
    if (!emptyList) {
        emptyList = document.createElement("p");
        emptyList.id = "empty-list";
        emptyList.textContent = "Your shopping list is empty.";
        shoppingList.insertAdjacentElement("afterend", emptyList);
    }
    return { select, detectButton, currentCurrency, locationStatus, saveStatus, emptyList };
}

const controls = ensureCurrencyControls();

// Central API helper: errors include the HTTP status when provided.
async function api(url, options) {
    const response = await fetch(url, options);
    if (response.status === 204) return null;
    let data;
    try {
        data = await response.json();
    } catch {
        throw new Error(`The server returned HTTP ${response.status}.`);
    }
    if (!response.ok) {
        const error = new Error(data?.error || "Request failed.");
        error.status = response.status;
        throw error;
    }
    return data;
}

function jsonRequest(method, body) {
    return {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    };
}

function formatMoney(amount) {
    const preferredLocales = {
        ZAR: "en-ZA", EUR: "de-DE", USD: "en-US",
        GBP: "en-GB", CHF: "de-CH", AUD: "en-AU",
        JPY: "ja-JP", INR: "en-IN"
    };
    try {
        return new Intl.NumberFormat(
            preferredLocales[activeCurrency] || navigator.language || "en",
            { style: "currency", currency: activeCurrency }
        ).format(amount);
    } catch {
        return `${activeCurrency} ${Number(amount).toFixed(2)}`;
    }
}

function updateBudgetOverview() {
    const total = items.reduce(
        (sum, item) => sum + (item.price === null ? 0 : item.quantity * item.price),
        0
    );
    const missing = items.filter(item => item.price === null).length;
    totalText.textContent = formatMoney(total);
    missingPricesText.textContent = missing
        ? `${missing} item(s) have no price. Estimated total excludes them.`
        : "All items have estimated prices.";

    const raw = budgetInput.value.trim();
    if (raw === "") {
        budgetStatus.textContent = "Enter a budget to see how much remains.";
        return;
    }
    const budget = Number(raw);
    if (!Number.isFinite(budget) || budget < 0) {
        budgetStatus.textContent = "Please enter a valid budget.";
        return;
    }
    const remaining = budget - total;
    budgetStatus.textContent = remaining >= 0
        ? `Remaining budget: ${formatMoney(remaining)}`
        : `Over budget by ${formatMoney(Math.abs(remaining))}`;
}

// Render the products in their current currency.
function renderItems() {
    shoppingList.replaceChildren();
    controls.emptyList.hidden = items.length !== 0;
    for (const item of items) {
        const li = document.createElement("li");
        li.className = `shopping-item${item.completed ? " completed" : ""}`;

        const label = document.createElement("label");
        label.className = "item-info";
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = item.completed;
        const details = document.createElement("span");
        details.className = "item-details";
        const name = document.createElement("span");
        name.className = "item-text";
        name.textContent = `${item.quantity} × ${item.name}`;
        const price = document.createElement("span");
        price.className = "item-price";
        price.textContent = item.price === null
            ? "Price not set"
            : `Estimated total: ${formatMoney(item.quantity * item.price)}`;
        details.append(name, price);
        label.append(checkbox, details);

        checkbox.addEventListener("change", async () => {
            checkbox.disabled = true;
            try {
                const saved = await api(
                    `/api/items/${item.id}`,
                    jsonRequest("PATCH", { completed: checkbox.checked })
                );
                item.completed = saved.completed;
                renderItems();
            } catch (error) {
                checkbox.checked = item.completed;
                alert(error.message);
            } finally {
                checkbox.disabled = false;
            }
        });

        const remove = document.createElement("button");
        remove.type = "button";
        remove.className = "delete-btn";
        remove.textContent = "Delete";
        remove.addEventListener("click", async () => {
            remove.disabled = true;
            try {
                await api(`/api/items/${item.id}`, { method: "DELETE" });
                items = items.filter(existing => existing.id !== item.id);
                renderItems();
            } catch (error) {
                alert(error.message);
                remove.disabled = false;
            }
        });

        // LESSON 14: Edit an existing product without deleting it.
        const edit = document.createElement("button");
        edit.type = "button";
        edit.className = "edit-btn";
        edit.textContent = "Edit";

        const actions = document.createElement("div");
        actions.className = "item-actions";
        actions.append(edit, remove);

        edit.addEventListener("click", () => {
            if (savingCurrency || li.classList.contains("editing")) return;
            li.classList.add("editing");

            const editForm = document.createElement("form");
            editForm.className = "edit-form";
            editForm.setAttribute("aria-label", `Edit ${item.name}`);

            // Building inputs with the DOM API treats names as text, not HTML.
            function makeField(caption, type, value, settings = {}) {
                const wrapper = document.createElement("div");
                const fieldLabel = document.createElement("label");
                const field = document.createElement("input");
                field.id = `edit-${settings.key}-${item.id}`;
                fieldLabel.htmlFor = field.id;
                fieldLabel.textContent = caption;
                field.type = type;
                field.value = value;
                field.required = settings.required ?? false;
                if (settings.min !== undefined) field.min = settings.min;
                if (settings.step !== undefined) field.step = settings.step;
                if (settings.maxLength !== undefined) field.maxLength = settings.maxLength;
                wrapper.append(fieldLabel, field);
                return { wrapper, field };
            }

            const nameField = makeField("Item name", "text", item.name,
                { key: "name", required: true, maxLength: 120 });
            const quantityField = makeField("Quantity", "number", String(item.quantity),
                { key: "quantity", required: true, min: "1", step: "1" });
            const priceField = makeField("Price per item (optional)", "number",
                item.price === null ? "" : String(item.price),
                { key: "price", min: "0", step: "0.01" });

            const fields = document.createElement("div");
            fields.className = "edit-fields";
            fields.append(nameField.wrapper, quantityField.wrapper, priceField.wrapper);

            const message = document.createElement("p");
            message.className = "edit-error";
            message.setAttribute("role", "alert");

            const save = document.createElement("button");
            save.type = "submit";
            save.className = "save-edit-btn";
            save.textContent = "Save changes";

            const cancel = document.createElement("button");
            cancel.type = "button";
            cancel.className = "cancel-edit-btn";
            cancel.textContent = "Cancel";

            const controls = document.createElement("div");
            controls.className = "edit-actions";
            controls.append(save, cancel);
            editForm.append(fields, message, controls);
            li.appendChild(editForm);
            nameField.field.focus();

            cancel.addEventListener("click", () => {
                editForm.remove();
                li.classList.remove("editing");
                edit.focus();
            });

            editForm.addEventListener("submit", async event => {
                event.preventDefault();
                if (savingCurrency) {
                    message.textContent = "Wait for the currency change to finish.";
                    return;
                }
                const name = nameField.field.value.trim();
                const quantity = Number(quantityField.field.value);
                const rawPrice = priceField.field.value.trim();
                const price = rawPrice === "" ? null : Number(rawPrice);

                if (!name || name.length > 120 ||
                    !Number.isSafeInteger(quantity) || quantity < 1 ||
                    (price !== null && (!Number.isFinite(price) || price < 0))) {
                    message.textContent = "Enter a valid name, quantity and optional price.";
                    return;
                }

                save.disabled = true;
                cancel.disabled = true;
                message.textContent = "Saving changes...";
                try {
                    const updated = await api(
                        `/api/items/${item.id}`,
                        jsonRequest("PATCH", { name, quantity, price })
                    );
                    const index = items.findIndex(existing => existing.id === updated.id);
                    if (index !== -1) items[index] = updated;
                    // Re-render updates the item and the budget calculation.
                    renderItems();
                } catch (error) {
                    message.textContent = error.message;
                    save.disabled = false;
                    cancel.disabled = false;
                }
            });
        });

        li.append(label, actions);
        shoppingList.appendChild(li);
    }
    updateBudgetOverview();
}

form.addEventListener("submit", async event => {
    event.preventDefault();
    if (savingCurrency) return;
    const name = itemInput.value.trim();
    const quantity = Number(quantityInput.value);
    const rawPrice = priceInput.value.trim();
    const price = rawPrice === "" ? null : Number(rawPrice);

    if (!name || name.length > 120 || !Number.isSafeInteger(quantity) || quantity < 1 ||
        (price !== null && (!Number.isFinite(price) || price < 0))) {
        alert("Enter a valid name, quantity and optional price.");
        return;
    }

    const button = form.querySelector('button[type="submit"]');
    button.disabled = true;
    try {
        const saved = await api("/api/items", jsonRequest("POST", { name, quantity, price }));
        items.push(saved);
        renderItems();
        itemInput.value = "";
        quantityInput.value = "1";
        priceInput.value = "";
        itemInput.focus();
    } catch (error) {
        alert(error.message);
    } finally {
        button.disabled = false;
    }
});

budgetInput.addEventListener("input", updateBudgetOverview);
budgetInput.addEventListener("change", async () => {
    if (savingCurrency) return;
    const raw = budgetInput.value.trim();
    const budget = raw === "" ? null : Number(raw);
    if (budget !== null && (!Number.isFinite(budget) || budget < 0)) {
        controls.saveStatus.textContent = "Please enter a valid budget.";
        return;
    }
    controls.saveStatus.textContent = "Saving budget...";
    try {
        const settings = await api("/api/settings", jsonRequest("PATCH", { budget }));
        savedBudget = settings.budget;
        controls.saveStatus.textContent = "Budget saved.";
    } catch (error) {
        controls.saveStatus.textContent = error.message;
    }
});

async function loadCurrencyOptions() {
    let codes;
    try {
        codes = await api("/api/currencies");
    } catch (error) {
        console.error(error);
        codes = ["ZAR", "EUR", "USD", "GBP", "AUD", "JPY", "CHF"];
    }
    let displayNames;
    try {
        displayNames = new Intl.DisplayNames([navigator.language], { type: "currency" });
    } catch { /* ISO codes remain usable. */ }

    controls.select.replaceChildren();
    for (const code of codes) {
        const option = document.createElement("option");
        option.value = code;
        option.textContent = `${code} — ${displayNames?.of(code) || code}`;
        controls.select.appendChild(option);
    }
    if (![...controls.select.options].some(option => option.value === activeCurrency)) {
        const option = document.createElement("option");
        option.value = activeCurrency;
        option.textContent = activeCurrency;
        controls.select.appendChild(option);
    }
    controls.select.value = activeCurrency;
}

function applyCurrency(currency) {
    activeCurrency = currency;
    controls.currentCurrency.textContent = `Current currency: ${currency}`;
    controls.select.value = currency;
    renderItems();
}

function hasMonetaryValues() {
    return savedBudget !== null || items.some(item => item.price !== null);
}

// Currency changes are NOT conversions. With user confirmation, the backend
// atomically clears monetary amounts (but preserves shopping item names).
async function changeCurrency(currency) {
    if (currency === activeCurrency) {
        controls.select.value = activeCurrency;
        return true;
    }
    if (savingCurrency) return false;

    const resetMonetaryValues = hasMonetaryValues();
    if (resetMonetaryValues) {
        const confirmed = window.confirm(
            `Change from ${activeCurrency} to ${currency}?\n\n` +
            "GrocerGlow cannot convert prices. To prevent showing incorrect amounts, " +
            "it will CLEAR all saved item prices and your shopping budget. " +
            "Item names, quantities and checkmarks will stay.\n\nContinue?"
        );
        if (!confirmed) {
            controls.select.value = activeCurrency;
            controls.locationStatus.textContent = "Currency change cancelled.";
            return false;
        }
    }

    savingCurrency = true;
    controls.select.disabled = true;
    controls.detectButton.disabled = true;
    budgetInput.disabled = true;
    controls.locationStatus.textContent = "Saving currency...";
    try {
        let settings;
        try {
            settings = await api(
                "/api/settings/currency",
                jsonRequest("PATCH", { currency, resetMonetaryValues })
            );
        } catch (error) {
            // Handles out-of-date tabs with monetary values unseen locally.
            if (error.status !== 409 || resetMonetaryValues) throw error;
            const confirmed = window.confirm(
                "Saved prices or a budget exist on the server. " +
                "Switching currency will clear those monetary values, " +
                "but keep your shopping items. Continue?"
            );
            if (!confirmed) return false;
            settings = await api(
                "/api/settings/currency",
                jsonRequest("PATCH", { currency, resetMonetaryValues: true })
            );
        }

        // Reload the authoritative saved data after the currency switch.
        const savedItems = await api("/api/items");
        items = savedItems;
        savedBudget = settings.budget;
        budgetInput.value = savedBudget === null ? "" : String(savedBudget);
        controls.saveStatus.textContent = "";
        applyCurrency(settings.currency);
        controls.locationStatus.textContent = `Currency saved: ${settings.currency}.`;
        return true;
    } catch (error) {
        controls.locationStatus.textContent = error.message;
        return false;
    } finally {
        controls.select.value = activeCurrency;
        controls.select.disabled = false;
        controls.detectButton.disabled = false;
        budgetInput.disabled = false;
        savingCurrency = false;
    }
}

controls.select.addEventListener("change", () => {
    void changeCurrency(controls.select.value);
});

// Geolocation is optional: browser permission is requested only after a click.
controls.detectButton.addEventListener("click", () => {
    if (!navigator.geolocation) {
        controls.locationStatus.textContent =
            "Location is unavailable. Please select a currency manually.";
        return;
    }
    controls.detectButton.disabled = true;
    controls.locationStatus.textContent = "Requesting location permission...";
    navigator.geolocation.getCurrentPosition(async position => {
        try {
            // Round before sending to our backend; never send exact GPS here.
            const latitude = Number(position.coords.latitude.toFixed(2));
            const longitude = Number(position.coords.longitude.toFixed(2));
            const detected = await api(
                "/api/detect-currency",
                jsonRequest("POST", { latitude, longitude })
            );
            if (detected.currency === activeCurrency) {
                controls.locationStatus.textContent =
                    `${detected.country} detected. Currency already correct (${activeCurrency}).`;
                return;
            }
            controls.locationStatus.textContent =
                `${detected.country} detected. Suggested: ${detected.currency}.`;
            const changed = await changeCurrency(detected.currency);
            if (changed) {
                controls.locationStatus.textContent =
                    `${detected.country} detected. Currency set to ${detected.currency}.`;
            }
        } catch (error) {
            controls.locationStatus.textContent = error.message;
        } finally {
            controls.detectButton.disabled = false;
        }
    }, error => {
        controls.locationStatus.textContent = error.code === 1
            ? "Location permission denied. Select a currency manually."
            : "Location unavailable. Select a currency manually.";
        controls.detectButton.disabled = false;
    }, { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 });
});

async function initialize() {
    controls.select.disabled = true;
    try {
        const [storedItems, settings] = await Promise.all([
            api("/api/items"), api("/api/settings")
        ]);
        items = storedItems;
        activeCurrency = settings.currency || "ZAR";
        savedBudget = settings.budget;
        budgetInput.value = savedBudget === null ? "" : String(savedBudget);
        await loadCurrencyOptions();
        applyCurrency(activeCurrency);
    } catch (error) {
        console.error("Initialization failed:", error);
        controls.saveStatus.textContent =
            "Could not load saved shopping data. Please refresh to retry.";
    } finally {
        controls.select.disabled = false;
    }
}

void initialize();
