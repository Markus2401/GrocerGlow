const express = require("express");
const path = require("path");
let db;
try {
    db = require("./database");
} catch (error) {
    if (require.main !== module) throw error;
    console.error(
        `Unable to open or initialize the database (${error.code || error.name}). Check GROCERGLOW_DB_PATH, folder permissions and backup access. Keep your database; do not reset it.`,
    );
    process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "127.0.0.1";
const money = require("./public/money");
const { createLocationHandler } = require("./location");

app.disable("x-powered-by");
app.use((req, res, next) => {
    res.set({
        "X-Content-Type-Options": "nosniff",
        "Referrer-Policy": "no-referrer",
        "Content-Security-Policy":
            "default-src 'self'; script-src 'self'; style-src 'self'; connect-src 'self'; img-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'",
    });
    next();
});

app.use(express.json({ limit: "16kb" }));
app.use("/api", (req, res, next) => {
    if (["POST", "PATCH"].includes(req.method)) {
        if (!req.is("application/json"))
            return res.status(415).json({ error: "Send an application/json request." });
        if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
            return res.status(400).json({ error: "Send a JSON object." });
        }
    }
    next();
});
app.use(express.static(path.join(__dirname, "public")));

// SQLite uses 0/1 for booleans. The browser uses false/true.
function formatItem(row) {
    return {
        id: row.id,
        name: row.name,
        quantity: row.quantity,
        price: row.price,
        completed: Boolean(row.completed),
    };
}

function validId(rawId) {
    const id = Number(rawId);
    return /^\d+$/.test(rawId) && Number.isSafeInteger(id) && id > 0 ? id : null;
}

// Lists own their budgets, currencies and items. Legacy routes use the oldest
// remaining list so earlier clients keep working without a global active-list setting.
function formatList(row) {
    return {
        id: row.id,
        name: row.name,
        budget: row.budget,
        currency: row.currency,
        createdAt: row.created_at,
    };
}
function resolveList(req, res, next) {
    const id =
        req.params.listId === undefined
            ? db.prepare("SELECT id FROM shopping_lists ORDER BY id LIMIT 1").get()?.id
            : validId(req.params.listId);
    if (!id) return res.status(400).json({ error: "Invalid list ID." });
    const list = db.prepare("SELECT * FROM shopping_lists WHERE id = ?").get(id);
    if (!list) return res.status(404).json({ error: "Shopping list not found." });
    req.shoppingList = list;
    next();
}
function validListName(name) {
    return typeof name === "string" && name.trim().length > 0 && name.length <= 80;
}

app.get("/api/lists", (req, res) => {
    res.json(db.prepare("SELECT * FROM shopping_lists ORDER BY id").all().map(formatList));
});
app.post("/api/lists", (req, res) => {
    const { name, currency } = req.body ?? {};
    if (!validListName(name))
        return res.status(400).json({ error: "Enter a list name (up to 80 characters)." });
    if (
        currency !== undefined &&
        (typeof currency !== "string" || !supportedCurrencies.has(currency))
    ) {
        return res.status(400).json({ error: "Choose a supported currency." });
    }
    const selectedCurrency =
        currency ??
        db.prepare("SELECT currency FROM shopping_lists ORDER BY id LIMIT 1").get().currency;
    const result = db
        .prepare("INSERT INTO shopping_lists (name, currency) VALUES (?, ?)")
        .run(name.trim(), selectedCurrency);
    res.status(201).json(
        formatList(
            db.prepare("SELECT * FROM shopping_lists WHERE id = ?").get(result.lastInsertRowid),
        ),
    );
});
app.get("/api/lists/:listId", resolveList, (req, res) => res.json(formatList(req.shoppingList)));
app.patch("/api/lists/:listId", resolveList, (req, res) => {
    if (!validListName(req.body?.name))
        return res.status(400).json({ error: "Enter a list name (up to 80 characters)." });
    db.prepare("UPDATE shopping_lists SET name = ? WHERE id = ?").run(
        req.body.name.trim(),
        req.shoppingList.id,
    );
    res.json(
        formatList(
            db.prepare("SELECT * FROM shopping_lists WHERE id = ?").get(req.shoppingList.id),
        ),
    );
});
app.delete("/api/lists/:listId", resolveList, (req, res) => {
    const removed = db.transaction(() => {
        if (db.prepare("SELECT COUNT(*) AS count FROM shopping_lists").get().count <= 1)
            return false;
        db.prepare("DELETE FROM shopping_lists WHERE id = ?").run(req.shoppingList.id);
        return true;
    })();
    if (!removed)
        return res.status(409).json({
            error: "Keep at least one shopping list. Create another list before deleting this one.",
        });
    res.sendStatus(204);
});
app.post("/api/lists/:listId/duplicate", resolveList, (req, res) => {
    const { name, copyPrices = false } = req.body ?? {};
    if (!validListName(name))
        return res.status(400).json({ error: "Enter a list name (up to 80 characters)." });
    if (typeof copyPrices !== "boolean")
        return res.status(400).json({ error: "Copy prices must be true or false." });
    const copy = db.transaction(() => {
        const source = req.shoppingList;
        const result = db
            .prepare("INSERT INTO shopping_lists (name, budget, currency) VALUES (?, ?, ?)")
            .run(name.trim(), source.budget, source.currency);
        db.prepare(
            `INSERT INTO items (list_id, name, quantity, price, completed)
            SELECT ?, name, quantity, CASE WHEN ? THEN price ELSE NULL END, 0
            FROM items WHERE list_id = ? ORDER BY id`,
        ).run(result.lastInsertRowid, Number(copyPrices), source.id);
        return db.prepare("SELECT * FROM shopping_lists WHERE id = ?").get(result.lastInsertRowid);
    })();
    res.status(201).json(formatList(copy));
});

