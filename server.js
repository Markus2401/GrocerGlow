const express = require("express");
const path = require("path");
const db = require("./database");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "16kb" }));
app.use(express.static(path.join(__dirname, "public")));

// SQLite uses 0/1 for booleans. The browser uses false/true.
function formatItem(row) {
    return {
        id: row.id,
        name: row.name,
        quantity: row.quantity,
        price: row.price,
        completed: Boolean(row.completed)
    };
}

function validId(rawId) {
    const id = Number(rawId);
    return Number.isSafeInteger(id) && id > 0 ? id : null;
}

// GET /api/items: retrieve the shopping list.
app.get("/api/items", (req, res) => {
    try {
        const rows = db.prepare("SELECT * FROM items ORDER BY id").all();
        res.json(rows.map(formatItem));
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Could not load items." });
    }
});

// POST /api/items: create an item.
app.post("/api/items", (req, res) => {
    const { name, quantity, price } = req.body ?? {};

    if (typeof name !== "string" || !name.trim() || name.length > 120) {
        return res.status(400).json({ error: "Enter an item name (up to 120 characters)." });
    }
    if (!Number.isSafeInteger(quantity) || quantity < 1) {
        return res.status(400).json({ error: "Quantity must be a positive whole number." });
    }
    if (price != null && (typeof price !== "number" || !Number.isFinite(price) || price < 0)) {
        return res.status(400).json({ error: "Price must be zero or greater." });
    }

    try {
        const result = db.prepare(
            "INSERT INTO items (name, quantity, price) VALUES (?, ?, ?)"
        ).run(name.trim(), quantity, price ?? null);
        const row = db.prepare("SELECT * FROM items WHERE id = ?").get(result.lastInsertRowid);
        res.status(201).json(formatItem(row));
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Could not create item." });
    }
});


 // PATCH: Edit item details OR update purchased status

app.patch("/api/items/:id", (req, res) => {
    const itemId = Number(req.params.id);
    const body = req.body ?? {};

    if (!Number.isSafeInteger(itemId) || itemId < 1) {
        return res.status(400).json({
            error: "Invalid item ID."
        });
    }

    try {
        // Check whether the item exists
        const existingItem = db.prepare(
            "SELECT * FROM items WHERE id = ?"
        ).get(itemId);

        if (!existingItem) {
            return res.status(404).json({
                error: "Item not found."
            });
        }

        // OPTION 1: Update checkbox
        if (Object.hasOwn(body, "completed")) {
            if (typeof body.completed !== "boolean") {
                return res.status(400).json({
                    error: "Completed must be true or false."
                });
            }

            db.prepare(`
                UPDATE items
                SET completed = ?
                WHERE id = ?
            `).run(body.completed ? 1 : 0, itemId);

        // OPTION 2: Edit item details
        } else {
            const { name, quantity, price } = body;

            if (typeof name !== "string" || !name.trim()) {
                return res.status(400).json({
                    error: "Invalid item name."
                });
            }

            if (!Number.isInteger(quantity) || quantity < 1) {
                return res.status(400).json({
                    error: "Invalid quantity."
                });
            }

            if (
                price != null &&
                (typeof price !== "number" ||
                 !Number.isFinite(price) ||
                 price < 0)
            ) {
                return res.status(400).json({
                    error: "Invalid price."
                });
            }

            db.prepare(`
                UPDATE items
                SET name = ?, quantity = ?, price = ?
                WHERE id = ?
            `).run(name.trim(), quantity, price ?? null, itemId);
        }

        const updatedItem = db.prepare(
            "SELECT * FROM items WHERE id = ?"
        ).get(itemId);

        res.json(formatItem(updatedItem));

    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Could not update item."
        });
    }
});


// DELETE /api/items/:id: remove an item from SQLite.
app.delete("/api/items/:id", (req, res) => {
    const id = validId(req.params.id);
    if (!id) return res.status(400).json({ error: "Invalid item ID." });

    try {
        const result = db.prepare("DELETE FROM items WHERE id = ?").run(id);
        if (!result.changes) return res.status(404).json({ error: "Item not found." });
        res.sendStatus(204);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Could not delete item." });
    }
});

// GET /api/settings: load the saved budget and currency.
app.get("/api/settings", (req, res) => {
    try {
        const settings = db.prepare(
            "SELECT budget, currency FROM settings WHERE id = 1"
        ).get();
        res.json(settings);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Could not load settings." });
    }
});

