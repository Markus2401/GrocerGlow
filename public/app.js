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
const areaInput = document.getElementById("shopping-area");
const priceSearchStatus = document.getElementById("price-search-status");
const areaStorageKey = "grocerglow.shoppingArea";

// Only the editable area text is saved in this browser, never GPS coordinates.
try {
    areaInput.value = (localStorage.getItem(areaStorageKey) || "").slice(0, 160);
} catch {
    /* Manual searches still work when browser storage is unavailable. */
}

function updatePriceSearchLinks() {
    const area = areaInput.value.trim();
    for (const link of shoppingList.querySelectorAll(".price-search-link")) {
        if (area) {
            const url = new URL("https://www.google.com/search");
            url.searchParams.set(
                "q",
                `${link.dataset.itemName} grocery price ${area} ${activeCurrency}`,
            );
            link.href = url.href;
            link.removeAttribute("aria-disabled");
        } else {
            link.removeAttribute("href");
            link.setAttribute("aria-disabled", "true");
        }
    }
}

function saveSearchArea() {
    try {
        const area = areaInput.value.trim();
        if (area) localStorage.setItem(areaStorageKey, area);
        else localStorage.removeItem(areaStorageKey);
    } catch {
        /* Storage is optional. */
    }
    document.getElementById("settings-shopping-area").value = areaInput.value;
    updatePriceSearchLinks();
}

areaInput.addEventListener("input", () => {
    saveSearchArea();
    priceSearchStatus.textContent = "";
});

let items = [];
let activeCurrency = "ZAR";
let savedBudget = null;
let savingCurrency = false;
let detectingLocation = false;
let lists = [];
let activeList = null;
let loadingList = false;
let pendingMutations = 0;
let listDialogMode = "new";
const selectedListStorageKey = "grocerglow.activeList";
let shoppingMode = false;
try {
    shoppingMode = sessionStorage.getItem("grocerglow.shoppingMode") === "true";
} catch {
    /* Optional preference. */
}

// Controls live in index.html so their positions and labels stay predictable.
const controls = {
    select: document.getElementById("currency-select"),
    detectButton: document.getElementById("detect-currency"),
    currentCurrency: document.getElementById("current-currency"),
    locationStatus: document.getElementById("location-status"),
    saveStatus: document.getElementById("settings-save-status"),
    emptyList: document.getElementById("empty-list"),
};
const settingsDialog = document.getElementById("currency-dialog");
const listStatus = document.getElementById("list-status");
const currencySaveStatus = document.getElementById("currency-save-status");

// Keep Tab inside open dialogs, including the first/last-control boundary.
for (const dialog of document.querySelectorAll("dialog")) {
    dialog.addEventListener("keydown", (event) => {
        if (event.key !== "Tab") return;
        const fields = [
            ...dialog.querySelectorAll("button, input, select, a[href], [tabindex='0']"),
        ].filter((field) => !field.disabled && field.getClientRects().length);
        const target =
            event.shiftKey && document.activeElement === fields[0]
                ? fields.at(-1)
                : !event.shiftKey && document.activeElement === fields.at(-1)
                  ? fields[0]
                  : null;
        if (target) {
            event.preventDefault();
            target.focus();
        }
    });
}
for (const button of document.querySelectorAll("[data-open-settings]")) {
    button.addEventListener("click", () => {
        document.getElementById("settings-shopping-area").value = areaInput.value;
        settingsDialog.showModal();
    });
}
for (const id of ["close-settings", "done-settings"]) {
    document.getElementById(id).addEventListener("click", () => settingsDialog.close());
}
document.getElementById("empty-add").addEventListener("click", () => {
    setShoppingMode(false);
    itemInput.focus();
});
document.getElementById("settings-shopping-area").addEventListener("input", (event) => {
    areaInput.value = event.target.value;
    saveSearchArea();
    priceSearchStatus.textContent = "";
});