// GET /api/items: retrieve the shopping list.
app.get(["/api/items", "/api/lists/:listId/items"], resolveList, (req, res) => {
    const rows = db
        .prepare("SELECT * FROM items WHERE list_id = ? ORDER BY id")
        .all(req.shoppingList.id);
    res.json(rows.map(formatItem));
});

// POST /api/items: create an item.
app.post(["/api/items", "/api/lists/:listId/items"], resolveList, (req, res) => {
    const { name, quantity, price } = req.body ?? {};

    if (typeof name !== "string" || !name.trim() || name.length > 120) {
        return res.status(400).json({ error: "Enter an item name (up to 120 characters)." });
    }
    if (!money.validQuantity(quantity)) {
        return res
            .status(400)
            .json({ error: "Quantity must be a whole number from 1 to 1,000,000." });
    }
    if (price != null && !money.validAmount(price)) {
        return res.status(400).json({ error: "Price must be between 0 and 1,000,000,000." });
    }

    const result = db
        .prepare("INSERT INTO items (list_id, name, quantity, price) VALUES (?, ?, ?, ?)")
        .run(req.shoppingList.id, name.trim(), quantity, price ?? null);
    const row = db.prepare("SELECT * FROM items WHERE id = ?").get(result.lastInsertRowid);
    res.status(201).json(formatItem(row));
});

// PATCH updates only supplied fields. Omitted fields keep their stored values.
app.patch(["/api/items/:id", "/api/lists/:listId/items/:id"], resolveList, (req, res) => {
    const id = validId(req.params.id);
    if (!id) return res.status(400).json({ error: "Invalid item ID." });
    const body = req.body;
    const fields = ["name", "quantity", "price", "completed"];
    if (
        !body ||
        typeof body !== "object" ||
        Array.isArray(body) ||
        !fields.some((field) => Object.hasOwn(body, field))
    ) {
        return res.status(400).json({ error: "Supply at least one item field." });
    }
    if (
        Object.hasOwn(body, "name") &&
        (typeof body.name !== "string" || !body.name.trim() || body.name.length > 120)
    ) {
        return res.status(400).json({ error: "Enter an item name (up to 120 characters)." });
    }
    if (Object.hasOwn(body, "quantity") && !money.validQuantity(body.quantity)) {
        return res
            .status(400)
            .json({ error: "Quantity must be a whole number from 1 to 1,000,000." });
    }
    if (Object.hasOwn(body, "price") && body.price !== null && !money.validAmount(body.price)) {
        return res.status(400).json({ error: "Price must be between 0 and 1,000,000,000." });
    }
    if (Object.hasOwn(body, "completed") && typeof body.completed !== "boolean") {
        return res.status(400).json({ error: "Completed must be true or false." });
    }

    const existing = db
        .prepare("SELECT * FROM items WHERE id = ? AND list_id = ?")
        .get(id, req.shoppingList.id);
    if (!existing) return res.status(404).json({ error: "Item not found." });
    db.prepare(
        `
        UPDATE items SET name = ?, quantity = ?, price = ?, completed = ? WHERE id = ? AND list_id = ?
    `,
    ).run(
        Object.hasOwn(body, "name") ? body.name.trim() : existing.name,
        Object.hasOwn(body, "quantity") ? body.quantity : existing.quantity,
        Object.hasOwn(body, "price") ? body.price : existing.price,
        Object.hasOwn(body, "completed") ? Number(body.completed) : existing.completed,
        id,
        req.shoppingList.id,
    );
    res.json(
        formatItem(
            db
                .prepare("SELECT * FROM items WHERE id = ? AND list_id = ?")
                .get(id, req.shoppingList.id),
        ),
    );
});

// DELETE /api/items/:id: remove an item from SQLite.
app.delete(["/api/items/:id", "/api/lists/:listId/items/:id"], resolveList, (req, res) => {
    const id = validId(req.params.id);
    if (!id) return res.status(400).json({ error: "Invalid item ID." });

    const result = db
        .prepare("DELETE FROM items WHERE id = ? AND list_id = ?")
        .run(id, req.shoppingList.id);
    if (!result.changes) return res.status(404).json({ error: "Item not found." });
    res.sendStatus(204);
});