// PATCH /api/settings: save the budget, including null for 'not set'.
app.patch("/api/settings", (req, res) => {
    const body = req.body ?? {};
    if (!Object.hasOwn(body, "budget")) {
        return res.status(400).json({ error: "Budget is required." });
    }
    const budget = body.budget;
    if (budget !== null && (typeof budget !== "number" || !Number.isFinite(budget) || budget < 0)) {
        return res.status(400).json({ error: "Enter a valid budget." });
    }

    try {
        db.prepare("UPDATE settings SET budget = ? WHERE id = 1").run(budget);
        res.json(db.prepare("SELECT budget, currency FROM settings WHERE id = 1").get());
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Could not save budget." });
    }
});

// The browser uses this list for the manual currency dropdown.
const supportedCurrencies = new Set(Intl.supportedValuesOf("currency"));
app.get("/api/currencies", (req, res) => {
    res.json([...supportedCurrencies]);
});

// PATCH /api/settings/currency: update safely without pretending prices convert.
// A confirmed currency switch clears monetary values but preserves shopping items.
app.patch("/api/settings/currency", (req, res) => {
    const currency = req.body?.currency;
    const resetMonetaryValues = req.body?.resetMonetaryValues === true;

    if (typeof currency !== "string" || !supportedCurrencies.has(currency)) {
        return res.status(400).json({ error: "Choose a supported currency." });
    }

    try {
        const change = db.transaction(() => {
            const settings = db.prepare(
                "SELECT budget, currency FROM settings WHERE id = 1"
            ).get();
            if (currency === settings.currency) return settings;

            const hasPrices = db.prepare(
                "SELECT EXISTS(SELECT 1 FROM items WHERE price IS NOT NULL) AS value"
            ).get().value === 1;

            // Never silently relabel amounts in a different currency.
            if ((hasPrices || settings.budget !== null) && !resetMonetaryValues) {
                return null;
            }

            if (hasPrices) {
                db.prepare("UPDATE items SET price = NULL WHERE price IS NOT NULL").run();
            }
            db.prepare(
                "UPDATE settings SET currency = ?, budget = NULL WHERE id = 1"
            ).run(currency);
            return db.prepare(
                "SELECT budget, currency FROM settings WHERE id = 1"
            ).get();
        });

        const settings = change();
        if (settings === null) {
            return res.status(409).json({
                error: "Changing currencies requires clearing saved prices and budget. Confirm the change to continue."
            });
        }
        res.json(settings);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Could not save currency." });
    }
});

// Third-party location requests happen ONLY on the backend, after a user click.
// Public Nominatim requires identifying headers and a low request rate.
const locationCache = new Map();
let lastLookupTime = 0;
const currencyMapPromise = import("country-to-currency").then(module => module.default);

app.post("/api/detect-currency", async (req, res) => {
    const { latitude, longitude } = req.body ?? {};
    if (typeof latitude !== "number" || typeof longitude !== "number" ||
        !Number.isFinite(latitude) || !Number.isFinite(longitude) ||
        latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
        return res.status(400).json({ error: "Invalid coordinates." });
    }

    // Coarse location is enough to suggest a country. Border areas may be inaccurate.
    const lat = latitude.toFixed(2);
    const lon = longitude.toFixed(2);
    const key = `${lat},${lon}`;

    try {
        let location = locationCache.get(key);
        if (!location || Date.now() - location.savedAt > 24 * 60 * 60 * 1000) {
            if (Date.now() - lastLookupTime < 1100) {
                return res.status(429).json({ error: "Please wait a moment and try again." });
            }
            lastLookupTime = Date.now();

            const url = new URL("https://nominatim.openstreetmap.org/reverse");
            url.searchParams.set("format", "jsonv2");
            url.searchParams.set("lat", lat);
            url.searchParams.set("lon", lon);
            url.searchParams.set("zoom", "3");
            url.searchParams.set("addressdetails", "1");

            const response = await fetch(url, {
                headers: {
                    "User-Agent": "GrocerGlow-IU-Portfolio/1.0 (educational shopping-list project)",
                    "Accept": "application/json"
                },
                signal: AbortSignal.timeout(10000)
            });
            if (!response.ok) throw new Error(`Nominatim returned ${response.status}`);

            const data = await response.json();
            const countryCode = data.address?.country_code?.toUpperCase();
            if (!countryCode) {
                return res.status(422).json({ error: "Country could not be identified." });
            }
            location = { countryCode, country: data.address.country, savedAt: Date.now() };
            locationCache.set(key, location);
        }

        const currencyMap = await currencyMapPromise;
        const currency = currencyMap[location.countryCode];
        if (typeof currency !== "string" || !supportedCurrencies.has(currency)) {
            return res.status(422).json({ error: "No supported currency was found for this country." });
        }
        res.json({ country: location.country, countryCode: location.countryCode, currency });
    } catch (error) {
        console.error("Currency detection:", error);
        res.status(502).json({ error: "Location service unavailable. Choose a currency manually." });
    }
});

app.listen(PORT, () => {
    console.log(`GrocerGlow running at http://localhost:${PORT}`);
});