function applyTheme() {
    const dark = document.documentElement.dataset.theme === "dark";
    const button = document.getElementById("theme-toggle");
    button.setAttribute("aria-pressed", String(dark));
    button.title = dark ? "Switch to light mode" : "Switch to dark mode";
    document.getElementById("theme-icon").textContent = dark ? "☀" : "☾";
}
document.getElementById("theme-toggle").addEventListener("click", () => {
    const theme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = theme;
    try {
        localStorage.setItem("grocerglow.theme", theme);
    } catch {
        /* Theme still works for this visit. */
    }
    applyTheme();
});

function setShoppingMode(enabled, render = true) {
    shoppingMode = enabled;
    document.body.classList.toggle("shopping-mode", enabled);
    const button = document.getElementById("shopping-mode-toggle");
    button.setAttribute("aria-pressed", String(enabled));
    button.textContent = enabled ? "Exit Shopping Mode" : "Shopping Mode";
    document.getElementById("page-title").textContent = enabled
        ? "Shopping mode"
        : activeList?.name || "Your shopping list";
    document.getElementById("page-description").textContent = enabled
        ? "Tap items as you shop. Purchased items move to the bottom."
        : "Add what you need, check your budget, and you're ready to shop.";
    try {
        sessionStorage.setItem("grocerglow.shoppingMode", String(enabled));
    } catch {
        /* Optional preference. */
    }
    if (render) renderItems();
}
document
    .getElementById("shopping-mode-toggle")
    .addEventListener("click", () => setShoppingMode(!shoppingMode));
for (const link of document.querySelectorAll("[data-planning-link]")) {
    link.addEventListener("click", (event) => {
        setShoppingMode(false);
        if (link.getAttribute("href") === "#lists-panel") {
            event.preventDefault();
            document.getElementById("lists-panel").scrollIntoView({ block: "start" });
            document.getElementById("list-select").focus({ preventScroll: true });
        }
    });
}

function showListFeedback(message, error = false) {
    listStatus.textContent = message;
    listStatus.dataset.tone = error ? "error" : "success";
}
function setCurrencyStatus(message) {
    setLocationStatus(message);
    currencySaveStatus.textContent = message;
}

function setLocationStatus(message) {
    controls.locationStatus.textContent = message;
    document.getElementById("settings-location-status").textContent = message;
}
function setLocationBusy(busy) {
    busy = busy || loadingList || savingCurrency || detectingLocation;
    controls.detectButton.disabled = busy;
    document.getElementById("settings-detect-location").disabled = busy;
}

function showLocationFailure(message) {
    setLocationStatus(message);
    priceSearchStatus.textContent =
        "Could not autofill your town or city. Allow location in your browser and try again, " +
        "or enter your town manually. Your existing search area has been kept.";
}

// Central API helper: errors include the HTTP status when provided.
async function api(url, options) {
    const mutation = options?.method && options.method !== "GET";
    if (mutation) {
        pendingMutations++;
        updateListControls();
    }
    try {
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
    } finally {
        if (mutation) {
            pendingMutations--;
            updateListControls();
        }
    }
}

function jsonRequest(method, body) {
    return {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    };
}

function formatMoney(amount) {
    const preferredLocales = {
        ZAR: "en-ZA",
        EUR: "de-DE",
        USD: "en-US",
        GBP: "en-GB",
        CHF: "de-CH",
        AUD: "en-AU",
        JPY: "ja-JP",
        INR: "en-IN",
    };
    try {
        return new Intl.NumberFormat(
            preferredLocales[activeCurrency] || navigator.language || "en",
            {
                style: "currency",
                currency: activeCurrency,
                maximumFractionDigits: Math.max(
                    3,
                    new Intl.NumberFormat("en", {
                        style: "currency",
                        currency: activeCurrency,
                    }).resolvedOptions().minimumFractionDigits,
                ),
            },
        ).format(amount);
    } catch {
        return `${activeCurrency} ${Number(amount).toFixed(2)}`;
    }
}

