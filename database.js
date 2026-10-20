const Database = require("better-sqlite3");
const path = require("path");

// Keep this filename unchanged so your existing shopping data is preserved.
const db = new Database(path.join(__dirname, "grocerglow.db"));

db.exec(`
    CREATE TABLE IF NOT EXISTS items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        quantity INTEGER NOT NULL CHECK(quantity > 0),
        price REAL CHECK(price IS NULL OR price >= 0),
        completed INTEGER NOT NULL DEFAULT 0 CHECK(completed IN (0, 1))
    );

    CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY CHECK(id = 1),
        budget REAL CHECK(budget IS NULL OR budget >= 0),
        currency TEXT NOT NULL DEFAULT 'ZAR'
    );
`);

// This adds initial settings only if the row does not already exist.
db.prepare(`
    INSERT OR IGNORE INTO settings (id, budget, currency)
    VALUES (1, NULL, 'ZAR')
`).run();

module.exports = db;