// GET /api/settings: load the saved budget and currency.
app.get(["/api/settings", "/api/lists/:listId/settings"], resolveList, (req, res) => {
    const settings = db
        .prepare("SELECT budget, currency FROM shopping_lists WHERE id = ?")
        .get(req.shoppingList.id);
    res.json(settings);
});

// PATCH /api/settings: save the budget, including null for 'not set'.
app.patch(["/api/settings", "/api/lists/:listId/settings"], resolveList, (req, res) => {
    const body = req.body ?? {};
    if (!Object.hasOwn(body, "budget")) {
        return res.status(400).json({ error: "Budget is required." });
    }
    const budget = body.budget;
    if (budget !== null && !money.validAmount(budget)) {
        return res
            .status(400)
            .json({ error: "Budget must be between 0 and 1,000,000,000, or null." });
    }

    db.prepare("UPDATE shopping_lists SET budget = ? WHERE id = ?").run(
        budget,
        req.shoppingList.id,
    );
    res.json(
        db
            .prepare("SELECT budget, currency FROM shopping_lists WHERE id = ?")
            .get(req.shoppingList.id),
    );
});

// The browser uses this list for the manual currency dropdown.
const supportedCurrencies = new Set(Intl.supportedValuesOf("currency"));
app.get("/api/currencies", (req, res) => {
    res.json([...supportedCurrencies]);
});

// PATCH /api/settings/currency: update safely without pretending prices convert.
// A confirmed currency switch clears monetary values but preserves shopping items.
app.patch(
    ["/api/settings/currency", "/api/lists/:listId/settings/currency"],
    resolveList,
    (req, res) => {
        const currency = req.body?.currency;
        const resetMonetaryValues = req.body?.resetMonetaryValues === true;
        if (
            Object.hasOwn(req.body, "resetMonetaryValues") &&
            typeof req.body.resetMonetaryValues !== "boolean"
        ) {
            return res.status(400).json({ error: "Reset monetary values must be true or false." });
        }

        if (typeof currency !== "string" || !supportedCurrencies.has(currency)) {
            return res.status(400).json({ error: "Choose a supported currency." });
        }

        const change = db.transaction(() => {
            const settings = db
                .prepare("SELECT budget, currency FROM shopping_lists WHERE id = ?")
                .get(req.shoppingList.id);
            if (currency === settings.currency) return settings;

            const hasPrices =
                db
                    .prepare(
                        "SELECT EXISTS(SELECT 1 FROM items WHERE list_id = ? AND price IS NOT NULL) AS value",
                    )
                    .get(req.shoppingList.id).value === 1;

            // Never silently relabel amounts in a different currency.
            if ((hasPrices || settings.budget !== null) && !resetMonetaryValues) {
                return null;
            }

            if (hasPrices) {
                db.prepare(
                    "UPDATE items SET price = NULL WHERE list_id = ? AND price IS NOT NULL",
                ).run(req.shoppingList.id);
            }
            db.prepare("UPDATE shopping_lists SET currency = ?, budget = NULL WHERE id = ?").run(
                currency,
                req.shoppingList.id,
            );
            return db
                .prepare("SELECT budget, currency FROM shopping_lists WHERE id = ?")
                .get(req.shoppingList.id);
        });

        const settings = change();
        if (settings === null) {
            return res.status(409).json({
                error: "Changing currencies requires clearing saved prices and budget. Confirm the change to continue.",
            });
        }
        res.json(settings);
    },
);

// Kept separate from CRUD: this is the only third-party data request.
app.post("/api/detect-currency", createLocationHandler(supportedCurrencies));

app.use("/api", (req, res) => res.status(404).json({ error: "API route not found." }));

app.use((error, req, res, next) => {
    if (res.headersSent) return next(error);
    if (error.type === "entity.too.large")
        return res.status(413).json({ error: "Request is too large (maximum 16 KB)." });
    if (error.status === 400) return res.status(400).json({ error: "Invalid JSON request." });
    console.error("Database/request failure:", error.code || error.name);
    res.status(500).json({ error: "Could not access shopping-list data. Please try again." });
});

if (require.main === module) {
    const server = app.listen(PORT, HOST, (error) => {
        if (error) return;
        if (db.migrationBackupPath) console.log(`Database backup: ${db.migrationBackupPath}`);
        console.log(
            `GrocerGlow running at http://${HOST}:${server.address().port} from ${__dirname}`,
        );
    });
    server.on("error", (error) => {
        console.error(
            `Server could not start (${error.code}). Check HOST, PORT and other running instances.`,
        );
        db.close();
        process.exitCode = 1;
    });
}

// Importing the app lets integration tests use an ephemeral port.
module.exports = app;