function updateBudgetOverview() {
    const total = GrocerMoney.total(items);
    const missing = items.filter((item) => item.price === null).length;
    totalText.textContent = formatMoney(total);
    missingPricesText.textContent = missing
        ? `${missing} item(s) have no price. Estimated total excludes them.`
        : "All items have estimated prices.";

    const raw = budgetInput.value.trim();
    const budgetProgress = document.getElementById("budget-progress");
    const budgetPercentage = document.getElementById("budget-percentage");
    budgetProgress.hidden = true;
    budgetPercentage.hidden = true;
    delete budgetStatus.dataset.tone;
    if (raw === "") {
        budgetStatus.textContent = "Enter a budget to see how much remains.";
        return;
    }
    const budget = Number(raw);
    if (!GrocerMoney.validAmount(budget)) {
        budgetStatus.textContent = "Please enter a valid budget.";
        return;
    }
    const remaining = GrocerMoney.round(budget - total);
    budgetProgress.hidden = false;
    budgetPercentage.hidden = false;
    budgetPercentage.textContent =
        budget === 0
            ? total > 0
                ? "Over budget"
                : "No spending estimated"
            : `${Math.round((total / budget) * 100)}% of budget`;
    budgetPercentage.dataset.tone = remaining < 0 ? "over" : "within";
    budgetProgress.value =
        budget === 0 ? (total > 0 ? 100 : 0) : Math.min(100, (total / budget) * 100);
    budgetProgress.setAttribute(
        "aria-valuetext",
        `${formatMoney(total)} estimated against a ${formatMoney(budget)} budget`,
    );
    budgetStatus.dataset.tone = remaining < 0 ? "over" : "within";
    budgetStatus.textContent =
        remaining >= 0
            ? `Remaining budget: ${formatMoney(remaining)}`
            : `Over budget by ${formatMoney(Math.abs(remaining))}`;
}

// Render the products in their current currency.
function renderItems() {
    shoppingList.replaceChildren();
    controls.emptyList.hidden = items.length !== 0;
    document.getElementById("item-count").textContent =
        `${items.length} ${items.length === 1 ? "item" : "items"}`;
    const progress = document.getElementById("shopping-progress");
    progress.hidden = !shoppingMode;
    progress.textContent = `${items.filter((item) => item.completed).length} of ${items.length} items purchased`;
    const visibleItems = shoppingMode
        ? [...items].sort((a, b) => Number(a.completed) - Number(b.completed) || a.id - b.id)
        : items;
    for (const item of visibleItems) {
        const li = document.createElement("li");
        li.className = `shopping-item${item.completed ? " completed" : ""}`;
        li.dataset.itemId = String(item.id);

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
        price.textContent =
            item.price === null
                ? "Price not set"
                : `Estimated total: ${formatMoney(GrocerMoney.lineTotal(item))}`;
        details.append(name, price);
        label.append(checkbox, details);

        checkbox.addEventListener("change", async () => {
            const hadFocus = document.activeElement === checkbox;
            checkbox.disabled = true;
            try {
                const saved = await api(
                    listUrl(`/items/${item.id}`),
                    jsonRequest("PATCH", { completed: checkbox.checked }),
                );
                item.completed = saved.completed;
                showListFeedback(
                    saved.completed
                        ? `Marked ${item.name} as purchased.`
                        : `Marked ${item.name} as still needed.`,
                );
                const restoreFocus = hadFocus && document.activeElement === document.body;
                renderItems();
                if (restoreFocus)
                    shoppingList
                        .querySelector(`[data-item-id="${item.id}"] input`)
                        .focus({ preventScroll: true });
            } catch (error) {
                checkbox.checked = item.completed;
                showListFeedback(error.message, true);
            } finally {
                checkbox.disabled = false;
                if (hadFocus && checkbox.isConnected && document.activeElement === document.body)
                    checkbox.focus();
            }
        });

        const remove = document.createElement("button");
        remove.type = "button";
        remove.className = "delete-btn";
        remove.textContent = "Delete";
        remove.addEventListener("click", async () => {
            if (!window.confirm(`Delete "${item.name}" from this list? This cannot be undone.`))
                return;
            const nextItem = li.nextElementSibling || li.previousElementSibling;
            const nextId = nextItem?.dataset.itemId;
            remove.disabled = true;
            try {
                await api(listUrl(`/items/${item.id}`), { method: "DELETE" });
                items = items.filter((existing) => existing.id !== item.id);
                showListFeedback(`Removed ${item.name} from your list.`);
                renderItems();
                const target = nextId
                    ? shoppingList.querySelector(`[data-item-id="${nextId}"] .delete-btn`)
                    : itemInput;
                target?.focus();
            } catch (error) {
                showListFeedback(error.message, true);
                remove.disabled = false;
            }
        });

        const edit = document.createElement("button");
        edit.type = "button";
        edit.className = "edit-btn";
        edit.textContent = "Edit";

        const actions = document.createElement("div");
        actions.className = "item-actions";
        const search = document.createElement("a");
        search.className = "price-search-link";
        search.setAttribute("role", "link");
        search.textContent = "Find Local Prices";
        search.setAttribute("aria-label", `Find Local Prices for ${item.name}`);
        search.dataset.itemName = item.name;
        search.target = "_blank";
        search.rel = "noopener noreferrer";
        search.referrerPolicy = "no-referrer";
        search.tabIndex = 0;
        function requireSearchArea(event) {
            if (areaInput.value.trim()) return;
            event.preventDefault();
            priceSearchStatus.textContent = "Enter your town or city before searching for prices.";
            areaInput.focus();
        }
        search.addEventListener("click", requireSearchArea);
        search.addEventListener("keydown", (event) => {
            if (event.key === "Enter" && !areaInput.value.trim()) requireSearchArea(event);
        });
        actions.append(search, edit, remove);

        edit.addEventListener("click", () => {
            if (
                savingCurrency ||
                loadingList ||
                pendingMutations ||
                detectingLocation ||
                li.classList.contains("editing")
            )
                return;
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
                field.name = settings.key;
                field.autocomplete = "off";
                field.value = value;
                field.required = settings.required ?? false;
                if (settings.min !== undefined) field.min = settings.min;
                if (type === "number")
                    field.max = settings.key === "quantity" ? "1000000" : "1000000000";
                if (settings.step !== undefined) field.step = settings.step;
                if (settings.maxLength !== undefined) field.maxLength = settings.maxLength;
                wrapper.append(fieldLabel, field);
                return { wrapper, field };
            }

            const nameField = makeField("Item name", "text", item.name, {
                key: "name",
                required: true,
                maxLength: 120,
            });
            const quantityField = makeField("Quantity", "number", String(item.quantity), {
                key: "quantity",
                required: true,
                min: "1",
                step: "1",
            });
            const priceField = makeField(
                "Price per item (optional)",
                "number",
                item.price === null ? "" : String(item.price),
                { key: "price", min: "0", step: "0.001" },
            );

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

            editForm.addEventListener("submit", async (event) => {
                event.preventDefault();
                if (savingCurrency || loadingList || pendingMutations || detectingLocation) {
                    message.textContent = "Wait for the currency change to finish.";
                    return;
                }
                const name = nameField.field.value.trim();
                const quantity = Number(quantityField.field.value);
                const rawPrice = priceField.field.value.trim();
                const price = rawPrice === "" ? null : Number(rawPrice);

                if (
                    !name ||
                    name.length > 120 ||
                    !GrocerMoney.validQuantity(quantity) ||
                    (price !== null && !GrocerMoney.validAmount(price))
                ) {
                    message.textContent = "Enter a valid name, quantity and optional price.";
                    return;
                }

                save.disabled = true;
                cancel.disabled = true;
                message.textContent = "Saving changes…";
                try {
                    const updated = await api(
                        listUrl(`/items/${item.id}`),
                        jsonRequest("PATCH", { name, quantity, price }),
                    );
                    const index = items.findIndex((existing) => existing.id === updated.id);
                    if (index !== -1) items[index] = updated;
                    showListFeedback(`Saved changes to ${updated.name}.`);
                    renderItems();
                    shoppingList.querySelector(`[data-item-id="${item.id}"] .edit-btn`).focus();
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
    updatePriceSearchLinks();
    updateBudgetOverview();
    updateListControls();
}

form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (savingCurrency || loadingList || pendingMutations || detectingLocation || !activeList)
        return;
    const name = itemInput.value.trim();
    const quantity = Number(quantityInput.value);
    const rawPrice = priceInput.value.trim();
    const price = rawPrice === "" ? null : Number(rawPrice);

    if (
        !name ||
        name.length > 120 ||
        !GrocerMoney.validQuantity(quantity) ||
        (price !== null && !GrocerMoney.validAmount(price))
    ) {
        showListFeedback("Enter a valid name, quantity and optional price.", true);
        return;
    }

    const button = form.querySelector('button[type="submit"]');
    button.disabled = true;
    try {
        const saved = await api(listUrl("/items"), jsonRequest("POST", { name, quantity, price }));
        showListFeedback(`Added ${name} to your list.`);
        items.push(saved);
        renderItems();
        itemInput.value = "";
        quantityInput.value = "1";
        priceInput.value = "";
        itemInput.focus();
    } catch (error) {
        showListFeedback(error.message, true);
    } finally {
        button.disabled = false;
    }
});

budgetInput.addEventListener("input", updateBudgetOverview);
budgetInput.addEventListener("change", async () => {
    if (savingCurrency || loadingList || pendingMutations || detectingLocation || !activeList)
        return;
    const raw = budgetInput.value.trim();
    const budget = raw === "" ? null : Number(raw);
    if (budget !== null && !GrocerMoney.validAmount(budget)) {
        controls.saveStatus.textContent = "Please enter a valid budget.";
        return;
    }
    controls.saveStatus.textContent = "Saving budget…";
    try {
        const settings = await api(listUrl("/settings"), jsonRequest("PATCH", { budget }));
        savedBudget = settings.budget;
        activeList.budget = settings.budget;
        controls.saveStatus.textContent = "Budget saved.";
    } catch (error) {
        budgetInput.value = savedBudget === null ? "" : String(savedBudget);
        updateBudgetOverview();
        controls.saveStatus.textContent = `${error.message} The saved budget has been restored.`;
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
    } catch {
        /* ISO codes remain usable. */
    }

    controls.select.replaceChildren();
    for (const code of codes) {
        const option = document.createElement("option");
        option.value = code;
        option.textContent = `${code} — ${displayNames?.of(code) || code}`;
        controls.select.appendChild(option);
    }
    if (![...controls.select.options].some((option) => option.value === activeCurrency)) {
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
    document.getElementById("header-currency").textContent = currency;
    document.getElementById("budget-currency").textContent = currency;
    document.getElementById("price-currency").textContent = `(${currency})`;
    controls.select.value = currency;
    renderItems();
}

function hasMonetaryValues() {
    return savedBudget !== null || items.some((item) => item.price !== null);
}

// Currency changes are NOT conversions. With user confirmation, the backend
// atomically clears monetary amounts (but preserves shopping item names).
async function changeCurrency(currency) {
    if (currency === activeCurrency) {
        controls.select.value = activeCurrency;
        return true;
    }
    if (savingCurrency || loadingList || pendingMutations || !activeList) return false;

    const resetMonetaryValues = hasMonetaryValues();
    if (resetMonetaryValues) {
        const confirmed = window.confirm(
            `Change from ${activeCurrency} to ${currency}?\n\n` +
                "GrocerGlow cannot convert prices. To prevent showing incorrect amounts, " +
                "it will CLEAR all saved item prices and your shopping budget. " +
                "Item names, quantities and checkmarks will stay.\n\nContinue?",
        );
        if (!confirmed) {
            controls.select.value = activeCurrency;
            setCurrencyStatus("Currency change cancelled.");
            return false;
        }
    }

    savingCurrency = true;
    controls.select.disabled = true;
    setLocationBusy(true);
    budgetInput.disabled = true;
    setCurrencyStatus("Saving currency…");
    try {
        let settings;
        try {
            settings = await api(
                listUrl("/settings/currency"),
                jsonRequest("PATCH", { currency, resetMonetaryValues }),
            );
        } catch (error) {
            // Handles out-of-date tabs with monetary values unseen locally.
            if (error.status !== 409 || resetMonetaryValues) throw error;
            const confirmed = window.confirm(
                "Saved prices or a budget exist on the server. " +
                    "Switching currency will clear those monetary values, " +
                    "but keep your shopping items. Continue?",
            );
            if (!confirmed) return false;
            settings = await api(
                listUrl("/settings/currency"),
                jsonRequest("PATCH", { currency, resetMonetaryValues: true }),
            );
        }

        // The PATCH has committed. Update the currency and cleared amounts before
        // a follow-up GET, which may fail independently of the successful save.
        items = items.map((item) => ({ ...item, price: null }));
        savedBudget = settings.budget;
        activeList.budget = settings.budget;
        activeList.currency = settings.currency;
        budgetInput.value = savedBudget === null ? "" : String(savedBudget);
        controls.saveStatus.textContent = "";
        applyCurrency(settings.currency);
        try {
            items = await api(listUrl("/items"));
            renderItems();
        } catch {
            setCurrencyStatus("Currency saved. Items could not refresh; reload to retry.");
            return true;
        }
        setCurrencyStatus(`Currency saved: ${settings.currency}.`);
        return true;
    } catch (error) {
        setCurrencyStatus(error.message);
        return false;
    } finally {
        controls.select.value = activeCurrency;
        controls.select.disabled = false;
        setLocationBusy(false);
        budgetInput.disabled = false;
        savingCurrency = false;
        updateListControls();
    }
}

controls.select.addEventListener("change", () => {
    void changeCurrency(controls.select.value);
});

// Geolocation is optional: browser permission is requested only after a click.
function detectLocation() {
    if (detectingLocation || loadingList || pendingMutations || savingCurrency || !activeList)
        return;
    if (!navigator.geolocation) {
        showLocationFailure(
            "Location is unavailable in this browser. Try Chrome or Edge, or enter your town manually.",
        );
        return;
    }
    // Lock the list for the whole permission + lookup operation, not only fetch.
    detectingLocation = true;
    setLocationBusy(true);
    updateListControls();
    setLocationStatus("Requesting location permission…");
    navigator.geolocation.getCurrentPosition(
        async (position) => {
            try {
                // Round before sending to our backend; never send exact GPS here.
                const latitude = Number(position.coords.latitude.toFixed(2));
                const longitude = Number(position.coords.longitude.toFixed(2));
                const detected = await api(
                    "/api/detect-currency",
                    jsonRequest("POST", { latitude, longitude }),
                );
                const place = [detected.city, detected.country].filter(Boolean).join(", ");
                if (detected.city) {
                    areaInput.value = place.slice(0, 160);
                    saveSearchArea();
                    priceSearchStatus.textContent = `Search area set to ${areaInput.value}. You can edit it.`;
                } else {
                    priceSearchStatus.textContent =
                        "Country detected, but no town or city was returned. Enter your search area manually.";
                }
                if (detected.currency === activeCurrency) {
                    setLocationStatus(
                        `${place} detected. Currency already correct (${activeCurrency}).`,
                    );
                    return;
                }
                setLocationStatus(`${place} detected. Suggested: ${detected.currency}.`);
                const changed = await changeCurrency(detected.currency);
                if (changed) {
                    setLocationStatus(`${place} detected. Currency set to ${detected.currency}.`);
                }
            } catch (error) {
                showLocationFailure(error.message);
            } finally {
                detectingLocation = false;
                setLocationBusy(false);
                updateListControls();
            }
        },
        (error) => {
            showLocationFailure(
                error.code === 1
                    ? "Location permission denied. Allow location for this site to autofill your town."
                    : "Your browser could not provide a location. Try Chrome or Edge with location enabled, or enter your town manually.",
            );
            detectingLocation = false;
            setLocationBusy(false);
            updateListControls();
        },
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    );
}
controls.detectButton.addEventListener("click", detectLocation);
document.getElementById("settings-detect-location").addEventListener("click", detectLocation);

function listUrl(suffix) {
    if (!activeList) throw new Error("Choose a shopping list first.");
    return `/api/lists/${activeList.id}${suffix}`;
}

function updateListControls() {
    const busy =
        loadingList || pendingMutations > 0 || savingCurrency || detectingLocation || !activeList;
    for (const id of [
        "list-select",
        "new-list-button",
        "rename-list-button",
        "shop-again-button",
        "shopping-mode-toggle",
    ]) {
        document.getElementById(id).disabled = busy;
    }
    const remove = document.getElementById("delete-list-button");
    remove.disabled = busy || lists.length <= 1;
    remove.title =
        lists.length <= 1
            ? "Create another list before deleting this one."
            : "Delete this list and its items";
    for (const element of document.querySelectorAll(
        "#item-form input, #item-form button, #shopping-list input, #shopping-list button, #list-management-form input, #list-management-form button",
    )) {
        element.disabled = busy;
    }
    budgetInput.disabled = busy;
    controls.select.disabled = busy;
}
function setListLoading(loading) {
    loadingList = loading;
    setLocationBusy(loading || savingCurrency);
    updateListControls();
}
function renderListOptions() {
    const select = document.getElementById("list-select");
    select.replaceChildren();
    for (const list of lists) {
        const option = document.createElement("option");
        option.value = String(list.id);
        option.textContent = list.name;
        select.appendChild(option);
    }
    if (activeList) select.value = String(activeList.id);
}
async function loadListData(id) {
    const [list, storedItems] = await Promise.all([
        api(`/api/lists/${id}`),
        api(`/api/lists/${id}/items`),
    ]);
    activeList = list;
    items = storedItems;
    savedBudget = list.budget;
    budgetInput.value = savedBudget === null ? "" : String(savedBudget);
    controls.saveStatus.textContent = "";
    currencySaveStatus.textContent = "";
    setLocationStatus("");
    listStatus.textContent = "";
    document.getElementById("current-list-name").textContent = list.name;
    try {
        localStorage.setItem(selectedListStorageKey, String(list.id));
    } catch {
        /* Optional preference. */
    }
    lists = lists.map((existing) => (existing.id === list.id ? list : existing));
    renderListOptions();
    setShoppingMode(shoppingMode, false);
    applyCurrency(list.currency);
}
async function refreshLists(preferredId) {
    lists = await api("/api/lists");
    const chosen = lists.find((list) => list.id === Number(preferredId)) || lists[0];
    if (!chosen) throw new Error("No shopping lists were found. Please restart the server.");
    await loadListData(chosen.id);
}
async function selectList(id) {
    if (loadingList || pendingMutations || savingCurrency) {
        document.getElementById("list-select").value = String(activeList.id);
        return;
    }
    setListLoading(true);
    try {
        await loadListData(id);
        document.getElementById("lists-status").textContent = `Opened ${activeList.name}.`;
    } catch (error) {
        if (error.status === 404) {
            try {
                await refreshLists();
            } catch (reloadError) {
                showListFeedback(reloadError.message, true);
            }
        }
        document.getElementById("list-select").value = String(activeList?.id || "");
        document.getElementById("lists-status").textContent = error.message;
    } finally {
        setListLoading(false);
    }
}
document
    .getElementById("list-select")
    .addEventListener("change", (event) => void selectList(Number(event.target.value)));

const listDialog = document.getElementById("list-dialog");
function openListDialog(mode) {
    if (loadingList || pendingMutations || savingCurrency) return;
    listDialogMode = mode;
    const duplicate = mode === "duplicate";
    document.getElementById("list-dialog-heading").textContent = duplicate
        ? "Shop Again"
        : mode === "rename"
          ? "Rename list"
          : "New list";
    document.getElementById("list-dialog-description").textContent = duplicate
        ? `Create a fresh copy of ${activeList.name}. Quantities, budget and currency are copied; purchased checkmarks are reset. Your original list stays unchanged.`
        : mode === "rename"
          ? "Give this list a new name. Its items and settings stay the same."
          : `Start an empty list in ${activeCurrency}. You can change its currency in Settings.`;
    document.getElementById("list-name").value = duplicate
        ? `${activeList.name.slice(0, 70)} (again)`
        : mode === "rename"
          ? activeList.name
          : "";
    document.getElementById("copy-prices").checked = false;
    document.getElementById("copy-prices-option").hidden = !duplicate;
    document.getElementById("copy-prices-note").hidden = !duplicate;
    document.getElementById("save-list-button").textContent = duplicate
        ? "Create fresh list"
        : mode === "rename"
          ? "Save name"
          : "Create list";
    document.getElementById("list-dialog-status").textContent = "";
    listDialog.showModal();
    document.getElementById("list-name").focus();
}
document.getElementById("new-list-button").addEventListener("click", () => openListDialog("new"));
document
    .getElementById("rename-list-button")
    .addEventListener("click", () => openListDialog("rename"));
document
    .getElementById("shop-again-button")
    .addEventListener("click", () => openListDialog("duplicate"));
for (const button of document.querySelectorAll("[data-close-list-dialog]")) {
    button.addEventListener("click", () => {
        if (!pendingMutations && !loadingList) listDialog.close();
    });
}
listDialog.addEventListener("cancel", (event) => {
    if (pendingMutations || loadingList) event.preventDefault();
});
document.getElementById("list-management-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    if (pendingMutations || loadingList) return;
    const name = document.getElementById("list-name").value.trim();
    const status = document.getElementById("list-dialog-status");
    if (!name || name.length > 80) {
        status.textContent = "Enter a list name (up to 80 characters).";
        return;
    }
    status.textContent = "Saving list…";
    try {
        const result =
            listDialogMode === "rename"
                ? await api(listUrl(""), jsonRequest("PATCH", { name }))
                : listDialogMode === "duplicate"
                  ? await api(
                        listUrl("/duplicate"),
                        jsonRequest("POST", {
                            name,
                            copyPrices: document.getElementById("copy-prices").checked,
                        }),
                    )
                  : await api(
                        "/api/lists",
                        jsonRequest("POST", { name, currency: activeCurrency }),
                    );
        setListLoading(true);
        await refreshLists(result.id);
        listDialog.close();
        document.getElementById("lists-status").textContent = `Opened ${result.name}.`;
    } catch (error) {
        status.textContent = error.message;
    } finally {
        setListLoading(false);
    }
});
document.getElementById("delete-list-button").addEventListener("click", async () => {
    if (loadingList || pendingMutations || savingCurrency || lists.length <= 1) return;
    const name = activeList.name;
    if (!window.confirm(`Delete "${name}" and its ${items.length} item(s)? This cannot be undone.`))
        return;
    try {
        await api(listUrl(""), { method: "DELETE" });
        setListLoading(true);
        await refreshLists();
        document.getElementById("lists-status").textContent =
            `Deleted ${name}. Opened ${activeList.name}.`;
    } catch (error) {
        document.getElementById("lists-status").textContent = error.message;
    } finally {
        setListLoading(false);
    }
});

async function initialize() {
    setListLoading(true);
    try {
        await loadCurrencyOptions();
        let savedId;
        try {
            savedId = localStorage.getItem(selectedListStorageKey);
        } catch {
            /* Optional preference. */
        }
        await refreshLists(savedId);
    } catch (error) {
        console.error("Initialization failed:", error);
        document.getElementById("lists-status").textContent =
            "Could not load your lists. Refresh to retry.";
    } finally {
        setListLoading(false);
    }
}

applyTheme();
setShoppingMode(shoppingMode, false);
void initialize();
